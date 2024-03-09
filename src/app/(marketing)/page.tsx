import Link from 'next/link'

import { BarGraph } from '@/components/graphs/bar-graph'
import { PricingCards } from '@/components/pricing-cards'
import { QRPlayground } from '@/components/qr-playground'
import { BackgroundBeams } from '@/components/ui/background-beams'
import { Button } from '@/components/ui/button'
import { InfiniteMovingCards } from '@/components/ui/infinite-moving-cards'
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
    quote:
      'It was the best of times, it was the worst of times, it was the age of wisdom, it was the age of foolishness, it was the epoch of belief, it was the epoch of incredulity, it was the season of Light, it was the season of Darkness, it was the spring of hope, it was the winter of despair.',
    name: 'Charles Dickens',
    title: 'A Tale of Two Cities'
  },
  {
    quote:
      "To be, or not to be, that is the question: Whether 'tis nobler in the mind to suffer The slings and arrows of outrageous fortune, Or to take Arms against a Sea of troubles, And by opposing end them: to die, to sleep.",
    name: 'William Shakespeare',
    title: 'Hamlet'
  },
  {
    quote: 'All that we see or seem is but a dream within a dream.',
    name: 'Edgar Allan Poe',
    title: 'A Dream Within a Dream'
  },
  {
    quote:
      'It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.',
    name: 'Jane Austen',
    title: 'Pride and Prejudice'
  },
  {
    quote:
      'Call me Ishmael. Some years ago—never mind how long precisely—having little or no money in my purse, and nothing particular to interest me on shore, I thought I would sail about a little and see the watery part of the world.',
    name: 'Herman Melville',
    title: 'Moby-Dick'
  }
]

const Home = async () => {
  const session = await getAuthSession()

  return (
    <div className="relative flex flex-col">
      <section className="relative w-full py-12 sm:min-h-screen md:py-24 lg:py-32">
        <div className="container relative z-10 mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
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
        <Spotlight
          className="-top-40 left-0 md:-top-20 md:left-60"
          fill="gray"
        />
      </section>
      <section className="dark:bg-grid-white/[0.1] bg-grid-black/[0.2] relative w-full bg-background py-12 sm:min-h-screen md:py-16 lg:py-32">
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
      <section className="relative w-full py-12 sm:min-h-screen md:py-16 lg:py-32">
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
      <section className="relative w-full py-12 md:py-16 lg:py-32">
        <InfiniteMovingCards
          items={testimonials}
          direction="right"
          speed="slow"
        />
      </section>
    </div>
  )
}

export default Home
