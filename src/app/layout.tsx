// import { Analytics } from '@vercel/analytics/react'
// import { SpeedInsights } from '@vercel/speed-insights/next'
import { GeistMono } from 'geist/font/mono'
import { GeistSans } from 'geist/font/sans'
import { Metadata } from 'next'
import { ThemeProvider } from 'next-themes'
import { ReactNode } from 'react'

import { Toaster } from '@/components/ui/toaster'
import { WWWRedirection } from '@/components/www-redirection'
import { env } from '@/env.mjs'
import { cn } from '@/lib/cn'
import { siteConfig } from '@/lib/siteConfig'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: siteConfig.name,
  description: siteConfig.description
}

const RootLayout = ({ children }: { children: ReactNode }) => {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          GeistSans.variable,
          GeistMono.variable
        )}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
          {/* <Analytics /> */}
          {/* <SpeedInsights /> */}
          {env.NODE_ENV === 'production' ? <WWWRedirection /> : null}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}

export default RootLayout
