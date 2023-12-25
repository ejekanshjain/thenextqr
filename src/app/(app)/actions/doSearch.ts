'use server'

import { authGuard } from '@/lib/auth'
import { prisma } from '@/lib/db'

export type SearchResult = {
  id: string
  title: string
  link: string
}

export async function doSearch(search: string): Promise<SearchResult[]> {
  const session = await authGuard()

  const searchResults: SearchResult[] = []

  if (!session) return searchResults

  const results = await prisma.qRCode.findMany({
    where: {
      createdById: session.user.id,
      name: {
        contains: search,
        mode: 'insensitive'
      }
    },
    take: 5
  })

  results.forEach(result => {
    searchResults.push({
      id: result.id,
      title: result.name,
      link: `/qr-codes/${result.id}`
    })
  })

  return searchResults
}
