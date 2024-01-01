'use client'

import { User } from 'next-auth'
import { signOut } from 'next-auth/react'
import Link from 'next/link'
import { FC, HTMLAttributes } from 'react'

import { Icons } from '@/components/icons'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { UserAvatar } from '@/components/user-avatar'

interface UserAccountNavProps extends HTMLAttributes<HTMLDivElement> {
  user?:
    | (Pick<User, 'name' | 'image' | 'email'> & {
        plan?: string | null
      })
    | null
}

export const UserAccountNav: FC<UserAccountNavProps> = ({ user }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <UserAvatar
          user={
            user ? { name: user.name || null, image: user.image || null } : null
          }
          className="h-8 w-8"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {user ? (
          <>
            <Link
              href="/settings"
              className="flex items-center justify-start gap-2 p-2 hover:bg-muted transition-all"
            >
              <div className="flex flex-col space-y-1 leading-none">
                {user.name && (
                  <div className="flex items-center gap-1">
                    <span className="font-medium">{user.name}</span>
                    {user.plan ? (
                      <Badge className="py-0">{user.plan}</Badge>
                    ) : null}
                  </div>
                )}
                {user.email && (
                  <p className="w-[200px] truncate text-sm text-muted-foreground">
                    {user.email}
                  </p>
                )}
              </div>
            </Link>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/qr-codes" className="cursor-pointer">
                <Icons.qrCode className="mr-3 h-4 w-4" />
                QR Codes
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/billing" className="cursor-pointer">
                <Icons.card className="mr-3 h-4 w-4" />
                Subscription & Billing
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/" className="cursor-pointer">
                <Icons.dollar className="mr-3 h-4 w-4" />
                Pricing
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings" className="cursor-pointer">
                <Icons.settings className="mr-3 h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/" className="cursor-pointer">
                <Icons.faq className="mr-3 h-4 w-4" />
                FAQs
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer"
              onSelect={event => {
                event.preventDefault()
                signOut({
                  callbackUrl: `${window.location.origin}/login`
                })
              }}
            >
              <Icons.logout className="mr-3 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuItem asChild>
              <Link href="/login" className="cursor-pointer">
                <Icons.login className="mr-3 h-4 w-4" />
                Login
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/" className="cursor-pointer">
                <Icons.dollar className="mr-3 h-4 w-4" />
                Pricing
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/" className="cursor-pointer">
                <Icons.faq className="mr-3 h-4 w-4" />
                FAQs
              </Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
