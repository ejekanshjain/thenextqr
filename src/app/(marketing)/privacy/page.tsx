import { Metadata } from 'next'
import Link from 'next/link'

import { siteConfig } from '@/lib/siteConfig'

export const metadata: Metadata = {
  title: 'Privacy Policy - ' + siteConfig.name,
  description: siteConfig.description
}

const date = new Date('2024-01-01').toLocaleDateString('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
})

const PrivacyPage = () => {
  return (
    <div className="px-2 sm:px-4 lg:px-8">
      <h1 className="my-2 text-5xl font-bold">Privacy Policy</h1>
      <div>
        <span className="text-lg text-muted-foreground">
          Last Updated: {date}
        </span>
      </div>
      <ol className="my-4 flex list-decimal flex-col space-y-2 px-1">
        <li>
          Introduction: This Privacy Policy outlines how The Next QR (we, our,
          or us) collects, uses, and protects the personal information of users
          of our QR code generator website (the Service).
        </li>
        <li>
          Information We Collect
          <ul className="list-inside list-disc">
            <li>
              User Account Information: When you create an account, we collect
              information such as your name, email address, and password.
            </li>
            <li>
              Authentication Information: We use NextAuth for user
              authentication, and during this process, certain information may
              be collected for login purposes.
            </li>
            <li>
              Usage Data: We may collect information on how you interact with
              the Service, including IP addresses, browser type, and access
              times.
            </li>
          </ul>
        </li>
        <li>
          Use of Information:
          <ul className="list-inside list-disc">
            <li>
              We use the collected information to provide and improve our
              Service, including personalized user experiences and customer
              support.
            </li>
            <li>
              Your information may be used for analytics, allowing us to analyze
              trends and optimize the Service.
            </li>
          </ul>
        </li>
        <li>
          Cookies:
          <ul className="list-inside list-disc">
            <li>
              We use cookies to enhance your user experience and for
              authentication purposes. Cookies are small pieces of data stored
              on your device.
            </li>
            <li>
              You can manage cookie preferences through your browser settings.
            </li>
          </ul>
        </li>
        <li>
          Third-Party Services: We may use third-party services for analytics
          and other purposes, and their privacy policies will apply.
        </li>
        <li>
          Data Security: We implement reasonable security measures to protect
          your information from unauthorized access, disclosure, alteration, or
          destruction.
        </li>
        <li>
          User Choices and Rights:
          <ul className="list-inside list-disc">
            <li>
              You can manage your account information and communication
              preferences through your account settings.
            </li>
            <li>
              You have the right to access, correct, or delete your personal
              information. Contact us for assistance.
            </li>
          </ul>
        </li>
        <li>
          Changes to Privacy Policy: We reserve the right to modify or update
          this Privacy Policy at any time. You will be notified of any
          significant changes.
        </li>
        <li>
          Contact Us: If you have any questions or concerns about this Privacy
          Policy, please{' '}
          <Link href="/contact" className="underline underline-offset-4">
            contact us.
          </Link>
        </li>
      </ol>
    </div>
  )
}

export default PrivacyPage
