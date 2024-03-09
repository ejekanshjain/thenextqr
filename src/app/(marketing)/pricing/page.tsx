import { Metadata } from 'next'

import { PricingCards } from '@/components/pricing-cards'
import { BackgroundBeams } from '@/components/ui/background-beams'
import { siteConfig } from '@/lib/siteConfig'

export const metadata: Metadata = {
  title: 'Pricing - ' + siteConfig.name,
  description: siteConfig.description
}

const PricingPage = async () => {
  return (
    <div className="relative flex w-full flex-col items-center justify-center p-5 md:p-10">
      <h1 className="relative z-10 mb-4 text-5xl font-bold">Pricing Plans</h1>
      <p className="relative z-10 max-w-xl text-center text-lg text-gray-600">
        Choose a plan that suits your need. Upgrade, downgrade, or cancel
        anytime.
      </p>
      <div className="relative z-10 mt-12 w-full max-w-6xl">
        <PricingCards />
      </div>
      <BackgroundBeams />
    </div>
  )
}

export default PricingPage
