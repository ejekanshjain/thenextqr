'use server'

import { getAuthSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { formatDate } from '@/lib/formatDate'
import { UnwrapPromise } from '@/types/UnwrapPromise'

export const getQRCodeAnalytics = async (id: string) => {
  const session = await getAuthSession()
  if (!session?.user) throw new Error('Unauthorized')

  const endDate = new Date()
  const startDate = new Date(endDate)
  startDate.setUTCDate(1)

  const currentMonthStats: any[] = await prisma.$queryRaw`
    SELECT
      date_trunc('day', "createdAt") AS date,
      count(id) AS count
    FROM
      "QRCodeScanLogs"
    WHERE
      "qrCodeId" = ${id}
      AND "createdAt" BETWEEN ${startDate} AND ${endDate}
    GROUP BY
      date
    ORDER BY
      date ASC`

  return {
    currentMonthStats: currentMonthStats.map(item => ({
      name: item.date.getUTCDate(),
      date: formatDate(item.date),
      count: parseInt(item.count)
    }))
  }
}

export type GetQRCodeAnalyticsFnDataType = UnwrapPromise<
  ReturnType<typeof getQRCodeAnalytics>
>
