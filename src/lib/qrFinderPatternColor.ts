export const DEFAULT_QR_FINDER_PATTERN_COLOR = '#000000'
export const DEFAULT_QR_COLOR_MODE = 'finderPattern'

export type QRCodeColorMode = 'finderPattern' | 'full'

const HEX_COLOR_REGEX = /^#?(?:[0-9a-f]{3}|[0-9a-f]{6})$/i

const FINDER_PATTERN_MODULE_SIZE = 7
const FINDER_PATTERN_DARK_MODULES = new Set([
  '0:0',
  '0:1',
  '0:2',
  '0:3',
  '0:4',
  '0:5',
  '0:6',
  '1:0',
  '1:6',
  '2:0',
  '2:2',
  '2:3',
  '2:4',
  '2:6',
  '3:0',
  '3:2',
  '3:3',
  '3:4',
  '3:6',
  '4:0',
  '4:2',
  '4:3',
  '4:4',
  '4:6',
  '5:0',
  '5:6',
  '6:0',
  '6:1',
  '6:2',
  '6:3',
  '6:4',
  '6:5',
  '6:6'
])

export const normalizeQRCodeFinderPatternColor = (color: string) => {
  const trimmedColor = color.trim()

  if (!HEX_COLOR_REGEX.test(trimmedColor)) {
    return DEFAULT_QR_FINDER_PATTERN_COLOR
  }

  return trimmedColor.startsWith('#') ? trimmedColor : `#${trimmedColor}`
}

export const isQRCodeFinderPatternColorValid = (color: string) =>
  HEX_COLOR_REGEX.test(color.trim())

export const applyQRCodeFinderPatternColor = ({
  canvas,
  color,
  margin,
  moduleCount
}: {
  canvas: HTMLCanvasElement
  color: string
  margin: number
  moduleCount: number
}) => {
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const normalizedColor = normalizeQRCodeFinderPatternColor(color)
  const moduleScale = canvas.width / (moduleCount + margin * 2)
  const finderPatternOrigins = [
    { x: 0, y: 0 },
    { x: moduleCount - FINDER_PATTERN_MODULE_SIZE, y: 0 },
    { x: 0, y: moduleCount - FINDER_PATTERN_MODULE_SIZE }
  ]

  ctx.fillStyle = normalizedColor

  for (const origin of finderPatternOrigins) {
    for (let row = 0; row < FINDER_PATTERN_MODULE_SIZE; row++) {
      for (let col = 0; col < FINDER_PATTERN_MODULE_SIZE; col++) {
        if (!FINDER_PATTERN_DARK_MODULES.has(`${row}:${col}`)) continue

        const x = Math.ceil((margin + origin.x + col) * moduleScale)
        const y = Math.ceil((margin + origin.y + row) * moduleScale)
        const nextX = Math.ceil((margin + origin.x + col + 1) * moduleScale)
        const nextY = Math.ceil((margin + origin.y + row + 1) * moduleScale)

        ctx.fillRect(x, y, nextX - x, nextY - y)
      }
    }
  }
}

export const getQRCodeCanvasOptions = (
  color: string,
  mode: QRCodeColorMode
) => {
  const darkColor =
    mode === 'full' ? normalizeQRCodeFinderPatternColor(color) : '#000000'

  return {
    width: 1024,
    margin: 2,
    errorCorrectionLevel: 'H' as const,
    color: {
      dark: darkColor,
      light: '#ffffff'
    }
  }
}

export const applyQRCodeColor = ({
  canvas,
  color,
  margin,
  mode,
  moduleCount
}: {
  canvas: HTMLCanvasElement
  color: string
  margin: number
  mode: QRCodeColorMode
  moduleCount: number
}) => {
  if (mode !== 'finderPattern') return

  applyQRCodeFinderPatternColor({
    canvas,
    color,
    margin,
    moduleCount
  })
}
