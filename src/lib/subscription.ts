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
    currentPeriodEnd: number
    isFreeTrial: boolean
    isPro: boolean
  }

export const freePlan: SubscriptionPlan = {
  name: 'FREE',
  description:
    'The FREE plan is limited to 5 static QR codes only. Upgrade to the PRO plan for 50 static QR codes and 5 dynamic QR codes.',
  stripePriceId: ''
}

export const freeTrialPlan: SubscriptionPlan = {
  name: 'FREE TRIAL',
  description:
    'The FREE TRIAL plan has 50 static QR codes and 5 dynamic QR codes. Upgrade to the PRO plan to continue using the benefits after the trial period ends.',
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
      currentPeriodEnd: true
    }
  })

  const isPro = !!(
    user.stripePriceId && user.currentPeriodEnd.getTime() > Date.now()
  )

  const isFreeTrial = !isPro && user.currentPeriodEnd.getTime() > Date.now()

  const plan = isPro ? proPlan : isFreeTrial ? freeTrialPlan : freePlan

  return {
    ...plan,
    ...user,
    isFreeTrial,
    isPro,
    currentPeriodEnd: user.currentPeriodEnd.getTime(),
    stripePriceId: user.stripePriceId || ''
  }
}
