import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

const PLAN_CREDITS: Record<string, number> = {
  free:   50,
  pro:    500,
  agency: 2000,
}

const PLAN_BANK: Record<string, number> = {
  free:   75,
  pro:    750,
  agency: 3000,
}

export async function GET(req: NextRequest) {
  // Verify this is called by Vercel cron
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  // Find all users whose credits are due for reset
  const { data: users, error } = await getSupabaseAdmin()
    .from('user_settings')
    .select('user_id, plan, ai_credits_remaining, ai_credits_reset_at')
    .or(`ai_credits_reset_at.is.null,ai_credits_reset_at.lt.${thirtyDaysAgo}`)

  if (error) {
    console.error('Credit reset fetch error:', error)
    return NextResponse.json({ error: 'DB error' }, { status: 500 })
  }

  let resetCount = 0

  for (const user of users || []) {
    const plan        = user.plan || 'free'
    const monthly     = PLAN_CREDITS[plan] ?? 50
    const bankCap     = PLAN_BANK[plan]    ?? 75
    const current     = user.ai_credits_remaining ?? 0

    // Add monthly credits but cap at bank capacity
    const newCredits  = Math.min(current + monthly, bankCap)

    await getSupabaseAdmin()
      .from('user_settings')
      .update({
        ai_credits_remaining: newCredits,
        ai_credits_reset_at:  new Date().toISOString(),
      })
      .eq('user_id', user.user_id)

    resetCount++
  }

  console.log(`Credit reset complete: ${resetCount} users updated`)
  return NextResponse.json({ success: true, resetCount })
}