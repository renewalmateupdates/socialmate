export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import Stripe from 'stripe'

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-02-25.clover' })
}

async function validateRenewalToken(token: string) {
  const admin = getSupabaseAdmin()
  const { data: slot } = await admin
    .from('studio_stax_slots')
    .select('id, listing_id, buyer_name, buyer_email, amount_paid_cents, expires_at, renewal_token, renewal_token_expires, status')
    .eq('renewal_token', token)
    .single()

  if (!slot) return { valid: false, expired: false, slot: null, listing: null }
  if (slot.status !== 'active') return { valid: false, expired: true, slot, listing: null }
  if (slot.renewal_token_expires && new Date(slot.renewal_token_expires) < new Date()) {
    return { valid: false, expired: true, slot, listing: null }
  }

  const { data: listing } = await admin
    .from('curated_listings')
    .select('id, name, tagline')
    .eq('id', slot.listing_id)
    .single()

  return { valid: true, expired: false, slot, listing }
}

// GET — validate token, return renewal pricing
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token') || ''
  if (!token) return NextResponse.json({ valid: false })

  const { valid, expired, slot, listing } = await validateRenewalToken(token)
  if (!valid) return NextResponse.json({ valid: false, expired })

  // Renewal = 20% off original paid price
  const originalCents  = slot!.amount_paid_cents ?? 10000
  const renewalCents   = Math.round(originalCents * 0.80)
  const daysUntilExpiry = Math.ceil((new Date(slot!.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))

  return NextResponse.json({
    valid:         true,
    listing:       { id: listing!.id, name: listing!.name, tagline: listing!.tagline },
    buyerName:     slot!.buyer_name,
    originalPrice: originalCents,
    renewalPrice:  renewalCents,
    expiresAt:     slot!.expires_at,
    daysRemaining: daysUntilExpiry,
  })
}

// POST — create Stripe checkout for renewal
export async function POST(req: NextRequest) {
  const { token } = await req.json()
  if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 400 })

  const { valid, expired, slot, listing } = await validateRenewalToken(token)
  if (!valid) {
    return NextResponse.json({ error: expired ? 'Renewal link expired' : 'Invalid renewal link' }, { status: 400 })
  }

  const originalCents = slot!.amount_paid_cents ?? 10000
  const renewalCents  = Math.round(originalCents * 0.80)
  const tierLabel     = originalCents <= 10000 ? 'founder' : 'standard'

  const now      = new Date()
  const newEnd   = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000)
  const appUrl   = process.env.NEXT_PUBLIC_APP_URL || 'https://socialmate.studio'

  try {
    const session = await getStripe().checkout.sessions.create({
      mode:           'payment',
      line_items:     [{
        price_data: {
          currency:     'usd',
          unit_amount:  renewalCents,
          product_data: {
            name:        `Studio Stax Renewal — ${listing!.name}`,
            description: `Annual renewal · ${tierLabel} rate · 20% loyalty discount`,
          },
        },
        quantity: 1,
      }],
      customer_email: slot!.buyer_email,
      success_url:    `${appUrl}/studio-stax/checkout/success?billing=renewal`,
      cancel_url:     `${appUrl}/studio-stax/renew?token=${token}`,
      metadata: {
        studio_stax:      'true',
        studio_stax_renew: 'true',
        slot_id:           slot!.id,
        listing_id:        listing!.id,
        billing_type:      'annual',
        tier:              tierLabel,
        original_amount:   String(originalCents),
        amount_cents:      String(renewalCents),
        slot_quarter:      String(now.getUTCFullYear()),
        slot_start:        now.toISOString(),
        slot_end:          newEnd.toISOString(),
        token,
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    console.error('[StaxRenew] Stripe error:', err)
    return NextResponse.json({ error: err.message || 'Payment setup failed' }, { status: 500 })
  }
}
