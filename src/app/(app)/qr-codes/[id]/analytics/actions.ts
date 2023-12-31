'use server'

import { getAuthSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { UnwrapPromise } from '@/types/UnwrapPromise'

export const getQRCodeAnalytics = async (id: string) => {
  const session = await getAuthSession()
  if (!session?.user) throw new Error('Unauthorized')

  const exists = await prisma.qRCode.count({
    where: {
      id,
      createdById: session.user.id
    }
  })
  if (!exists) throw new Error('Unauthorized')

  return
}

export type GetQRCodeAnalyticsFnDataType = UnwrapPromise<
  ReturnType<typeof getQRCodeAnalytics>
>
