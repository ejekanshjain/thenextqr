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
      logo: {
        select: {
          id: true,
          url: true,
          cdnUrl: true
        }
      },
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          scanLogs: true
        }
      }
    }
  })
}

export type GetQRCodeFnDataType = UnwrapPromise<ReturnType<typeof getQRCode>>

export const createQRCode = async ({
  dynamic,
  name,
  slug,
  website,
  logoId
}: {
  dynamic: boolean
  name: string
  slug?: string
  website: string
  logoId?: string | null
}) => {
  const session = await getAuthSession()
  if (!session?.user) throw new Error('Unauthorized')

  if (slug) slug = slug.toLowerCase()

  if (!dynamic) slug = undefined
  else if (dynamic && !slug) slug = nanoid(8).toLowerCase()

  const plan = await getUserSubscriptionPlan(session.user.id)

  if (plan.isPro || plan.isFreeTrial) {
    if (dynamic) {
      const dynamicCount = await prisma.qRCode.count({
        where: {
          dynamic: true,
          createdById: session.user.id
        }
      })

      if (dynamicCount >= 5)
        return {
          error: `You can only create 5 dynamic QR Codes with ${plan.name} plan`
        }
    } else {
      const staticCount = await prisma.qRCode.count({
        where: {
          dynamic: false,
          createdById: session.user.id
        }
      })
      if (staticCount >= 50)
        return {
          error: `You can only create 50 static QR Codes with ${plan.name} plan`
        }
    }
  } else {
    if (dynamic)
      return { error: 'Dynamic QR Codes are only available for PRO plan' }
    else {
      const staticCount = await prisma.qRCode.count({
        where: {
          dynamic: false,
          createdById: session.user.id
        }
      })
      if (staticCount >= 5)
        return { error: 'You can only create 5 static QR Codes with FREE plan' }
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
    return { error: 'Slug already taken' }

  const { id } = await prisma.qRCode.create({
    data: {
      name,
      dynamic,
      slug,
      website,
      expires: dynamic ? new Date(plan.currentPeriodEnd) : null,
      createdById: session.user.id,
      updatedById: session.user.id
    }
  })

  if (logoId)
    await prisma.resource.update({
      where: {
        id: logoId
      },
      data: {
        qrCodeId: id
      }
    })

  if (slug) revalidatePath(`/${slug}`)
  revalidatePath(`/qr-codes/${id}`)
  return { id }
}

export const updateQRCode = async ({
  id,
  dynamic,
  name,
  slug,
  website,
  logoId
}: {
  id: string
  dynamic: boolean
  name: string
  slug?: string
  website: string
  logoId?: string | null
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
  if (plan.isPro || plan.isFreeTrial) {
    if (dynamic && !qr.dynamic) {
      const dynamicCount = await prisma.qRCode.count({
        where: {
          dynamic: true,
          createdById: session.user.id
        }
      })

      if (dynamicCount >= 5)
        return {
          error: `You can only create 5 dynamic QR Codes with ${plan.name} plan`
        }
    }
  } else {
    if (dynamic)
      return {
        error: `Dynamic QR Codes are only available for ${plan.name} plan`
      }
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
    return { error: 'Slug already taken' }

  await Promise.all([
    prisma.qRCode.update({
      where: {
        id
      },
      data: {
        name,
        dynamic,
        slug,
        website,
        expires: dynamic ? new Date(plan.currentPeriodEnd) : null
      }
    }),
    prisma.resource.updateMany({
      where: {
        qrCodeId: id
      },
      data: {
        qrCodeId: null
      }
    })
  ])

  if (logoId)
    await prisma.resource.update({
      where: {
        id: logoId
      },
      data: {
        qrCodeId: id
      }
    })

  if (qr.slug) revalidatePath(`/${qr.slug}`)
  if (slug && qr.slug !== slug) revalidatePath(`/${slug}`)
  revalidatePath(`/qr-codes/${id}`)
  return { id }
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

  if (deleted.slug) revalidatePath(`/${deleted.slug}`)
  revalidatePath(`/qr-codes/${id}`)
  return
}
