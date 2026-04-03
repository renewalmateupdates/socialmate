export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import Stripe from 'stripe'
import { ANNUAL_FOUNDER_CENTS, ANNUAL_STANDARD_CENTS, FOUNDING_SLOT_LIMIT } from '@/app/api/studio-stax/pricing/route'

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-02-25.clover' })
}

async function validateToken(token: string) {
  const admin = getSupabaseAdmin()
  const { data: listing } = await admin
    .from('curated_listings')
    .select('id, name, tagline, applicant_name, applicant_email, checkout_token, checkout_token_expires, status')
    .eq('checkout_token', token)
    .single()

  if (!listing) return { valid: false, expired: false, listing: null }
  if (new Date(listing.checkout_token_expires) < new Date()) return { valid: false, expired: true, listing }
  return { valid: true, expired: false, listing }
}

// GET — validate token and return pricing info
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token') || ''
  if (!token) return NextResponse.json({ valid: false })

  const { valid, expired, listing } = await validateToken(token)
  if (!valid) return NextResponse.json({ valid: false, expired })

  const admin = getSupabaseAdmin()

  // Count all currently active (paid, non-expired) slots — source of truth for pricing tier
  const { count } = await admin
    .from('studio_stax_slots')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')
    .gt('expires_at', new Date().toISOString())

  const slotsFilled    = count ?? 0
  const foundingFull   = slotsFilled >= FOUNDING_SLOT_LIMIT
  const slotsRemaining = Math.max(0, FOUNDING_SLOT_LIMIT - slotsFilled)

  return NextResponse.json({
    valid:          true,
    listing:        { id: listing!.id, name: listing!.name, tagline: listing!.tagline, applicant_name: listing!.applicant_name },
    slotsFilled,
    slotsRemaining,
    foundingFull,
    currentTier:    foundingFull ? 'standard' : 'founding',
    annualPrice:    foundingFull ? ANNUAL_STANDARD_CENTS : ANNUAL_FOUNDER_CENTS,
    founderPrice:   ANNUAL_FOUNDER_CENTS,
    standardPrice:  ANNUAL_STANDARD_CENTS,
    slotsTotal:     FOUNDING_SLOT_LIMIT,
  })
}

// POST — create Stripe checkout session (annual only)
export async function POST(req: NextRequest) {
  const { token } = await req.json()
  if (!token) {
    return NextResponse.json({ error: 'Missing token' }, { status: 400 })
  }

  const { valid, expired, listing } = await validateToken(token)
  if (!valid) {
    return NextResponse.json({ error: expired ? 'Checkout link expired' : 'Invalid checkout link' }, { status: 400 })
  }

  const admin = getSupabaseAdmin()
  const now   = new Date()

  // Count all currently active annual slots to determine founding price
  const { count } = await admin
    .from('studio_stax_slots')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')
    .gt('expires_at', now.toISOString())

  const slotsFilled  = count ?? 0
  const foundingFull = slotsFilled >= FOUNDING_SLOT_LIMIT
  const tier         = foundingFull ? 'standard' : 'founding'
  const unitAmount   = foundingFull ? ANNUAL_STANDARD_CENTS : ANNUAL_FOUNDER_CENTS
  const tierLabel    = foundingFull
    ? `standard rate ($${ANNUAL_STANDARD_CENTS / 100}/yr)`
    : `founder rate ($${ANNUAL_FOUNDER_CENTS / 100}/yr — ${FOUNDING_SLOT_LIMIT - slotsFilled} spot${FOUNDING_SLOT_LIMIT - slotsFilled !== 1 ? 's' : ''} left)`

  const slotEnd  = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000)
  const appUrl   = process.env.NEXT_PUBLIC_APP_URL || 'https://socialmate.studio'

  try {
    const session = await getStripe().checkout.sessions.create({
      mode:           'payment',
      line_items:     [{
        price_data: {
          currency:     'usd',
          unit_amount:  unitAmount,
          product_data: {
            name:        `Studio Stax — ${listing!.name}`,
            description: `Annual directory listing · ${tierLabel}`,
          },
        },
        quantity: 1,
      }],
      customer_email: listing!.applicant_email,
      success_url:    `${appUrl}/studio-stax/checkout/success?billing=annual`,
      cancel_url:     `${appUrl}/studio-stax/checkout?token=${token}`,
      metadata: {
        studio_stax:    'true',
        listing_id:     listing!.id,
        billing_type:   'annual',
        tier,
        amount_cents:   String(unitAmount),
        // slot_quarter stores cycle year for DB compat (schema requires non-null)
        slot_quarter:   String(now.getUTCFullYear()),
        slot_start:     now.toISOString(),
        slot_end:       slotEnd.toISOString(),
        token,
      },
    })

    await admin
      .from('curated_listings')
      .update({ chosen_billing_type: 'annual' })
      .eq('id', listing!.id)

    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    console.error('[StaxCheckout] Stripe error:', err)
    return NextResponse.json({ error: err.message || 'Payment setup failed' }, { status: 500 })
  }
}
