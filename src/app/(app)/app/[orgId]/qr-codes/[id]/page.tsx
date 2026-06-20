import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { getQRCodeAction } from '~/app/(app)/actions/qr-codes'
import { Button } from '~/components/ui/button'
import { env } from '~/env'
import { QRCodeForm } from '../_components/qr-code-form'

export default async function Page({
  params
}: {
  params: Promise<{ orgId: string; id: string }>
}) {
  const { orgId, id } = await params

  const result = await getQRCodeAction({
    organizationId: orgId,
    id
  })

  if (result?.serverError) throw new Error(result.serverError)
  if (!result?.data) throw new Error('QR code not found')

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Button asChild variant="ghost" size="sm" className="-ml-2 w-fit">
          <Link href={`/app/${orgId}/qr-codes`}>
            <ArrowLeft data-icon="inline-start" />
            Back to QR codes
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit QR code</h1>
          <p className="text-muted-foreground">
            Update the destination or download a fresh QR image.
          </p>
        </div>
      </div>

      <QRCodeForm
        mode="edit"
        organizationId={orgId}
        appBaseUrl={env.BETTER_AUTH_URL}
        qrCode={result.data}
      />
    </div>
  )
}
