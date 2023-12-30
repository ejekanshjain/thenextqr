import { S3Client } from '@ejekanshjain/cloud-storage'

import { env } from '@/env.mjs'

export const storageClient = S3Client({
  host: env.S3_HOST,
  region: env.S3_REGION,
  bucket: env.S3_BUCKET,
  accessKey: env.S3_ACCESS_KEY,
  accessSecret: env.S3_ACCESS_SECRET
})

export const getCdnUrl = (filename: string) =>
  env.S3_CDN ? `${env.S3_CDN}/${filename}` : null
