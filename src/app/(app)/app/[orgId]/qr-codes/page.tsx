import { getQRCodesAction } from '~/app/(app)/actions/qr-codes'
import { env } from '~/env'
import { QRCodeList } from './_components/qr-code-list'

export default async function Page({
  params,
  searchParams
}: {
  params: Promise<{ orgId: string }>
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}) {
  const { orgId } = await params
  const resolvedSearchParams = (await searchParams) ?? {}
  const search =
    typeof resolvedSearchParams.search === 'string'
      ? resolvedSearchParams.search
      : undefined

  const result = await getQRCodesAction({
    organizationId: orgId,
    limit: 100,
    search
  })

  if (result?.serverError) throw new Error(result.serverError)
  if (!result?.data) throw new Error('Failed to load QR codes')

  const [qrCodes, total] = result.data

  return (
    <QRCodeList
      organizationId={orgId}
      appBaseUrl={env.BETTER_AUTH_URL}
      qrCodes={qrCodes}
      total={total}
      search={search}
    />
  )
}
