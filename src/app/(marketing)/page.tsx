import { BarGraph } from '@/components/graphs/bar-graph'
import { PricingCards } from '@/components/pricing-cards'
import { Button } from '@/components/ui/button'
import { getAuthSession } from '@/lib/auth'
import Link from 'next/link'

const graphData = [
  {
    name: 'Jan',
    count: 4230
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
    count: 5230
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
    <div className="flex flex-col min-h-screen">
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Track Your QR Code Scans
              </h2>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                Upgrade Now and get insights into how often your QR codes are
                being scanned.
              </p>
            </div>
            <div className="w-full">
              <BarGraph data={graphData} />
            </div>
            <div>
              <PricingCards />
            </div>
          </div>
        </div>
      </section>
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                Generate Your QR Code
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                Enter your desired content and generate a QR code instantly.
                Customize the logo to your needs.
              </p>
            </div>
            <div className="w-full max-w-md pt-5">
              <Link href={session?.user ? '/qr-codes/new' : '/login'}>
                <Button size="lg">Generate QR Code</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
