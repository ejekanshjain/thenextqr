'use server'

import { env } from '@/env.mjs'
import { getAuthSession } from '@/lib/auth'
import { stripe } from '@/lib/stripe'
import { getUserSubscriptionPlan, proPlan } from '@/lib/subscription'

const billingUrl = `${env.NEXT_PUBLIC_APP_URL}/billing`

export const getStripeBillingUrl = async () => {
  const session = await getAuthSession()
  if (!session?.user || !session.user.email) throw new Error('Unauthorized')

  const subscriptionPlan = await getUserSubscriptionPlan(session.user.id)

  if (subscriptionPlan.stripeCustomerId && subscriptionPlan.isPro) {
    const stripeSession = await stripe.billingPortal.sessions.create({
      customer: subscriptionPlan.stripeCustomerId,
      return_url: billingUrl
    })

    return stripeSession.url
  }

  const stripeSession = await stripe.checkout.sessions.create({
    success_url: billingUrl,
    cancel_url: billingUrl,
    payment_method_types: ['card'],
    mode: 'subscription',
    billing_address_collection: 'auto',
    customer_email: session.user.email,
    line_items: [
      {
        price: proPlan.stripePriceId,
        quantity: 1
      }
    ],
    metadata: {
      userId: session.user.id
    }
  })

  if (!stripeSession.url) throw new Error('Stripe session url not found')

  return stripeSession.url
}
