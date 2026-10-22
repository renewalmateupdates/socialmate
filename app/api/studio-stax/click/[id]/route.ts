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

  // Awaited: on Vercel the function can be frozen as soon as the response is
  // returned, so a fire-and-forget call could drop the click entirely. These
  // counts are what listers see in the portal.
  const today = new Date().toISOString().slice(0, 10)
  const { error: clickErr } = await admin.rpc('increment_stax_click', { p_listing_id: id, p_date: today })
  if (clickErr) console.warn('[StaxClick] increment failed:', clickErr.message)

  return NextResponse.redirect(destination, { status: 302 })
}
