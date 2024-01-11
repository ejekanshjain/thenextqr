'use server'

import { getAuthSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { formatDate } from '@/lib/formatDate'
import { UnwrapPromise } from '@/types/UnwrapPromise'
import dayjs from 'dayjs'

export const getQRCodeAnalytics = async (id: string) => {
  const session = await getAuthSession()
  if (!session?.user) throw new Error('Unauthorized')

  const monthEndDate = new Date()
  const monthStartDate = new Date(monthEndDate)
  monthStartDate.setUTCDate(1)
  monthStartDate.setUTCHours(0, 0, 0, 0)

  const currentMonthStats: any[] = await prisma.$queryRaw`
    SELECT
      date_trunc('day', "createdAt") AS date,
      count(id) AS count
    FROM
      "QRCodeScanLogs"
    WHERE
      "qrCodeId" = ${id}
      AND "createdAt" BETWEEN ${monthStartDate} AND ${monthEndDate}
    GROUP BY
      date
    ORDER BY
      date ASC`

  const yearEndDate = new Date()
  const yearStartDate = new Date(yearEndDate)
  yearStartDate.setUTCDate(1)
  yearStartDate.setUTCMonth(0)
  yearStartDate.setUTCHours(0, 0, 0, 0)

  const currentYearStats: any[] = await prisma.$queryRaw`
    SELECT
      date_trunc('month', "createdAt") AS date,
      count(id) AS count
    FROM
      "QRCodeScanLogs"
    WHERE
      "qrCodeId" = ${id}
      AND "createdAt" BETWEEN ${yearStartDate} AND ${yearEndDate}
    GROUP BY
      date
    ORDER BY
      date ASC`

  return {
    currentMonthStats: currentMonthStats.map(item => ({
      name: item.date.getUTCDate(),
      date: formatDate(item.date),
      count: parseInt(item.count)
    })),
    currentYearStats: currentYearStats.map(item => ({
      name: dayjs(item.date).format('MMM'),
      date: formatDate(item.date),
      count: parseInt(item.count)
    }))
  }
}

export type GetQRCodeAnalyticsFnDataType = UnwrapPromise<
  ReturnType<typeof getQRCodeAnalytics>
>
