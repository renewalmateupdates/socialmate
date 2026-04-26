'use client'
import { Suspense } from 'react'
import { useEffect, useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createBrowserClient } from '@supabase/ssr'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Trade {
  id: string
  broker: string
  symbol: string
  side: 'buy' | 'sell'
  qty: number
  price: number
  total: number
  reason: string
  confidence: number
  paper: boolean
  status: string
  created_at: string
  executed_at: string | null
}

type StatusFilter = 'all' | 'open' | 'closed'

// Compute P&L for closed sell trades by matching against prior buys (FIFO)
// Returns a map of trade id → { pnl_dollar, pnl_pct }
function computePnl(trades: Trade[]): Map<string, { pnl_dollar: number; pnl_pct: number }> {
  // Work on a sorted-by-date copy (oldest first) to do FIFO matching
  const sorted = Array.from(trades).sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  )

  // Per-symbol buy queues: { qty, price }[]
  const buyQueues: Record<string, Array<{ qty: number; price: number }>> = {}
  const result = new Map<string, { pnl_dollar: number; pnl_pct: number }>()

  for (const t of sorted) {
    if (t.side === 'buy') {
      if (!buyQueues[t.symbol]) buyQueues[t.symbol] = []
      buyQueues[t.symbol].push({ qty: Number(t.qty), price: Number(t.price) })
    } else {
      // SELL — match against earliest buys
      const queue = buyQueues[t.symbol]
      if (!queue || queue.length === 0) continue

      let remainingQty = Number(t.qty)
      let totalCost = 0
      let matchedQty = 0

      while (remainingQty > 0 && queue.length > 0) {
        const buy = queue[0]
        const take = Math.min(remainingQty, buy.qty)
        totalCost += take * buy.price
        matchedQty += take
        remainingQty -= take
        buy.qty -= take
        if (buy.qty <= 0) queue.shift()
      }

      if (matchedQty > 0) {
        const avgCost = totalCost / matchedQty
        const revenue = matchedQty * Number(t.price)
        const pnl_dollar = revenue - totalCost
        const pnl_pct = avgCost > 0 ? (pnl_dollar / totalCost) * 100 : 0
        result.set(t.id, { pnl_dollar, pnl_pct })
      }
    }
  }

  return result
}

function isOpenStatus(status: string) {
  return status === 'pending' || status === 'pending_approval'
}

