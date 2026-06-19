'use server'

import { nanoid } from 'nanoid'

import { getAuthSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { normalizeQRCodeFinderPatternColor } from '@/lib/qrFinderPatternColor'
import { getUserSubscriptionPlan } from '@/lib/subscription'
import { UnwrapPromise } from '@/types/UnwrapPromise'
import { QRCodeColorMode, QRCodeType } from '@prisma/client'
import { revalidatePath } from 'next/cache'

export const getQRCode = async (id: string) => {
  const session = await getAuthSession()
  if (!session?.user) throw new Error('Unauthorized')
  return await prisma.qRCode.findUniqueOrThrow({
    where: {
      id,
      createdById: session.user.id
    },
    include: {
      logo: {
        select: {
          id: true,
          url: true,
          cdnUrl: true
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
  logoId,
  type,
  colorCode,
  colorMode,
  website,
  phoneNumber,
  message,
  email,
  subject
}: {
  dynamic: boolean
  name: string
  slug?: string
  logoId?: string | null
  type: QRCodeType
  colorCode: string
  colorMode: QRCodeColorMode
  website?: string | null
  phoneNumber?: string | null
  message?: string | null
  email?: string | null
  subject?: string | null
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
      type,
      colorCode: normalizeQRCodeFinderPatternColor(colorCode),
      colorMode,
      expires: dynamic ? new Date(plan.currentPeriodEnd) : null,
      website,
      phoneNumber,
      message,
      email,
      subject,
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

  revalidatePath(`/qr-codes/${id}`)
  revalidatePath('/qr-codes')

  return { id }
}

export const updateQRCode = async ({
  id,
  dynamic,
  name,
  slug,
  logoId,
  colorCode,
  colorMode,
  website,
  phoneNumber,
  message,
  email,
  subject
}: {
  id: string
  dynamic: boolean
  name: string
  slug?: string
  logoId?: string | null
  colorCode: string
  colorMode: QRCodeColorMode
  website?: string | null
  phoneNumber?: string | null
  message?: string | null
  email?: string | null
  subject?: string | null
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

  if (!dynamic) {
    slug = null as any
  } else if (dynamic && !slug) {
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
        colorCode: normalizeQRCodeFinderPatternColor(colorCode),
        colorMode,
        expires: dynamic ? new Date(plan.currentPeriodEnd) : null,
        website,
        phoneNumber,
        message,
        email,
        subject
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

  revalidatePath(`/qr-codes/${id}`)
  revalidatePath('/qr-codes')

  return { id }
}

export const deleteQRCode = async (id: string) => {
  const session = await getAuthSession()
  if (!session?.user) throw new Error('Unauthorized')

  await prisma.qRCode.delete({
    where: {
      id,
      createdById: session.user.id
    }
  })

  revalidatePath(`/qr-codes/${id}`)
  revalidatePath('/qr-codes')

  return
}
