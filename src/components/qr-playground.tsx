/* eslint-disable @next/next/no-img-element */
'use client'

import debounce from 'lodash/debounce'
import QRCodeGen from 'qrcode'
import { FC, useMemo, useRef, useState } from 'react'

import { Icons } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

export const QRPlayground: FC = () => {
  const [generatedQRCode, setGeneratedQRCode] = useState('')

  const canvasRef = useRef<HTMLCanvasElement>(null)

  const debouncedSetQr = useMemo(
    () =>
      debounce((url: string) => {
        if (!url) {
          setGeneratedQRCode('')
          return
        }
        QRCodeGen.toCanvas(canvasRef.current, url, {
          width: 1024,
          margin: 2,
          errorCorrectionLevel: 'H'
        }).then(() => {
          const canvas = canvasRef.current
          if (!canvas) return
          setGeneratedQRCode(canvas.toDataURL('image/png'))
        })
      }, 1000),
    []
  )

  return (
    <div className="flex w-full flex-col gap-3">
      <canvas ref={canvasRef} className="hidden" />
      <Input
        type="url"
        placeholder="Enter Website Url"
        autoCapitalize="none"
        autoCorrect="off"
        onChange={e => debouncedSetQr(e.target.value)}
        className="w-full"
      />
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
