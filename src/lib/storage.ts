import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { createId } from '@paralleldrive/cuid2'
import { and, eq, lt } from 'drizzle-orm'
import { db } from '~/db'
import { fileUploadsTable } from '~/db/schema'
import { env } from '~/env'
import {
  PRESIGNED_URL_TTL_SECONDS,
  TEMP_CLEANUP_THRESHOLD_MS
} from './constants'
import {
  type AllowedImageMimeType,
  getImageExtensionForMimeType,
  isAllowedImageMimeType
} from './upload-policy'

/*
R2 Policy need to be set
[
  {
    "AllowedOrigins": [
      "http://localhost:3000"
    ],
    "AllowedMethods": [
      "PUT"
    ],
    "AllowedHeaders": [
      "content-type",
      "content-length"
    ]
  }
]
*/

export function isR2Configured(): boolean {
  return !!(
    env.R2_ACCOUNT_ID &&
    env.R2_ACCESS_KEY_ID &&
    env.R2_SECRET_ACCESS_KEY &&
    env.R2_BUCKET_NAME &&
    env.R2_PUBLIC_URL
  )
}

let _r2Client: S3Client | null = null

function getR2Client(): S3Client {
  if (_r2Client) return _r2Client

  const configured = isR2Configured()
  if (!configured) {
    throw new Error('R2 storage is not configured')
  }

  _r2Client = new S3Client({
    region: 'auto',
    endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: env.R2_ACCESS_KEY_ID!,
      secretAccessKey: env.R2_SECRET_ACCESS_KEY!
    }
  })

  return _r2Client
}

export async function deleteFile(key: string): Promise<void> {
  const client = getR2Client()
  await client.send(
    new DeleteObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: key
    })
  )

  await db.delete(fileUploadsTable).where(eq(fileUploadsTable.key, key))
}

export async function generateUploadUrl(params: {
  filename: string
  mimeType: AllowedImageMimeType
  size: number
  uploadedBy: string
  organizationId?: string | null
}): Promise<{
  uploadUrl: string
  key: string
}> {
  const ext = getImageExtensionForMimeType(params.mimeType)
  const folder = params.organizationId
    ? `uploads/organizations/${params.organizationId}`
    : `uploads/misc`

  const fileId = createId()
  const key = `${folder}/${fileId}.${ext}`

  const client = getR2Client()
  const uploadUrl = await getSignedUrl(
    client,
    new PutObjectCommand({
      Bucket: env.R2_BUCKET_NAME!,
      Key: key,
      ContentType: params.mimeType,
      ContentLength: params.size
    }),
    { expiresIn: PRESIGNED_URL_TTL_SECONDS }
  )

  await db.insert(fileUploadsTable).values({
    id: `file_upload_${fileId}`,
    key,
    originalName: params.filename,
    mimeType: params.mimeType,
    size: params.size,
    isTemp: true,
    uploadedBy: params.uploadedBy,
    organizationId: params.organizationId
  })

  return { uploadUrl, key }
}

function detectImageMimeType(bytes: Uint8Array): AllowedImageMimeType | null {
  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return 'image/png'
  }

  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return 'image/jpeg'
  }

  const header = new TextDecoder().decode(bytes.slice(0, 12))
  if (header.startsWith('GIF87a') || header.startsWith('GIF89a')) {
    return 'image/gif'
  }

  if (header.startsWith('RIFF') && header.slice(8, 12) === 'WEBP') {
    return 'image/webp'
  }

  return null
}

async function readObjectPrefix(key: string) {
  const response = await getR2Client().send(
    new GetObjectCommand({
      Bucket: env.R2_BUCKET_NAME!,
      Key: key,
      Range: 'bytes=0-11'
    })
  )

  const body = response.Body
  if (!body) throw new Error('Uploaded image could not be read')

  if ('transformToByteArray' in body) {
    return await body.transformToByteArray()
  }

  const chunks: Uint8Array[] = []
  for await (const chunk of body as AsyncIterable<Uint8Array | string>) {
    chunks.push(
      typeof chunk === 'string' ? new TextEncoder().encode(chunk) : chunk
    )
  }

  const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0)
  const bytes = new Uint8Array(totalLength)
  let offset = 0

  for (const chunk of chunks) {
    bytes.set(chunk, offset)
    offset += chunk.length
  }

  return bytes
}

async function assertUploadedImageObject(
  key: string,
  expectedMimeType: string
) {
  if (!isAllowedImageMimeType(expectedMimeType)) {
    throw new Error('Upload must be a PNG, JPEG, WebP, or GIF image')
  }

  const detectedMimeType = detectImageMimeType(await readObjectPrefix(key))
  if (detectedMimeType !== expectedMimeType) {
    throw new Error(
      'Uploaded file content does not match an allowed image type'
    )
  }
}

export function getOrganizationUploadPrefix(organizationId: string) {
  return `uploads/organizations/${organizationId}/`
}

export function isOrganizationUploadKey(key: string, organizationId: string) {
  return key.startsWith(getOrganizationUploadPrefix(organizationId))
}

export function assertOrganizationUploadKey(
  key: string,
  organizationId: string
) {
  if (!isOrganizationUploadKey(key, organizationId)) {
    throw new Error('Upload does not belong to this organization')
  }
}

export async function confirmUpload(
  newKey: string,
  oldKey?: string | null,
  options?: {
    organizationId?: string
    uploadedBy?: string
  }
): Promise<void> {
  const where = and(
    eq(fileUploadsTable.key, newKey),
    options?.organizationId
      ? eq(fileUploadsTable.organizationId, options.organizationId)
      : undefined,
    options?.uploadedBy
      ? eq(fileUploadsTable.uploadedBy, options.uploadedBy)
      : undefined
  )

  const upload = await db.query.fileUploadsTable.findFirst({
    where,
    columns: {
      id: true,
      key: true,
      mimeType: true
    }
  })

  if (!upload) {
    throw new Error('Upload does not belong to this organization')
  }

  await assertUploadedImageObject(upload.key, upload.mimeType)

  await db
    .update(fileUploadsTable)
    .set({ isTemp: false })
    .where(eq(fileUploadsTable.id, upload.id))

  if (oldKey && isR2Configured() && isR2Key(oldKey)) {
    const canDeleteOldKey =
      !options?.organizationId ||
      isOrganizationUploadKey(oldKey, options.organizationId)

    if (canDeleteOldKey) {
      await deleteFile(oldKey).catch(() => {
        // Non-fatal: old file cleanup failure should not block the save
      })
    }
  }
}

export function isR2Key(value: string | null | undefined): value is string {
  return !!value && !value.startsWith('data:') && !value.startsWith('https://')
}

export function resolveImageUrl(
  value: string | null | undefined
): string | null {
  if (!value) return null
  if (!isR2Key(value)) return value
  if (!isR2Configured()) return null
  return `${env.R2_PUBLIC_URL}/${value}`
}

export async function cleanupTempUploads(): Promise<{
  deleted: number
  errors: number
}> {
  const threshold = new Date(Date.now() - TEMP_CLEANUP_THRESHOLD_MS)

  const stale = await db
    .select({ id: fileUploadsTable.id, key: fileUploadsTable.key })
    .from(fileUploadsTable)
    .where(
      and(
        eq(fileUploadsTable.isTemp, true),
        lt(fileUploadsTable.createdAt, threshold)
      )
    )

  let deleted = 0
  let errors = 0

  for (const file of stale) {
    try {
      await deleteFile(file.key)
      deleted++
    } catch {
      errors++
    }
  }

  return { deleted, errors }
}
