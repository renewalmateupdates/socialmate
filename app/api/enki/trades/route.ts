export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
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

// GET — fetch trade history for current user
export async function GET(req: NextRequest) {
  const supabase = getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ trades: [] })

  const { searchParams } = new URL(req.url)
  const limit  = Math.min(parseInt(searchParams.get('limit')  ?? '50'), 200)
  const broker = searchParams.get('broker') // 'alpaca' | 'coinbase' | 'paper' | null

  let query = supabase
    .from('enki_trades')
    .select('id, broker, symbol, side, qty, price, reason, confidence, paper, status, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (broker) query = query.eq('broker', broker)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Pair buys and sells to compute per-trade P&L
  const trades = (data ?? []).map((t: any) => ({
    id:         t.id,
    broker:     t.broker,
    symbol:     t.symbol,
    side:       t.side,
    qty:        t.qty,
    price:      t.price,
    total:      Math.round(t.qty * t.price * 100) / 100,
    reason:     t.reason ?? '',
    confidence: t.confidence ?? 0,
    paper:      t.paper,
    status:     t.status,
    created_at: t.created_at,
  }))

  return NextResponse.json({ trades })
}
