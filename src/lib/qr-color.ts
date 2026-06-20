export const DEFAULT_QR_COLOR_CODE = '#000000'
export const DEFAULT_QR_COLOR_MODE = 'finderPattern'

const HEX_COLOR_REGEX = /^#?(?:[0-9a-f]{3}|[0-9a-f]{6})$/i

export const isQRCodeColorValid = (color: string) =>
  HEX_COLOR_REGEX.test(color.trim())

export const normalizeQRCodeColor = (color: string) => {
  const trimmed = color.trim()

  if (!isQRCodeColorValid(trimmed)) return DEFAULT_QR_COLOR_CODE

  return trimmed.startsWith('#') ? trimmed : `#${trimmed}`
}
