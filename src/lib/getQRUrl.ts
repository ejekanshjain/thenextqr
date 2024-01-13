import { QRCodeType } from '@prisma/client'

export function getQRUrl({
  type,
  website,
  phoneNumber,
  message,
  email,
  subject
}: {
  type: QRCodeType
  website?: string | null
  phoneNumber?: string | null
  message?: string | null
  email?: string | null
  subject?: string | null
}) {
  switch (type) {
    case 'website': {
      return website ? website : undefined
    }
    case 'phone': {
      return phoneNumber ? `tel:${phoneNumber}` : undefined
    }
    case 'sms': {
      return phoneNumber ? `sms:${phoneNumber}` : undefined
    }
    case 'email': {
      if (!email) return
      const params = new URLSearchParams()
      params.append('subject', subject || '')
      params.append('body', message || '')
      return `mailto:${email}?${params.toString()}`
    }
  }
}
