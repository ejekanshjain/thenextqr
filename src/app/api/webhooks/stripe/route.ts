import { headers } from 'next/headers'
import Stripe from 'stripe'

import { env } from '@/env.mjs'
import { prisma } from '@/lib/db'
import { stripe } from '@/lib/stripe'

export async function POST(req: Request) {
  try {
    const body = await req.text()
    const signature = headers().get('Stripe-Signature') as string

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        env.STRIPE_WEBHOOK_SECRET
      )
    } catch (err) {
      console.error(err)
      return new Response(`Webhook Error: ${(err as any).message}`, {
        status: 400
      })
    }

    if (event.type === 'invoice.payment_succeeded') {
      const stripeInvoice = event.data.object as Stripe.Invoice
      const subscriptionId = stripeInvoice.subscription?.toString()

      if (!subscriptionId) {
        console.error('Invalid parameters "subscriptionId"')
        return new Response('Invalid parameters "subscriptionId"', {
          status: 400
        })
      }

      const subscription = await stripe.subscriptions.retrieve(subscriptionId)
      const priceId = subscription.items.data[0]?.price.id
      const userId = subscription.metadata?.userId

      if (!userId || !priceId) {
        console.error('Invalid parameters "userId" and "priceId"')
        return new Response('Invalid parameters "userId" and "priceId"', {
          status: 400
        })
      }

      const expires = new Date(subscription.current_period_end * 1000)

      await Promise.all([
        prisma.user.update({
          where: {
            id: userId
          },
          data: {
            stripeSubscriptionId: subscriptionId,
            stripePriceId: priceId,
            stripeCurrentPeriodEnd: expires
          }
        }),
        prisma.qRCode.updateMany({
          where: {
            createdById: userId,
            dynamic: true
          },
          data: {
            expires
          }
        })
      ])

      return new Response('Done', { status: 200 })
    }

    console.error(`Unhandled Stripe Event: ${event.type}`)
    return new Response(`Unhandled Stripe Event: ${event.type}`, {
      status: 400
    })
  } catch (err) {
    console.error(err)
    return new Response('Internal Server Error', { status: 500 })
  }
}
