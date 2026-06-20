'use client'

import {
  adminClient,
  inferAdditionalFields,
  lastLoginMethodClient,
  magicLinkClient,
  organizationClient
} from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'
import type { auth } from './auth'

export const { signIn, signOut, getLastUsedLoginMethod, admin } =
  createAuthClient({
    plugins: [
      inferAdditionalFields<typeof auth>(),
      magicLinkClient(),
      adminClient(),
      organizationClient(),
      lastLoginMethodClient()
    ]
  })
