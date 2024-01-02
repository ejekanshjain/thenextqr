'use client'

import { useRouter } from 'next/navigation'
import { FC } from 'react'

import { Button } from '@/components/ui/button'

export const PricingButton: FC<{
  session: boolean
  planStripePriceId?: string | null
  userStripePriceId?: string | null
}> = ({ session, planStripePriceId, userStripePriceId }) => {
  const router = useRouter()

  let text = 'Get Started'

  if (session && planStripePriceId) text = 'Upgrade Now'

  if (
    session &&
    planStripePriceId &&
    userStripePriceId &&
    planStripePriceId === userStripePriceId
  )
    text = 'Current Plan'

  return (
    <Button
      disabled={!!(planStripePriceId && userStripePriceId)}
      onClick={() =>
        router.push(session && planStripePriceId ? '/billing' : '/login')
      }
    >
      {text}
    </Button>
  )
}
