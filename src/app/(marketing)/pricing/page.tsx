import { Metadata } from 'next'

import { PricingCards } from '@/components/pricing-cards'
import { siteConfig } from '@/lib/siteConfig'

export const metadata: Metadata = {
  title: 'Pricing - ' + siteConfig.name,
  description: siteConfig.description
}

const PricingPage = async () => {
  return (
    <div className="flex w-full flex-col items-center justify-center p-5 md:p-10">
      <h1 className="mb-4 text-5xl font-bold">Pricing Plans</h1>
      <p className="max-w-xl text-center text-lg text-gray-600">
        Choose a plan that suits your need. Upgrade, downgrade, or cancel
        anytime.
      </p>
      <div className="mt-12 w-full max-w-6xl">
        <PricingCards />
      </div>
    </div>
  )
}

export default PricingPage
