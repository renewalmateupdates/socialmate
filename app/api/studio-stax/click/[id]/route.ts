export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

// GET /api/studio-stax/click/[id]
// Logs a click event for the listing, then redirects to its URL.
// Used as href on all listing cards in the public directory so clicks are tracked.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const admin  = getSupabaseAdmin()

  // Fetch the listing URL
  const { data: listing } = await admin
    .from('curated_listings')
    .select('url')
    .eq('id', id)
    .maybeSingle()

  const destination = listing?.url ?? '/studio-stax'

  // Increment click counter (fire and forget — don't block the redirect)
  const today = new Date().toISOString().slice(0, 10)
  admin.rpc('increment_stax_click', { p_listing_id: id, p_date: today }).then(() => {})

  return NextResponse.redirect(destination, { status: 302 })
}
