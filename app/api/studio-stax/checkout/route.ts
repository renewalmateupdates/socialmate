export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import Stripe from 'stripe'

const ANNUAL_FOUNDING_CENTS  = 9900
const ANNUAL_STANDARD_CENTS  = 14900
const QUARTERLY_CENTS        = 4900
const FOUNDING_LIMIT         = 100

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-02-25.clover' })
}

function getQuarterInfo(date: Date) {
  const year    = date.getUTCFullYear()
  const month   = date.getUTCMonth() + 1
  const quarter = Math.ceil(month / 3)
  const current = `${year}-Q${quarter}`
  let nextYear = year, nextQ = quarter + 1
  if (nextQ > 4) { nextQ = 1; nextYear++ }
  const next = `${nextYear}-Q${nextQ}`
  const quarterStartMonth = (quarter - 1) * 3 + 1
  const dayInQuarter = (month - quarterStartMonth) * 30 + date.getUTCDate()
  const isMidQuarter = dayInQuarter > 15
  return { current, next, isMidQuarter }
}

function quarterStartDate(quarterStr: string): Date {
  const [year, qPart] = quarterStr.split('-Q')
  return new Date(Date.UTC(parseInt(year), (parseInt(qPart) - 1) * 3, 1))
}
function quarterEndDate(quarterStr: string): Date {
  const [year, qPart] = quarterStr.split('-Q')
  const q = parseInt(qPart)
  let ny = parseInt(year), nq = q + 1
  if (nq > 4) { nq = 1; ny++ }
  return new Date(new Date(Date.UTC(ny, (nq - 1) * 3, 1)).getTime() - 1)
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
  const now   = new Date()
  const { current, next, isMidQuarter } = getQuarterInfo(now)

  const { count } = await admin
    .from('studio_stax_slots')
    .select('*', { count: 'exact', head: true })
    .eq('slot_quarter', current)
    .eq('status', 'active')

  const slotsFilled    = count ?? 0
  const slotsRemaining = Math.max(0, FOUNDING_LIMIT - slotsFilled)

  return NextResponse.json({
    valid:          true,
    listing:        { id: listing!.id, name: listing!.name, tagline: listing!.tagline, applicant_name: listing!.applicant_name },
    slotsFilled,
    slotsRemaining,
    currentQuarter: current,
    nextQuarter:    next,
    isMidQuarter,
  })
}

// POST — create Stripe checkout session
export async function POST(req: NextRequest) {
  const { token, billingType } = await req.json()
  if (!token || !billingType) {
    return NextResponse.json({ error: 'Missing token or billingType' }, { status: 400 })
  }

  const { valid, expired, listing } = await validateToken(token)
  if (!valid) {
    return NextResponse.json({ error: expired ? 'Checkout link expired' : 'Invalid checkout link' }, { status: 400 })
  }

  const admin = getSupabaseAdmin()
  const now   = new Date()
  const { current, next, isMidQuarter } = getQuarterInfo(now)

  // Determine price
  const { count } = await admin
    .from('studio_stax_slots')
    .select('*', { count: 'exact', head: true })
    .eq('slot_quarter', current)
    .eq('status', 'active')

  const slotsFilled = count ?? 0
  const foundingFull = slotsFilled >= FOUNDING_LIMIT

  let unitAmount: number
  let description: string
  const quarterlyTarget = isMidQuarter ? next : current
  const slotStart = billingType === 'quarterly' ? quarterStartDate(quarterlyTarget) : now
  const slotEnd   = billingType === 'quarterly'
    ? quarterEndDate(quarterlyTarget)
    : new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000)

  if (billingType === 'annual') {
    unitAmount  = foundingFull ? ANNUAL_STANDARD_CENTS : ANNUAL_FOUNDING_CENTS
    description = foundingFull
      ? `Studio Stax Annual Listing — ${listing!.name} (standard rate)`
      : `Studio Stax Annual Listing — ${listing!.name} (founding rate, ${FOUNDING_LIMIT - slotsFilled} spots left)`
  } else {
    unitAmount  = QUARTERLY_CENTS
    description = `Studio Stax Quarterly Listing — ${listing!.name} (${quarterlyTarget}${isMidQuarter ? ', starts next quarter' : ''})`
  }

  const appUrl     = process.env.NEXT_PUBLIC_APP_URL || 'https://socialmate.studio'
  const successUrl = `${appUrl}/studio-stax/checkout/success?token=${token}&billing=${billingType}`
  const cancelUrl  = `${appUrl}/studio-stax/checkout?token=${token}`

  try {
    const session = await getStripe().checkout.sessions.create({
      mode:         'payment',
      line_items:   [{ price_data: { currency: 'usd', unit_amount: unitAmount, product_data: { name: `Studio Stax — ${listing!.name}`, description } }, quantity: 1 }],
      customer_email: listing!.applicant_email,
      success_url:  successUrl,
      cancel_url:   cancelUrl,
      metadata: {
        studio_stax:    'true',
        listing_id:     listing!.id,
        billing_type:   billingType,
        slot_quarter:   billingType === 'quarterly' ? quarterlyTarget : current,
        slot_start:     slotStart.toISOString(),
        slot_end:       slotEnd.toISOString(),
        token,
      },
    })

    // Store billing type choice on listing
    await admin.from('curated_listings').update({ chosen_billing_type: billingType }).eq('id', listing!.id)

    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    console.error('[StaxCheckout] Stripe error:', err)
    return NextResponse.json({ error: err.message || 'Payment setup failed' }, { status: 500 })
  }
}
