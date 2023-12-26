import { notFound, redirect } from 'next/navigation'
import { UAParser } from 'ua-parser-js'

import { prisma } from '@/lib/db'

const Page = async (ctx: any) => {
  const qrCode = await prisma.qRCode.findUnique({
    where: {
      slug: ctx.params.qrslug,
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
    const uaParser = new UAParser(ctx.req.headers['user-agent'])
    const uaParsed = uaParser.getResult()

    await prisma.qRCodeScanLog.create({
      data: {
        qrCodeId: qrCode.id,
        ipAdress:
          ctx.req.headers['x-forwarded-for'] ||
          ctx.req.connection.remoteAddress,
        userAgent: ctx.req.headers['user-agent'],
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
