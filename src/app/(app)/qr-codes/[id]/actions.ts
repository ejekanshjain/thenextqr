'use server'

import { getAuthSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { UnwrapPromise } from '@/types/UnwrapPromise'
import { nanoid } from 'nanoid'

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

  if (slug) slug = slug.toLowerCase()

  if (!dynamic) slug = undefined
  else if (dynamic && !slug) slug = nanoid(8).toLowerCase()

  if (
    dynamic &&
    (await prisma.qRCode.count({
      where: {
        slug
      }
    }))
  )
    throw new Error('Slug already taken')

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

export const updateQRCode = async ({
  id,
  dynamic,
  name,
  slug,
  website
}: {
  id: string
  dynamic: boolean
  name: string
  slug?: string
  website: string
}) => {
  const session = await getAuthSession()
  if (!session?.user) throw new Error('Unauthorized')

  if (slug) slug = slug.toLowerCase()

  const qr = await prisma.qRCode.findUniqueOrThrow({
    where: {
      id,
      createdById: session.user.id
    }
  })

  if (qr.dynamic && !dynamic) {
    slug = null as any
  } else if (!qr.dynamic && dynamic && !slug) {
    slug = nanoid(8).toLowerCase()
  }

  if (
    dynamic &&
    qr.slug !== slug &&
    (await prisma.qRCode.count({
      where: {
        slug
      }
    }))
  )
    throw new Error('Slug already taken')

  await prisma.qRCode.update({
    where: {
      id
    },
    data: {
      name,
      dynamic,
      slug,
      website
    }
  })
}
