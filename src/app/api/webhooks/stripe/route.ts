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
      const stripeCustomerId = stripeInvoice.customer?.toString()

      if (!subscriptionId || !stripeCustomerId) {
        console.error(
          'Invalid parameters "subscriptionId" and "stripeCustomerId"'
        )
        return new Response(
          'Invalid parameters "subscriptionId" and "stripeCustomerId"',
          {
            status: 400
          }
        )
      }

      const subscription = await stripe.subscriptions.retrieve(subscriptionId)
      const priceId = subscription.items.data[0]?.price.id

      if (!priceId) {
        console.error('Invalid parameters "priceId"')
        return new Response('Invalid parameters "priceId"', {
          status: 400
        })
      }

      const expires = new Date(subscription.current_period_end * 1000)

      const u = await prisma.user.findUnique({
        where: {
          stripeCustomerId
        }
      })

      if (!u) {
        console.error(
          `User not found with stripeCustomerId: ${stripeCustomerId}`
        )
        return new Response(
          `User not found with stripeCustomerId: ${stripeCustomerId}`,
          {
            status: 404
          }
        )
      }

      await Promise.all([
        prisma.user.update({
          where: {
            id: u.id
          },
          data: {
            stripeSubscriptionId: subscriptionId,
            stripePriceId: priceId,
            currentPeriodEnd: expires
          }
        }),
        prisma.qRCode.updateMany({
          where: {
            createdById: u.id,
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
