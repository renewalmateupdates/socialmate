export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

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

  const [{ data: entries }, { data: myProfile }] = await Promise.all([
    db
      .from('affiliate_profiles')
      .select('id, full_name, total_earnings_cents, active_referral_count, leaderboard_anonymous')
      .eq('leaderboard_opt_in', true)
      .eq('status', 'active')
      .order('total_earnings_cents', { ascending: false })
      .limit(10),
    db
      .from('affiliate_profiles')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle(),
  ])

  const leaderboard = (entries ?? []).map((e, i) => ({
    rank: i + 1,
    name: e.leaderboard_anonymous ? 'Anonymous Partner' : (e.full_name || 'Partner'),
    total_earnings_cents: e.total_earnings_cents,
    active_referral_count: e.active_referral_count,
    is_me: e.id === myProfile?.id,
  }))

  return NextResponse.json({ leaderboard })
}
