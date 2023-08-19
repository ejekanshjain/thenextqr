/* eslint-disable @next/next/no-img-element */
'use client'

import { QRCode } from '@prisma/client'
import { useRouter } from 'next/navigation'
import QRCodeGen from 'qrcode'
import { FC, useEffect, useState } from 'react'

import { Icons } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { env } from '@/env.mjs'
import { formatDate } from '@/lib/formatDate'
import Link from 'next/link'

export const QRListItem: FC<{
  qr: QRCode
}> = ({ qr }) => {
  const router = useRouter()
  const [generatedQRCode, setGeneratedQRCode] = useState('')

  useEffect(() => {
    let url = ''
    if (qr.dynamic) {
      url = qr.slug ? `${env.NEXT_PUBLIC_APP_URL}/qr/${qr.slug}` : ''
    } else {
      url = qr.website ? qr.website : ''
    }

    if (!url) return

    QRCodeGen.toDataURL(
      url,
      {
        width: 640,
        margin: 3
      },
      (err, dataUrl) => {
        if (err) return console.error(err)
        setGeneratedQRCode(dataUrl)
      }
    )
  }, [qr])

  return (
    <div className="grid grid-cols-1 p-1 md:grid-cols-2 md:p-3">
      <div className="flex flex-col gap-2">
        <h4 className="flex items-center justify-start">
          <Icons.note className="mr-2 h-4 w-4" />
          {qr.name}
        </h4>
        <p className="flex items-center justify-start">
          <Icons.clock className="mr-2 h-4 w-4" />
          {formatDate(qr.createdAt)}
        </p>
        {qr.dynamic ? (
          <div className="flex items-center">
            <p className="flex items-center justify-start">
              <Icons.link className="mr-2 h-4 w-4" />
              <Link
                href={env.NEXT_PUBLIC_APP_URL + '/qr/' + qr.slug}
                className="text-muted-foreground underline underline-offset-4 hover:text-primary"
              >
                {env.NEXT_PUBLIC_APP_URL + '/qr/' + qr.slug}
              </Link>
            </p>
            <Icons.arrowRight className="mx-2 h-4 w-4" />
            <Link
              href={qr.website}
              className="text-muted-foreground underline underline-offset-4 hover:text-primary"
            >
              {qr.website}
            </Link>
          </div>
        ) : (
          <p className="flex items-center justify-start">
            <Icons.link className="mr-2 h-4 w-4" />
            <Link
              className="text-muted-foreground underline underline-offset-4 hover:text-primary"
              href={qr.website}
            >
              {qr.website}
            </Link>
          </p>
        )}
      </div>
      <div className="flex items-center justify-around gap-2">
        <div className="flex text-muted-foreground">
          {`${(qr as any)._count?.scanLogs || 0} Scans`}
        </div>
        <div className="flex h-36 w-36 items-center justify-center">
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
        <Separator orientation="vertical" />
        <div className="flex flex-col gap-2">
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
        </div>
      </div>
    </div>
  )
}
