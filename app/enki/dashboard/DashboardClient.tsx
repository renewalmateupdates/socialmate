'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
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

interface PendingTrade {
  id: string
  doctrine_id: string | null
  broker: string
  symbol: string
  side: 'buy' | 'sell'
  qty: number
  price: number
  reason: string
  confidence: number
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

interface EnkiNotification {
  id: string
  type: string
  title: string
  message: string
  data: Record<string, unknown> | null
  is_read: boolean
  created_at: string
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

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export default function DashboardClient() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const justUpgraded = searchParams.get('upgrade') === 'success'
  const [loading, setLoading] = useState(true)
  const [authed, setAuthed] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [trades, setTrades] = useState<Trade[]>([])
  const [snapshots, setSnapshots] = useState<Snapshot[]>([])
  const [paperPositions, setPaperPositions] = useState<PaperPosition[]>([])
  const [pendingTrades, setPendingTrades] = useState<PendingTrade[]>([])
  const [approvalState, setApprovalState] = useState<Record<string, 'approved' | 'rejected' | 'loading'>>({})
  const [guardianToggling, setGuardianToggling] = useState(false)

  // Notification bell state
  const [notifications, setNotifications]         = useState<EnkiNotification[]>([])
  const [notifOpen, setNotifOpen]                 = useState(false)
  const [notifMarking, setNotifMarking]           = useState(false)
  const notifRef                                  = useRef<HTMLDivElement>(null)

