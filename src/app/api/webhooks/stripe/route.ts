import { headers } from 'next/headers'
import Stripe from 'stripe'

import { env } from '@/env.mjs'
import { prisma } from '@/lib/db'
import { stripe } from '@/lib/stripe'

export async function POST(req: Request) {
  const body = await req.text()
  const signature = headers().get('Stripe-Signature') as string

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      env.STRIPE_WEBHOOK_SECRET
    )
  } catch (error) {
    return new Response(`Webhook Error: ${(error as any).message}`, {
      status: 400
    })
  }

  const session = event.data.object as Stripe.Checkout.Session

  if (event.type === 'checkout.session.completed') {
    const userId = session.metadata?.userId
    const subscriptionId = session.subscription?.toString()

    if (userId && subscriptionId) {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId)
      const priceId = subscription.items.data[0]?.price.id

      if (priceId) {
        await prisma.user.update({
          where: {
            id: userId
          },
          data: {
            stripeSubscriptionId: subscription.id,
            stripePriceId: priceId,
            stripeCurrentPeriodEnd: new Date(
              subscription.current_period_end * 1000
            )
          }
        })
        return new Response('Done', { status: 200 })
      }
    }
    return new Response('Invalid parameters', { status: 400 })
  }

  if (event.type === 'invoice.payment_succeeded') {
    const subscriptionId = session.subscription?.toString()

    if (subscriptionId) {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId)
      const priceId = subscription.items.data[0]?.price.id

      if (priceId) {
        const expires = new Date(subscription.current_period_end * 1000)
        const u = await prisma.user.update({
          where: {
            stripeSubscriptionId: subscription.id
          },
          data: {
            stripePriceId: priceId,
            stripeCurrentPeriodEnd: expires
          }
        })
        await prisma.qRCode.updateMany({
          where: {
            createdById: u.id,
            dynamic: true
          },
          data: {
            expires
          }
        })
        return new Response('Done', { status: 200 })
      }
    }
    return new Response('Invalid parameters', { status: 400 })
  }

  return new Response('Not supported', { status: 400 })
}
