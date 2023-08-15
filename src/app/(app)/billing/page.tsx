import { Heading } from '@/components/heading'
import { Shell } from '@/components/shell'
import { getAuthSession } from '@/lib/auth'
import { stripe } from '@/lib/stripe'
import { getUserSubscriptionPlan } from '@/lib/subscription'
import { Render } from './render'

const BillingPage = async () => {
  const session = await getAuthSession()
  if (!session?.user) return null

  const subscriptionPlan = await getUserSubscriptionPlan(session.user.id)

  // If user has a pro plan, check cancel status on Stripe.
  let isCanceled = false
  if (subscriptionPlan.isPro && subscriptionPlan.stripeSubscriptionId) {
    const stripePlan = await stripe.subscriptions.retrieve(
      subscriptionPlan.stripeSubscriptionId
    )
    isCanceled = stripePlan.cancel_at_period_end
  }

  return (
    <Shell>
      <Heading
        heading="Billing"
        text="Manage billing and your subscription plan."
      />
      <div className="grid gap-10">
        <Render
          subscriptionPlan={{
            ...subscriptionPlan,
            isCanceled
          }}
        />
      </div>
    </Shell>
  )
}

export default BillingPage
