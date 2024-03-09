import { Metadata } from 'next'
import { ReactNode } from 'react'

import { MainNav } from '@/components/main-nav'
import { SiteFooter } from '@/components/site-footer'
import { Badge } from '@/components/ui/badge'
import { UserAccountNav } from '@/components/user-account-nav'
import { getAuthSession } from '@/lib/auth'
import { siteConfig } from '@/lib/siteConfig'

export const metadata: Metadata = {
  title: siteConfig.name,
  description: siteConfig.description
}

const Layout = async ({ children }: { children: ReactNode }) => {
  const session = await getAuthSession()

  return (
    <div className="flex min-h-screen flex-col space-y-4">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="app-container flex h-16 items-center justify-between py-4">
          <MainNav />
          <div className="flex items-center justify-center space-x-4">
            <Badge className="px-3 py-1.5 font-normal" variant="secondary">
              Beta
            </Badge>
            <UserAccountNav
              user={
                session
                  ? {
                      name: session.user.name,
                      image: session.user.image,
                      email: session.user.email,
                      plan: session.user.plan
                    }
                  : null
              }
            />
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <SiteFooter className="border-t" />
    </div>
  )
}

export default Layout
