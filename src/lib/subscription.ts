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

export const proPlanMonthly: SubscriptionPlan = {
  name: 'PRO',
  description: 'The PRO plan has 50 static QR codes and 5 dynamic QR codes.',
  stripePriceId: env.STRIPE_PRO_MONTHLY_PLAN_ID
}

export const proPlanYearly: SubscriptionPlan = {
  name: 'PRO',
  description: 'The PRO plan has 50 static QR codes and 5 dynamic QR codes.',
  stripePriceId: env.STRIPE_PRO_YEARLY_PLAN_ID
}

export const plans = [
  {
    name: 'Free',
    price: 0,
    per: null,
    description: 'For individuals that just want to explore.',
    promoted: false,
    features: [
      '5 Static QR Codes',
      '7 Day Free Trial of Pro',
      'No Credit Card Required'
    ],
    stripePriceId: ''
  },
  {
    name: 'Pro',
    price: 9.99,
    per: 'month',
    description: 'For reaching higher limits and more features.',
    promoted: true,
    features: [
      'Everything in Free',
      '50 Static QR Codes',
      '5 Dynamic QR Codes'
    ],
    stripePriceId: proPlanMonthly.stripePriceId
  },
  {
    name: 'Pro Yearly',
    price: 99.99,
    per: 'year',
    description: 'Save 20% by paying yearly.',
    promoted: false,
    features: ['Everything in Pro'],
    stripePriceId: proPlanYearly.stripePriceId
  }
]

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
    user.stripePriceId &&
    (user.stripePriceId === proPlanMonthly.stripePriceId ||
      user.stripePriceId === proPlanYearly.stripePriceId) &&
    user.currentPeriodEnd.getTime() > Date.now()
  )

  const isFreeTrial = !isPro && user.currentPeriodEnd.getTime() > Date.now()

  const plan = isPro
    ? user.stripePriceId === proPlanMonthly.stripePriceId
      ? proPlanMonthly
      : proPlanYearly
    : isFreeTrial
      ? freeTrialPlan
      : freePlan

  return {
    ...plan,
    ...user,
    isFreeTrial,
    isPro,
    currentPeriodEnd: user.currentPeriodEnd.getTime(),
    stripePriceId: user.stripePriceId || ''
  }
}
