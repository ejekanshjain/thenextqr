'use server'

import { headers } from 'next/headers'

import { getAuthSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const saveContactUs = async (data: {
  name: string
  email: string
  subject: string
  message: string
}) => {
  const session = await getAuthSession()
  const reqHeaders = headers()
  await prisma.contactUs.create({
    data: {
      ...data,
      ipAdress: reqHeaders.get('x-forwarded-for'),
      userAgent: reqHeaders.get('user-agent'),
      userId: session?.user.id
    }
  })
}
