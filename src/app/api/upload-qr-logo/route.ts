import { randomUUID } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'

import { getAuthSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getCdnUrl, storageClient } from '@/lib/storageClient'

const MAX_FILE_SIZE = 512 * 1024 // 512kb

const allowedFileTypes = ['image/png', 'image/jpeg']

export async function POST(request: NextRequest) {
  const session = await getAuthSession()
  if (!session)
    return NextResponse.json({
      success: false
    })

  const data = await request.formData()
  const file: File | null = data.get('file') as unknown as File

  if (!file) return NextResponse.json({ success: false })

  if (file.size > MAX_FILE_SIZE)
    return NextResponse.json({
      success: false,
      message: 'File size is too big'
    })

  if (!allowedFileTypes.includes(file.type))
    return NextResponse.json({
      success: false,
      message: 'File type is not allowed'
    })

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const filename = `${randomUUID()}-${file.name}`
  const url = await storageClient.addFile({
    filename,
    data: buffer
  })
  const { id } = await prisma.resource.create({
    data: {
      newFilename: filename,
      originalFilename: file.name,
      url,
      cdnUrl: getCdnUrl(filename)
    }
  })

  return NextResponse.json({ success: true, id, url })
}
