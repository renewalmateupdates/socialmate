export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

function getSupabase() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: async () => (await cookies()).getAll(),
        setAll: async (cookiesToSet) => {
          const store = await cookies()
          cookiesToSet.forEach(({ name, value, options }) => store.set(name, value, options))
        },
      },
    }
  )
}

// GET — public leaderboard (top 50 by P&L %)
// Never returns dollar amounts, balances, or positions — % only
export async function GET() {
  const supabase = getSupabase()

  const { data, error } = await supabase
    .from('enki_leaderboard')
    .select('display_name, avatar_url, tier, trading_mode, total_pnl_pct, conquest_streak, best_streak, total_trades, win_rate, doctrine_rank, badges')
    .eq('is_visible', true)
    .order('total_pnl_pct', { ascending: false })
    .limit(50)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ entries: data ?? [] })
}
