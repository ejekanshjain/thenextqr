import { notFound } from 'next/navigation'

import { Heading } from '@/components/heading'
import { Shell } from '@/components/shell'
import { formatDate } from '@/lib/formatDate'
import { getQRCode } from '../actions'
import { getQRCodeAnalytics } from './actions'
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
  const analyticsData = await getQRCodeAnalytics(id)

  return (
    <Shell>
      <Heading
        heading={qrCode.name}
        text={`Created on: ${formatDate(qrCode.createdAt)} (${
          qrCode._count.scanLogs
        } Scans)`}
      />
      <div>
        <Render data={analyticsData} />
      </div>
    </Shell>
  )
}

export default QRCodeAnalyticsPage
