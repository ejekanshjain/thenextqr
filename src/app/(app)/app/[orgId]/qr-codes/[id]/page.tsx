import { ArrowLeft, BarChart3, Pencil } from 'lucide-react'
import Link from 'next/link'
import { getQRCodeAnalyticsAction } from '~/app/(app)/actions/qr-analytics'
import { getQRCodeAction } from '~/app/(app)/actions/qr-codes'
import { QRAnalyticsDashboard } from '~/components/qr-analytics-dashboard'
import { Button } from '~/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import { env } from '~/env'
import { QRCodeForm } from '../_components/qr-code-form'

export default async function Page({
  params
}: {
  params: Promise<{ orgId: string; id: string }>
}) {
  const { orgId, id } = await params

  const [result, analytics] = await Promise.all([
    getQRCodeAction({
      organizationId: orgId,
      id
    }),
    getQRCodeAnalyticsAction({
      organizationId: orgId,
      qrCodeId: id
    })
  ])

  if (result?.serverError) throw new Error(result.serverError)
  if (!result?.data) throw new Error('QR code not found')
  if (analytics?.serverError) throw new Error(analytics.serverError)
  if (!analytics?.data) throw new Error('Failed to load QR analytics')

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
          <h1 className="text-3xl font-bold tracking-tight">
            {result.data.name}
          </h1>
          <p className="text-muted-foreground">
            Edit the QR code configuration or review scan analytics.
          </p>
        </div>
      </div>

      <Tabs defaultValue="edit" className="w-full">
        <div className="flex items-center justify-between gap-4">
          <TabsList>
            <TabsTrigger value="edit">
              <Pencil data-icon="inline-start" />
              Edit
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <BarChart3 data-icon="inline-start" />
              Analytics
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="edit">
          <QRCodeForm
            mode="edit"
            organizationId={orgId}
            appBaseUrl={env.BETTER_AUTH_URL}
            qrCode={result.data}
          />
        </TabsContent>
        <TabsContent value="analytics">
          <QRAnalyticsDashboard data={analytics.data} scope="qr-code" />
        </TabsContent>
      </Tabs>
    </div>
  )
}
