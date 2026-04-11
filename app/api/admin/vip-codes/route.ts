export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { requireAdmin } from '@/lib/admin-auth'
import Stripe from 'stripe'

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-02-25.clover' })
}

// ── GET — list all admin VIP codes ────────────────────────────────────────

export async function GET(_req: NextRequest) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { data, error } = await getSupabaseAdmin()
    .from('admin_promo_codes')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ codes: data ?? [] })
}

// ── POST — create a new VIP promo code ────────────────────────────────────

export async function POST(req: NextRequest) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const {
    code,            // e.g. PROLIFE, AGENCYFOUNDER
    label,           // human description e.g. "Pro for Life — VIP"
    discount_pct,    // 1-100
    duration,        // 'forever' | 'once' | 'repeating'
    duration_months, // only if duration = 'repeating'
    max_redemptions, // null = unlimited
    note,            // internal note
  } = body

  if (!code || !label || !discount_pct) {
    return NextResponse.json({ error: 'code, label, discount_pct required' }, { status: 400 })
  }

  const upperCode = (code as string).toUpperCase().replace(/[^A-Z0-9_-]/g, '')
  if (!upperCode) return NextResponse.json({ error: 'Invalid code format' }, { status: 400 })

  const stripe = getStripe()
  const db = getSupabaseAdmin()

  // Create Stripe coupon
  let couponId: string | null = null
  let stripePromoId: string | null = null

  try {
    const coupon = await stripe.coupons.create({
      percent_off: Number(discount_pct),
      duration: duration || 'forever',
      ...(duration === 'repeating' && duration_months
        ? { duration_in_months: Number(duration_months) }
        : {}),
      name: label,
      ...(max_redemptions ? { max_redemptions: Number(max_redemptions) } : {}),
      metadata: { created_by: admin.email || 'admin', type: 'vip' },
    })
    couponId = coupon.id

    const promoCode = await stripe.promotionCodes.create({
      promotion: { type: 'coupon', coupon: coupon.id },
      code: upperCode,
      ...(max_redemptions ? { max_redemptions: Number(max_redemptions) } : {}),
      metadata: { created_by: admin.email || 'admin', type: 'vip' },
    })
    stripePromoId = promoCode.id
  } catch (err: any) {
    if (err?.code === 'resource_already_exists') {
      return NextResponse.json({ error: `Code "${upperCode}" already exists in Stripe` }, { status: 409 })
    }
    console.error('[VIPCode] Stripe error:', err?.message)
    return NextResponse.json({ error: err?.message || 'Stripe error' }, { status: 500 })
  }

  // Store in DB
  const { data: inserted, error: dbErr } = await db
    .from('admin_promo_codes')
    .insert({
      code:             upperCode,
      label,
      discount_pct:     Number(discount_pct),
      duration:         duration || 'forever',
      duration_months:  duration === 'repeating' ? Number(duration_months) : null,
      max_redemptions:  max_redemptions ? Number(max_redemptions) : null,
      stripe_coupon_id: couponId,
      stripe_promo_id:  stripePromoId,
      note:             note || null,
      created_by:       admin.email || 'admin',
    })
    .select()
    .single()

  if (dbErr) {
    console.error('[VIPCode] DB error:', dbErr.message)
    return NextResponse.json({ error: dbErr.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, code: inserted })
}

// ── DELETE — deactivate a VIP code in Stripe ──────────────────────────────

export async function DELETE(req: NextRequest) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const db = getSupabaseAdmin()
  const { data: code } = await db
    .from('admin_promo_codes')
    .select('stripe_promo_id, active')
    .eq('id', id)
    .single()

  if (!code) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Deactivate in Stripe
  if (code.stripe_promo_id) {
    try {
      await getStripe().promotionCodes.update(code.stripe_promo_id, { active: false })
    } catch (err: any) {
      console.warn('[VIPCode] Stripe deactivate failed:', err?.message)
    }
  }

  await db.from('admin_promo_codes').update({ active: false }).eq('id', id)

  return NextResponse.json({ success: true })
}
