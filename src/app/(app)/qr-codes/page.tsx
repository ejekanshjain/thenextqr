import Link from 'next/link'

import { EmptyPlaceholder } from '@/components/empty-placeholder'
import { Heading } from '@/components/heading'
import { Icons } from '@/components/icons'
import { Shell } from '@/components/shell'
import { Button } from '@/components/ui/button'
import { getQRCodes } from './actions'

const QRCodesPage = async () => {
  const data = await getQRCodes()
  return (
    <Shell>
      <Heading heading="QR Codes" text="Create and manage qr codes.">
        <Link href="/qr-codes/new">
          <Button>
            <Icons.add className="mr-2 h-4 w-4" />
            New QR Code
          </Button>
        </Link>
      </Heading>
      <div>
        {data.qrCodes?.length ? (
          <div className="divide-y divide-border rounded-md border">
            {data.qrCodes.map(qrCode => (
              <div key={qrCode.id} />
            ))}
          </div>
        ) : (
          <EmptyPlaceholder>
            <EmptyPlaceholder.Icon name="qrCode" />
            <EmptyPlaceholder.Title>No qr codes created</EmptyPlaceholder.Title>
            <EmptyPlaceholder.Description>
              You don&apos;t have any qr codes yet. Start creating.
            </EmptyPlaceholder.Description>
            <Button variant="outline">
              <Icons.add className="mr-2 h-4 w-4" />
              New QR Code
            </Button>
          </EmptyPlaceholder>
        )}
      </div>
    </Shell>
  )
}

export default QRCodesPage