function isClosedStatus(status: string) {
  return status === 'filled' || status === 'executed' || status === 'cancelled' || status === 'failed'
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    filled:           'bg-green-900/30 text-green-400 border border-green-800/50',
    executed:         'bg-green-900/30 text-green-400 border border-green-800/50',
    pending:          'bg-amber-900/30 text-amber-400 border border-amber-800/50',
    pending_approval: 'bg-amber-900/30 text-amber-400 border border-amber-800/50',
    cancelled:        'bg-gray-800 text-gray-400 border border-gray-700',
    failed:           'bg-red-900/30 text-red-400 border border-red-800/50',
  }
  const labels: Record<string, string> = {
    pending_approval: 'Pending',
    pending:          'Open',
    filled:           'Closed',
    executed:         'Closed',
    cancelled:        'Cancelled',
    failed:           'Failed',
  }
  return (
    <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${styles[status] ?? 'bg-gray-800 text-gray-400'}`}>
      {labels[status] ?? status}
    </span>
  )
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' ' +
    d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

function EnkiTradesInner() {
  const router       = useRouter()
  const searchParams = useSearchParams()

  const [trades, setTrades]     = useState<Trade[]>([])
  const [loading, setLoading]   = useState(true)
  const [authed, setAuthed]     = useState(false)
  const [filter, setFilter]     = useState<StatusFilter>('all')
  const [page, setPage]         = useState(1)
  const [total, setTotal]       = useState(0)
  const PAGE_SIZE = 25

  // Derived P&L map (computed once all trades are loaded)
  const [pnlMap, setPnlMap]     = useState<Map<string, { pnl_dollar: number; pnl_pct: number }>>(new Map())
  // All trades (unfiltered, for P&L computation across pairs)
  const [allTrades, setAllTrades] = useState<Trade[]>([])

  // Read initial tab from ?tab= query param
  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab === 'open' || tab === 'closed') setFilter(tab)
  }, [])

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/login?redirect=/enki/trades'); return }
      setAuthed(true)
    })
  }, [])

  // Load all trades once for P&L pairing
  useEffect(() => {
    if (!authed) return
    fetch('/api/enki/trades?page=1&status=all')
      .then(r => r.json())
      .then(json => {
        const list: Trade[] = json.trades ?? []
        setAllTrades(list)
        setPnlMap(computePnl(list))
      })
      .catch(() => {})
  }, [authed])

  const loadPage = useCallback(async (f: StatusFilter, p: number) => {
    setLoading(true)
    try {
      const url = `/api/enki/trades?status=${f}&page=${p}`
      const res  = await fetch(url)
      const json = await res.json()
      setTrades(json.trades ?? [])
      setTotal(json.total ?? 0)
    } catch {
      setTrades([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!authed) return
    loadPage(filter, page)
  }, [authed, filter, page, loadPage])

  function changeFilter(f: StatusFilter) {
    setFilter(f)
    setPage(1)
  }

  // Summary stats computed from ALL trades
  const closedTrades = allTrades.filter(t => isClosedStatus(t.status))
  const sellsWithPnl = closedTrades.filter(t => t.side === 'sell' && pnlMap.has(t.id))
  const wins         = sellsWithPnl.filter(t => (pnlMap.get(t.id)?.pnl_dollar ?? 0) > 0)
  const winRate      = sellsWithPnl.length > 0
    ? Math.round((wins.length / sellsWithPnl.length) * 100)
    : null
  const totalPnlDollar = sellsWithPnl.reduce((sum, t) => sum + (pnlMap.get(t.id)?.pnl_dollar ?? 0), 0)
  const avgPnlPct      = sellsWithPnl.length > 0
    ? sellsWithPnl.reduce((sum, t) => sum + (pnlMap.get(t.id)?.pnl_pct ?? 0), 0) / sellsWithPnl.length
    : null
  const openCount = allTrades.filter(t => isOpenStatus(t.status)).length

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  if (!authed) return null

  return (
    <div className="min-h-screen bg-black text-white">
      {/* ── Header / Nav ── */}
      <div className="bg-black border-b border-gray-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-amber-400 rounded-lg flex items-center justify-center text-black font-extrabold text-sm shrink-0">E</div>
            <div>
              <p className="text-sm font-extrabold text-white leading-none">Enki</p>
              <p className="text-xs text-gray-500 mt-0.5">Trade History</p>
            </div>
          </div>

          {/* Nav links — matches DashboardClient pattern */}
          <nav className="flex items-center gap-4 flex-wrap">
            <Link href="/enki/dashboard" className="text-xs font-bold text-gray-400 hover:text-amber-400 transition-colors">
              Dashboard
            </Link>
            <Link href="/enki/doctrines" className="text-xs font-bold text-gray-400 hover:text-amber-400 transition-colors">
              Doctrines
            </Link>
            <Link href="/enki/leaderboard" className="text-xs font-bold text-gray-400 hover:text-amber-400 transition-colors">
              Leaderboard
            </Link>
            <Link href="/enki/trades" className="text-xs font-bold text-amber-400">
              Trade History
            </Link>
            <Link href="/enki/truth" className="text-xs font-bold text-gray-400 hover:text-amber-400 transition-colors">
              Truth Mode
            </Link>
            <Link href="/enki" className="text-xs font-bold text-gray-500 hover:text-white transition-colors">
              ← Back
            </Link>
          </nav>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* ── Summary bar ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {/* Total trades */}
          <div className="bg-gray-950 border border-amber-400/20 rounded-2xl p-5">
            <p className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-1">Total Trades</p>
            <p className="text-2xl font-extrabold text-amber-400">
              {allTrades.length > 0 ? allTrades.length : '—'}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">{openCount} open</p>
          </div>

          {/* Win rate */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Win Rate</p>
            <p className={`text-2xl font-extrabold ${winRate !== null ? (winRate >= 50 ? 'text-green-400' : 'text-red-400') : 'text-gray-600'}`}>
              {winRate !== null ? `${winRate}%` : '—'}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {sellsWithPnl.length > 0 ? `${wins.length}/${sellsWithPnl.length} closed sells` : 'no closed sells yet'}
            </p>
          </div>

          {/* Total P&L */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total P&L</p>
            <p className={`text-2xl font-extrabold ${totalPnlDollar >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {sellsWithPnl.length > 0
                ? `${totalPnlDollar >= 0 ? '+' : ''}$${Math.abs(totalPnlDollar).toFixed(2)}`
                : '—'}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">paper gains/losses</p>
          </div>

          {/* Avg P&L % */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Avg P&L %</p>
            <p className={`text-2xl font-extrabold ${avgPnlPct !== null ? (avgPnlPct >= 0 ? 'text-green-400' : 'text-red-400') : 'text-gray-600'}`}>
              {avgPnlPct !== null ? `${avgPnlPct >= 0 ? '+' : ''}${avgPnlPct.toFixed(1)}%` : '—'}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">per closed trade</p>
          </div>
        </div>

        {/* ── Filter tabs ── */}
        <div className="flex items-center gap-2 mb-6">
          {(['all', 'open', 'closed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => changeFilter(f)}
              className={`text-xs font-bold px-4 py-1.5 rounded-full transition-colors capitalize ${
                filter === f
                  ? 'bg-amber-400 text-black'
                  : 'bg-gray-900 border border-gray-700 text-gray-400 hover:border-amber-500 hover:text-amber-400'
              }`}
            >
              {f === 'all' ? 'All' : f === 'open' ? 'Open' : 'Closed'}
              {f === 'open' && openCount > 0 && (
                <span className={`ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full font-extrabold ${filter === 'open' ? 'bg-black/20' : 'bg-amber-400/20 text-amber-400'}`}>
                  {openCount}
                </span>
              )}
            </button>
          ))}

          {total > 0 && (
            <span className="ml-auto text-xs text-gray-500">
              {total} trade{total !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* ── Trade table ── */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden mb-6">
          {loading ? (
            <div className="py-16 text-center">
              <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs text-gray-400">Loading trades…</p>
            </div>
          ) : trades.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-sm text-gray-500 mb-1">No paper trades recorded yet.</p>
              <p className="text-xs text-gray-600">Enki scans every 15 minutes during market hours (9:30 AM–4:00 PM ET).</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-800 bg-gray-900/80">
                    <th className="px-4 py-3 text-left font-bold text-gray-500 uppercase tracking-wider">Symbol</th>
                    <th className="px-4 py-3 text-left font-bold text-gray-500 uppercase tracking-wider">Side</th>
                    <th className="px-4 py-3 text-right font-bold text-gray-500 uppercase tracking-wider">Qty</th>
                    <th className="px-4 py-3 text-right font-bold text-gray-500 uppercase tracking-wider">Entry</th>
                    <th className="px-4 py-3 text-right font-bold text-gray-500 uppercase tracking-wider">Exit</th>
                    <th className="px-4 py-3 text-right font-bold text-gray-500 uppercase tracking-wider">P&L</th>
                    <th className="px-4 py-3 text-center font-bold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-right font-bold text-gray-500 uppercase tracking-wider">Score</th>
                    <th className="px-4 py-3 text-left font-bold text-gray-500 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {trades.map((t) => {
                    const pnl = t.side === 'sell' ? pnlMap.get(t.id) : null
                    const isClosed = isClosedStatus(t.status)
                    return (
                      <tr
                        key={t.id}
                        className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors"
                      >
                        {/* Symbol */}
                        <td className="px-4 py-3 font-extrabold text-white">{t.symbol}</td>

                        {/* Side badge */}
                        <td className="px-4 py-3">
                          <span className={`font-bold uppercase text-xs px-2 py-0.5 rounded ${
                            t.side === 'buy'
                              ? 'bg-green-900/30 text-green-400 border border-green-800/50'
                              : 'bg-red-900/30 text-red-400 border border-red-800/50'
                          }`}>
                            {t.side}
                          </span>
                        </td>

                        {/* Qty */}
                        <td className="px-4 py-3 text-right text-gray-400 tabular-nums">{Number(t.qty).toFixed(2)}</td>

                        {/* Entry price */}
                        <td className="px-4 py-3 text-right text-gray-300 tabular-nums font-medium">
                          ${Number(t.price).toFixed(2)}
                        </td>

                        {/* Exit price — only meaningful for sells */}
                        <td className="px-4 py-3 text-right text-gray-400 tabular-nums">
                          {t.side === 'sell' && isClosed ? `$${Number(t.price).toFixed(2)}` : <span className="text-gray-700">—</span>}
                        </td>

                        {/* P&L */}
                        <td className="px-4 py-3 text-right tabular-nums font-bold">
                          {pnl ? (
                            <span className={pnl.pnl_dollar >= 0 ? 'text-green-400' : 'text-red-400'}>
                              {pnl.pnl_pct >= 0 ? '+' : ''}{pnl.pnl_pct.toFixed(1)}%
                              <span className="block text-[10px] font-medium opacity-70">
                                {pnl.pnl_dollar >= 0 ? '+' : ''}${pnl.pnl_dollar.toFixed(2)}
                              </span>
                            </span>
                          ) : (
                            <span className="text-gray-700">—</span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3 text-center">
                          <StatusBadge status={t.status} />
                        </td>

                        {/* Confidence */}
                        <td className="px-4 py-3 text-right">
                          {t.confidence > 0 ? (
                            <span className={`font-bold tabular-nums ${
                              t.confidence >= 7 ? 'text-green-400' :
                              t.confidence >= 5 ? 'text-amber-400' : 'text-gray-500'
                            }`}>
                              {Number(t.confidence).toFixed(1)}/10
                            </span>
                          ) : (
                            <span className="text-gray-700">—</span>
                          )}
                        </td>

                        {/* Date */}
                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap tabular-nums">
                          {formatDate(t.created_at)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="text-xs font-bold px-4 py-2 rounded-xl bg-gray-900 border border-gray-700 text-gray-400 hover:border-amber-500 hover:text-amber-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              ← Prev
            </button>
            <p className="text-xs text-gray-500">
              Page {page} of {totalPages}
            </p>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="text-xs font-bold px-4 py-2 rounded-xl bg-gray-900 border border-gray-700 text-gray-400 hover:border-amber-500 hover:text-amber-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next →
            </button>
          </div>
        )}

        {/* ── Footer note ── */}
        <p className="text-center text-xs text-gray-700 mt-8">
          Enki scans every 15 min during market hours (Mon–Fri 9:30 AM–4:00 PM ET) · Paper trades only on Citizen tier
        </p>
      </div>
    </div>
  )
}

export default function EnkiTradesPage() {
  return <Suspense fallback={<div className="min-h-screen bg-black" />}><EnkiTradesInner /></Suspense>
}
