export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Only run on January 1st (Vercel cron schedule already enforces this,
  // but double-check in case of manual trigger)
  const now = new Date()
  if (now.getMonth() !== 0 || now.getDate() !== 1) {
    return NextResponse.json({ skipped: true, reason: 'Not January 1st' })
  }

  const { error, count } = await getAdmin()
    .from('affiliate_profiles')
    .update({ yearly_earnings_cents: 0 })
    .gte('yearly_earnings_cents', 0) // matches all rows

  if (error) {
    console.error('Yearly earnings reset error:', error)
    return NextResponse.json({ error: 'DB error' }, { status: 500 })
  }

  console.log(`Yearly affiliate earnings reset complete: ${count} profiles updated`)
  return NextResponse.json({ success: true, count })
}
