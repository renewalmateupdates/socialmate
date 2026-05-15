export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

// POST /api/admin/studio-stax/[id]/feature
// Toggles paid "featured" placement for a curated listing.
// Sets featured=true + featured_until=now+90d, or clears it.
// This is separate from admin_featured (Editor's Pick) — it's for paid spotlight placement.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  const { id } = await params
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const body = await req.json().catch(() => ({}))
  const { enable } = body as { enable?: boolean }

  const supabase = getSupabaseAdmin()

  // Fetch current state from curated_listings
  const { data: listing, error: fetchErr } = await supabase
    .from('curated_listings')
    .select('id, featured, featured_until')
    .eq('id', id)
    .maybeSingle()

  if (fetchErr || !listing) {
    return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
  }

  const shouldFeature = enable !== undefined ? enable : !(listing.featured)
  const now = new Date()
  const featuredUntil = shouldFeature
    ? new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString()
    : null

  const { error: updateErr } = await supabase
    .from('curated_listings')
    .update({
      featured: shouldFeature,
      featured_until: featuredUntil,
    })
    .eq('id', id)

  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    featured: shouldFeature,
    featured_until: featuredUntil,
  })
}
