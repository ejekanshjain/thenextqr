import { and, eq, gt, isNull, or, sql } from 'drizzle-orm'
import { headers } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { db } from '~/db'
import { qrCodeScanLogsTable, qrCodesTable } from '~/db/schema'
import { env } from '~/env'
import { getQRUrl } from '~/lib/qr-url'

export default async function Page({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const [qrCode] = await db
    .update(qrCodesTable)
    .set({
      totalScans: sql`${qrCodesTable.totalScans} + 1`
    })
    .where(
      and(
        eq(qrCodesTable.slug, slug),
        eq(qrCodesTable.isDynamic, true),
        or(
          isNull(qrCodesTable.expiresAt),
          gt(qrCodesTable.expiresAt, new Date())
        )
      )
    )
    .returning({
      id: qrCodesTable.id,
      type: qrCodesTable.type,
      website: qrCodesTable.website,
      phoneNumber: qrCodesTable.phoneNumber,
      message: qrCodesTable.message,
      email: qrCodesTable.email,
      subject: qrCodesTable.subject
    })

  if (!qrCode) return notFound()

  const requestHeaders = await headers()
  const userAgent = requestHeaders.get('user-agent') ?? ''
  const forwardedFor = requestHeaders.get('x-forwarded-for') ?? ''
  const ipAddress = forwardedFor.split(',')[0]?.trim() || null
  const userAgentInfo = parseUserAgent(userAgent)

  await db.insert(qrCodeScanLogsTable).values({
    qrCodeId: qrCode.id,
    ipAddress,
    userAgent,
    ...userAgentInfo
  })

  redirect(
    getQRUrl({
      type: qrCode.type,
      website: qrCode.website,
      phoneNumber: qrCode.phoneNumber,
      message: qrCode.message,
      email: qrCode.email,
      subject: qrCode.subject
    }) ?? env.BETTER_AUTH_URL
  )
}

function parseUserAgent(userAgent: string) {
  const browser = userAgent.match(/Edg\/([\d.]+)/)
    ? ['Edge', userAgent.match(/Edg\/([\d.]+)/)?.[1]]
    : userAgent.match(/Chrome\/([\d.]+)/)
      ? ['Chrome', userAgent.match(/Chrome\/([\d.]+)/)?.[1]]
      : userAgent.match(/Firefox\/([\d.]+)/)
        ? ['Firefox', userAgent.match(/Firefox\/([\d.]+)/)?.[1]]
        : userAgent.match(/Version\/([\d.]+).*Safari/)
          ? ['Safari', userAgent.match(/Version\/([\d.]+).*Safari/)?.[1]]
          : [null, null]

  const os = userAgent.match(/Windows NT ([\d.]+)/)
    ? ['Windows', userAgent.match(/Windows NT ([\d.]+)/)?.[1]]
    : userAgent.match(/Android ([\d.]+)/)
      ? ['Android', userAgent.match(/Android ([\d.]+)/)?.[1]]
      : userAgent.match(/iPhone OS ([\d_]+)/)
        ? [
            'iOS',
            userAgent.match(/iPhone OS ([\d_]+)/)?.[1]?.replaceAll('_', '.')
          ]
        : userAgent.match(/Mac OS X ([\d_]+)/)
          ? [
              'macOS',
              userAgent.match(/Mac OS X ([\d_]+)/)?.[1]?.replaceAll('_', '.')
            ]
          : [null, null]

  const deviceType = /Mobile|iPhone|Android/.test(userAgent)
    ? 'mobile'
    : /iPad|Tablet/.test(userAgent)
      ? 'tablet'
      : userAgent
        ? 'desktop'
        : null

  return {
    browserName: browser[0],
    browserVersion: browser[1],
    osName: os[0],
    osVersion: os[1],
    deviceVendor: null,
    deviceModel: null,
    deviceType
  }
}
