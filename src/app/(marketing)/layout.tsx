import { ReactNode } from 'react'

import { MainNav } from '@/components/main-nav'
import { SiteFooter } from '@/components/site-footer'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/ui/icons'
import Link from 'next/link'

const Layout = async ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex min-h-screen flex-col space-y-4">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
          <MainNav />
          <div className="flex items-center justify-center space-x-4">
            <Link href="/login">
              <Button size="sm">
                <Icons.login className="mr-2 h-4 w-4" />
                Sign in to Continue
              </Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <SiteFooter className="border-t" />
    </div>
  )
}

export default Layout
