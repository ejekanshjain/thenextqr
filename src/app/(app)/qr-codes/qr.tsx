/* eslint-disable @next/next/no-img-element */
'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import QRCodeGen from 'qrcode'
import { FC, useEffect, useRef, useState } from 'react'

import { Icons } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { env } from '@/env.mjs'
import { canvasRoundRect } from '@/lib/canvasRoundRect'
import { formatDate } from '@/lib/formatDate'
import { GetQRCodesFnDataType } from './actions'

export const QRListItem: FC<{
  qr: GetQRCodesFnDataType['qrCodes'][0]
}> = ({ qr }) => {
  const router = useRouter()
  const [generatedQRCode, setGeneratedQRCode] = useState('')

  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    let url = ''
    if (qr.dynamic) {
      url = qr.slug ? `${env.NEXT_PUBLIC_APP_URL}/${qr.slug}` : ''
    } else {
      url = qr.website ? qr.website : ''
    }

    if (!url) return

    QRCodeGen.toCanvas(canvasRef.current, url, {
      width: 1024,
      margin: 2,
      errorCorrectionLevel: 'H'
    }).then(() => {
      const canvas = canvasRef.current
      if (!canvas) return

      const imageUrl = qr.logo?.cdnUrl || qr.logo?.url

      if (!imageUrl) {
        setGeneratedQRCode(canvas.toDataURL('image/png'))
        return
      }

      const image = new Image()
      image.src = imageUrl
      image.crossOrigin = 'anonymous'

      const ctx = canvasRef.current.getContext('2d')!
      const canvasWidth = canvas.width
      const logoSize = 0.29
      const borderSize = 0.024
      const borderRadius = 1
      const bgColor = '#ffffff'

      const logoWidth = canvasWidth * logoSize
      const logoXY = (canvasWidth * (1 - logoSize)) / 2
      const logoBgWidth = canvasWidth * (logoSize + borderSize)
      const logoBgXY = (canvasWidth * (1 - logoSize - borderSize)) / 2

      canvasRoundRect(ctx)(
        logoBgXY,
        logoBgXY,
        logoBgWidth,
        logoBgWidth,
        borderRadius
      )
      ctx.fillStyle = bgColor
      ctx.fill()

      image.onload = () => {
        ctx.drawImage(image, logoXY, logoXY, logoWidth, logoWidth)
        const dataUrl = canvasRef.current?.toDataURL('image/png')
        setGeneratedQRCode(dataUrl || '')
      }

      image.onerror = () => {
        const dataUrl = canvasRef.current?.toDataURL('image/png')
        setGeneratedQRCode(dataUrl || '')
      }
    })
  }, [qr])

  return (
    <div className="grid grid-cols-1 gap-2 p-2 md:grid-cols-3 md:p-3">
      <div className="flex flex-col gap-2">
        <h4 className="flex items-center justify-start">
          <Icons.note className="mr-2 h-4 w-4" />
          {qr.name}
        </h4>
        <p className="flex items-center justify-start">
          <Icons.clock className="mr-2 h-4 w-4" />
          {formatDate(qr.createdAt)}
        </p>
        <p className="flex items-center justify-start">
          <Icons.link className="mr-2 h-4 w-4" />
          <Link
            className="text-muted-foreground underline underline-offset-4 hover:text-primary"
            href={
              qr.dynamic ? env.NEXT_PUBLIC_APP_URL + '/' + qr.slug : qr.website
            }
          >
            {qr.dynamic ? env.NEXT_PUBLIC_APP_URL + '/' + qr.slug : qr.website}
          </Link>
        </p>
      </div>
      <div className="col-span-2 flex flex-col md:flex-row md:items-center md:justify-around gap-2">
        <div className="md:hidden lg:block">
          {qr.dynamic ? (
            <Link
              href={`/qr-codes/${qr.id}/analytics`}
              className="text-muted-foreground underline underline-offset-4 hover:text-primary transition-all"
            >
              {qr.totalScans || 0} Scans
            </Link>
          ) : (
            <p className="text-muted-foreground">{qr.totalScans || 0} Scans</p>
          )}
        </div>
        <div className="flex h-full w-full max-h-60 max-w-60 md:h-36 md:w-36 items-center justify-center">
          <canvas ref={canvasRef} className="hidden" />
          {generatedQRCode ? (
            <img
              className="rounded"
              src={generatedQRCode}
              alt={`${qr.name} QR Code`}
            />
          ) : (
            <Icons.spinner className="h-6 w-6 animate-spin" />
          )}
        </div>
        <Separator orientation="vertical" className="hidden md:inline-block" />
        <div className="flex md:flex-col gap-2">
          <Button
            onClick={() => {
              const a = document.createElement('a')
              a.href = generatedQRCode
              a.download = `${qr.name}.png`
              a.click()
            }}
          >
            <Icons.download className="mr-2 h-4 w-4" />
            Download
          </Button>
          <Button
            variant="secondary"
            onClick={() => router.push(`/qr-codes/${qr.id}`)}
          >
            <Icons.edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          {qr.dynamic ? (
            <Button
              variant="secondary"
              onClick={() => router.push(`/qr-codes/${qr.id}/analytics`)}
            >
              <Icons.analytics className="mr-2 h-4 w-4" />
              Reports
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  )
}
