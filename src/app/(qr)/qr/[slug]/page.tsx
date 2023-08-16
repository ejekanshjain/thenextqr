import { notFound, redirect } from 'next/navigation'

import { prisma } from '@/lib/db'

const Page = async ({
  params: { slug }
}: {
  params: {
    slug: string
  }
}) => {
  const qrCode = await prisma.qRCode.findUnique({
    where: {
      slug,
      dynamic: true
    },
    select: {
      id: true,
      website: true
    }
  })

  if (qrCode) {
    await prisma.qRCodeScanLog.create({
      data: {
        qrCodeId: qrCode.id
      }
    })
    return redirect(qrCode.website)
  }

  return notFound()
}

export default Page
