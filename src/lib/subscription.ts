import { env } from '@/env.mjs'
import { prisma } from '@/lib/db'
import { User } from '@prisma/client'

export type SubscriptionPlan = {
  name: string
  description: string
  stripePriceId: string
}

export type UserSubscriptionPlan = SubscriptionPlan &
  Pick<User, 'stripeSubscriptionId'> & {
    stripeCurrentPeriodEnd: number
    isPro: boolean
  }

export const freePlan: SubscriptionPlan = {
  name: 'FREE',
  description:
    'The FREE plan is limited to 5 static QR codes only. Upgrade to the PRO plan for 50 static QR codes and 5 dynamic QR codes.',
  stripePriceId: ''
}

export const proPlan: SubscriptionPlan = {
  name: 'PRO',
  description: 'The PRO plan has 50 static QR codes and 5 dynamic QR codes.',
  stripePriceId: env.STRIPE_PRO_MONTHLY_PLAN_ID
}

export const getUserSubscriptionPlan = async (
  userId: string
): Promise<UserSubscriptionPlan> => {
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      id: userId
    },
    select: {
      stripeSubscriptionId: true,
      stripePriceId: true,
      stripeCurrentPeriodEnd: true
    }
  })

  const isPro = !!(
    user.stripePriceId &&
    (user.stripeCurrentPeriodEnd?.getTime() || 0) > Date.now()
  )

  const plan = isPro ? proPlan : freePlan

  return {
    ...plan,
    ...user,
    stripeCurrentPeriodEnd: user.stripeCurrentPeriodEnd?.getTime() || 0,
    isPro,
    stripePriceId: user.stripePriceId || ''
  }
}
