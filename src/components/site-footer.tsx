import Link from 'next/link'
import { FC, HTMLAttributes } from 'react'

import { DarkModeToggle } from '@/components/dark-mode-toggle'
import { Icons } from '@/components/icons'
import { cn } from '@/lib/cn'
import { siteConfig } from '@/lib/siteConfig'

export const SiteFooter: FC<HTMLAttributes<HTMLElement>> = ({ className }) => {
  return (
    <footer className={cn(className)}>
      <div className="app-container flex items-center justify-between gap-2 py-4">
        <Link href="/" className="flex items-center gap-2">
          <Icons.logo />
          <p className="text-sm leading-loose text-left">{siteConfig.name}</p>
        </Link>
        <div className="flex items-center justify-center gap-2">
          <Link
            href="/terms"
            className="hidden sm:inline-block hover:underline underline-offset-4 text-xs text-muted-foreground"
          >
            Terms of Service
          </Link>
          <Link
            href="/privacy"
            className="hidden sm:inline-block hover:underline underline-offset-4 text-xs text-muted-foreground"
          >
            Privacy Policy
          </Link>
          <Link
            href="/terms"
            className="sm:hidden hover:underline underline-offset-4 text-xs text-muted-foreground"
          >
            Terms
          </Link>
          <Link
            href="/privacy"
            className="sm:hidden hover:underline underline-offset-4 text-xs text-muted-foreground"
          >
            Privacy
          </Link>
          <DarkModeToggle />
        </div>
      </div>
    </footer>
  )
}
