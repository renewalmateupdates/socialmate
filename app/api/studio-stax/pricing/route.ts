export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

// Pricing constants (in cents)
// First 1000 annual slots are founding price ($100/yr).
// After 1000 slots are filled it goes to standard price ($150/yr).
// Renewal discounts: founding tier renews at $80 (20% off), standard at $120 (20% off).
// If a founding member doesn't renew, their slot reopens as founding.
export const ANNUAL_FOUNDING_CENTS   = 10000  // $100/year — first 1000 slots
export const ANNUAL_STANDARD_CENTS   = 15000  // $150/year — after 1000 founding slots filled
export const RENEWAL_FOUNDING_CENTS  = 8000   // $80/year  — 20% off for founding tier renewals
export const RENEWAL_STANDARD_CENTS  = 12000  // $120/year — 20% off for standard tier renewals
export const FOUNDING_SLOT_LIMIT     = 1000

export async function GET() {
  const admin = getSupabaseAdmin()

  // Count all-time ACTIVE founding slots (expired/lapsed ones reopen)
  const { count: activeFoundingCount } = await admin
    .from('studio_stax_slots')
    .select('*', { count: 'exact', head: true })
    .eq('tier', 'founding')
    .eq('status', 'active')

  const slotsFilled    = activeFoundingCount ?? 0
  const foundingFull   = slotsFilled >= FOUNDING_SLOT_LIMIT
  const slotsRemaining = Math.max(0, FOUNDING_SLOT_LIMIT - slotsFilled)

  return NextResponse.json({
    annual: {
      price:           foundingFull ? ANNUAL_STANDARD_CENTS : ANNUAL_FOUNDING_CENTS,
      foundingPrice:   ANNUAL_FOUNDING_CENTS,
      standardPrice:   ANNUAL_STANDARD_CENTS,
      renewalFounding: RENEWAL_FOUNDING_CENTS,
      renewalStandard: RENEWAL_STANDARD_CENTS,
      foundingFull,
      slotsFilled,
      slotsRemaining,
      slotsTotal:      FOUNDING_SLOT_LIMIT,
    },
    currentTier: foundingFull ? 'standard' : 'founding',
  })
}
