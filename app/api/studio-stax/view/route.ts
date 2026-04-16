export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

// POST /api/studio-stax/view
// Body: { listing_ids: string[] }
// Called by ListingViewTracker on page load to batch-increment view counters
// for all listings visible on the public Studio Stax directory.
export async function POST(request: NextRequest) {
  let listing_ids: string[]
  try {
    const body = await request.json()
    listing_ids = Array.isArray(body?.listing_ids) ? body.listing_ids : []
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  if (!listing_ids.length) return NextResponse.json({ ok: true })

  const admin = getSupabaseAdmin()
  const today = new Date().toISOString().slice(0, 10)

  await admin.rpc('increment_stax_views', {
    p_listing_ids: listing_ids,
    p_date:        today,
  })

  return NextResponse.json({ ok: true })
}
