import { MAX_FILE_SIZE_BYTES, MAX_FILE_SIZE_MB } from './constants'

export const ALLOWED_IMAGE_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif'
] as const

export type AllowedImageMimeType = (typeof ALLOWED_IMAGE_MIME_TYPES)[number]

const IMAGE_EXTENSIONS: Record<AllowedImageMimeType, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'image/gif': 'gif'
}

export const ALLOWED_IMAGE_LABEL = 'PNG, JPEG, WebP, or GIF'
export const ALLOWED_IMAGE_ACCEPT = ALLOWED_IMAGE_MIME_TYPES.join(',')

export function isAllowedImageMimeType(
  mimeType: string
): mimeType is AllowedImageMimeType {
  return ALLOWED_IMAGE_MIME_TYPES.includes(mimeType as AllowedImageMimeType)
}

export function getImageExtensionForMimeType(mimeType: AllowedImageMimeType) {
  return IMAGE_EXTENSIONS[mimeType]
}

export function getImageDataUrlMetadata(value: string): {
  mimeType: AllowedImageMimeType
  size: number
} | null {
  const match = value.match(/^data:([^;,]+);base64,([A-Za-z0-9+/=\s]+)$/)
  if (!match?.[1] || !match[2] || !isAllowedImageMimeType(match[1])) {
    return null
  }

  const base64 = match[2].replace(/\s/g, '')
  const padding = base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0
  const size = Math.floor((base64.length * 3) / 4) - padding

  return {
    mimeType: match[1],
    size
  }
}

export function isAllowedImageDataUrl(value: string) {
  const metadata = getImageDataUrlMetadata(value)
  return !!metadata && metadata.size > 0 && metadata.size <= MAX_FILE_SIZE_BYTES
}

export function getImageUploadError() {
  return `Upload a ${ALLOWED_IMAGE_LABEL} image under ${MAX_FILE_SIZE_MB}MB.`
}
