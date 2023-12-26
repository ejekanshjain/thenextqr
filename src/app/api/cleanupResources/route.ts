import { NextResponse } from 'next/server'

import { prisma } from '@/lib/db'
import { storageClient } from '@/lib/storageClient'

export async function POST() {
  const attachments = await prisma.resource.findMany({
    where: {
      qrCodeId: null
    }
  })
  const toDelete: string[] = []
  await Promise.all(
    attachments.map(async a => {
      try {
        await storageClient.deleteFile(a.newFilename)
        toDelete.push(a.id)
      } catch (err) {}
    })
  )
  if (toDelete.length)
    await prisma.resource.deleteMany({
      where: {
        id: {
          in: toDelete
        }
      }
    })

  return NextResponse.json({ success: true })
}
