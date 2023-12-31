import { notFound } from 'next/navigation'

import { Heading } from '@/components/heading'
import { Shell } from '@/components/shell'
import { formatDate } from '@/lib/formatDate'
import { getQRCode } from '../actions'
import { Render } from './render'

const QRCodeAnalyticsPage = async ({
  params: { id }
}: {
  params: {
    id: string
  }
}) => {
  if (id === 'new') return notFound()

  const qrCode = await getQRCode(id)

  return (
    <Shell>
      <Heading
        heading={qrCode.name}
        text={`Created on: ${formatDate(qrCode.createdAt)} (${
          qrCode._count.scanLogs
        } Scans)`}
      />
      <div className="grid gap-10 p-1">
        <Render />
      </div>
    </Shell>
  )
}

export default QRCodeAnalyticsPage
