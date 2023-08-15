'use server'

import { authGuard } from '@/lib/auth'

export type SearchResult = {
  id: string
  title: string
  link: string
}

export async function doSearch(search: string): Promise<SearchResult[]> {
  await authGuard()

  const searchResults: SearchResult[] = []

  console.log(search)

  return searchResults
}
