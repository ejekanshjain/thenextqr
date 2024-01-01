import { Metadata } from 'next'

import { Icons } from '@/components/icons'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { getAuthSession } from '@/lib/auth'
import { siteConfig } from '@/lib/siteConfig'
import { plans } from '@/lib/subscription'
import { PricingButton } from './PricingButton'

export const metadata: Metadata = {
  title: 'Pricing - ' + siteConfig.name,
  description: siteConfig.description
}

const PricingPage = async () => {
  const session = await getAuthSession()

  return (
    <div className="flex flex-col items-center justify-center w-full p-5 md:p-10">
      <h1 className="text-5xl font-bold mb-4">Pricing Plans</h1>
      <p className="text-lg text-gray-600 text-center max-w-xl">
        Choose a plan that suits your need. Upgrade, downgrade, or cancel
        anytime.
      </p>
      <div className="mt-12 grid gap-6 lg:gap-12 lg:grid-cols-3 w-full max-w-6xl">
        {plans.map(plan => (
          <Card
            key={plan.name}
            className={`flex flex-col justify-between ${
              plan.promoted ? '' : ''
            }`}
          >
            <div>
              <CardHeader className="flex flex-col gap-4">
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription className="text-gray-500">
                  {plan.description}
                </CardDescription>
                <div className="flex items-end">
                  <h4 className="text-3xl font-semibold">${plan.price}</h4>
                  {plan.per ? (
                    <span className="text-gray-600 ml-2 font-light text-sm">
                      / {plan.per}
                    </span>
                  ) : null}
                </div>
              </CardHeader>
              <Separator />
              <CardContent className="py-6">
                <ul className="space-y-2 text-left text-sm">
                  {plan.features.map(feature => (
                    <li key={feature}>
                      <Icons.check className="mr-2 inline-block h-4 w-4" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </div>
            <CardFooter>
              <PricingButton
                session={!!session?.user}
                planStripePriceId={plan.stripePriceId}
                userStripePriceId={session?.user.stripePriceId}
              />
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default PricingPage
