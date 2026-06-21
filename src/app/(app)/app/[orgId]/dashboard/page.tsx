import { LayoutGrid } from 'lucide-react'
import { redirect } from 'next/navigation'
import { getOrganizationQRAnalyticsAction } from '~/app/(app)/actions/qr-analytics'
import { PageHeading } from '~/components/page-heading'
import { QRAnalyticsDashboard } from '~/components/qr-analytics-dashboard'
import { getUserOrganizationsCached } from '~/lib/organization-access'

export default async function Page({
  params
}: {
  params: Promise<{ orgId: string }>
}) {
  const { orgId } = await params
  const org = (await getUserOrganizationsCached()).find(o => o.id === orgId)

  if (!org) {
    return redirect('/app')
  }

  const analyticsResult = await getOrganizationQRAnalyticsAction({
    organizationId: orgId
  })

  if (analyticsResult?.serverError) throw new Error(analyticsResult.serverError)
  if (!analyticsResult?.data) throw new Error('Failed to load QR analytics')

  return (
    <div className="flex w-full flex-col gap-6">
      <PageHeading
        title={org.name}
        description="QR performance, scans, and device analytics."
        icon={LayoutGrid}
      />

      <QRAnalyticsDashboard data={analyticsResult.data} scope="organization" />
    </div>
  )
}
