import { NextResponse } from 'next/server'

import { cleanupResources } from '@/lib/cleanupResources'

export async function POST() {
  await cleanupResources()
  return NextResponse.json({ success: true })
}
