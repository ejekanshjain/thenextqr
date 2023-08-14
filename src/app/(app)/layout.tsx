import { notFound } from 'next/navigation'
import { ReactNode } from 'react'

import { MainNav } from '@/components/main-nav'
import { SiteFooter } from '@/components/site-footer'
import { UserAccountNav } from '@/components/user-account-nav'
import { getAuthSession } from '@/lib/auth'

const AdminLayout = async ({ children }: { children: ReactNode }) => {
  const session = await getAuthSession()

  if (!session?.user) return notFound()

  return (
    <div className="flex min-h-screen flex-col space-y-4">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
          <MainNav />
          <div className="flex items-center justify-center space-x-4">
            <UserAccountNav
              user={{
                name: session.user.name,
                image: session.user.image,
                email: session.user.email
              }}
            />
          </div>
        </div>
      </header>
      <div className="flex-1">{children}</div>
      <SiteFooter className="border-t" />
    </div>
  )
}

export default AdminLayout
