/* eslint-disable @next/next/no-img-element */
'use client'

import debounce from 'lodash/debounce'
import QRCodeGen from 'qrcode'
import { FC, useEffect, useMemo, useRef, useState } from 'react'

import { Icons } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  DEFAULT_QR_COLOR_MODE,
  DEFAULT_QR_FINDER_PATTERN_COLOR,
  QRCodeColorMode,
  applyQRCodeColor,
  getQRCodeCanvasOptions,
  isQRCodeFinderPatternColorValid,
  normalizeQRCodeFinderPatternColor
} from '@/lib/qrFinderPatternColor'

export const QRPlayground: FC = () => {
  const [url, setUrl] = useState('')
  const [finderPatternColor, setFinderPatternColor] = useState(
    DEFAULT_QR_FINDER_PATTERN_COLOR
  )
  const [colorMode, setColorMode] = useState<QRCodeColorMode>(
    DEFAULT_QR_COLOR_MODE
  )
  const [generatedQRCode, setGeneratedQRCode] = useState('')

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const normalizedFinderPatternColor =
    normalizeQRCodeFinderPatternColor(finderPatternColor)
  const isFinderPatternColorValid =
    isQRCodeFinderPatternColorValid(finderPatternColor)

  const debouncedSetQr = useMemo(
    () =>
      debounce(
        (
          url: string,
          finderPatternColor: string,
          colorMode: QRCodeColorMode
        ) => {
          if (!url) {
            setGeneratedQRCode('')
            return
          }
          const qrCodeCanvasOptions = getQRCodeCanvasOptions(
            finderPatternColor,
            colorMode
          )
          const qrCode = QRCodeGen.create(url, qrCodeCanvasOptions)

          QRCodeGen.toCanvas(canvasRef.current, url, qrCodeCanvasOptions).then(
            () => {
              const canvas = canvasRef.current
              if (!canvas) return

              applyQRCodeColor({
                canvas,
                color: finderPatternColor,
                margin: qrCodeCanvasOptions.margin,
                mode: colorMode,
                moduleCount: qrCode.modules.size
              })

              setGeneratedQRCode(canvas.toDataURL('image/png'))
            }
          )
        },
        1000
      ),
    []
  )

  useEffect(() => {
    if (!url) {
      setGeneratedQRCode('')
      return
    }

    debouncedSetQr(url, normalizedFinderPatternColor, colorMode)
  }, [colorMode, debouncedSetQr, normalizedFinderPatternColor, url])

  useEffect(() => {
    return () => {
      debouncedSetQr.cancel()
    }
  }, [debouncedSetQr])

  return (
    <div className="flex w-full flex-col gap-3">
      <canvas ref={canvasRef} className="hidden" />
      <Input
        type="url"
        placeholder="Enter Website Url"
        autoCapitalize="none"
        autoCorrect="off"
        onChange={e => setUrl(e.target.value)}
        className="w-full"
      />
      <div className="grid gap-1 text-left">
        <Label htmlFor="playgroundFinderPatternColor">QR color</Label>
        <Input
          id="playgroundFinderPatternColor"
          type="text"
          placeholder="#000000"
          autoCapitalize="none"
          autoCorrect="off"
          value={finderPatternColor}
          onChange={e => setFinderPatternColor(e.target.value)}
          className="w-full"
          aria-invalid={!isFinderPatternColorValid}
        />
        {!isFinderPatternColorValid ? (
          <p className="text-xs text-destructive">
            Enter a valid hex color, like #000000.
          </p>
        ) : null}
      </div>
      <div className="flex items-center justify-between gap-4 rounded-lg border p-4 text-left">
        <div className="space-y-0.5">
          <Label htmlFor="playgroundColorMode">Color complete QR</Label>
          <p className="text-sm text-muted-foreground">
            Turn off to color only the three side squares.
          </p>
        </div>
        <Switch
          id="playgroundColorMode"
          checked={colorMode === 'full'}
          onCheckedChange={checked =>
            setColorMode(checked ? 'full' : 'finderPattern')
          }
        />
      </div>
      <Card>
        <CardHeader>Generated QR Code</CardHeader>
        <CardContent>
          {generatedQRCode ? (
            <img
              src={generatedQRCode}
              alt="QR Code"
              className="h-80 w-80 md:h-96 md:w-96"
            />
          ) : (
            <div className="w-80 md:w-96">
              Enter a URL to generate a QR code.
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button
            type="button"
            onClick={() => {
              const a = document.createElement('a')
              a.href = generatedQRCode
              a.download = `QR Code - ${Date.now()}.png`
              a.click()
            }}
            disabled={!generatedQRCode}
          >
            <Icons.download className="mr-2 h-4 w-4" />
            Download png
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
