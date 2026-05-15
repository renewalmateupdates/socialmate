export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

// In-memory cache — no Redis needed
let cachedCount: number | null = null
let cacheTimestamp: number = 0
const CACHE_TTL_MS = 60_000 // 60 seconds

export async function GET() {
  const now = Date.now()

  if (cachedCount !== null && now - cacheTimestamp < CACHE_TTL_MS) {
    return NextResponse.json({ count: cachedCount })
  }

  try {
    const db = getSupabaseAdmin()
    const { count, error } = await db
      .from('user_settings')
      .select('*', { count: 'exact', head: true })

    if (error || count === null) {
      // Return stale cache if available, otherwise fallback
      return NextResponse.json({ count: cachedCount ?? 30 })
    }

    cachedCount = count
    cacheTimestamp = now
    return NextResponse.json({ count })
  } catch {
    return NextResponse.json({ count: cachedCount ?? 30 })
  }
}
