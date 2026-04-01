export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { stripe } from '@/lib/stripe'

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

  // ── Admin shortcut: return isAdmin flag so partner portal can redirect ──
  if (adminEmail && user.email === adminEmail) {
    return NextResponse.json({ isAdmin: true, profile: null })
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

// ── Stripe coupon helper ──────────────────────────────────────────────────

async function createStripeCouponForCode(params: {
  code: string
  discount_value: number
  stripe_duration: 'once' | 'repeating' | 'forever'
  stripe_duration_months?: number
  description: string
  affiliate_id: string
}): Promise<{ coupon_id: string | null; promo_code_id: string | null }> {
  try {
    const coupon = await stripe.coupons.create({
      percent_off: params.discount_value,
      duration: params.stripe_duration,
      ...(params.stripe_duration === 'repeating' && params.stripe_duration_months
        ? { duration_in_months: params.stripe_duration_months }
        : {}),
      name: `${params.code} — ${params.description}`,
      metadata: { affiliate_id: params.affiliate_id, promo_code: params.code },
    })

    const promoCode = await stripe.promotionCodes.create({
      promotion: { type: 'coupon', coupon: coupon.id },
      code: params.code,
      max_redemptions: 1,
      metadata: { affiliate_id: params.affiliate_id },
    })

    return { coupon_id: coupon.id, promo_code_id: promoCode.id }
  } catch (err: any) {
    // Duplicate code in Stripe — try to find existing promotion code
    if (err?.code === 'resource_already_exists') {
      console.warn(`Stripe promo code already exists for ${params.code}, skipping Stripe creation`)
    } else {
      console.warn(`Stripe coupon creation failed for ${params.code}:`, err?.message)
    }
    return { coupon_id: null, promo_code_id: null }
  }
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

  // ── Single custom promo code ──
  if (body.action === 'generate_promo') {
    const { affiliate_id, code, discount_value, duration_months } = body
    if (!affiliate_id || !code) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

    const db = getAdminSupabase()
    const upperCode = (code as string).toUpperCase()
    const description = duration_months
      ? `${discount_value}% off for ${duration_months} months`
      : `${discount_value}% off`

    const { error } = await db.from('affiliate_promo_codes').insert({
      affiliate_id,
      code: upperCode,
      discount_type: 'percent',
      discount_value,
      duration_months,
      description,
    })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Create Stripe coupon + promo code (non-fatal if fails)
    const { coupon_id, promo_code_id } = await createStripeCouponForCode({
      code: upperCode,
      discount_value,
      stripe_duration: 'once',
      description,
      affiliate_id,
    })

    if (coupon_id) {
      // Store as "couponId|promoCodeId" so webhook can look up by promo_code_id
      const stripeValue = promo_code_id ? `${coupon_id}|${promo_code_id}` : coupon_id
      await db.from('affiliate_promo_codes')
        .update({ stripe_coupon_id: stripeValue })
        .eq('code', upperCode)
        .eq('affiliate_id', affiliate_id)
    }

    return NextResponse.json({ success: true })
  }

  // ── Bulk generate all 8 standard promo codes for an affiliate ──
  if (body.action === 'generate_all_promos') {
    const { affiliate_id, email_prefix } = body
    if (!affiliate_id || !email_prefix) {
      return NextResponse.json({ error: 'Missing affiliate_id or email_prefix' }, { status: 400 })
    }

    const BASE = (email_prefix as string).replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 8)

    const standardCodes: Array<{
      code: string
      discount_value: number
      duration_months: number | null
      description: string
      stripe_duration: 'once' | 'repeating'
      stripe_duration_months?: number
    }> = [
      { code: `${BASE}1M`,  discount_value: 15, duration_months: 1,    description: '15% off for 1 month',           stripe_duration: 'repeating', stripe_duration_months: 1  },
      { code: `${BASE}3M`,  discount_value: 20, duration_months: 3,    description: '20% off for 3 months',          stripe_duration: 'repeating', stripe_duration_months: 3  },
      { code: `${BASE}6M`,  discount_value: 22, duration_months: 6,    description: '22% off for 6 months',          stripe_duration: 'repeating', stripe_duration_months: 6  },
      { code: `${BASE}1Y`,  discount_value: 25, duration_months: 12,   description: '25% off annual plan',           stripe_duration: 'once'      },
      { code: `${BASE}CR1`, discount_value: 10, duration_months: null, description: '10% off Starter/Popular credits', stripe_duration: 'once'    },
      { code: `${BASE}CR2`, discount_value: 15, duration_months: null, description: '15% off Pro/Max credits',       stripe_duration: 'once'      },
      { code: `${BASE}WLB`, discount_value: 15, duration_months: null, description: '15% off White Label Basic',     stripe_duration: 'once'      },
      { code: `${BASE}WLP`, discount_value: 20, duration_months: null, description: '20% off White Label Pro',       stripe_duration: 'once'      },
    ]

    const db = getAdminSupabase()
    const results: Array<{ code: string; success: boolean; error?: string }> = []

    for (const def of standardCodes) {
      // Insert into DB
      const { error: insertError } = await db.from('affiliate_promo_codes').insert({
        affiliate_id,
        code: def.code,
        code_template: def.code,
        discount_type: 'percent',
        discount_value: def.discount_value,
        duration_months: def.duration_months,
        description: def.description,
      })

      if (insertError) {
        // Already exists — not fatal, continue
        console.warn(`DB insert skipped for ${def.code}: ${insertError.message}`)
        results.push({ code: def.code, success: false, error: insertError.message })
        continue
      }

      // Create Stripe coupon + promotion code
      const { coupon_id, promo_code_id } = await createStripeCouponForCode({
        code: def.code,
        discount_value: def.discount_value,
        stripe_duration: def.stripe_duration,
        stripe_duration_months: def.stripe_duration_months,
        description: def.description,
        affiliate_id,
      })

      if (coupon_id) {
        // Store as "couponId|promoCodeId" so webhook can match by promo_code_id
        const stripeValue = promo_code_id ? `${coupon_id}|${promo_code_id}` : coupon_id
        await db.from('affiliate_promo_codes')
          .update({ stripe_coupon_id: stripeValue })
          .eq('code', def.code)
          .eq('affiliate_id', affiliate_id)
      }

      results.push({ code: def.code, success: true })
    }

    const created = results.filter(r => r.success).length
    const skipped = results.filter(r => !r.success).length
    return NextResponse.json({ success: true, created, skipped, results })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
