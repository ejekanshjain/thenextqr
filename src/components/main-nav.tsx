'use client'

import Link from 'next/link'
import { FC } from 'react'

import { Icons } from '@/components/icons'
import { siteConfig } from '@/lib/siteConfig'

type MainNavProps = {
  logoLink?: string
}

export const MainNav: FC<MainNavProps> = ({ logoLink = '/' }) => {
  return (
    <div className="flex md:gap-10">
      <Link href={logoLink} className="items-center space-x-2 flex">
        <Icons.logo />
        <span className="font-bold">{siteConfig.name}</span>
      </Link>
    </div>
  )
}
