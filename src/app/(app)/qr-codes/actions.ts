import { getAuthSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { UnwrapPromise } from '@/types/UnwrapPromise'

export const getQRCodes = async () => {
  const session = await getAuthSession()

  if (!session?.user) throw new Error('Unathorized')

  const [qrCodes, total] = await Promise.all([
    prisma.qRCode.findMany({
      where: {
        createdById: session.user.id
      },
      orderBy: {
        updatedAt: 'desc'
      }
    }),
    prisma.qRCode.count({})
  ])

  return { qrCodes, total }
}

export type GetQRCodesFnDataType = UnwrapPromise<ReturnType<typeof getQRCodes>>
