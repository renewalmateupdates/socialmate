export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { partnerFigures } from '@/lib/partner-rate'

function getAdminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

async function getAuthedUser() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
  return supabase.auth.getUser()
}

// ── GET — top opted-in affiliates sorted by total earnings ────────────────

export async function GET(_req: NextRequest) {
  const { data: { user } } = await getAuthedUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = getAdminSupabase()

  // Who opted in comes from affiliate_profiles; what they earned and how many
  // referrals they have come from `affiliates`, the row the webhook credits.
  // The profile's earnings and count columns are never written, so ranking by
  // them listed every partner at $0.
  const [{ data: entries, error: entriesErr }, { data: myProfile }] = await Promise.all([
    db
      .from('affiliate_profiles')
      .select('id, user_id, full_name, leaderboard_anonymous')
      .eq('leaderboard_opt_in', true)
      .eq('status', 'active'),
    db
      .from('affiliate_profiles')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle(),
  ])
  if (entriesErr) console.warn('[partners/leaderboard] profiles read failed:', entriesErr.message)

  const userIds = (entries ?? []).map(e => e.user_id).filter(Boolean)
  const { data: rows, error: rowsErr } = userIds.length
    ? await db.from('affiliates')
        .select('user_id, total_earnings, unpaid_earnings, active_referral_count, commission_rate')
        .in('user_id', userIds)
    : { data: [], error: null }
  if (rowsErr) console.warn('[partners/leaderboard] affiliates read failed:', rowsErr.message)
  const figuresByUser = new Map((rows ?? []).map(r => [r.user_id, partnerFigures(r)]))

  const leaderboard = (entries ?? [])
    .map(e => ({ e, f: figuresByUser.get(e.user_id) ?? partnerFigures(null) }))
    .sort((a, b) => b.f.total_earnings_cents - a.f.total_earnings_cents)
    .slice(0, 10)
    .map(({ e, f }, i) => ({
      rank: i + 1,
      name: e.leaderboard_anonymous ? 'Anonymous Partner' : (e.full_name || 'Partner'),
      total_earnings_cents: f.total_earnings_cents,
      active_referral_count: f.active_referral_count,
      is_me: e.id === myProfile?.id,
    }))

  return NextResponse.json({ leaderboard })
}
