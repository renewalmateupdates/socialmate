export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

// Canonical Studio Stax pricing (yearly only).
// First 100 ACTIVE spots = $100/year (founder price).
// Beyond 100 active = $150/year (standard price).
// Founder spots reopen naturally as listings expire — no quarter tracking needed.
// Renewal = 20% off original paid amount (applied per-member in renewal flow).
export const ANNUAL_FOUNDER_CENTS   = 10000  // $100/year — first 100 active spots
export const ANNUAL_STANDARD_CENTS  = 15000  // $150/year — after 100 active spots filled
export const RENEWAL_FOUNDER_CENTS  = 8000   // $80/year  — 20% off founder tier
export const RENEWAL_STANDARD_CENTS = 12000  // $120/year — 20% off standard tier
export const FOUNDING_SLOT_LIMIT    = 100

export async function GET() {
  const admin = getSupabaseAdmin()

  // Count all currently ACTIVE (paid, non-expired) slots.
  // We do NOT filter by tier column — it's not reliably populated.
  // Active count is the source of truth for founder pricing.
  const { count: activeCount } = await admin
    .from('studio_stax_slots')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')
    .gt('expires_at', new Date().toISOString())

  const slotsFilled    = activeCount ?? 0
  const foundingFull   = slotsFilled >= FOUNDING_SLOT_LIMIT
  const slotsRemaining = Math.max(0, FOUNDING_SLOT_LIMIT - slotsFilled)

  return NextResponse.json({
    annual: {
      price:           foundingFull ? ANNUAL_STANDARD_CENTS : ANNUAL_FOUNDER_CENTS,
      founderPrice:    ANNUAL_FOUNDER_CENTS,
      standardPrice:   ANNUAL_STANDARD_CENTS,
      renewalFounding: RENEWAL_FOUNDER_CENTS,
      renewalStandard: RENEWAL_STANDARD_CENTS,
      foundingFull,
      slotsFilled,
      slotsRemaining,
      slotsTotal:      FOUNDING_SLOT_LIMIT,
    },
    currentTier: foundingFull ? 'standard' : 'founding',
  })
}
