'use server'

import { and, count, desc, eq, gte, sql } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '~/db'
import { qrCodeScanLogsTable, qrCodesTable } from '~/db/schema'
import { assertUserMembership } from '~/lib/organization-access'
import { authActionClient } from '~/lib/safe-action'
import type { QRAnalyticsData } from './qr-analytics.types'

const organizationAnalyticsSchema = z.object({
  organizationId: z.string().trim().min(1)
})

const qrCodeAnalyticsSchema = organizationAnalyticsSchema.extend({
  qrCodeId: z.string().trim().min(1)
})

const chartFills = [
  'var(--color-chart-1)',
  'var(--color-chart-2)',
  'var(--color-chart-3)',
  'var(--color-chart-4)',
  'var(--color-chart-5)'
]

export const getOrganizationQRAnalyticsAction = authActionClient
  .inputSchema(organizationAnalyticsSchema)
  .action(async ({ parsedInput: { organizationId } }) => {
    await assertUserMembership(organizationId)

    return getOrganizationQRAnalytics(organizationId)
  })

export const getQRCodeAnalyticsAction = authActionClient
  .inputSchema(qrCodeAnalyticsSchema)
  .action(async ({ parsedInput: { organizationId, qrCodeId } }) => {
    await assertUserMembership(organizationId)

    return getQRCodeAnalytics({
      organizationId,
      qrCodeId
    })
  })

async function getOrganizationQRAnalytics(
  organizationId: string
): Promise<QRAnalyticsData> {
  const today = startOfDay(new Date())
  const since = addDays(today, -29)

  const [qrSummary] = await db
    .select({
      totalQRCodes: count(qrCodesTable.id),
      dynamicQRCodes: sql<number>`count(*) filter (where ${qrCodesTable.isDynamic} = true)`,
      totalScans: sql<number>`coalesce(sum(${qrCodesTable.totalScans}), 0)`
    })
    .from(qrCodesTable)
    .where(eq(qrCodesTable.organizationId, organizationId))

  const [scanSummary, todaySummary] = await Promise.all([
    getScanCount({ organizationId, since }),
    getScanCount({ organizationId, since: today })
  ])

  const [dailyScans, topQRCodes, deviceTypes, browsers, operatingSystems] =
    await Promise.all([
      getDailyScans({ organizationId, since }),
      getTopQRCodes(organizationId),
      getBreakdown({
        organizationId,
        since,
        expression: sql<string>`coalesce(${qrCodeScanLogsTable.deviceType}, 'unknown')`
      }),
      getBreakdown({
        organizationId,
        since,
        expression: sql<string>`coalesce(${qrCodeScanLogsTable.browserName}, 'unknown')`
      }),
      getBreakdown({
        organizationId,
        since,
        expression: sql<string>`coalesce(${qrCodeScanLogsTable.osName}, 'unknown')`
      })
    ])

  return {
    summary: {
      totalQRCodes: toNumber(qrSummary?.totalQRCodes),
      dynamicQRCodes: toNumber(qrSummary?.dynamicQRCodes),
      totalScans: toNumber(qrSummary?.totalScans),
      scansLast30Days: scanSummary,
      scansToday: todaySummary
    },
    dailyScans,
    topQRCodes,
    deviceTypes,
    browsers,
    operatingSystems
  }
}

async function getQRCodeAnalytics({
  organizationId,
  qrCodeId
}: {
  organizationId: string
  qrCodeId: string
}): Promise<QRAnalyticsData> {
  const today = startOfDay(new Date())
  const since = addDays(today, -29)

  const qrCode = await db.query.qrCodesTable.findFirst({
    where: and(
      eq(qrCodesTable.id, qrCodeId),
      eq(qrCodesTable.organizationId, organizationId)
    ),
    columns: {
      id: true,
      isDynamic: true,
      totalScans: true
    }
  })

  if (!qrCode) throw new Error('QR code not found')

  const [scanSummary, todaySummary] = await Promise.all([
    getScanCount({ organizationId, qrCodeId, since }),
    getScanCount({ organizationId, qrCodeId, since: today })
  ])

  const [dailyScans, deviceTypes, browsers, operatingSystems] =
    await Promise.all([
      getDailyScans({ organizationId, qrCodeId, since }),
      getBreakdown({
        organizationId,
        qrCodeId,
        since,
        expression: sql<string>`coalesce(${qrCodeScanLogsTable.deviceType}, 'unknown')`
      }),
      getBreakdown({
        organizationId,
        qrCodeId,
        since,
        expression: sql<string>`coalesce(${qrCodeScanLogsTable.browserName}, 'unknown')`
      }),
      getBreakdown({
        organizationId,
        qrCodeId,
        since,
        expression: sql<string>`coalesce(${qrCodeScanLogsTable.osName}, 'unknown')`
      })
    ])

  return {
    summary: {
      totalQRCodes: 1,
      dynamicQRCodes: qrCode.isDynamic ? 1 : 0,
      totalScans: toNumber(qrCode.totalScans),
      scansLast30Days: scanSummary,
      scansToday: todaySummary
    },
    dailyScans,
    topQRCodes: [],
    deviceTypes,
    browsers,
    operatingSystems
  }
}

