'use server'

import { createId } from '@paralleldrive/cuid2'
import { and, asc, count, desc, eq, ilike, or } from 'drizzle-orm'
import { z } from 'zod'
import { SortOrderEnum } from '~/components/data-table/enum'
import { db } from '~/db'
import { fileUploadsTable, qrCodesTable } from '~/db/schema'
import { getPaginationSchema, getSortSchema } from '~/lib/actions'
import { assertUserMembership } from '~/lib/organization-access'
import { DEFAULT_QR_COLOR_MODE, normalizeQRCodeColor } from '~/lib/qr-color'
import { authActionClient } from '~/lib/safe-action'
import { confirmUpload, resolveImageUrl } from '~/lib/storage'
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
          with: {
            logoUpload: true
          },
          orderBy: [direction(sortColumn)],
          limit,
          offset: (page - 1) * limit
        }),
        db.select({ count: count() }).from(qrCodesTable).where(where)
      ])

      return [
        rows.map(row => ({
          ...row,
          logoUrl: resolveImageUrl(row.logoUpload?.key)
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
      ),
      with: {
        logoUpload: true
      }
    })

    if (!qrCode) throw new Error('QR code not found')

    return {
      ...qrCode,
      logoUrl: resolveImageUrl(qrCode.logoUpload?.key)
    }
  })

export const createQRCodeAction = authActionClient
  .inputSchema(createQRCodeSchema)
  .action(async ({ parsedInput, ctx: { user } }) => {
    await assertUserMembership(parsedInput.organizationId)

    const slug = parsedInput.isDynamic
      ? await resolveUniqueSlug(parsedInput.slug)
      : null

    const logoUpload = await getOrganizationLogoUpload(
      parsedInput.organizationId,
      parsedInput.logoUploadId
    )

    const [created] = await db
      .insert(qrCodesTable)
      .values({
        organizationId: parsedInput.organizationId,
        createdById: user.id,
        updatedById: user.id,
        logoUploadId: logoUpload?.id ?? null,
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

    if (logoUpload) await confirmUpload(logoUpload.key)

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
      ),
      with: {
        logoUpload: true
      }
    })

    if (!existing) throw new Error('QR code not found')

    const slug = parsedInput.isDynamic
      ? await resolveUniqueSlug(parsedInput.slug, existing.id)
      : null

    const logoUpload = await getOrganizationLogoUpload(
      parsedInput.organizationId,
      parsedInput.logoUploadId
    )

    await db
      .update(qrCodesTable)
      .set({
        updatedById: user.id,
        logoUploadId: logoUpload?.id ?? null,
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

    if (logoUpload?.key && logoUpload.id !== existing.logoUploadId) {
      await confirmUpload(logoUpload.key, existing.logoUpload?.key)
    }

    return { id: existing.id }
  })

export const deleteQRCodeAction = authActionClient
  .inputSchema(deleteQRCodeSchema)
  .action(async ({ parsedInput: { organizationId, id } }) => {
    await assertUserMembership(organizationId)

    await db
      .delete(qrCodesTable)
      .where(
        and(
          eq(qrCodesTable.id, id),
          eq(qrCodesTable.organizationId, organizationId)
        )
      )

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

async function getOrganizationLogoUpload(
  organizationId: string,
  logoUploadId?: string | null
) {
  if (!logoUploadId) return null

  const upload = await db.query.fileUploadsTable.findFirst({
    where: and(
      eq(fileUploadsTable.id, logoUploadId),
      eq(fileUploadsTable.organizationId, organizationId)
    )
  })

  if (!upload) throw new Error('Logo upload not found')

  return upload
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
