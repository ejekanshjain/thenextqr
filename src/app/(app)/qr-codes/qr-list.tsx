'use client'

import { FC, useMemo, useState } from 'react'

import { EmptyPlaceholder } from '@/components/empty-placeholder'
import { Icons } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { GetQRCodesFnDataType } from './actions'
import { QRListItem } from './qr'

export const QRList: FC<{
  data: GetQRCodesFnDataType
}> = ({ data }) => {
  const [search, setSearch] = useState('')

  const filteredData = useMemo(() => {
    const s = search.trim().toLowerCase()
    return data.qrCodes.filter(qr => qr.name.toLowerCase().includes(s))
  }, [search, data.qrCodes])

  return (
    <div className="flex flex-col gap-3">
      <Input
        className={`max-w-md ${!data.total ? 'invisible' : ''}`}
        placeholder="Search..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      {!data.total ? (
        <EmptyPlaceholder>
          <EmptyPlaceholder.Icon name="qrCode" />
          <EmptyPlaceholder.Title>No QR codes created</EmptyPlaceholder.Title>
          <EmptyPlaceholder.Description>
            You don&apos;t have any QR codes yet. Start creating.
          </EmptyPlaceholder.Description>
          <Link href="/qr-codes/new">
            <Button variant="outline">
              <Icons.add className="mr-2 h-4 w-4" />
              New QR Code
            </Button>
          </Link>
        </EmptyPlaceholder>
      ) : !filteredData.length ? (
        <EmptyPlaceholder>
          <EmptyPlaceholder.Icon name="qrCode" />
          <EmptyPlaceholder.Title>No QR codes found</EmptyPlaceholder.Title>
          <EmptyPlaceholder.Description>
            No QR codes found for your search. Try again.
          </EmptyPlaceholder.Description>
        </EmptyPlaceholder>
      ) : (
        <div className="divide-y divide-border rounded-md border">
          {filteredData.map(qrCode => (
            <QRListItem key={qrCode.id} qr={qrCode} />
          ))}
        </div>
      )}
    </div>
  )
}
