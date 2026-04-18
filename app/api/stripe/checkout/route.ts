export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(req: NextRequest) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { priceId, fromOnboarding, coupon_code } = await req.json()

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://socialmate.studio'

  const successUrl = fromOnboarding
    ? `${appUrl}/onboarding?upgraded=true&step=3`
    : `${appUrl}/dashboard?upgraded=true`

  // ── Coupon validation ────────────────────────────────────────────────────
  let couponRecord: {
    id: string
    code: string
    affiliate_id: string | null
    discount_type: string
    discount_value: number
    stripe_promo_id: string | null
  } | null = null

  if (coupon_code) {
    const db = getSupabaseAdmin()
    const { data: found } = await db
      .from('coupons')
      .select('id, code, affiliate_id, discount_type, discount_value, max_redemptions, current_redemptions, expires_at, active, stripe_promo_id')
      .ilike('code', (coupon_code as string).trim())
      .single()

    if (!found || !found.active) {
      return NextResponse.json({ error: 'Invalid or inactive coupon code' }, { status: 400 })
    }
    if (found.expires_at && new Date(found.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Coupon code has expired' }, { status: 400 })
    }
    if (found.max_redemptions != null && found.current_redemptions >= found.max_redemptions) {
      return NextResponse.json({ error: 'Coupon has reached its redemption limit' }, { status: 400 })
    }
    // Prevent double redemption per user
    const { data: prior } = await db
      .from('coupon_redemptions')
      .select('id')
      .eq('coupon_id', found.id)
      .eq('user_id', user.id)
      .maybeSingle()
    if (prior) {
      return NextResponse.json({ error: 'You have already used this coupon' }, { status: 400 })
    }

    couponRecord = found
  }

  // ── Build Stripe session params ──────────────────────────────────────────
  const metadata: Record<string, string> = {
    user_id: user.id,
    ...(couponRecord ? {
      coupon_code:  couponRecord.code,
      affiliate_id: couponRecord.affiliate_id ?? '',
    } : {}),
  }

  // trial_extension: set trial days instead of a discount object
  const trialDays = couponRecord?.discount_type === 'trial_extension'
    ? Math.round(Number(couponRecord.discount_value))
    : undefined

  // percent/fixed: apply via Stripe promotion code (mutually exclusive with allow_promotion_codes)
  const discounts = couponRecord?.stripe_promo_id && couponRecord.discount_type !== 'trial_extension'
    ? [{ promotion_code: couponRecord.stripe_promo_id }]
    : undefined

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    customer_email: user.email,
    line_items: [{ price: priceId, quantity: 1 }],
    metadata,
    automatic_tax: { enabled: true },
    // allow_promotion_codes only when no coupon applied (can't combine with discounts[])
    ...(discounts ? { discounts } : { allow_promotion_codes: true }),
    ...(trialDays ? { subscription_data: { trial_period_days: trialDays } } : {}),
    success_url: successUrl,
    cancel_url: fromOnboarding ? `${appUrl}/onboarding?step=2` : `${appUrl}/pricing`,
  })

  // ── Record redemption + increment counter (fire-and-forget, non-blocking) ─
  if (couponRecord) {
    const db = getSupabaseAdmin()
    await Promise.all([
      db.from('coupon_redemptions').insert({
        coupon_id:         couponRecord.id,
        user_id:           user.id,
        stripe_customer_id: user.email ?? null,  // customer_id not yet known pre-checkout
      }),
      db.rpc('increment_coupon_redemptions', { coupon_id: couponRecord.id }),
    ]).catch(err => console.error('[Checkout] Coupon redemption record error:', err))
  }

  return NextResponse.json({ url: session.url })
}
