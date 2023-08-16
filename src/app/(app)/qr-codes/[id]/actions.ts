'use server'

import { getAuthSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getUserSubscriptionPlan } from '@/lib/subscription'
import { UnwrapPromise } from '@/types/UnwrapPromise'
import { nanoid } from 'nanoid'
import { revalidatePath } from 'next/cache'

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

  const plan = await getUserSubscriptionPlan(session.user.id)

  if (plan.isPro) {
    if (dynamic) {
      const dynamicCount = await prisma.qRCode.count({
        where: {
          dynamic: true,
          createdById: session.user.id
        }
      })

      if (dynamicCount >= 5)
        throw new Error('You can only create 5 dynamic QR Codes with PRO plan')
    }
  } else {
    if (dynamic)
      throw new Error('Dynamic QR Codes are only available for PRO plan')
    else {
      const staticCount = await prisma.qRCode.count({
        where: {
          dynamic: false,
          createdById: session.user.id
        }
      })
      if (staticCount >= 5)
        throw new Error('You can only create 5 static QR Codes with FREE plan')
    }
  }

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
      expires:
        dynamic && plan.stripeCurrentPeriodEnd
          ? new Date(plan.stripeCurrentPeriodEnd)
          : null,
      createdById: session.user.id,
      updatedById: session.user.id
    }
  })

  if (slug) revalidatePath(`/qr/${slug}`)
  revalidatePath(`/qr-codes/${id}`)
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

  const plan = await getUserSubscriptionPlan(session.user.id)
  if (plan.isPro) {
    if (dynamic && !qr.dynamic) {
      const dynamicCount = await prisma.qRCode.count({
        where: {
          dynamic: true,
          createdById: session.user.id
        }
      })

      if (dynamicCount >= 5)
        throw new Error('You can only create 5 dynamic QR Codes with PRO plan')
    }
  } else {
    if (dynamic)
      throw new Error('Dynamic QR Codes are only available for PRO plan')
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
      website,
      expires:
        dynamic && plan.stripeCurrentPeriodEnd
          ? new Date(plan.stripeCurrentPeriodEnd)
          : null
    }
  })

  if (qr.slug) revalidatePath(`/qr/${qr.slug}`)
  if (slug && qr.slug !== slug) revalidatePath(`/qr/${slug}`)
  revalidatePath(`/qr-codes/${id}`)
}

export const deleteQRCode = async (id: string) => {
  const session = await getAuthSession()
  if (!session?.user) throw new Error('Unauthorized')

  const deleted = await prisma.qRCode.delete({
    where: {
      id,
      createdById: session.user.id
    }
  })

  if (deleted.slug) revalidatePath(`/qr/${deleted.slug}`)
  revalidatePath(`/qr-codes/${id}`)
}
