'use server'

import { createId } from '@paralleldrive/cuid2'
import { and, asc, count, desc, eq, ilike, or } from 'drizzle-orm'
import { z } from 'zod'
import { SortOrderEnum } from '~/components/data-table/enum'
import { db } from '~/db'
import { qrCodesTable } from '~/db/schema'
import { getPaginationSchema, getSortSchema } from '~/lib/actions'
import { assertUserMembership } from '~/lib/organization-access'
import { DEFAULT_QR_COLOR_MODE, normalizeQRCodeColor } from '~/lib/qr-color'
import { authActionClient } from '~/lib/safe-action'
import {
  confirmUpload,
  deleteFile,
  isR2Configured,
  isR2Key,
  resolveImageUrl
} from '~/lib/storage'
import {
  createQRCodeSchema,
  deleteQRCodeSchema,
  getQRCodeSchema,
  updateQRCodeSchema
} from './qr-codes.validation'

const qrCodeListSchema = z.object({
  organizationId: z.string().trim().min(1),
  ...getPaginationSchema(),
  ...getSortSchema(['name', 'type', 'isDynamic', 'totalScans', 'updatedAt']),
  search: z.string().trim().optional()
})

export const getQRCodesAction = authActionClient
  .inputSchema(qrCodeListSchema)
  .action(
    async ({
      parsedInput: { organizationId, page, limit, sortBy, sortOrder, search }
    }) => {
      await assertUserMembership(organizationId)

      const where = and(
        eq(qrCodesTable.organizationId, organizationId),
        search
          ? or(
              ilike(qrCodesTable.name, `%${search}%`),
              ilike(qrCodesTable.slug, `%${search}%`),
              ilike(qrCodesTable.website, `%${search}%`),
              ilike(qrCodesTable.phoneNumber, `%${search}%`),
              ilike(qrCodesTable.email, `%${search}%`)
            )
          : undefined
      )

      const sortColumn = qrCodesTable[sortBy ?? 'updatedAt']
      const direction = sortOrder === SortOrderEnum.ASC ? asc : desc

      const [rows, total] = await Promise.all([
        db.query.qrCodesTable.findMany({
          where,
          orderBy: [direction(sortColumn)],
          limit,
          offset: (page - 1) * limit
        }),
        db.select({ count: count() }).from(qrCodesTable).where(where)
      ])

      return [
        rows.map(row => ({
          ...row,
          logoUrl: resolveImageUrl(row.logoUrl)
        })),
        total[0]?.count ?? 0
      ] as const
    }
  )

export const getQRCodeAction = authActionClient
  .inputSchema(getQRCodeSchema)
  .action(async ({ parsedInput: { organizationId, id } }) => {
    await assertUserMembership(organizationId)

    const qrCode = await db.query.qrCodesTable.findFirst({
      where: and(
        eq(qrCodesTable.id, id),
        eq(qrCodesTable.organizationId, organizationId)
      )
    })

    if (!qrCode) throw new Error('QR code not found')

    return {
      ...qrCode,
      logoResolvedUrl: resolveImageUrl(qrCode.logoUrl)
    }
  })

export const createQRCodeAction = authActionClient
  .inputSchema(createQRCodeSchema)
  .action(async ({ parsedInput, ctx: { user } }) => {
    await assertUserMembership(parsedInput.organizationId)

    const slug = parsedInput.isDynamic
      ? await resolveUniqueSlug(parsedInput.slug)
      : null

    const logoUrl = getVerifiedLogoUrl(
      parsedInput.organizationId,
      parsedInput.logoUrl
    )

    const [created] = await db
      .insert(qrCodesTable)
      .values({
        organizationId: parsedInput.organizationId,
        createdById: user.id,
        updatedById: user.id,
        logoUrl,
        isDynamic: parsedInput.isDynamic,
        name: parsedInput.name,
        slug,
        type: parsedInput.type,
        colorCode: normalizeQRCodeColor(parsedInput.colorCode),
        colorMode: parsedInput.colorMode ?? DEFAULT_QR_COLOR_MODE,
        expiresAt: null,
        ...getDestinationValues(parsedInput)
      })
      .returning({ id: qrCodesTable.id })

    if (!created) throw new Error('Failed to create QR code')

    await handleLogoUploadChange(logoUrl, null)

    return { id: created.id }
  })

