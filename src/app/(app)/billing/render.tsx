'use client'

import { FC, useState } from 'react'

import { Icons } from '@/components/icons'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { toast } from '@/components/ui/use-toast'
import { formatDate } from '@/lib/formatDate'
import { UserSubscriptionPlan } from '@/lib/subscription'
import { getStripeBillingUrl } from './actions'

interface Props {
  subscriptionPlan: UserSubscriptionPlan & {
    isCanceled: boolean
  }
}

export const Render: FC<Props> = ({ subscriptionPlan }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscription Plan</CardTitle>
        <CardDescription>
          You are currently on the <strong>{subscriptionPlan.name}</strong>{' '}
          plan.
        </CardDescription>
      </CardHeader>
      <CardContent>{subscriptionPlan.description}</CardContent>
      <CardFooter className="flex flex-col items-start space-y-2 md:flex-row md:justify-between md:space-x-0">
        <Button
          type="submit"
          disabled={isLoading}
          onClick={async () => {
            setIsLoading(true)
            const result = await getStripeBillingUrl()
            if (result.error) {
              console.error(result.error)
              toast({
                title: 'Internal Server Error',
                variant: 'destructive',
                description: 'Please try again later.'
              })
            } else if (result.url) {
              window.location.href = result.url
            }
          }}
        >
          {isLoading ? (
            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
          ) : subscriptionPlan.isPro ? (
            <Icons.wrench className="mr-2 h-4 w-4" />
          ) : (
            <Icons.star className="mr-2 h-4 w-4" />
          )}
          {subscriptionPlan.isPro ? 'Manage Subscription' : 'Upgrade to PRO'}
        </Button>
        {subscriptionPlan.isFreeTrial ? (
          <p className="rounded-full text-xs font-medium">
            Your free trial ends on{' '}
            {formatDate(new Date(subscriptionPlan.currentPeriodEnd))}.
          </p>
        ) : undefined}
        {subscriptionPlan.isPro ? (
          <p className="rounded-full text-xs font-medium">
            {subscriptionPlan.isCanceled
              ? 'Your plan will be canceled on '
              : 'Your plan renews on '}
            {formatDate(new Date(subscriptionPlan.currentPeriodEnd))}.
          </p>
        ) : undefined}
      </CardFooter>
    </Card>
  )
}
