import { Metadata } from 'next'

import { PricingCards } from '@/components/pricing-cards'
import { siteConfig } from '@/lib/siteConfig'

export const metadata: Metadata = {
  title: 'Pricing - ' + siteConfig.name,
  description: siteConfig.description
}

const PricingPage = async () => {
  return (
    <div className="flex flex-col items-center justify-center w-full p-5 md:p-10">
      <h1 className="text-5xl font-bold mb-4">Pricing Plans</h1>
      <p className="text-lg text-gray-600 text-center max-w-xl">
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
