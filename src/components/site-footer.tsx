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
            className="hover:underline underline-offset-4 text-sm"
          >
            Terms
          </Link>
          <Link
            href="/privacy"
            className="hover:underline underline-offset-4 text-sm"
          >
            Privacy
          </Link>
          <DarkModeToggle />
        </div>
      </div>
    </footer>
  )
}
