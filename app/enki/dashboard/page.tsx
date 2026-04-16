'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createBrowserClient } from '@supabase/ssr'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Profile {
  tier: 'citizen' | 'commander' | 'emperor'
  guardian_mode: 'approval' | 'autonomous' | 'dormant'
  alpaca_connected: boolean
  coinbase_connected: boolean
  cloud_runner: boolean
}

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

interface Snapshot {
  broker: string
  portfolio_value: number
  daily_pnl: number
  total_pnl: number
  cash: number
  open_positions: number
  snapshot_date: string
}

interface PaperPosition {
  symbol: string
  qty: number
  avgPrice: number
  currentValue: number
}

const TIER_BADGE: Record<string, string> = {
  citizen:  'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  commander:'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  emperor:  'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
}

const MODE_BADGE: Record<string, string> = {
  approval:   'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  autonomous: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  dormant:    'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
}

const MODE_LABEL: Record<string, string> = {
  approval:   'Approval Mode',
  autonomous: 'Autonomous',
  dormant:    'Guardian Dormant',
}

function StatCard({ label, value, sub, accent = false }: { label: string; value: string; sub?: string; accent?: boolean }) {
  return (
    <div className={`rounded-2xl border p-5 ${accent ? 'bg-black dark:bg-gray-950 border-amber-400/30' : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800'}`}>
      <p className={`text-xs font-bold uppercase tracking-widest mb-1 ${accent ? 'text-amber-500' : 'text-gray-400'}`}>{label}</p>
      <p className={`text-2xl font-extrabold ${accent ? 'text-amber-400' : 'text-gray-900 dark:text-gray-100'}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  )
}

export default function EnkiDashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [authed, setAuthed] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [trades, setTrades] = useState<Trade[]>([])
  const [snapshots, setSnapshots] = useState<Snapshot[]>([])
  const [paperPositions, setPaperPositions] = useState<PaperPosition[]>([])

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/login?next=/enki/dashboard'); return }
      setAuthed(true)
      loadAll()
    })
  }, [])

  async function loadAll() {
    setLoading(true)
    try {
      const [profileRes, tradesRes, snapshotsRes] = await Promise.all([
        fetch('/api/enki/profile'),
        fetch('/api/enki/trades?limit=10'),
        fetch('/api/enki/snapshots'),
      ])
      const [profileJson, tradesJson, snapshotsJson] = await Promise.all([
        profileRes.json(),
        tradesRes.json(),
        snapshotsRes.json(),
      ])
      if (profileJson.profile)   setProfile(profileJson.profile)
      if (tradesJson.trades)     setTrades(tradesJson.trades)
      if (snapshotsJson.snapshots) setSnapshots(snapshotsJson.snapshots)

      // Derive paper positions from paper trades
      if (tradesJson.trades) {
        const allPaperTrades = tradesJson.trades.filter((t: Trade) => t.broker === 'paper' && t.status === 'filled')
        const posMap: Record<string, { qty: number; cost: number }> = {}
        for (const t of allPaperTrades) {
          if (!posMap[t.symbol]) posMap[t.symbol] = { qty: 0, cost: 0 }
          if (t.side === 'buy') {
            posMap[t.symbol].qty  += t.qty
            posMap[t.symbol].cost += t.qty * t.price
          } else {
            posMap[t.symbol].qty  -= t.qty
            posMap[t.symbol].cost -= t.qty * t.price
          }
        }
        const positions: PaperPosition[] = Object.entries(posMap)
          .filter(([, pos]) => pos.qty > 0)
          .map(([symbol, pos]) => ({
            symbol,
            qty: pos.qty,
            avgPrice: pos.qty > 0 ? pos.cost / pos.qty : 0,
            currentValue: pos.cost,
          }))
        setPaperPositions(positions)
      }
    } catch (e) {
      console.error('Enki dashboard load error:', e)
    } finally {
      setLoading(false)
    }
  }

  // Aggregate totals across all brokers from latest snapshot
  const latestSnap = snapshots[0]
  const totalValue  = latestSnap?.portfolio_value ?? 0
  const dailyPnl    = latestSnap?.daily_pnl ?? 0
  const totalPnl    = latestSnap?.total_pnl ?? 0
  const openPos     = latestSnap?.open_positions ?? 0

  const pnlColor = (n: number) => n >= 0 ? 'text-green-500' : 'text-red-500'
  const pnlSign  = (n: number) => n >= 0 ? '+' : ''

  if (!authed || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-400">Guardian initializing…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* ── Header ── */}
      <div className="bg-black dark:bg-gray-950 border-b border-gray-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-amber-400 rounded-lg flex items-center justify-center text-black font-extrabold text-sm">E</div>
            <div>
              <p className="text-sm font-extrabold text-white leading-none">Enki</p>
              <p className="text-xs text-gray-500 mt-0.5">Treasury Guardian</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {profile && (
              <>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full capitalize ${TIER_BADGE[profile.tier]}`}>
                  {profile.tier}
                </span>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${MODE_BADGE[profile.guardian_mode]}`}>
                  {MODE_LABEL[profile.guardian_mode]}
                </span>
              </>
            )}
            <Link
              href="/enki/doctrines"
              className="text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors"
            >
              Doctrines
            </Link>
            <Link
              href="/enki/leaderboard"
              className="text-xs font-bold text-gray-400 hover:text-amber-400 transition-colors"
            >
              Leaderboard
            </Link>
            <Link
              href="/enki/trades"
              className="text-xs font-bold text-gray-400 hover:text-amber-400 transition-colors"
            >
              Trade Ledger
            </Link>
            <Link
              href="/enki"
              className="text-xs font-bold text-gray-400 hover:text-white transition-colors"
            >
              ← Back
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* ── No snapshot yet (new user) ── */}
        {snapshots.length === 0 && (
          <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-2xl p-6 mb-8">
            <p className="text-sm font-bold text-amber-700 dark:text-amber-400 mb-1">Guardian Initializing</p>
            <p className="text-xs text-amber-600 dark:text-amber-500">
              {profile?.tier === 'citizen'
                ? 'Paper trading is active — no real money required. Your portfolio data will appear here once the first 15-minute scan cycle runs. Make sure you have an active doctrine in settings.'
                : 'Connect your broker in Settings to start trading. Your treasury data will appear here once the first scan cycle runs.'}
            </p>
            <div className="mt-3 flex gap-3">
              <Link href="/enki/settings" className="text-xs font-bold text-amber-700 dark:text-amber-400 hover:underline">
                Go to Settings →
              </Link>
            </div>
          </div>
        )}

        {/* ── Tier upgrade nudge for Citizen ── */}
        {profile?.tier === 'citizen' && (
          <div className="bg-black dark:bg-gray-950 border border-amber-400/30 rounded-2xl p-5 mb-8 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-extrabold text-amber-400 mb-0.5">You're in Simulation Mode</p>
              <p className="text-xs text-gray-400">Paper trading only. Upgrade to Commander to go live with real stocks.</p>
            </div>
            <Link
              href="/enki#pricing"
              className="text-xs font-bold bg-amber-400 hover:bg-amber-500 text-black px-4 py-2 rounded-xl whitespace-nowrap transition-colors"
            >
              Upgrade →
            </Link>
          </div>
        )}

        {/* ── Stats row ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Treasury Value"
            value={totalValue > 0 ? `$${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—'}
            sub={latestSnap ? `as of ${latestSnap.snapshot_date}` : 'No data yet'}
            accent
          />
          <StatCard
            label="Today's P&L"
            value={latestSnap ? `${pnlSign(dailyPnl)}$${Math.abs(dailyPnl).toFixed(2)}` : '—'}
            sub={dailyPnl !== 0 ? (dailyPnl >= 0 ? '▲ Positive day' : '▼ Drawdown') : undefined}
          />
          <StatCard
            label="Total P&L"
            value={latestSnap ? `${pnlSign(totalPnl)}$${Math.abs(totalPnl).toFixed(2)}` : '—'}
            sub="Since inception"
          />
          <StatCard
            label="Open Positions"
            value={String(openPos)}
            sub={openPos === 0 ? 'Guardian watching' : `${openPos} active`}
          />
        </div>

        {/* ── Broker status ── */}
        {profile && (
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 mb-8">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Broker Connections</p>
            <div className="flex flex-wrap gap-3">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border ${profile.alpaca_connected ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400' : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${profile.alpaca_connected ? 'bg-green-500' : 'bg-gray-400'}`} />
                Alpaca — Stocks (Mon–Fri)
                {!profile.alpaca_connected && <span className="ml-1 font-normal opacity-70"><Link href="/enki/settings" className="hover:text-amber-400">Connect in Settings</Link></span>}
              </div>
              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border ${profile.coinbase_connected ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400' : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${profile.coinbase_connected ? 'bg-green-500' : 'bg-gray-400'}`} />
                Coinbase — Crypto 24/7
                {!profile.coinbase_connected && (
                  <span className="ml-1 font-normal opacity-70">
                    {profile.tier === 'emperor'
                      ? <Link href="/enki/settings" className="hover:text-amber-400">Connect in Settings</Link>
                      : 'Emperor only'}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Paper positions (Citizen tier) ── */}
        {profile?.tier === 'citizen' && paperPositions.length > 0 && (
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden mb-8">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <p className="text-sm font-extrabold text-gray-900 dark:text-gray-100">Paper Positions</p>
                <span className="text-[10px] font-bold bg-gray-100 dark:bg-gray-800 text-gray-500 px-1.5 py-0.5 rounded">SIMULATED</span>
              </div>
              <span className="text-xs text-gray-400">{paperPositions.length} open</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800">
                    <th className="px-4 py-3 text-left font-bold text-gray-400 uppercase tracking-wider">Symbol</th>
                    <th className="px-4 py-3 text-right font-bold text-gray-400 uppercase tracking-wider">Qty</th>
                    <th className="px-4 py-3 text-right font-bold text-gray-400 uppercase tracking-wider">Avg Price</th>
                    <th className="px-4 py-3 text-right font-bold text-gray-400 uppercase tracking-wider">Cost Basis</th>
                  </tr>
                </thead>
                <tbody>
                  {paperPositions.map(pos => (
                    <tr key={pos.symbol} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                      <td className="px-4 py-3 font-bold text-gray-900 dark:text-gray-100">{pos.symbol}</td>
                      <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-400">{pos.qty}</td>
                      <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-400">${pos.avgPrice.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right font-bold text-gray-900 dark:text-gray-100">${pos.currentValue.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Recent trades ── */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <p className="text-sm font-extrabold text-gray-900 dark:text-gray-100">Recent Trades</p>
            <Link href="/enki/trades" className="text-xs font-bold text-amber-500 hover:text-amber-400 transition-colors">
              View all →
            </Link>
          </div>

          {trades.length === 0 ? (
            <div className="px-6 py-10 text-center">
              <p className="text-sm text-gray-400">No trades yet.</p>
              <p className="text-xs text-gray-500 mt-1">The guardian is watching. Trades execute when confidence hits 6/10.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800">
                    <th className="px-4 py-3 text-left font-bold text-gray-400 uppercase tracking-wider">Symbol</th>
                    <th className="px-4 py-3 text-left font-bold text-gray-400 uppercase tracking-wider">Side</th>
                    <th className="px-4 py-3 text-right font-bold text-gray-400 uppercase tracking-wider">Qty</th>
                    <th className="px-4 py-3 text-right font-bold text-gray-400 uppercase tracking-wider">Price</th>
                    <th className="px-4 py-3 text-right font-bold text-gray-400 uppercase tracking-wider">Total</th>
                    <th className="px-4 py-3 text-right font-bold text-gray-400 uppercase tracking-wider">Score</th>
                    <th className="px-4 py-3 text-left font-bold text-gray-400 uppercase tracking-wider">Broker</th>
                    <th className="px-4 py-3 text-left font-bold text-gray-400 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {trades.map((t) => (
                    <tr key={t.id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                      <td className="px-4 py-3 font-bold text-gray-900 dark:text-gray-100">{t.symbol}</td>
                      <td className="px-4 py-3">
                        <span className={`font-bold uppercase ${t.side === 'buy' ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                          {t.side}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-400">{t.qty}</td>
                      <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-400">${t.price.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right font-bold text-gray-900 dark:text-gray-100">${t.total.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right">
                        {t.confidence > 0 && (
                          <span className="text-amber-500 font-bold">{t.confidence.toFixed(1)}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1.5">
                          {t.paper && <span className="text-gray-400 text-[10px] font-bold bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">PAPER</span>}
                          <span className="text-gray-500 capitalize">{t.broker}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-400">
                        {new Date(t.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Fortress status ── */}
        <div className="bg-black dark:bg-gray-950 border border-gray-800 rounded-2xl p-6">
          <p className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-4">Fortress Guard — Active Rules</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Daily Drawdown', value: '3% max' },
              { label: 'Loss Brake', value: '3 consecutive' },
              { label: 'Macro Shield', value: 'CPI / FOMC / NFP' },
              { label: 'Earnings Guard', value: '2-day buffer' },
              { label: 'PDT Rule', value: 'Auto-enforced' },
              { label: 'Sector Cap', value: '40% per sector' },
              { label: 'Crypto Cap', value: '35% of treasury' },
              { label: 'Confidence Gate', value: '6.0 / 10 min' },
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-2">
                <span className="text-amber-500 mt-0.5 text-xs">◆</span>
                <div>
                  <p className="text-xs font-bold text-gray-300">{item.label}</p>
                  <p className="text-xs text-gray-500">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
