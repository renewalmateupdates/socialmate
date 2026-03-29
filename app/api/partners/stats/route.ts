export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://socialmate.studio'

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

// ── GET — fetch affiliate stats (affiliate or admin) ─────────────────────

export async function GET(req: NextRequest) {
  const { data: { user } } = await getAuthedUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const isAdmin    = searchParams.get('admin') === 'true'
  const adminEmail = process.env.ADMIN_EMAIL

  const db = getAdminSupabase()

  // ── Admin view: all affiliates + revenue summary ──────────────────────
  if (isAdmin) {
    if (adminEmail && user.email !== adminEmail) {
      return NextResponse.json({ forbidden: true }, { status: 403 })
    }

    const type = searchParams.get('type')

    if (type === 'revenue') {
      const { data: conversions } = await db
        .from('affiliate_conversions')
        .select('amount_cents, commission_cents, status')

      const gross       = (conversions ?? []).reduce((s, c) => s + c.amount_cents, 0)
      const commissions = (conversions ?? []).reduce((s, c) => s + c.commission_cents, 0)
      const forfeited   = (conversions ?? []).filter(c => c.status === 'forfeited').reduce((s, c) => s + c.commission_cents, 0)
      const pending     = (conversions ?? []).filter(c => c.status === 'pending' || c.status === 'holding').reduce((s, c) => s + c.commission_cents, 0)

      return NextResponse.json({
        revenue: {
          gross_revenue_cents:       gross,
          total_commissions_cents:   commissions,
          net_to_joshua_cents:       gross - commissions,
          pending_payouts_cents:     pending,
          forfeited_cents:           forfeited,
          sm_give_cents:             Math.floor(forfeited / 2),
        },
      })
    }

    const { data: affiliates } = await db
      .from('affiliate_profiles')
      .select('*')
      .order('created_at', { ascending: false })

    return NextResponse.json({ affiliates: affiliates ?? [] })
  }

  // ── Affiliate view: own profile ───────────────────────────────────────
  const { data: profile } = await db
    .from('affiliate_profiles')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!profile) return NextResponse.json({ profile: null })

  const commissionRate = profile.active_referral_count >= 100 ? 0.40 : 0.30
  const commissionLabel = profile.active_referral_count >= 100 ? '40%' : '30%'
  const nextTier = profile.active_referral_count >= 100
    ? null
    : { rate: '40%', remaining: 100 - profile.active_referral_count }

  // Promo codes
  const { data: promoCodes } = await db
    .from('affiliate_promo_codes')
    .select('*')
    .eq('affiliate_id', profile.id)
    .eq('is_active', true)

  // Recent conversions
  const { data: conversions } = await db
    .from('affiliate_conversions')
    .select('*')
    .eq('affiliate_id', profile.id)
    .order('converted_at', { ascending: false })
    .limit(50)

  // Payouts
  const { data: payouts } = await db
    .from('affiliate_payouts')
    .select('*')
    .eq('affiliate_id', profile.id)
    .order('requested_at', { ascending: false })

  // Notifications
  const { data: notifications } = await db
    .from('affiliate_notifications')
    .select('*')
    .eq('affiliate_id', profile.id)
    .order('sent_at', { ascending: false })
    .limit(20)

  // Referral link (using affiliate promo code prefix or fallback)
  const referralLink = `${appUrl}/?aff=${profile.id.slice(0, 8)}`

  return NextResponse.json({
    profile: { ...profile, commission_rate: commissionRate },
    referral_link: referralLink,
    promo_codes: promoCodes ?? [],
    conversions: conversions ?? [],
    payouts: payouts ?? [],
    commission_label: commissionLabel,
    next_tier: nextTier,
    notifications: notifications ?? [],
  })
}

// ── PATCH — admin update affiliate status ─────────────────────────────────

export async function PATCH(req: NextRequest) {
  const { data: { user } } = await getAuthedUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const adminEmail = process.env.ADMIN_EMAIL
  if (adminEmail && user.email !== adminEmail) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id, status, notes } = await req.json()
  if (!id || !status) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  const db = getAdminSupabase()
  const { error } = await db
    .from('affiliate_profiles')
    .update({ status, notes: notes || null, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}

// ── POST — admin generate custom promo code ───────────────────────────────

export async function POST(req: NextRequest) {
  const { data: { user } } = await getAuthedUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const adminEmail = process.env.ADMIN_EMAIL
  if (adminEmail && user.email !== adminEmail) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()

  if (body.action === 'generate_promo') {
    const { affiliate_id, code, discount_value, duration_months } = body
    if (!affiliate_id || !code) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

    const db = getAdminSupabase()
    const { error } = await db.from('affiliate_promo_codes').insert({
      affiliate_id,
      code: code.toUpperCase(),
      discount_type: 'percent',
      discount_value,
      duration_months,
      description: `${discount_value}% off for ${duration_months} months`,
    })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