async function getScanCount({
  organizationId,
  qrCodeId,
  since
}: {
  organizationId: string
  qrCodeId?: string
  since: Date
}) {
  const [row] = await db
    .select({
      scans: count(qrCodeScanLogsTable.id)
    })
    .from(qrCodeScanLogsTable)
    .innerJoin(qrCodesTable, eq(qrCodeScanLogsTable.qrCodeId, qrCodesTable.id))
    .where(
      and(
        eq(qrCodesTable.organizationId, organizationId),
        gte(qrCodeScanLogsTable.createdAt, since),
        qrCodeId ? eq(qrCodeScanLogsTable.qrCodeId, qrCodeId) : undefined
      )
    )

  return toNumber(row?.scans)
}

async function getDailyScans({
  organizationId,
  qrCodeId,
  since
}: {
  organizationId: string
  qrCodeId?: string
  since: Date
}) {
  const dayExpression = sql<string>`to_char(${qrCodeScanLogsTable.createdAt}, 'YYYY-MM-DD')`
  const where = and(
    eq(qrCodesTable.organizationId, organizationId),
    gte(qrCodeScanLogsTable.createdAt, since),
    qrCodeId ? eq(qrCodeScanLogsTable.qrCodeId, qrCodeId) : undefined
  )

  const rows = await db
    .select({
      date: dayExpression,
      scans: count(qrCodeScanLogsTable.id)
    })
    .from(qrCodeScanLogsTable)
    .innerJoin(qrCodesTable, eq(qrCodeScanLogsTable.qrCodeId, qrCodesTable.id))
    .where(where)
    .groupBy(dayExpression)
    .orderBy(dayExpression)

  const countsByDate = new Map(
    rows.map(row => [row.date, toNumber(row.scans)] as const)
  )

  return getLast30Days(since).map(date => ({
    date,
    label: formatDayLabel(date),
    scans: countsByDate.get(date) ?? 0
  }))
}

async function getTopQRCodes(organizationId: string) {
  const scansExpression = count(qrCodeScanLogsTable.id)

  const rows = await db
    .select({
      id: qrCodesTable.id,
      name: qrCodesTable.name,
      type: qrCodesTable.type,
      scans: scansExpression
    })
    .from(qrCodesTable)
    .leftJoin(
      qrCodeScanLogsTable,
      eq(qrCodeScanLogsTable.qrCodeId, qrCodesTable.id)
    )
    .where(eq(qrCodesTable.organizationId, organizationId))
    .groupBy(qrCodesTable.id, qrCodesTable.name, qrCodesTable.type)
    .orderBy(desc(scansExpression), desc(qrCodesTable.updatedAt))
    .limit(5)

  return rows.map(row => ({
    id: row.id,
    name: row.name,
    type: row.type,
    scans: toNumber(row.scans)
  }))
}

async function getBreakdown({
  organizationId,
  qrCodeId,
  since,
  expression
}: {
  organizationId: string
  qrCodeId?: string
  since: Date
  expression: ReturnType<typeof sql<string>>
}) {
  const rows = await db
    .select({
      name: expression,
      scans: count(qrCodeScanLogsTable.id)
    })
    .from(qrCodeScanLogsTable)
    .innerJoin(qrCodesTable, eq(qrCodeScanLogsTable.qrCodeId, qrCodesTable.id))
    .where(
      and(
        eq(qrCodesTable.organizationId, organizationId),
        gte(qrCodeScanLogsTable.createdAt, since),
        qrCodeId ? eq(qrCodeScanLogsTable.qrCodeId, qrCodeId) : undefined
      )
    )
    .groupBy(expression)
    .orderBy(desc(count(qrCodeScanLogsTable.id)))
    .limit(5)

  return rows.map((row, index) => ({
    name: row.name || 'unknown',
    scans: toNumber(row.scans),
    fill: chartFills[index % chartFills.length] ?? 'var(--color-chart-1)'
  }))
}

function getLast30Days(since: Date) {
  return Array.from({ length: 30 }, (_, index) =>
    formatDateKey(addDays(since, index))
  )
}

function startOfDay(date: Date) {
  const copy = new Date(date)
  copy.setHours(0, 0, 0, 0)
  return copy
}

function addDays(date: Date, days: number) {
  const copy = new Date(date)
  copy.setDate(copy.getDate() + days)
  return copy
}

function formatDateKey(date: Date) {
  return date.toISOString().slice(0, 10)
}

function formatDayLabel(dateKey: string) {
  return new Date(`${dateKey}T00:00:00`).toLocaleDateString('en', {
    month: 'short',
    day: 'numeric'
  })
}

function toNumber(value: unknown) {
  return Number(value ?? 0)
}
