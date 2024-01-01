'use server'

import { env } from '@/env.mjs'
import { getAuthSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { stripe } from '@/lib/stripe'
import {
  getUserSubscriptionPlan,
  proPlanMonthly,
  proPlanYearly
} from '@/lib/subscription'

const appUrl = `${env.NEXT_PUBLIC_APP_URL}/billing`

export const getStripeBillingUrl = async (type?: 'monthly' | 'yearly') => {
  const session = await getAuthSession()
  if (!session?.user || !session.user.email) throw new Error('Unauthorized')

  let stripeCustomerId: string | undefined

  const u = await prisma.user.findUniqueOrThrow({
    where: {
      id: session.user.id
    },
    select: {
      id: true,
      name: true,
      email: true,
      stripeCustomerId: true
    }
  })

  if (!u.email) throw new Error('No email in user')

  if (u.stripeCustomerId) {
    stripeCustomerId = u.stripeCustomerId
  } else {
    const c = await stripe.customers.create({
      email: u.email,
      name: u.name || undefined
    })
    await prisma.user.update({
      where: {
        id: u.id
      },
      data: {
        stripeCustomerId: c.id
      }
    })
    stripeCustomerId = c.id
  }

  const subscriptionPlan = await getUserSubscriptionPlan(session.user.id)

  if (subscriptionPlan.isPro) {
    const stripeSession = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: appUrl
    })

    return { url: stripeSession.url }
  }

  const stripeSession = await stripe.checkout.sessions.create({
    success_url: appUrl,
    cancel_url: appUrl,
    payment_method_types: ['card'],
    mode: 'subscription',
    customer: stripeCustomerId,
    line_items: [
      {
        price:
          type === 'yearly'
            ? proPlanYearly.stripePriceId
            : proPlanMonthly.stripePriceId,
        quantity: 1
      }
    ]
  })

  if (!stripeSession.url) return { error: 'Stripe session url not found' }

  return { url: stripeSession.url }
}
