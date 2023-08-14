'use server'

import { z } from 'zod'

import { authGuard } from '@/lib/auth'

export type SearchResult = {
  id: string
  title: string
  link: string
}

export async function doSearch(search: string): Promise<SearchResult[]> {
  await authGuard()

  const zSchema = z.string().min(1).cuid()

  let idToSearch: string

  try {
    const parsed = await zSchema.parseAsync(search)
    idToSearch = parsed
  } catch (err) {
    return []
  }

  const searchResults: SearchResult[] = []

  return searchResults
}
