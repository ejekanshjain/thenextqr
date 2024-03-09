import Link from 'next/link'

import { BarGraph } from '@/components/graphs/bar-graph'
import { Icons } from '@/components/icons'
import { PricingCards } from '@/components/pricing-cards'
import { QRPlayground } from '@/components/qr-playground'
import { BackgroundBeams } from '@/components/ui/background-beams'
import { Button } from '@/components/ui/button'
import { InfiniteMovingCards } from '@/components/ui/infinite-moving-cards'
import { SparklesCore } from '@/components/ui/sparkles'
import { Spotlight } from '@/components/ui/spotlight'
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

const testimonials = [
  {
    name: 'Priya Sharma',
    title: 'Marketing Manager',
    quote:
      'The QR code generation feature in this app is incredibly useful for our marketing campaigns. Being able to track the number of scans and access detailed analytics has greatly improved our understanding of customer engagement.'
  },
  {
    name: 'Rahul Patel',
    title: 'Event Organizer',
    quote:
      'As an event organizer, I rely heavily on QR codes for ticketing and promotional purposes. This app not only simplifies the process of generating QR codes but also provides insightful analytics on scan data, allowing me to optimize event strategies.'
  },
  {
    name: 'Amit Singh',
    title: 'Small Business Owner',
    quote:
      "Using this app has been a game-changer for my small business. I can easily create dynamic QR codes for various products and track how many times they've been scanned. The detailed reports help me refine my marketing efforts and understand customer behavior better."
  },
  {
    name: 'Neha Verma',
    title: 'Digital Marketer',
    quote:
      "I've tried several QR code generators, but this app stands out for its advanced analytics features. It not only generates QR codes efficiently but also provides comprehensive insights into user interactions. It's a must-have tool for any digital marketer."
  }
]

const Home = async () => {
  const session = await getAuthSession()

  return (
    <div className="relative flex flex-col">
      <section className="relative w-full overflow-hidden py-12 md:min-h-screen md:py-24 lg:py-32">
        <div className="container relative z-10 mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                Generate your QR now
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-500 dark:text-gray-400 md:text-xl">
                Enter your desired content and generate a QR code instantly.
                Customize the logo to your needs.
              </p>
            </div>
            <div className="w-full max-w-md pt-5">
              <Link href={session?.user ? '/qr-codes/new' : '/login'}>
                <Button size="lg">
                  Join Now <Icons.arrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="max-w-2xl flex-col space-y-2 pt-8">
              <QRPlayground />
            </div>
          </div>
        </div>
        <Spotlight
          className="-top-40 left-0 md:-top-20 md:left-60"
          fill="gray"
        />
      </section>
      <section className="relative w-full bg-background py-12 bg-grid-black/[0.2] dark:bg-grid-white/[0.1] md:min-h-screen md:py-16 lg:py-32">
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-background [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
        <div className="container relative z-10 mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center md:space-y-8 lg:space-y-16">
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
      <section className="relative w-full py-12 md:min-h-screen md:py-16 lg:py-32">
        <div className="relative z-10 flex w-full flex-col items-center justify-center px-4">
          <h2 className="mb-4 text-3xl font-bold sm:text-4xl md:text-5xl">
            Pricing Plans
          </h2>
          <p className="max-w-xl text-center text-lg text-gray-600">
            Choose a plan that suits your need. Upgrade, downgrade, or cancel
            anytime.
          </p>
          <div className="mt-12 w-full max-w-6xl">
            <PricingCards />
          </div>
        </div>
        <BackgroundBeams />
      </section>
      <section className="relative w-full overflow-hidden py-12 md:py-16 lg:py-32">
        <div className="flex w-full flex-col items-center justify-center px-4">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            What are people saying?
          </h2>
          <div className="relative h-32 w-full max-w-xl">
            <div className="absolute inset-x-20 top-0 h-[2px] w-3/4 bg-gradient-to-r from-transparent via-indigo-500 to-transparent blur-sm" />
            <div className="absolute inset-x-20 top-0 h-px w-3/4 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
            <div className="absolute inset-x-60 top-0 h-[5px] w-1/4 bg-gradient-to-r from-transparent via-sky-500 to-transparent blur-sm" />
            <div className="absolute inset-x-60 top-0 h-px w-1/4 bg-gradient-to-r from-transparent via-sky-500 to-transparent" />

            <SparklesCore
              background="transparent"
              minSize={0.4}
              maxSize={1}
              particleDensity={1200}
              className="h-full w-full"
              particleColor="#FFFFFF"
            />

            <div className="absolute inset-0 h-full w-full bg-background [mask-image:radial-gradient(350px_200px_at_top,transparent_20%,white)]"></div>
          </div>
          <div className="-mt-4">
            <InfiniteMovingCards
              items={testimonials}
              direction="right"
              speed="slow"
            />
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