export const updateQRCodeAction = authActionClient
  .inputSchema(updateQRCodeSchema)
  .action(async ({ parsedInput, ctx: { user } }) => {
    await assertUserMembership(parsedInput.organizationId)

    const existing = await db.query.qrCodesTable.findFirst({
      where: and(
        eq(qrCodesTable.id, parsedInput.id),
        eq(qrCodesTable.organizationId, parsedInput.organizationId)
      )
    })

    if (!existing) throw new Error('QR code not found')

    const slug = parsedInput.isDynamic
      ? await resolveUniqueSlug(parsedInput.slug, existing.id)
      : null

    const logoUrl = getVerifiedLogoUrl(
      parsedInput.organizationId,
      parsedInput.logoUrl
    )

    await db
      .update(qrCodesTable)
      .set({
        updatedById: user.id,
        logoUrl,
        isDynamic: parsedInput.isDynamic,
        name: parsedInput.name,
        slug,
        type: parsedInput.type,
        colorCode: normalizeQRCodeColor(parsedInput.colorCode),
        colorMode: parsedInput.colorMode ?? DEFAULT_QR_COLOR_MODE,
        expiresAt: null,
        ...getDestinationValues(parsedInput)
      })
      .where(eq(qrCodesTable.id, existing.id))

    await handleLogoUploadChange(logoUrl, existing.logoUrl)

    return { id: existing.id }
  })

export const deleteQRCodeAction = authActionClient
  .inputSchema(deleteQRCodeSchema)
  .action(async ({ parsedInput: { organizationId, id } }) => {
    await assertUserMembership(organizationId)

    const existing = await db.query.qrCodesTable.findFirst({
      where: and(
        eq(qrCodesTable.id, id),
        eq(qrCodesTable.organizationId, organizationId)
      ),
      columns: { logoUrl: true }
    })

    await db
      .delete(qrCodesTable)
      .where(
        and(
          eq(qrCodesTable.id, id),
          eq(qrCodesTable.organizationId, organizationId)
        )
      )

    if (isR2Configured() && isR2Key(existing?.logoUrl)) {
      await deleteFile(existing.logoUrl).catch(() => {})
    }

    return true
  })

async function resolveUniqueSlug(slug?: string | null, currentId?: string) {
  if (slug) {
    const existing = await db.query.qrCodesTable.findFirst({
      where: eq(qrCodesTable.slug, slug),
      columns: { id: true }
    })

    if (existing && existing.id !== currentId) {
      throw new Error('Slug already taken')
    }

    return slug
  }

  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate = createId().slice(0, 8).toLowerCase()
    const existing = await db.query.qrCodesTable.findFirst({
      where: eq(qrCodesTable.slug, candidate),
      columns: { id: true }
    })

    if (!existing) return candidate
  }

  throw new Error('Could not generate a unique slug')
}

function getVerifiedLogoUrl(organizationId: string, logoUrl?: string | null) {
  if (!logoUrl) return null

  if (
    isR2Key(logoUrl) &&
    !logoUrl.startsWith(`uploads/organizations/${organizationId}/`)
  ) {
    throw new Error('Logo upload does not belong to this organization')
  }

  return logoUrl
}

async function handleLogoUploadChange(
  newLogoUrl: string | null,
  oldLogoUrl: string | null
) {
  if (!isR2Configured()) return

  const newIsR2Key = isR2Key(newLogoUrl)
  const oldIsR2Key = isR2Key(oldLogoUrl)

  if (newIsR2Key && newLogoUrl !== oldLogoUrl) {
    await confirmUpload(newLogoUrl, oldIsR2Key ? oldLogoUrl : null)
    return
  }

  if (!newLogoUrl && oldIsR2Key) {
    await deleteFile(oldLogoUrl).catch(() => {})
  }
}

function getDestinationValues(input: z.infer<typeof createQRCodeSchema>) {
  return {
    website: input.type === 'website' ? input.website : null,
    phoneNumber:
      input.type === 'phone' || input.type === 'sms' ? input.phoneNumber : null,
    message:
      input.type === 'email' || input.type === 'sms' ? input.message : null,
    email: input.type === 'email' ? input.email : null,
    subject: input.type === 'email' ? input.subject : null
  }
}
