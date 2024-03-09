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
          <p className="text-left text-sm leading-loose">{siteConfig.name}</p>
        </Link>
        <div className="flex items-center justify-center gap-2">
          <Link
            href="/terms"
            className="hidden text-xs text-muted-foreground underline-offset-4 hover:underline sm:inline-block"
          >
            Terms of Service
          </Link>
          <Link
            href="/privacy"
            className="hidden text-xs text-muted-foreground underline-offset-4 hover:underline sm:inline-block"
          >
            Privacy Policy
          </Link>
          <Link
            href="/terms"
            className="text-xs text-muted-foreground underline-offset-4 hover:underline sm:hidden"
          >
            Terms
          </Link>
          <Link
            href="/privacy"
            className="text-xs text-muted-foreground underline-offset-4 hover:underline sm:hidden"
          >
            Privacy
          </Link>
          <DarkModeToggle />
        </div>
      </div>
    </footer>
  )
}
