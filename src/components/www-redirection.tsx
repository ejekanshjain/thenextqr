'use client'

import { env } from '@/env.mjs'
import { FC, useEffect } from 'react'

export const WWWRedirection: FC = () => {
  useEffect(() => {
    const base = new URL(env.NEXT_PUBLIC_APP_URL)
    const current = window.location

    if (!base.hostname.startsWith('www.')) return

    if (base.hostname === current.hostname) return

    const baseHostnameWithoutWww = base.hostname.replace('www.', '')

    if (current.hostname === baseHostnameWithoutWww) {
      const redirectTo = current.href.replace(current.hostname, base.hostname)
      window.location.href = redirectTo
    }
  }, [])

  return null
}
