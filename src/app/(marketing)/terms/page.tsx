import { Metadata } from 'next'
import Link from 'next/link'

import { siteConfig } from '@/lib/siteConfig'

export const metadata: Metadata = {
  title: 'Terms of Service - ' + siteConfig.name,
  description: siteConfig.description
}

const date = new Date('2024-01-01').toLocaleDateString('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
})

const TermsPage = () => {
  return (
    <div className="px-2 sm:px-4 lg:px-8">
      <h1 className="my-2 text-5xl font-bold">Terms of Service</h1>
      <div>
        <span className="text-lg text-muted-foreground">
          Last Updated: {date}
        </span>
      </div>
      <ol className="my-4 flex list-decimal flex-col space-y-2 px-1">
        <li>
          Acceptance of Terms: By accessing or using {siteConfig.name}&apos;s QR
          code generator (the Service), you agree to comply with and be bound by
          these Terms of Service.
        </li>
        <li>
          Description of Service: The Next QR provides a QR code generator
          service with login functionality, dynamic QR codes, and optional paid
          subscriptions for enhanced features.
        </li>
        <li>
          User Accounts:
          <ul className="list-inside list-disc">
            <li>
              To access certain features of the Service, you may be required to
              register for an account. You agree to provide accurate, current,
              and complete information during the registration process.
            </li>
            <li>
              You are responsible for maintaining the confidentiality of your
              account credentials and for all activities that occur under your
              account.
            </li>
          </ul>
        </li>
        <li>
          Dynamic QR Code Usage:
          <ul className="list-inside list-disc">
            <li>
              Users can generate dynamic QR codes to track and monitor usage and
              analytics.
            </li>
            <li>
              The Next QR reserves the right to limit or suspend access to
              dynamic QR code features for any user violating these Terms.
            </li>
          </ul>
        </li>
        <li>
          Paid Subscriptions:
          <ul className="list-inside list-disc">
            <li>
              The Next QR offers paid subscriptions with additional features and
              limits for dynamic QR codes.
            </li>
            <li>
              Payment terms, including fees and billing cycles, are outlined in
              the subscription plan selected by the user.
            </li>
          </ul>
        </li>
        <li>
          Termination: The Next QR reserves the right to terminate or suspend
          access to the Service, with or without cause, at any time.
        </li>
        <li>
          Limitation of Liability: The Next QR is not liable for any direct,
          indirect, incidental, special, or consequential damages arising out of
          or in any way connected with the use of the Service.
        </li>
        <li>
          Changes to Terms: The Next QR reserves the right to modify or revise
          these Terms of Service at any time. Continued use of the Service after
          such changes constitutes your acceptance of the new Terms.
        </li>
        <li>
          Contact Us: If you have any questions or concerns about this Terms of
          Service, please{' '}
          <Link href="/contact" className="underline underline-offset-4">
            contact us.
          </Link>
        </li>
      </ol>
    </div>
  )
}

export default TermsPage
