'use server'

import { getAuthSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export const updateName = async ({ name }: { name: string }) => {
  const session = await getAuthSession()
  if (!session?.user) throw new Error('Unauthorized')

  await prisma.user.update({
    where: {
      id: session.user.id
    },
    data: {
      name
    }
  })

  revalidatePath('/settings')
}