  const unreadCount = notifications.filter(n => !n.is_read).length

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/login?redirect=/enki/dashboard'); return }
      setAuthed(true)
      loadAll()
    })
  }, [])

  // Close notification panel when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false)
      }
    }
    if (notifOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [notifOpen])

  async function fetchNotifications() {
    try {
      const res = await fetch('/api/enki/notifications')
      const json = await res.json()
      if (json.notifications) setNotifications(json.notifications)
    } catch (e) {
      console.error('Notifications load error:', e)
    }
  }

  async function markAllRead() {
    setNotifMarking(true)
    try {
      await fetch('/api/enki/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mark_all: true }),
      })
      await fetchNotifications()
    } catch (e) {
      console.error('Mark all read error:', e)
    } finally {
      setNotifMarking(false)
    }
  }

  async function loadAll() {
    setLoading(true)
    try {
      const [profileRes, tradesRes, snapshotsRes, pendingRes, notifRes, doctrinesRes] = await Promise.all([
        fetch('/api/enki/profile'),
        fetch('/api/enki/trades?limit=10'),
        fetch('/api/enki/snapshots'),
        fetch('/api/enki/trades/pending'),
        fetch('/api/enki/notifications'),
        fetch('/api/enki/doctrines'),
      ])
      const [profileJson, tradesJson, snapshotsJson, pendingJson, notifJson, doctrinesJson] = await Promise.all([
        profileRes.json(),
        tradesRes.json(),
        snapshotsRes.json(),
        pendingRes.json(),
        notifRes.json(),
        doctrinesRes.json(),
      ])
      if (profileJson.profile)      setProfile(profileJson.profile)
      if (tradesJson.trades)        setTrades(tradesJson.trades)
      if (snapshotsJson.snapshots)  setSnapshots(snapshotsJson.snapshots)
      if (pendingJson.trades)       setPendingTrades(pendingJson.trades)
      if (notifJson.notifications)  setNotifications(notifJson.notifications)

      // Auto-create a default doctrine for brand-new users so the guardian
      // has something to work with on the very first scan cycle.
      if (Array.isArray(doctrinesJson.doctrines) && doctrinesJson.doctrines.length === 0) {
        await fetch('/api/enki/doctrines', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name:        'Balanced Doctrine',
            description: 'Auto-created starter doctrine. Trades SPY, QQQ, and AAPL at 10% position size with balanced risk settings.',
            is_active:   true,
            config: {
              symbols:                ['SPY', 'QQQ', 'AAPL'],
              broker:                 'paper',
              position_size_pct:      10,
              stop_loss_pct:          5,
              take_profit_pct:        12,
              max_positions:          5,
              max_daily_drawdown_pct: 3,
            },
          }),
        })
      }

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

  async function handleApproval(id: string, action: 'approve' | 'reject') {
    setApprovalState(prev => ({ ...prev, [id]: 'loading' }))
    try {
      const res = await fetch('/api/enki/trades/pending', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action }),
      })
      const json = await res.json()
      if (json.success) {
        setApprovalState(prev => ({ ...prev, [id]: action === 'approve' ? 'approved' : 'rejected' }))
        // Remove from list after brief delay so user sees the inline state
        setTimeout(() => {
          setPendingTrades(prev => prev.filter(t => t.id !== id))
          setApprovalState(prev => { const next = { ...prev }; delete next[id]; return next })
        }, 1200)
      } else {
        setApprovalState(prev => { const next = { ...prev }; delete next[id]; return next })
        console.error('Approval error:', json.error)
      }
    } catch (e) {
      setApprovalState(prev => { const next = { ...prev }; delete next[id]; return next })
      console.error('Approval request failed:', e)
    }
  }

  async function toggleGuardian() {
    if (!profile || guardianToggling) return
    const nextMode = profile.guardian_mode === 'dormant' ? 'approval' : 'dormant'
    setGuardianToggling(true)
    try {
      const res = await fetch('/api/enki/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guardian_mode: nextMode }),
      })
      const json = await res.json()
      if (json.success) {
        setProfile(prev => prev ? { ...prev, guardian_mode: nextMode } : prev)
      }
    } catch (e) {
      console.error('Guardian toggle error:', e)
    } finally {
      setGuardianToggling(false)
    }
  }

  // Aggregate totals across all brokers from latest snapshot
  const latestSnap = snapshots[0]
  const totalValue  = latestSnap?.portfolio_value ?? 0
  const dailyPnl    = latestSnap?.daily_pnl ?? 0
  const totalPnl    = latestSnap?.total_pnl ?? 0
  const openPos     = latestSnap?.open_positions ?? 0

  // ── Sharpe + Sortino + Max Drawdown from daily snapshots ──────────────
  const riskMetrics = (() => {
    const snaps = [...snapshots].sort((a, b) => a.snapshot_date.localeCompare(b.snapshot_date))
    if (snaps.length < 2) return null
    const RISK_FREE = 0.05 / 252 // ~5% annual risk-free, daily
    const dailyReturns = snaps.slice(1).map((s, i) => {
      const prev = snaps[i].portfolio_value
      return prev > 0 ? (s.portfolio_value - prev) / prev : 0
    })
    const n    = dailyReturns.length
    const mean = dailyReturns.reduce((s, r) => s + r, 0) / n
    const excess = mean - RISK_FREE
    // Sharpe: std over all returns
    const variance = dailyReturns.reduce((s, r) => s + (r - mean) ** 2, 0) / n
    const std = Math.sqrt(variance)
    const sharpe = std > 0 ? (excess / std) * Math.sqrt(252) : null
    // Sortino: std over downside returns only
    const downsideReturns = dailyReturns.filter(r => r < RISK_FREE)
    const dsVariance = downsideReturns.length > 0
      ? downsideReturns.reduce((s, r) => s + (r - RISK_FREE) ** 2, 0) / downsideReturns.length
      : 0
    const dsStd   = Math.sqrt(dsVariance)
    const sortino = dsStd > 0 ? (excess / dsStd) * Math.sqrt(252) : null
    // Max drawdown: from peak portfolio value
    let peak = snaps[0].portfolio_value, maxDD = 0
    for (const s of snaps) {
      if (s.portfolio_value > peak) peak = s.portfolio_value
      const dd = (peak - s.portfolio_value) / peak
      if (dd > maxDD) maxDD = dd
    }
    const lowConfidence = n < 30
    return { sharpe, sortino, maxDD, n, lowConfidence }
  })()

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
              href="/enki/truth"
              className="text-xs font-bold text-gray-400 hover:text-amber-400 transition-colors"
            >
              Truth Mode
            </Link>

            {/* ── Notification Bell ── */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifOpen(o => !o)}
                className="relative w-8 h-8 flex items-center justify-center text-gray-400 hover:text-amber-400 transition-colors focus:outline-none"
                aria-label="Notifications"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-red-500 text-white text-[9px] font-extrabold rounded-full flex items-center justify-center px-0.5 leading-none">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 top-10 w-80 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl z-50 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-bold text-gray-900 dark:text-gray-100">Notifications</p>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllRead}
                        disabled={notifMarking}
                        className="text-xs text-amber-500 hover:text-amber-400 font-semibold disabled:opacity-50 transition-colors"
                      >
                        {notifMarking ? 'Marking…' : 'Mark all read'}
                      </button>
                    )}
                  </div>

                  {notifications.length === 0 ? (
                    <div className="py-6 text-center">
                      <p className="text-sm text-gray-400">No notifications yet.</p>
                      <p className="text-xs text-gray-500 mt-1">Trade alerts and guardian updates appear here.</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-80 overflow-y-auto">
                      {notifications.slice(0, 10).map(n => (
                        <div
                          key={n.id}
                          className={`rounded-xl p-3 transition-colors ${
                            n.is_read
                              ? 'bg-gray-50 dark:bg-gray-800/50'
                              : 'bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className={`text-xs font-bold leading-tight ${n.is_read ? 'text-gray-700 dark:text-gray-300' : 'text-gray-900 dark:text-gray-100'}`}>
                              {n.title}
                            </p>
                            <span className="text-[10px] text-gray-400 whitespace-nowrap shrink-0">{timeAgo(n.created_at)}</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5 leading-snug">{n.message}</p>
                          {!n.is_read && (
                            <span className="inline-block w-1.5 h-1.5 bg-amber-400 rounded-full mt-1.5" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

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

        {/* ── Upgrade success banner ── */}
        {justUpgraded && (
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-300 dark:border-amber-700 rounded-2xl px-6 py-4 mb-6 flex items-center gap-4">
            <span className="text-2xl">🎖️</span>
            <div>
              <p className="font-extrabold text-amber-800 dark:text-amber-300 text-sm">Welcome to the Empire.</p>
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                Your tier has been activated. Create a doctrine to put the guardian to work.
              </p>
            </div>
            <a href="/enki/doctrines" className="ml-auto shrink-0 bg-amber-400 hover:bg-amber-500 text-black font-bold text-xs px-4 py-2 rounded-xl transition-all">
              Set Doctrine →
            </a>
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

        {/* ── Guardian status row ── */}
        {profile && (
          <div className="flex items-center justify-between bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl px-5 py-3 mb-6 gap-3 flex-wrap">
            <div className="flex items-center gap-2.5">
              <span
                className={`w-2.5 h-2.5 rounded-full shrink-0 ${profile.guardian_mode !== 'dormant' ? 'bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.6)]' : 'bg-gray-400'}`}
              />
              <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                Guardian:{' '}
                {profile.guardian_mode === 'dormant'
                  ? <span className="text-gray-400 font-semibold">PAUSED</span>
                  : profile.guardian_mode === 'autonomous'
                  ? <span className="text-green-500">ACTIVE</span>
                  : <span className="text-green-500">ACTIVE</span>
                }
              </span>
              {profile.guardian_mode !== 'dormant' && (
                <span className="text-xs text-gray-400 font-medium">
                  — {profile.guardian_mode === 'autonomous' ? 'Autonomous' : 'Approval Mode'}
                </span>
              )}
            </div>
            <button
              onClick={toggleGuardian}
              disabled={guardianToggling}
              className={`text-xs font-bold px-4 py-1.5 rounded-xl border transition-colors disabled:opacity-50 ${
                profile.guardian_mode !== 'dormant'
                  ? 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  : 'bg-green-600 border-green-700 text-white hover:bg-green-700'
              }`}
            >
              {guardianToggling ? '…' : profile.guardian_mode !== 'dormant' ? 'Pause' : 'Resume'}
            </button>
          </div>
        )}

        {/* ── Pending approvals amber banner ── */}
        {pendingTrades.length > 0 && (
          <div className="flex items-center justify-between bg-amber-50 dark:bg-amber-950/20 border border-amber-300 dark:border-amber-700 rounded-2xl px-5 py-3.5 mb-6 gap-3">
            <div className="flex items-center gap-2.5">
              <span className="text-amber-500 text-base leading-none">⚡</span>
              <p className="text-sm font-bold text-amber-800 dark:text-amber-300">
                {pendingTrades.length} trade{pendingTrades.length === 1 ? '' : 's'} waiting for your approval
              </p>
            </div>
            <Link
              href="/enki/trades?tab=pending"
              className="text-xs font-bold text-amber-700 dark:text-amber-400 hover:text-amber-600 dark:hover:text-amber-300 whitespace-nowrap transition-colors"
            >
              Review →
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

        {/* ── Risk Metrics (Sharpe / Sortino / Max Drawdown) ── */}
        {riskMetrics && (
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 mb-8">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Risk Metrics</p>
              {riskMetrics.lowConfidence && (
                <span className="text-[10px] font-bold bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800 px-2 py-0.5 rounded-full">
                  Low confidence — {riskMetrics.n} trading days
                </span>
              )}
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Sharpe Ratio</p>
                <p className={`text-xl font-extrabold ${riskMetrics.sharpe === null ? 'text-gray-400' : riskMetrics.sharpe >= 1 ? 'text-green-500' : riskMetrics.sharpe >= 0 ? 'text-amber-500' : 'text-red-500'}`}>
                  {riskMetrics.sharpe === null ? '—' : riskMetrics.sharpe.toFixed(2)}
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">≥ 1.0 is strong</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Sortino Ratio</p>
                <p className={`text-xl font-extrabold ${riskMetrics.sortino === null ? 'text-gray-400' : riskMetrics.sortino >= 1 ? 'text-green-500' : riskMetrics.sortino >= 0 ? 'text-amber-500' : 'text-red-500'}`}>
                  {riskMetrics.sortino === null ? '—' : riskMetrics.sortino.toFixed(2)}
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">Downside risk adjusted</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Max Drawdown</p>
                <p className={`text-xl font-extrabold ${riskMetrics.maxDD > 0.2 ? 'text-red-500' : riskMetrics.maxDD > 0.1 ? 'text-amber-500' : 'text-green-500'}`}>
                  -{(riskMetrics.maxDD * 100).toFixed(1)}%
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">Peak-to-trough</p>
              </div>
            </div>
          </div>
        )}

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

        {/* ── Pending Approvals (approval mode only) ── */}
        {profile?.guardian_mode === 'approval' && pendingTrades.length > 0 && (
          <div className="bg-white dark:bg-gray-900 border border-amber-200 dark:border-amber-800/50 rounded-2xl overflow-hidden mb-8">
            <div className="px-6 py-4 border-b border-amber-100 dark:border-amber-800/40 flex items-center gap-3">
              <span className="text-amber-500">⚡</span>
              <p className="text-sm font-extrabold text-gray-900 dark:text-gray-100">Pending Approvals</p>
              <span className="text-[11px] font-bold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full">
                {pendingTrades.length} pending
              </span>
            </div>
            <div className="divide-y divide-gray-50 dark:divide-gray-800/50">
              {pendingTrades.map((t) => {
                const state = approvalState[t.id]
                const isLoading = state === 'loading'
                const isDone    = state === 'approved' || state === 'rejected'
                return (
                  <div key={t.id} className="px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-extrabold text-sm text-gray-900 dark:text-gray-100">{t.symbol}</span>
                      <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded ${t.side === 'buy' ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'}`}>
                        {t.side}
                      </span>
                      <span className="text-xs text-gray-500">{t.qty} shares</span>
                      <span className="text-xs font-bold text-gray-700 dark:text-gray-300">${t.price.toFixed(2)}</span>
                      {t.confidence > 0 && (
                        <span className="text-xs text-amber-500 font-bold">{t.confidence.toFixed(1)}/10</span>
                      )}
                      <span className="text-xs text-gray-400">
                        {new Date(t.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {isDone ? (
                        <span className={`text-xs font-bold px-3 py-1.5 rounded-xl ${state === 'approved' ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/20 text-red-500'}`}>
                          {state === 'approved' ? '✓ Approved' : '✕ Rejected'}
                        </span>
                      ) : (
                        <>
                          <button
                            disabled={isLoading}
                            onClick={() => handleApproval(t.id, 'approve')}
                            className="text-xs font-bold bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-xl transition-colors disabled:opacity-50"
                          >
                            {isLoading ? '…' : 'Approve ✓'}
                          </button>
                          <button
                            disabled={isLoading}
                            onClick={() => handleApproval(t.id, 'reject')}
                            className="text-xs font-bold bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 px-3 py-1.5 rounded-xl transition-colors disabled:opacity-50"
                          >
                            Reject ✕
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )
              })}
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
