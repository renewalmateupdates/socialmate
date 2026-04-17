import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [statsRes, openRes, closedRes, spyRes] = await Promise.all([
    supabase
      .from('enki_truth_strategy_stats')
      .select('*')
      .eq('user_id', user.id),

    supabase
      .from('enki_truth_trades')
      .select('id,symbol,strategy,confidence,congressional_boost,entry_price,stop_price,tp1_price,tp2_price,tp1_hit,tp2_hit,qty,remaining_qty,position_usd,atr_at_entry,highest_price_seen,entry_time')
      .eq('user_id', user.id)
      .eq('is_open', true)
      .order('entry_time', { ascending: false }),

    supabase
      .from('enki_truth_trades')
      .select('id,symbol,strategy,confidence,congressional_boost,entry_price,exit_price,exit_time,exit_reason,pnl_pct,pnl_dollar,win,entry_time,tp1_hit,tp2_hit,stop_loss_hit,trailing_stop_hit')
      .eq('user_id', user.id)
      .eq('is_open', false)
      .order('exit_time', { ascending: true }),

    // SPY baseline: fetch 3-month return from Yahoo Finance
    fetch(
      'https://query1.finance.yahoo.com/v8/finance/chart/SPY?range=3mo&interval=1d',
      { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(5000) }
    ).then(r => r.ok ? r.json() : null).catch(() => null),
  ])

  const stats    = statsRes.data ?? []
  const open     = openRes.data ?? []
  const closed   = closedRes.data ?? []

  // Equity curve: cumulative P&L sorted by exit_time
  let cumulative = 0
  const equityCurve = closed.map(t => {
    cumulative += (t.pnl_pct ?? 0)
    return { date: t.exit_time, pnl_pct: t.pnl_pct ?? 0, cumulative }
  })

  // SPY 3-month return
  let spyReturn3mo: number | null = null
  try {
    const closes = spyRes?.chart?.result?.[0]?.indicators?.quote?.[0]?.close as number[] | undefined
    if (closes && closes.length >= 2) {
      const first = closes.find((c: number) => c != null)
      const last  = [...closes].reverse().find((c: number) => c != null)
      if (first && last) spyReturn3mo = ((last - first) / first) * 100
    }
  } catch { /* ignore */ }

  // Experiment progress: total closed trades per strategy (need 50 for conclusions)
  const progress = {
    momentum:       (closed.filter(t => t.strategy === 'momentum').length),
    mean_reversion: (closed.filter(t => t.strategy === 'mean_reversion').length),
    target: 50,
  }

  return NextResponse.json({
    stats,
    open,
    closed,
    equityCurve,
    spyReturn3mo,
    progress,
  })
}
