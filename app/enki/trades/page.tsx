'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
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
}

const BROKER_FILTERS = ['all', 'alpaca', 'coinbase', 'paper'] as const
type BrokerFilter = typeof BROKER_FILTERS[number]

export default function EnkiTradesPage() {
  const router = useRouter()
  const [trades, setTrades]   = useState<Trade[]>([])
  const [loading, setLoading] = useState(true)
  const [authed, setAuthed]   = useState(false)
  const [broker, setBroker]   = useState<BrokerFilter>('all')

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/login?next=/enki/trades'); return }
      setAuthed(true)
      load('all')
    })
  }, [])

  async function load(b: BrokerFilter) {
    setLoading(true)
    const url = b === 'all' ? '/api/enki/trades?limit=200' : `/api/enki/trades?limit=200&broker=${b}`
    const res  = await fetch(url)
    const json = await res.json()
    setTrades(json.trades ?? [])
    setLoading(false)
  }

  function handleBrokerChange(b: BrokerFilter) {
    setBroker(b)
    load(b)
  }

  // Summary stats
  const buys  = trades.filter(t => t.side === 'buy')
  const sells = trades.filter(t => t.side === 'sell')
  const avgConfidence = trades.length > 0
    ? (trades.reduce((sum, t) => sum + t.confidence, 0) / trades.length).toFixed(1)
    : '—'

  if (!authed) return null

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* ── Header ── */}
      <div className="bg-black dark:bg-gray-950 border-b border-gray-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-amber-400 rounded-lg flex items-center justify-center text-black font-extrabold text-sm">E</div>
            <div>
              <p className="text-sm font-extrabold text-white leading-none">Enki</p>
              <p className="text-xs text-gray-500 mt-0.5">Trade Ledger</p>
            </div>
          </div>
          <Link href="/enki/dashboard" className="text-xs font-bold text-gray-400 hover:text-white transition-colors">
            ← Dashboard
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* ── Summary ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Trades', value: String(trades.length) },
            { label: 'Buys', value: String(buys.length) },
            { label: 'Sells', value: String(sells.length) },
            { label: 'Avg Confidence', value: avgConfidence !== '—' ? `${avgConfidence}/10` : '—' },
          ].map((s) => (
            <div key={s.label} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{s.label}</p>
              <p className="text-2xl font-extrabold text-gray-900 dark:text-gray-100">{s.value}</p>
            </div>
          ))}
        </div>

        {/* ── Filters ── */}
        <div className="flex items-center gap-2 mb-6">
          {BROKER_FILTERS.map((b) => (
            <button
              key={b}
              onClick={() => handleBrokerChange(b)}
              className={`text-xs font-bold px-3 py-1.5 rounded-full transition-colors capitalize ${
                broker === b
                  ? 'bg-amber-400 text-black'
                  : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-amber-400 hover:text-amber-500'
              }`}
            >
              {b === 'all' ? 'All Brokers' : b}
            </button>
          ))}
        </div>

        {/* ── Trade table ── */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden">
          {loading ? (
            <div className="py-16 text-center">
              <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs text-gray-400">Loading trade ledger…</p>
            </div>
          ) : trades.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-sm text-gray-400">No trades recorded yet.</p>
              <p className="text-xs text-gray-500 mt-1">The guardian executes when all signals align and confidence exceeds 6/10.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                    <th className="px-4 py-3 text-left font-bold text-gray-400 uppercase tracking-wider">Symbol</th>
                    <th className="px-4 py-3 text-left font-bold text-gray-400 uppercase tracking-wider">Side</th>
                    <th className="px-4 py-3 text-right font-bold text-gray-400 uppercase tracking-wider">Qty</th>
                    <th className="px-4 py-3 text-right font-bold text-gray-400 uppercase tracking-wider">Price</th>
                    <th className="px-4 py-3 text-right font-bold text-gray-400 uppercase tracking-wider">Total</th>
                    <th className="px-4 py-3 text-right font-bold text-gray-400 uppercase tracking-wider">Confidence</th>
                    <th className="px-4 py-3 text-left font-bold text-gray-400 uppercase tracking-wider">Broker</th>
                    <th className="px-4 py-3 text-left font-bold text-gray-400 uppercase tracking-wider">Reason</th>
                    <th className="px-4 py-3 text-left font-bold text-gray-400 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {trades.map((t) => (
                    <tr
                      key={t.id}
                      className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
                    >
                      <td className="px-4 py-3 font-bold text-gray-900 dark:text-gray-100">{t.symbol}</td>
                      <td className="px-4 py-3">
                        <span className={`font-bold uppercase ${t.side === 'buy' ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                          {t.side}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-400 tabular-nums">{t.qty}</td>
                      <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-400 tabular-nums">${t.price.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right font-bold text-gray-900 dark:text-gray-100 tabular-nums">${t.total.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right">
                        {t.confidence > 0 ? (
                          <span className={`font-bold tabular-nums ${t.confidence >= 7 ? 'text-green-500' : t.confidence >= 6 ? 'text-amber-500' : 'text-gray-400'}`}>
                            {t.confidence.toFixed(1)}/10
                          </span>
                        ) : <span className="text-gray-300 dark:text-gray-600">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1.5">
                          {t.paper && <span className="text-gray-400 text-[10px] font-bold bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded uppercase">Paper</span>}
                          <span className="text-gray-500 capitalize">{t.broker}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-400 max-w-[180px] truncate" title={t.reason}>{t.reason || '—'}</td>
                      <td className="px-4 py-3 text-gray-400 whitespace-nowrap tabular-nums">
                        {new Date(t.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}{' '}
                        <span className="text-gray-500">{new Date(t.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
