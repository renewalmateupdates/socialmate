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
      .select('id,symbol,strategy,confidence,congressional_boost,entry_price,exit_price,entry_time,exit_time,exit_reason,pnl_pct,pnl_dollar,win,tp1_hit,tp2_hit,stop_loss_hit,trailing_stop_hit')
      .eq('user_id', user.id)
      .eq('is_open', false)
      .order('exit_time', { ascending: true }),

    fetch(
      'https://query1.finance.yahoo.com/v8/finance/chart/SPY?range=3mo&interval=1d',
      { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(5000) }
    ).then(r => r.ok ? r.json() : null).catch(() => null),
  ])

  const stats  = statsRes.data ?? []
  const open   = openRes.data ?? []
  const closed = closedRes.data ?? []

  // Equity curve: cumulative P&L sorted by exit_time
  let cumulative = 0
  const equityCurve = closed.map(t => {
    cumulative += (t.pnl_pct ?? 0)
    return { date: t.exit_time, pnl_pct: t.pnl_pct ?? 0, cumulative }
  })

  // SPY baseline processing
  let spyReturn3mo: number | null = null
  let spyCurve: Array<{ cumulative: number }> = []

  try {
    const spyCloses: number[] = spyRes?.chart?.result?.[0]?.indicators?.quote?.[0]?.close ?? []
    const spyDates: number[]  = spyRes?.chart?.result?.[0]?.timestamp ?? []
    const validPairs = spyDates
      .map((ts: number, i: number) => ({ date: new Date(ts * 1000).toISOString().slice(0, 10), close: spyCloses[i] }))
      .filter(p => p.close != null)

    if (validPairs.length >= 2) {
      const first = validPairs[0].close
      const last  = validPairs[validPairs.length - 1].close
      spyReturn3mo = ((last - first) / first) * 100

      // If there are closed trades, build a SPY curve sampled at the same number of points
      // as the equity curve for visual overlay alignment.
      if (equityCurve.length >= 2) {
        const n = equityCurve.length
        spyCurve = equityCurve.map((_, i) => {
          // Sample SPY at proportional index
          const spyIdx = Math.min(Math.round((i / (n - 1)) * (validPairs.length - 1)), validPairs.length - 1)
          const spyPricePct = ((validPairs[spyIdx].close - first) / first) * 100
          return { cumulative: spyPricePct }
        })
      }
    }
  } catch { /* ignore */ }

  // Experiment progress
  const progress = {
    momentum:       closed.filter(t => t.strategy === 'momentum').length,
    mean_reversion: closed.filter(t => t.strategy === 'mean_reversion').length,
    target: 50,
  }

  return NextResponse.json({
    stats,
    open,
    closed,
    equityCurve,
    spyReturn3mo,
    spyCurve,
    progress,
  })
}
