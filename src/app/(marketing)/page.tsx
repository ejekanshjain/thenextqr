import Link from 'next/link'

import { BarGraph } from '@/components/graphs/bar-graph'
import { PricingCards } from '@/components/pricing-cards'
import { QRPlayground } from '@/components/qr-playground'
import { BackgroundBeams } from '@/components/ui/background-beams'
import { Button } from '@/components/ui/button'
import { getAuthSession } from '@/lib/auth'

const graphData = [
  {
    name: 'Jan',
    count: 1630
  },
  {
    name: 'Feb',
    count: 3150
  },
  {
    name: 'Mar',
    count: 1250
  },
  {
    name: 'Apr',
    count: 2099
  },
  {
    name: 'May',
    count: 3450
  },
  {
    name: 'Jun',
    count: 2390
  },
  {
    name: 'Jul',
    count: 2002
  }
]

const Home = async () => {
  const session = await getAuthSession()

  return (
    <div className="relative flex min-h-screen flex-col">
      <section className="relative w-full py-12 md:py-24 lg:py-32">
        <div className="container relative z-10 mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                Generate Your QR Code
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-500 dark:text-gray-400 md:text-xl">
                Enter your desired content and generate a QR code instantly.
                Customize the logo to your needs.
              </p>
            </div>
            <div className="w-full max-w-md pt-5">
              <Link href={session?.user ? '/qr-codes/new' : '/login'}>
                <Button size="lg">Generate QR Code</Button>
              </Link>
            </div>
            <div className="max-w-2xl flex-col space-y-2 pt-8">
              <QRPlayground />
            </div>
          </div>
        </div>
        <BackgroundBeams />
      </section>
      <section className="dark:bg-grid-white/[0.2] bg-grid-black/[0.2] relative min-h-screen w-full bg-background py-12 md:py-16 lg:py-32">
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-background [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
        <div className="container relative z-10 mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Track Your QR Code Scans
              </h2>
              <p className="mx-auto max-w-[700px] text-gray-500 dark:text-gray-400 md:text-xl">
                Upgrade Now and get insights into how often your QR codes are
                being scanned.
              </p>
            </div>
            <div className="w-full">
              <BarGraph data={graphData} />
            </div>
          </div>
        </div>
      </section>
      <section className="w-full py-12 md:py-16 lg:py-32">
        <div className="flex w-full flex-col items-center justify-center">
          <h2 className="mb-4 text-5xl font-bold">Pricing Plans</h2>
          <p className="max-w-xl text-center text-lg text-gray-600">
            Choose a plan that suits your need. Upgrade, downgrade, or cancel
            anytime.
          </p>
          <div className="mt-12 w-full max-w-6xl">
            <PricingCards />
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
