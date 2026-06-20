export type QRCodeType = 'website' | 'email' | 'sms' | 'phone'

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
    case 'website':
      return website || undefined
    case 'phone':
      return phoneNumber ? `tel:${phoneNumber}` : undefined
    case 'sms':
      return phoneNumber ? `sms:${phoneNumber}` : undefined
    case 'email': {
      if (!email) return undefined

      const params = new URLSearchParams()
      if (subject) params.set('subject', subject)
      if (message) params.set('body', message)

      const query = params.toString()
      return query ? `mailto:${email}?${query}` : `mailto:${email}`
    }
  }
}

export const getDynamicQRCodeUrl = (slug: string, baseUrl: string) =>
  `${baseUrl.replace(/\/$/, '')}/q/${slug}`
