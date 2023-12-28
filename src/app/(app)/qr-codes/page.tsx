import Link from 'next/link'

import { Heading } from '@/components/heading'
import { Icons } from '@/components/icons'
import { Shell } from '@/components/shell'
import { Button } from '@/components/ui/button'
import { getQRCodes } from './actions'
import { QRList } from './qr-list'

const QRCodesPage = async () => {
  const data = await getQRCodes()
  return (
    <Shell>
      <Heading heading="QR Codes" text="Create and manage your QR codes.">
        <Link href="/qr-codes/new">
          <Button>
            <Icons.add className="mr-2 h-4 w-4" />
            New QR Code
          </Button>
        </Link>
      </Heading>
      <QRList data={data} />
    </Shell>
  )
}

export default QRCodesPage
