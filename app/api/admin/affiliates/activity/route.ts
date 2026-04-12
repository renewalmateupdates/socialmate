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
        setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
  return supabase.auth.getUser()
}

// ── GET — fetch per-affiliate activity from affiliate_conversions ──────────

export async function GET(_req: NextRequest) {
  const { data: { user } } = await getAuthedUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const adminEmail = process.env.ADMIN_EMAIL || 'socialmatehq@gmail.com'
  if (user.email !== adminEmail) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const db = getAdminSupabase()

  // Pull all conversions — we'll aggregate in JS to avoid complex SQL
  const { data: conversions, error } = await db
    .from('affiliate_conversions')
    .select('affiliate_id, converted_at, status')
    .order('converted_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Active statuses = conversions still generating value (not forfeited/paid out)
  const ACTIVE_STATUSES = new Set(['pending', 'holding', 'earned'])

  // Aggregate per affiliate_id
  const byAffiliate = new Map<string, {
    last_referral_at: string | null
    total_conversions: number
    active_conversions: number
  }>()

  for (const row of (conversions ?? [])) {
    const existing = byAffiliate.get(row.affiliate_id)
    if (!existing) {
      byAffiliate.set(row.affiliate_id, {
        last_referral_at: row.converted_at,
        total_conversions: 1,
        active_conversions: ACTIVE_STATUSES.has(row.status) ? 1 : 0,
      })
    } else {
      // converted_at is already sorted desc so first seen = most recent
      existing.total_conversions++
      if (ACTIVE_STATUSES.has(row.status)) existing.active_conversions++
    }
  }

  // Shape into array keyed by affiliate_id
  const activity = Array.from(byAffiliate.entries()).map(([affiliate_id, data]) => ({
    affiliate_id,
    ...data,
  }))

  return NextResponse.json({ activity })
}
