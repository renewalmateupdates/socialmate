export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { requireAdmin } from '@/lib/admin-auth'
import Stripe from 'stripe'

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-02-25.clover' })
}

// ── GET — list all coupons with redemption count + affiliate name ─────────

export async function GET(_req: NextRequest) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const db = getSupabaseAdmin()

  const { data: coupons, error } = await db
    .from('coupons')
    .select(`
      *,
      affiliates ( id, full_name, email )
    `)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ coupons: coupons ?? [] })
}

// ── POST — create a new affiliate coupon ─────────────────────────────────

export async function POST(req: NextRequest) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const {
    code,
    affiliate_id,
    discount_type,
    discount_value,
    max_redemptions,
    expires_at,
    note,
  } = body

  if (!code || !discount_type || discount_value == null) {
    return NextResponse.json({ error: 'code, discount_type, discount_value required' }, { status: 400 })
  }

  const upperCode = (code as string).toUpperCase().replace(/[^A-Z0-9_-]/g, '')
  if (!upperCode) return NextResponse.json({ error: 'Invalid code format' }, { status: 400 })
  if (!['percent', 'fixed', 'trial_extension'].includes(discount_type)) {
    return NextResponse.json({ error: 'Invalid discount_type' }, { status: 400 })
  }

  const db     = getSupabaseAdmin()
  const stripe = getStripe()

  let stripePromoId: string | null = null
  let stripeCouponId: string | null = null

  // Create Stripe objects for percent/fixed (trial_extension is applied at session creation)
  if (discount_type === 'percent' || discount_type === 'fixed') {
    try {
      const couponParams: Stripe.CouponCreateParams = {
        name: `Partner: ${upperCode}`,
        metadata: { code: upperCode, affiliate_id: affiliate_id ?? '', type: 'partner' },
        ...(max_redemptions ? { max_redemptions: Number(max_redemptions) } : {}),
        ...(expires_at ? { redeem_by: Math.floor(new Date(expires_at).getTime() / 1000) } : {}),
      }

      if (discount_type === 'percent') {
        couponParams.percent_off = Number(discount_value)
        couponParams.duration = 'once'
      } else {
        couponParams.amount_off = Math.round(Number(discount_value) * 100) // cents
        couponParams.currency = 'usd'
        couponParams.duration = 'once'
      }

      const coupon = await stripe.coupons.create(couponParams)
      stripeCouponId = coupon.id

      const promoParams: Stripe.PromotionCodeCreateParams = {
        promotion: { type: 'coupon', coupon: coupon.id },
        code: upperCode,
        ...(max_redemptions ? { max_redemptions: Number(max_redemptions) } : {}),
        metadata: { affiliate_id: affiliate_id ?? '', type: 'partner' },
      }
      const promo = await stripe.promotionCodes.create(promoParams)
      stripePromoId = promo.id
    } catch (err: any) {
      if (err?.code === 'resource_already_exists') {
        return NextResponse.json({ error: `Code "${upperCode}" already exists in Stripe` }, { status: 409 })
      }
      return NextResponse.json({ error: err?.message || 'Stripe error' }, { status: 500 })
    }
  }

  const { data: inserted, error: dbErr } = await db
    .from('coupons')
    .insert({
      code:                upperCode,
      affiliate_id:        affiliate_id || null,
      discount_type,
      discount_value:      Number(discount_value),
      max_redemptions:     max_redemptions ? Number(max_redemptions) : null,
      expires_at:          expires_at || null,
      stripe_coupon_id:    stripeCouponId,
      stripe_promo_id:     stripePromoId,
      note:                note || null,
    })
    .select()
    .single()

  if (dbErr) {
    if (dbErr.code === '23505') {
      return NextResponse.json({ error: `Code "${upperCode}" already exists` }, { status: 409 })
    }
    return NextResponse.json({ error: dbErr.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, coupon: inserted })
}

// ── PATCH — deactivate a coupon ───────────────────────────────────────────

export async function PATCH(req: NextRequest) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id, active } = await req.json()
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const db = getSupabaseAdmin()

  // Deactivate in Stripe too (for percent/fixed types)
  const { data: coupon } = await db.from('coupons').select('stripe_promo_id').eq('id', id).single()
  if (coupon?.stripe_promo_id && active === false) {
    try {
      await getStripe().promotionCodes.update(coupon.stripe_promo_id, { active: false })
    } catch { /* non-fatal */ }
  }

  await db.from('coupons').update({ active: active ?? false }).eq('id', id)
  return NextResponse.json({ success: true })
}
