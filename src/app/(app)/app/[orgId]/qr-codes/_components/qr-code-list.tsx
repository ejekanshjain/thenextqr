'use client'

import { Edit, ExternalLink, Plus, QrCode } from 'lucide-react'
import Link from 'next/link'
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
import { getDynamicQRCodeUrl, getQRUrl, type QRCodeType } from '~/lib/qr-url'
import { QRCodePreview } from './qr-code-preview'

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

            return (
              <Card key={qr.id}>
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
                      <span>Updated {qr.updatedAt.toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 md:justify-end">
                    {destination ? (
                      <Button asChild variant="outline" size="sm">
                        <Link href={destination} target="_blank">
                          <ExternalLink data-icon="inline-start" />
                          Test
                        </Link>
                      </Button>
                    ) : null}
                    <Button asChild size="sm">
                      <Link href={`/app/${organizationId}/qr-codes/${qr.id}`}>
                        <Edit data-icon="inline-start" />
                        Edit
                      </Link>
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
