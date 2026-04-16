export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

function getSupabase() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: async () => (await cookies()).getAll(),
        setAll: async (cookiesToSet) => {
          const store = await cookies()
          cookiesToSet.forEach(({ name, value, options }) => store.set(name, value, options))
        },
      },
    }
  )
}

// GET /api/studio-stax/analytics
// Returns view/click analytics for the authenticated user's listing.
// Only the listing owner can access their own stats.
export async function GET() {
  const supabase = getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = getSupabaseAdmin()

  // Find the listing owned by this user
  const { data: listing } = await admin
    .from('curated_listings')
    .select('id')
    .eq('applicant_email', user.email ?? '')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!listing) return NextResponse.json({ error: 'No listing found' }, { status: 404 })

  // Fetch all daily stats for this listing (newest first for all-time sum)
  const { data: allStats } = await admin
    .from('stax_daily_stats')
    .select('stat_date, views, clicks')
    .eq('listing_id', listing.id)
    .order('stat_date', { ascending: true })

  const rows = allStats ?? []

  const now = new Date()
  const d30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  const d7  = new Date(now.getTime() -  7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)

  const allTimeViews  = rows.reduce((s, r) => s + r.views, 0)
  const allTimeClicks = rows.reduce((s, r) => s + r.clicks, 0)

  const last30Rows  = rows.filter(r => r.stat_date >= d30)
  const last30Views  = last30Rows.reduce((s, r) => s + r.views, 0)
  const last30Clicks = last30Rows.reduce((s, r) => s + r.clicks, 0)

  // Build a full 7-day array (filling gaps with 0s)
  const daily_last_7: Array<{ date: string; views: number; clicks: number }> = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
    const dateStr = d.toISOString().slice(0, 10)
    const row = rows.find(r => r.stat_date === dateStr)
    daily_last_7.push({ date: dateStr, views: row?.views ?? 0, clicks: row?.clicks ?? 0 })
  }

  const last7Views  = daily_last_7.reduce((s, r) => s + r.views, 0)
  const last7Clicks = daily_last_7.reduce((s, r) => s + r.clicks, 0)

  return NextResponse.json({
    all_time:     { views: allTimeViews,  clicks: allTimeClicks  },
    last_30:      { views: last30Views,   clicks: last30Clicks   },
    last_7:       { views: last7Views,    clicks: last7Clicks    },
    daily_last_7,
  })
}
