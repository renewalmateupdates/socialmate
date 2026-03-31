export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

// Price constants (in cents)
// First 100 buyers each quarter get the founding price ($99).
// Once 100 slots are filled, additional buyers pay the standard rate ($149).
const ANNUAL_FOUNDING_CENTS  = 9900  // $99/year — first 100 this quarter
const ANNUAL_STANDARD_CENTS  = 14900 // $149/year — after 100 slots are filled
const QUARTERLY_CENTS        = 4900  // $49/quarter
const FOUNDING_SLOT_LIMIT    = 100

// Returns which quarter string we're in: e.g. '2026-Q2'
// and the next quarter string
function getQuarterInfo(date: Date) {
  const year    = date.getUTCFullYear()
  const month   = date.getUTCMonth() + 1 // 1-12
  const quarter = Math.ceil(month / 3)
  const current = `${year}-Q${quarter}`

  // Next quarter
  let nextYear = year, nextQ = quarter + 1
  if (nextQ > 4) { nextQ = 1; nextYear++ }
  const next = `${nextYear}-Q${nextQ}`

  // Are we past halfway through the current quarter?
  // Quarters: Q1=Jan-Mar, Q2=Apr-Jun, Q3=Jul-Sep, Q4=Oct-Dec
  const quarterStartMonth = (quarter - 1) * 3 + 1 // 1, 4, 7, 10
  const dayInQuarter = (month - quarterStartMonth) * 30 + date.getUTCDate()
  const isMidQuarter = dayInQuarter > 15

  return { current, next, isMidQuarter }
}

// Start of a quarter date
function quarterStartDate(quarterStr: string): Date {
  const [year, qPart] = quarterStr.split('-Q')
  const q   = parseInt(qPart)
  const month = (q - 1) * 3 // 0-indexed month
  return new Date(Date.UTC(parseInt(year), month, 1))
}

// End of a quarter date (last ms of last day)
function quarterEndDate(quarterStr: string): Date {
  const [year, qPart] = quarterStr.split('-Q')
  const q = parseInt(qPart)
  let nextYear = parseInt(year), nextQ = q + 1
  if (nextQ > 4) { nextQ = 1; nextYear++ }
  const nextStart = new Date(Date.UTC(nextYear, (nextQ - 1) * 3, 1))
  return new Date(nextStart.getTime() - 1)
}

export async function GET(req: NextRequest) {
  const admin = getSupabaseAdmin()
  const now   = new Date()
  const { current, next, isMidQuarter } = getQuarterInfo(now)

  // Count active slots already purchased this quarter
  const { count: currentCount } = await admin
    .from('studio_stax_slots')
    .select('*', { count: 'exact', head: true })
    .eq('slot_quarter', current)
    .eq('status', 'active')

  const slotsFilled    = currentCount ?? 0
  // Founding slots are gone once 100 are taken — price goes UP after that
  const foundingFull   = slotsFilled >= FOUNDING_SLOT_LIMIT
  const slotsRemaining = Math.max(0, FOUNDING_SLOT_LIMIT - slotsFilled)

  // For quarterly purchases: if mid-quarter, book into next quarter
  const quarterlyTarget = isMidQuarter ? next : current
  const quarterlyStart  = quarterStartDate(quarterlyTarget)
  const quarterlyEnd    = quarterEndDate(quarterlyTarget)

  return NextResponse.json({
    annual: {
      // Price is $99 while founding slots remain; $149 after they're gone
      price:          foundingFull ? ANNUAL_STANDARD_CENTS : ANNUAL_FOUNDING_CENTS,
      foundingPrice:  ANNUAL_FOUNDING_CENTS,
      standardPrice:  ANNUAL_STANDARD_CENTS,
      foundingFull,
      slotsFilled,
      slotsRemaining,
      slotsTotal: FOUNDING_SLOT_LIMIT,
    },
    quarterly: {
      price:         QUARTERLY_CENTS,
      targetQuarter: quarterlyTarget,
      isMidQuarter,
      startsAt:      quarterlyStart.toISOString(),
      endsAt:        quarterlyEnd.toISOString(),
    },
    currentQuarter: current,
  })
}
