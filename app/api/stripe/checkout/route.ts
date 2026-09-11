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

  const { priceId, fromOnboarding, coupon_code, returnStep, workspaceId } = await req.json()

  // workspaceId reaches Stripe metadata and the webhook later trusts it
  // outright to flip workspace-level entitlements (SOMA Autopilot/Full Send)
  // — verify the caller actually owns it before that happens, or any
  // authenticated user could pay for their own subscription and have it
  // activate on someone else's workspace.
  let verifiedWorkspaceId: string | undefined
  if (workspaceId) {
    const db = getSupabaseAdmin()
    const { data: ws } = await db.from('workspaces').select('id').eq('id', workspaceId).eq('owner_id', user.id).maybeSingle()
    if (ws) verifiedWorkspaceId = ws.id
  }

  // Detect user's locale from cookie for Stripe checkout page translation
  const STRIPE_SUPPORTED: Record<string, string> = {
    en: 'en', es: 'es', de: 'de', fr: 'fr', pt: 'pt', ru: 'ru', zh: 'zh', ja: 'ja', ko: 'ko',
  }
  const rawLocale = cookieStore.get('sm_locale')?.value ?? 'en'
  const stripeLocale = (STRIPE_SUPPORTED[rawLocale] ?? 'auto') as 'auto' | 'en' | 'es' | 'de' | 'fr' | 'pt' | 'ru' | 'zh' | 'ja' | 'ko'

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://socialmate.studio'

  const successUrl = fromOnboarding
    ? `${appUrl}/onboarding?upgraded=true&step=${returnStep ?? 3}`
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
    ...(verifiedWorkspaceId ? { workspace_id: verifiedWorkspaceId } : {}),
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
    locale: stripeLocale,
    metadata,
    automatic_tax: { enabled: true },
    // allow_promotion_codes only when no coupon applied (can't combine with discounts[])
    ...(discounts ? { discounts } : { allow_promotion_codes: true }),
    // Checkout Session metadata does not carry over to the Subscription object
    // Stripe creates from it — copying it into subscription_data.metadata too
    // means customer.subscription.updated/deleted (which only ever see the
    // Subscription, never the originating session) can still resolve user_id/
    // workspace_id instead of relying solely on price-id matching.
    subscription_data: {
      metadata,
      ...(trialDays ? { trial_period_days: trialDays } : {}),
    },
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
