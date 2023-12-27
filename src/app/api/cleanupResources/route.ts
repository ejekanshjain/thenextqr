import { cleanupResources } from '@/lib/cleanupResources'
import { NextResponse } from 'next/server'

export async function POST() {
  await cleanupResources()
  return NextResponse.json({ success: true })
}
