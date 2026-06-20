import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '~/components/ui/button'
import { env } from '~/env'
import { QRCodeForm } from '../_components/qr-code-form'

export default async function Page({
  params
}: {
  params: Promise<{ orgId: string }>
}) {
  const { orgId } = await params

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
          <h1 className="text-3xl font-bold tracking-tight">Create QR code</h1>
          <p className="text-muted-foreground">
            Configure the destination, choose a public slug, and export the QR.
          </p>
        </div>
      </div>

      <QRCodeForm
        mode="create"
        organizationId={orgId}
        appBaseUrl={env.BETTER_AUTH_URL}
      />
    </div>
  )
}
