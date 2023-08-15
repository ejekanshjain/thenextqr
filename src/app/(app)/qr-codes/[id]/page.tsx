import { Heading } from '@/components/heading'
import { Shell } from '@/components/shell'
import { formatDate } from '@/lib/formatDate'
import { GetQRCodeFnDataType, getQRCode } from './actions'
import { Render } from './render'

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
        heading={
          qrCode
            ? qrCode?.name || qrCode?.slug || qrCode?.website || qrCode.id
            : 'New QR Code'
        }
        text={qrCode ? formatDate(qrCode.createdAt) : undefined}
      />
      <div className="grid gap-10">
        <Render qrCode={qrCode} />
      </div>
    </Shell>
  )
}

export default QRCodePage
