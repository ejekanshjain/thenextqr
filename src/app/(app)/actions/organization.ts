'use server'

import { and, eq } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '~/db'
import { membersTable, organizationsTable } from '~/db/schema'
import {
  assertUserCanManageOrganization,
  getUserMembershipCached
} from '~/lib/organization-access'
import { authActionClient } from '~/lib/safe-action'
import {
  assertOrganizationUploadKey,
  confirmUpload,
  isR2Configured,
  isR2Key
} from '~/lib/storage'
import { isAllowedImageDataUrl } from '~/lib/upload-policy'
import { stringValidation } from '~/lib/validations'

export const updateOrganizationLogoAction = authActionClient
  .inputSchema(
    z.object({
      organizationId: stringValidation,
      key: z.string().min(1)
    })
  )
  .action(async ({ parsedInput, ctx: { user } }) => {
    await assertUserCanManageOrganization(parsedInput.organizationId)

    if (parsedInput.key.startsWith('data:')) {
      if (!isAllowedImageDataUrl(parsedInput.key)) {
        throw new Error('Logo must be a PNG, JPEG, WebP, or GIF image')
      }

      await db
        .update(organizationsTable)
        .set({ logo: parsedInput.key })
        .where(eq(organizationsTable.id, parsedInput.organizationId))

      return true
    }

    if (!isR2Configured() || !isR2Key(parsedInput.key)) {
      throw new Error('Invalid logo upload')
    }

    assertOrganizationUploadKey(parsedInput.key, parsedInput.organizationId)

    const org = await db.query.organizationsTable.findFirst({
      where: eq(organizationsTable.id, parsedInput.organizationId),
      columns: {
        logo: true
      }
    })

    if (!org) {
      throw new Error('Organization not found')
    }

    await confirmUpload(parsedInput.key, org.logo, {
      organizationId: parsedInput.organizationId,
      uploadedBy: user.id
    })

    await db
      .update(organizationsTable)
      .set({ logo: parsedInput.key })
      .where(eq(organizationsTable.id, parsedInput.organizationId))

    return true
  })

export const transferOrganizationOwnershipAction = authActionClient
  .inputSchema(
    z.object({
      organizationId: stringValidation,
      targetMemberId: stringValidation
    })
  )
  .action(async ({ parsedInput: { organizationId, targetMemberId } }) => {
    const membership = await getUserMembershipCached(organizationId)
    if (!membership || membership.role !== 'owner') {
      throw new Error('Only the organization owner can transfer ownership')
    }

    if (targetMemberId === membership.id) {
      throw new Error('You are already the owner of this organization')
    }

    const target = await db.query.membersTable.findFirst({
      where: and(
        eq(membersTable.id, targetMemberId),
        eq(membersTable.organizationId, organizationId)
      )
    })
    if (!target) {
      throw new Error('Selected member does not belong to this organization')
    }

    await db.transaction(async tx => {
      await tx
        .update(membersTable)
        .set({ role: 'owner' })
        .where(eq(membersTable.id, target.id))

      await tx
        .update(membersTable)
        .set({ role: 'admin' })
        .where(eq(membersTable.id, membership.id))
    })

    return true
  })
