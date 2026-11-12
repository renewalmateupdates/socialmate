export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

const NOT_FOUND = new URL('/?link_not_found=1', 'https://socialmate.studio')

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const admin = getSupabaseAdmin()

  // One statement that counts the click and returns where to go
  // (supabase/short_link_clicks_nov2026.sql). The read-then-write below it
  // loses clicks when two land at once, which a campaign's links now invite.
  const counted = await admin.rpc('increment_short_link_clicks', { p_slug: slug })
  if (!counted.error) {
    const target = typeof counted.data === 'string' ? counted.data : null
    return NextResponse.redirect(target ?? NOT_FOUND, { status: 302 })
  }
  // PGRST202: the function isn't there yet (its SQL hasn't run). Anything else
  // is logged, and the redirect still happens.
  if (counted.error.code !== 'PGRST202') {
    console.warn('[go] increment_short_link_clicks failed:', counted.error.message)
  }

  const { data: link, error } = await admin
    .from('short_links')
    .select('id, original_url, clicks')
    .eq('slug', slug)
    .maybeSingle()
  if (error) console.warn('[go] short link lookup failed:', error.message)

  if (!link) {
    return NextResponse.redirect(NOT_FOUND, { status: 302 })
  }

  // Not atomic: only used until the function above exists.
  const { error: countErr } = await admin
    .from('short_links')
    .update({ clicks: (link.clicks ?? 0) + 1 })
    .eq('id', link.id)
  if (countErr) console.warn('[go] click count failed:', countErr.message)

  return NextResponse.redirect(link.original_url, { status: 302 })
}
