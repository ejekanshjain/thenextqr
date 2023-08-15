import { env } from '@/env.mjs'
import { prisma } from '@/lib/db'
import { User } from '@prisma/client'

export type SubscriptionPlan = {
  name: string
  description: string
  stripePriceId: string
}

export type UserSubscriptionPlan = SubscriptionPlan &
  Pick<User, 'stripeCustomerId' | 'stripeSubscriptionId'> & {
    stripeCurrentPeriodEnd: number
    isPro: boolean
  }

export const freePlan: SubscriptionPlan = {
  name: 'Free',
  description:
    'The free plan is limited to 5 static QR codes only. Upgrade to the PRO plan for unlimited static QR codes and 5 dynamic QR codes.',
  stripePriceId: ''
}

export const proPlan: SubscriptionPlan = {
  name: 'PRO',
  description:
    'The PRO plan has unlimited static QR codes and 5 dynamic QR codes.',
  stripePriceId: env.STRIPE_PRO_MONTHLY_PLAN_ID
}

export const getUserSubscriptionPlan = async (
  userId: string
): Promise<UserSubscriptionPlan> => {
  const user = await prisma.user.findFirst({
    where: {
      id: userId
    },
    select: {
      stripeCustomerId: true,
      stripeSubscriptionId: true,
      stripePriceId: true,
      stripeCurrentPeriodEnd: true
    }
  })

  if (!user) throw new Error('User not found')

  const isPro = !!(
    user.stripePriceId &&
    (user.stripeCurrentPeriodEnd?.getTime() || 0) + 86_400_000 > Date.now()
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
