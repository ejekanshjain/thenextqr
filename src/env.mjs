import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    NODE_ENV: z.enum(['development', 'production']).default('development'),
    DATABASE_URL: z.string().url(),
    NEXTAUTH_SECRET:
      process.env.NODE_ENV === 'production'
        ? z.string().min(1)
        : z.string().min(1).optional(),
    NEXTAUTH_URL: z.preprocess(
      // This makes Vercel deployments not fail if you don't set NEXTAUTH_URL
      // Since NextAuth.js automatically uses the VERCEL_URL if present.
      str => process.env.VERCEL_URL ?? str,
      // VERCEL_URL doesn't include `https` so it cant be validated as a URL
      process.env.VERCEL ? z.string().min(1) : z.string().url()
    ),
    EMAIL_SERVER_HOST: z.string().min(1),
    EMAIL_SERVER_PORT: z.number(),
    EMAIL_SERVER_USER: z.string().min(1),
    EMAIL_SERVER_PASSWORD: z.string().min(1),
    EMAIL_FROM: z.string().email(),
    NEXTAUTH_GOOGLE_ID: z.string().min(1),
    NEXTAUTH_GOOGLE_SECRET: z.string().min(1),
    NEXTAUTH_GITHUB_ID: z.string().min(1),
    NEXTAUTH_GITHUB_SECRET: z.string().min(1),
    S3_HOST: z.string().optional(),
    S3_REGION: z.string().min(1),
    S3_BUCKET: z.string().min(1),
    S3_ACCESS_KEY: z.string().min(1),
    S3_ACCESS_SECRET: z.string().min(1),
    S3_CDN: z.string().optional().nullable(),
    STRIPE_API_KEY: z.string().min(1),
    STRIPE_WEBHOOK_SECRET: z.string().min(1),
    STRIPE_PRO_MONTHLY_PLAN_ID: z.string().min(1),
    STRIPE_PRO_YEARLY_PLAN_ID: z.string().min(1)
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    NEXT_PUBLIC_APP_URL: z.string().url()
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    EMAIL_SERVER_HOST: process.env.EMAIL_SERVER_HOST,
    EMAIL_SERVER_PORT: parseInt(process.env.EMAIL_SERVER_PORT || ''),
    EMAIL_SERVER_USER: process.env.EMAIL_SERVER_USER,
    EMAIL_SERVER_PASSWORD: process.env.EMAIL_SERVER_PASSWORD,
    EMAIL_FROM: process.env.EMAIL_FROM,
    NEXTAUTH_GOOGLE_ID: process.env.NEXTAUTH_GOOGLE_ID,
    NEXTAUTH_GOOGLE_SECRET: process.env.NEXTAUTH_GOOGLE_SECRET,
    NEXTAUTH_GITHUB_ID: process.env.NEXTAUTH_GITHUB_ID,
    NEXTAUTH_GITHUB_SECRET: process.env.NEXTAUTH_GITHUB_SECRET,
    S3_HOST: process.env.S3_HOST,
    S3_REGION: process.env.S3_REGION,
    S3_BUCKET: process.env.S3_BUCKET,
    S3_ACCESS_KEY: process.env.S3_ACCESS_KEY,
    S3_ACCESS_SECRET: process.env.S3_ACCESS_SECRET,
    S3_CDN: process.env.S3_CDN,
    STRIPE_API_KEY: process.env.STRIPE_API_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    STRIPE_PRO_MONTHLY_PLAN_ID: process.env.STRIPE_PRO_MONTHLY_PLAN_ID,
    STRIPE_PRO_YEARLY_PLAN_ID: process.env.STRIPE_PRO_YEARLY_PLAN_ID,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation.
   * This is especially useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,

  // This makes empty strings be treated as undefined
  emptyStringAsUndefined: true
})
