import { Metadata } from 'next'

import { Heading } from '@/components/heading'
import { Shell } from '@/components/shell'
import { formatDate } from '@/lib/formatDate'
import { siteConfig } from '@/lib/siteConfig'
import { GetQRCodeFnDataType, getQRCode } from './actions'
import { Render } from './render'

export const metadata: Metadata = {
  title: 'QR Code',
  description: siteConfig.description
}

const QRCodePage = async ({
  params: { id }
}: {
  params: {
    id: string
  }
}) => {
  let qrCode: GetQRCodeFnDataType | undefined

  if (id !== 'new') qrCode = await getQRCode(id)

  return (
    <Shell>
      <Heading
        heading={qrCode ? qrCode.name : 'New QR Code'}
        text={
          qrCode
            ? `Created on: ${formatDate(qrCode.createdAt)} (${
                qrCode.totalScans
              } Scans)`
            : undefined
        }
      />
      <div className="grid gap-10 p-1">
        <Render qrCode={qrCode} />
      </div>
    </Shell>
  )
}

export default QRCodePage
