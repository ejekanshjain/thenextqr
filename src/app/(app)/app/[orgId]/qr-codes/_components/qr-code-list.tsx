'use client'

import { ArrowUpRight, Download, Loader2, Plus, QrCode } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, type KeyboardEvent, type MouseEvent } from 'react'
import { PageHeading } from '~/components/page-heading'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { cn } from '~/lib/cn'
import { getDynamicQRCodeUrl, getQRUrl, type QRCodeType } from '~/lib/qr-url'
import { downloadQRCodePng, QRCodePreview } from './qr-code-preview'

type QRCodeListItem = {
  id: string
  name: string
  isDynamic: boolean
  slug: string | null
  type: QRCodeType
  colorCode: string
  colorMode: 'finderPattern' | 'full'
  logoUrl: string | null
  totalScans: number
  website: string | null
  phoneNumber: string | null
  message: string | null
  email: string | null
  subject: string | null
  updatedAt: Date
}

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC'
})

export function QRCodeList({
  organizationId,
  appBaseUrl,
  qrCodes,
  total,
  search
}: {
  organizationId: string
  appBaseUrl: string
  qrCodes: QRCodeListItem[]
  total: number
  search?: string
}) {
  const router = useRouter()
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  const openQRCode = (href: string) => {
    router.push(href)
  }

  const handleCardKeyDown = (
    event: KeyboardEvent<HTMLDivElement>,
    href: string
  ) => {
    if (event.target !== event.currentTarget) return
    if (event.key !== 'Enter' && event.key !== ' ') return

    event.preventDefault()
    openQRCode(href)
  }

  const handleDownload = async (
    event: MouseEvent<HTMLButtonElement>,
    qr: QRCodeListItem,
    destination?: string
  ) => {
    event.stopPropagation()
    if (!destination || downloadingId) return

    setDownloadingId(qr.id)

    try {
      await downloadQRCodePng({
        value: destination,
        name: qr.name,
        colorCode: qr.colorCode,
        colorMode: qr.colorMode,
        logoUrl: qr.logoUrl,
        size: 'lg'
      })
    } finally {
      setDownloadingId(null)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeading
        title="QR Codes"
        description="Create, edit, download, and track organization QR codes."
        icon={QrCode}
      >
        <Button asChild>
          <Link href={`/app/${organizationId}/qr-codes/new`}>
            <Plus data-icon="inline-start" />
            New QR code
          </Link>
        </Button>
      </PageHeading>

      <form className="max-w-md">
        <Input
          name="search"
          placeholder="Search by name, slug, or destination"
          defaultValue={search ?? ''}
        />
      </form>

      {total === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No QR codes yet</CardTitle>
            <CardDescription>
              Create your first QR code for this organization.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link href={`/app/${organizationId}/qr-codes/new`}>
                <Plus data-icon="inline-start" />
                Create QR code
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {qrCodes.map(qr => {
            const destination = qr.isDynamic
              ? qr.slug
                ? getDynamicQRCodeUrl(qr.slug, appBaseUrl)
                : undefined
              : getQRUrl(qr)

            const href = `/app/${organizationId}/qr-codes/${qr.id}`
            const isDownloading = downloadingId === qr.id

            return (
              <Card
                key={qr.id}
                role="link"
                tabIndex={0}
                onClick={() => openQRCode(href)}
                onKeyDown={event => handleCardKeyDown(event, href)}
                className={cn(
                  'group cursor-pointer transition-colors outline-none',
                  'hover:border-primary/40 hover:bg-muted/35',
                  'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]'
                )}
              >
                <CardContent className="grid gap-4 p-4 md:grid-cols-[112px_minmax(0,1fr)_auto] md:items-center">
                  <QRCodePreview
                    value={destination}
                    name={qr.name}
                    colorCode={qr.colorCode}
                    colorMode={qr.colorMode}
                    logoUrl={qr.logoUrl}
                    size="sm"
                  />
                  <div className="min-w-0">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <h2 className="truncate text-lg font-semibold">
                        {qr.name}
                      </h2>
                      <Badge variant="secondary">{qr.type}</Badge>
                      <Badge variant={qr.isDynamic ? 'default' : 'outline'}>
                        {qr.isDynamic ? 'Dynamic' : 'Static'}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground truncate text-sm">
                      {destination ?? 'No destination'}
                    </p>
                    <div className="text-muted-foreground mt-2 flex flex-wrap gap-4 text-xs">
                      <span>{qr.totalScans} scans</span>
                      <span>Updated {dateFormatter.format(qr.updatedAt)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 md:justify-end">
                    <span className="text-muted-foreground hidden items-center gap-1 text-sm opacity-0 transition-opacity group-hover:opacity-100 md:flex">
                      Open QR code
                      <ArrowUpRight className="size-4" />
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      disabled={!destination || Boolean(downloadingId)}
                      title={
                        destination
                          ? 'Download QR code'
                          : 'Add destination before download'
                      }
                      onClick={event => handleDownload(event, qr, destination)}
                    >
                      {isDownloading ? (
                        <Loader2 className="animate-spin" />
                      ) : (
                        <Download />
                      )}
                      <span className="sr-only">Download QR code</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
