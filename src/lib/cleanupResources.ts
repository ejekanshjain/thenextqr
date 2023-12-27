import { prisma } from './db'
import { storageClient } from './storageClient'

export const cleanupResources = async () => {
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
}
