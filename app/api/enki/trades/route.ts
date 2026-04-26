export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

async function getSupabase() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (s) => s.forEach(({ name, value, options }) => cookieStore.set(name, value, options)),
      },
    }
  )
}

// GET — fetch paginated trade history for current user
// ?status=open|closed|all  (default: all)
// ?page=1                  (1-indexed, 25 per page)
// ?broker=alpaca|coinbase|paper
export async function GET(req: NextRequest) {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status') ?? 'all'   // open | closed | all
  const page   = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
  const broker = searchParams.get('broker')
  const PAGE_SIZE = 25

  // Build base query — select all columns needed by the UI
  let query = supabase
    .from('enki_trades')
    .select('id, broker, symbol, side, qty, price, reason, confidence, paper, status, created_at, executed_at', { count: 'exact' })
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Status filter
  // "open"   = pending or pending_approval
  // "closed" = filled, executed, cancelled, failed
  if (status === 'open') {
    query = query.in('status', ['pending', 'pending_approval'])
  } else if (status === 'closed') {
    query = query.in('status', ['filled', 'executed', 'cancelled', 'failed'])
  }

  if (broker) query = query.eq('broker', broker)

  // Pagination
  const from = (page - 1) * PAGE_SIZE
  const to   = from + PAGE_SIZE - 1
  query = query.range(from, to)

  const { data, error, count } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const trades = (data ?? []).map((t: any) => ({
    id:          t.id,
    broker:      t.broker,
    symbol:      t.symbol,
    side:        t.side,
    qty:         t.qty,
    price:       t.price,
    total:       Math.round(t.qty * t.price * 100) / 100,
    reason:      t.reason ?? '',
    confidence:  t.confidence ?? 0,
    paper:       t.paper,
    status:      t.status,
    created_at:  t.created_at,
    executed_at: t.executed_at ?? null,
  }))

  return NextResponse.json({ trades, total: count ?? 0, page, page_size: PAGE_SIZE })
}
