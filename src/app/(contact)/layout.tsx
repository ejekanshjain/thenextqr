import { Metadata } from 'next'
import { ReactNode } from 'react'

import { SiteFooter } from '@/components/site-footer'
import { siteConfig } from '@/lib/siteConfig'

export const metadata: Metadata = {
  title: 'Contact Us - ' + siteConfig.name,
  description: siteConfig.description
}

const AuthLayout = async ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex min-h-screen flex-col justify-between">
      <main>{children}</main>
      <SiteFooter />
    </div>
  )
}

export default AuthLayout
