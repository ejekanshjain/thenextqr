import { ReactNode } from 'react'

import { SiteFooter } from '@/components/site-footer'

const Layout = async ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex min-h-screen flex-col space-y-4">
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  )
}

export default Layout
