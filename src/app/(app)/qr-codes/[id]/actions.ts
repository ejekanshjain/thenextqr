'use server'

import { getAuthSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { UnwrapPromise } from '@/types/UnwrapPromise'

export const getQRCode = async (id: string) => {
  const session = await getAuthSession()
  if (!session?.user) throw new Error('Unauthorized')
  return await prisma.qRCode.findUniqueOrThrow({
    where: {
      id,
      createdById: session.user.id
    },
    select: {
      id: true,
      dynamic: true,
      name: true,
      slug: true,
      website: true,
      createdAt: true,
      updatedAt: true
    }
  })
}

export type GetQRCodeFnDataType = UnwrapPromise<ReturnType<typeof getQRCode>>

export const createQRCode = async ({
  dynamic,
  name,
  slug,
  website
}: {
  dynamic: boolean
  name: string
  slug?: string
  website: string
}) => {
  const session = await getAuthSession()
  if (!session?.user) throw new Error('Unauthorized')
  const { id } = await prisma.qRCode.create({
    data: {
      name,
      dynamic,
      slug,
      website,
      createdById: session.user.id,
      updatedById: session.user.id
    }
  })
  return id
}
