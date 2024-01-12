'use server'

import { headers } from 'next/headers'

import { prisma } from '@/lib/db'

export const saveContactUs = async (data: {
  name: string
  email: string
  subject: string
  message: string
}) => {
  const reqHeaders = headers()
  await prisma.contactUs.create({
    data: {
      ...data,
      ipAdress: reqHeaders.get('x-forwarded-for'),
      userAgent: reqHeaders.get('user-agent')
    }
  })
}
