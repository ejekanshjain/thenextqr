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
import { plans } from '@/lib/subscription'
import { PricingButton } from './pricing-button'
import { BackgroundGradient } from './ui/background-gradient'

export const PricingCards = async () => {
  const session = await getAuthSession()

  return (
    <div className="grid w-full gap-6 lg:grid-cols-3 lg:gap-12">
      {plans.map(plan => {
        const Inner = (
          <>
            <div className="flex flex-col justify-between">
              <CardHeader className="flex flex-col gap-4">
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription className="text-gray-500">
                  {plan.description}
                </CardDescription>
                <div className="flex items-end">
                  <h4 className="text-3xl font-semibold">${plan.price}</h4>
                  {plan.per ? (
                    <span className="ml-2 text-sm font-light text-gray-600">
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
          </>
        )
        return plan.promoted ? (
          <BackgroundGradient
            className="flex h-full flex-col justify-between rounded-[22px] bg-background p-4 sm:p-8"
            key={plan.name}
          >
            {Inner}
          </BackgroundGradient>
        ) : (
          <Card className="flex h-full flex-col justify-between rounded-[22px] bg-background p-4 sm:p-8">
            {Inner}
          </Card>
        )
      })}
    </div>
  )
}
