import { headers } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { UAParser } from 'ua-parser-js'

import { prisma } from '@/lib/db'

const Page = async ({ params: { qrslug } }: { params: { qrslug: string } }) => {
  const qrCode = await prisma.qRCode.findUnique({
    where: {
      slug: qrslug,
      dynamic: true,
      expires: {
        gt: new Date()
      }
    },
    select: {
      id: true,
      website: true
    }
  })

  if (qrCode) {
    const headersList = headers()

    const ua = headersList.get('user-agent') || ''
    const uaParser = new UAParser(ua)
    const uaParsed = uaParser.getResult()

    const ip = headersList.get('x-forwarded-for') || ''

    // const randomNumberBetween = (min: number, max: number) => {
    //   return Math.floor(Math.random() * (max - min + 1) + min)
    // }
    // const createdAt = new Date()
    // createdAt.setUTCDate(createdAt.getUTCDate() - randomNumberBetween(1, 30))

    await prisma.qRCodeScanLog.create({
      data: {
        qrCodeId: qrCode.id,
        ipAdress: ip,
        userAgent: ua,
        browserName: uaParsed.browser.name,
        browserVersion: uaParsed.browser.version,
        osName: uaParsed.os.name,
        osVersion: uaParsed.os.version,
        deviceVendor: uaParsed.device.vendor,
        deviceModel: uaParsed.device.model,
        deviceType: uaParsed.device.type
      }
    })

    return redirect(qrCode.website)
  }

  return notFound()
}

export default Page
