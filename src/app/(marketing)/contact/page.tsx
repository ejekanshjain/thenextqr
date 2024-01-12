import { Metadata } from 'next'
import Link from 'next/link'

import { Icons } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { siteConfig } from '@/lib/siteConfig'
import { Render } from './render'

export const metadata: Metadata = {
  title: 'Contact Us - ' + siteConfig.name,
  description: siteConfig.description
}

const ContactPage = () => {
  return (
    <div className="app-container flex h-[90vh] w-screen flex-col items-center justify-center">
      <Link href="/" className="absolute left-4 top-4">
        <Button variant="ghost">
          <Icons.chevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </Link>
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-80">
        <div className="flex flex-col space-y-2 text-center">
          <Icons.logo className="mx-auto h-6 w-6" />
          <h1 className="text-2xl font-semibold tracking-tight">Contact Us</h1>
          <p className="text-sm text-muted-foreground">
            Fill out the form below and we&apos;ll get back to you shortly.
          </p>
        </div>
        <Render />
      </div>
    </div>
  )
}

export default ContactPage
