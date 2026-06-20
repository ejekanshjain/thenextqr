'use client'

import QRCode from 'qrcode'
import { useEffect, useState } from 'react'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { cn } from '~/lib/cn'

type QRCodePreviewProps = {
  value?: string
  name?: string
  colorCode?: string
  colorMode?: 'finderPattern' | 'full'
  logoUrl?: string | null
  size?: 'sm' | 'lg'
  downloadable?: boolean
}

const getFinderPatternColor = (
  row: number,
  col: number,
  moduleCount: number,
  colorCode: string,
  colorMode: 'finderPattern' | 'full'
) => {
  if (colorMode === 'full') return colorCode

  const inTopLeft = row < 7 && col < 7
  const inTopRight = row < 7 && col >= moduleCount - 7
  const inBottomLeft = row >= moduleCount - 7 && col < 7

  return inTopLeft || inTopRight || inBottomLeft ? colorCode : '#000000'
}

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.crossOrigin = 'anonymous'
    image.onload = () => resolve(image)
    image.onerror = reject
    image.src = src
  })

const drawRoundedRect = (
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) => {
  context.beginPath()
  context.moveTo(x + radius, y)
  context.lineTo(x + width - radius, y)
  context.quadraticCurveTo(x + width, y, x + width, y + radius)
  context.lineTo(x + width, y + height - radius)
  context.quadraticCurveTo(
    x + width,
    y + height,
    x + width - radius,
    y + height
  )
  context.lineTo(x + radius, y + height)
  context.quadraticCurveTo(x, y + height, x, y + height - radius)
  context.lineTo(x, y + radius)
  context.quadraticCurveTo(x, y, x + radius, y)
  context.closePath()
}

async function renderQRCodeDataUrl({
  value,
  colorCode,
  colorMode,
  logoUrl,
  size
}: {
  value: string
  colorCode: string
  colorMode: 'finderPattern' | 'full'
  logoUrl?: string | null
  size: 'sm' | 'lg'
}) {
  const qr = QRCode.create(value, { errorCorrectionLevel: 'H' })
  const moduleCount = qr.modules.size
  const margin = 2
  const targetSize = size === 'lg' ? 720 : 240
  const moduleSize = Math.max(
    1,
    Math.floor(targetSize / (moduleCount + margin * 2))
  )
  const canvasSize = (moduleCount + margin * 2) * moduleSize
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')

  if (!context) return ''

  canvas.width = canvasSize
  canvas.height = canvasSize
  context.fillStyle = '#ffffff'
  context.fillRect(0, 0, canvasSize, canvasSize)

  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (!qr.modules.data[row * moduleCount + col]) continue

      context.fillStyle = getFinderPatternColor(
        row,
        col,
        moduleCount,
        colorCode || '#000000',
        colorMode
      )
      context.fillRect(
        (col + margin) * moduleSize,
        (row + margin) * moduleSize,
        moduleSize,
        moduleSize
      )
    }
  }

  if (logoUrl) {
    try {
      const logo = await loadImage(logoUrl)
      const logoSize = Math.floor(canvasSize * 0.2)
      const logoPadding = Math.floor(logoSize * 0.12)
      const boxSize = logoSize + logoPadding * 2
      const boxX = Math.floor((canvasSize - boxSize) / 2)
      const boxY = Math.floor((canvasSize - boxSize) / 2)
      const logoX = boxX + logoPadding
      const logoY = boxY + logoPadding

      context.fillStyle = '#ffffff'
      drawRoundedRect(context, boxX, boxY, boxSize, boxSize, logoPadding)
      context.fill()
      context.drawImage(logo, logoX, logoY, logoSize, logoSize)
    } catch {
      // A failed logo load should not block generating a scannable QR code.
    }
  }

  return canvas.toDataURL('image/png')
}

export function QRCodePreview({
  value,
  name = 'qr-code',
  colorCode = '#000000',
  colorMode = 'finderPattern',
  logoUrl,
  size = 'lg',
  downloadable = false
}: QRCodePreviewProps) {
  const [dataUrl, setDataUrl] = useState('')

  useEffect(() => {
    let cancelled = false

    if (!value) {
      queueMicrotask(() => {
        if (!cancelled) setDataUrl('')
      })
      return
    }

    renderQRCodeDataUrl({
      value,
      colorCode,
      colorMode,
      logoUrl,
      size
    }).then(url => {
      if (!cancelled) setDataUrl(url)
    })

    return () => {
      cancelled = true
    }
  }, [colorCode, colorMode, logoUrl, size, value])

  const download = () => {
    if (!dataUrl) return

    const a = document.createElement('a')
    a.href = dataUrl
    a.download = `${name || 'qr-code'}.png`
    a.click()
  }

  return (
    <div
      className={cn(
        'bg-background flex flex-col items-center justify-center rounded-lg border',
        size === 'lg' ? 'min-h-96 gap-4 p-6' : 'size-24 p-2'
      )}
    >
      {dataUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={dataUrl}
          alt={name}
          className={cn(
            'rounded-md',
            size === 'lg' ? 'size-72 max-w-full' : 'size-20'
          )}
        />
      ) : (
        <div
          className={cn(
            'bg-muted text-muted-foreground grid place-items-center rounded-md text-xs',
            size === 'lg' ? 'size-72' : 'size-20'
          )}
        >
          QR
        </div>
      )}

      {size === 'lg' ? (
        <div className="flex flex-col items-center gap-3 text-center">
          <Badge variant={value ? 'secondary' : 'outline'}>
            {value ? 'Preview ready' : 'Add destination'}
          </Badge>
          {downloadable ? (
            <Button type="button" variant="outline" onClick={download}>
              Download PNG
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
