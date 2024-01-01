import dotenv from 'dotenv'
import { SSTConfig } from 'sst'
import { NextjsSite } from 'sst/constructs'

const envPathMap = new Map()
envPathMap.set('test', '.env.test')

export default {
  config(_input) {
    return {
      name: 'thenextqr',
      region: 'ap-south-1'
    }
  },
  stacks(app) {
    app.stack(function Site({ stack }) {
      const path = envPathMap.get(stack.stage)

      if (path) dotenv.config({ path })

      const tempEnvironment: Record<string, string | undefined> = {
        DATABASE_URL: process.env.DATABASE_URL,
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
        NEXTAUTH_URL: process.env.NEXTAUTH_URL,
        EMAIL_SERVER_HOST: process.env.EMAIL_SERVER_HOST,
        EMAIL_SERVER_PORT: process.env.EMAIL_SERVER_PORT,
        EMAIL_SERVER_USER: process.env.EMAIL_SERVER_USER,
        EMAIL_SERVER_PASSWORD: process.env.EMAIL_SERVER_PASSWORD,
        EMAIL_FROM: process.env.EMAIL_FROM,
        NEXT_AUTH_GOOGLE_ID: process.env.NEXT_AUTH_GOOGLE_ID,
        NEXT_AUTH_GOOGLE_SECRET: process.env.NEXT_AUTH_GOOGLE_SECRET,
        NEXT_AUTH_GITHUB_ID: process.env.NEXT_AUTH_GITHUB_ID,
        NEXT_AUTH_GITHUB_SECRET: process.env.NEXT_AUTH_GITHUB_SECRET,
        S3_HOST: process.env.S3_HOST,
        S3_REGION: process.env.S3_REGION,
        S3_BUCKET: process.env.S3_BUCKET,
        S3_ACCESS_KEY: process.env.S3_ACCESS_KEY,
        S3_ACCESS_SECRET: process.env.S3_ACCESS_SECRET,
        S3_CDN: process.env.S3_CDN,
        STRIPE_API_KEY: process.env.STRIPE_API_KEY,
        STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
        STRIPE_PRO_MONTHLY_PLAN_ID: process.env.STRIPE_PRO_MONTHLY_PLAN_ID,
        NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL
      }

      const environment = Object.keys(tempEnvironment).reduce(
        (obj, key) => {
          const val = tempEnvironment[key]
          if (val) {
            obj[key] = val
          }
          return obj
        },
        {} as Record<string, string>
      )

      const site = new NextjsSite(stack, 'site', {
        environment
      })

      stack.addOutputs({
        SiteUrl: site.url
      })
    })
  }
} satisfies SSTConfig
