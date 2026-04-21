import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Enki Leaderboard — Top Architects by Treasury Growth',
  description: 'See the top Enki architects ranked by % P&L. Paper and live trading. All positions private — only % performance is shown.',
}

export const dynamic = 'force-dynamic'

interface LeaderboardEntry {
  display_name: string
  avatar_url: string | null
  tier: string
  trading_mode: 'paper' | 'live'
  total_pnl_pct: number
  conquest_streak: number
  best_streak: number
  total_trades: number
  win_rate: number
  doctrine_rank: string
  badges: string[]
}

const TIER_BADGE: Record<string, string> = {
  citizen:  'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
  commander:'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  emperor:  'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
}

const RANK_COLORS: Record<string, string> = {
  'Initiate':        'text-gray-400',
  'Trader':          'text-blue-500',
  'Conqueror':       'text-green-500',
  'Warlord':         'text-amber-500',
  'Emperor':         'text-orange-500',
  'Mythic Architect':'text-purple-500',
}

async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  try {
    const base = process.env.NEXT_PUBLIC_APP_URL ?? 'https://socialmate.studio'
    const res  = await fetch(`${base}/api/enki/leaderboard`, { next: { revalidate: 60 } })
    if (!res.ok) return []
    const json = await res.json()
    return json.entries ?? []
  } catch {
    return []
  }
}

function PlacementBadge({ rank }: { rank: number }) {
  if (rank === 1) return <span className="text-lg">🥇</span>
  if (rank === 2) return <span className="text-lg">🥈</span>
  if (rank === 3) return <span className="text-lg">🥉</span>
  return <span className="text-sm font-bold text-gray-400 tabular-nums">#{rank}</span>
}

export default async function EnkiLeaderboardPage() {
  const entries = await getLeaderboard()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* ── Enki Nav Header ── */}
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
            <Link href="/enki/doctrines" className="text-xs font-bold text-gray-400 hover:text-amber-400 transition-colors">
              Doctrines
            </Link>
            <Link href="/enki/leaderboard" className="text-xs font-bold text-amber-400">
              Leaderboard
            </Link>
            <Link href="/enki/trades" className="text-xs font-bold text-gray-400 hover:text-amber-400 transition-colors">
              Trade Ledger
            </Link>
            <Link href="/enki/truth" className="text-xs font-bold text-gray-400 hover:text-amber-400 transition-colors">
              Truth Mode
            </Link>
            <Link href="/enki/dashboard" className="text-xs font-bold text-gray-400 hover:text-white transition-colors">
              ← Back
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-16">

        {/* ── Header ── */}
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-bold mb-5 uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Live Rankings
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-gray-50 mb-3">
            Conquest Leaderboard
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
            Top Enki architects ranked by treasury growth. Only % P&L is shown — balances, positions, and order sizes are always private.
          </p>
        </div>

        {/* ── Privacy notice ── */}
        <div className="bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl px-5 py-3 mb-8 flex items-center gap-3">
          <span className="text-amber-500 text-sm">◆</span>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            <strong className="text-gray-700 dark:text-gray-300">Privacy first:</strong> Only % performance, streaks, and rank are visible. Dollar amounts, holdings, and account details are always hidden.
          </p>
        </div>

        {/* ── Table ── */}
        {entries.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl py-20 text-center">
            <div className="w-12 h-12 bg-black dark:bg-amber-400/10 rounded-xl flex items-center justify-center text-amber-400 font-extrabold text-xl mx-auto mb-4">E</div>
            <p className="text-sm font-bold text-gray-600 dark:text-gray-400 mb-1">No architects on the board yet.</p>
            <p className="text-xs text-gray-400 mb-6">Be the first. Start paper trading — it's free forever.</p>
            <Link
              href="/enki"
              className="inline-flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black font-bold px-6 py-2.5 rounded-xl text-sm hover:opacity-80 transition-all"
            >
              Join as Citizen — Free
            </Link>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                    <th className="px-4 py-3 text-left w-10 font-bold text-gray-400 text-xs uppercase tracking-wider">#</th>
                    <th className="px-4 py-3 text-left font-bold text-gray-400 text-xs uppercase tracking-wider">Architect</th>
                    <th className="px-4 py-3 text-right font-bold text-gray-400 text-xs uppercase tracking-wider">P&L %</th>
                    <th className="px-4 py-3 text-right font-bold text-gray-400 text-xs uppercase tracking-wider">Streak</th>
                    <th className="px-4 py-3 text-right font-bold text-gray-400 text-xs uppercase tracking-wider">Win Rate</th>
                    <th className="px-4 py-3 text-right font-bold text-gray-400 text-xs uppercase tracking-wider">Trades</th>
                    <th className="px-4 py-3 text-left font-bold text-gray-400 text-xs uppercase tracking-wider">Rank</th>
                    <th className="px-4 py-3 text-left font-bold text-gray-400 text-xs uppercase tracking-wider">Mode</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry, i) => (
                    <tr
                      key={i}
                      className={`border-b border-gray-50 dark:border-gray-800/50 transition-colors ${i < 3 ? 'bg-amber-50/30 dark:bg-amber-900/5' : 'hover:bg-gray-50 dark:hover:bg-gray-800/30'}`}
                    >
                      <td className="px-4 py-3.5 w-10">
                        <PlacementBadge rank={i + 1} />
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-sm font-extrabold text-gray-500 flex-shrink-0">
                            {entry.display_name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 dark:text-gray-100 text-sm">{entry.display_name}</p>
                            {entry.badges.length > 0 && (
                              <p className="text-xs text-gray-400">{entry.badges.slice(0, 2).join(' · ')}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-right tabular-nums">
                        <span className={`font-extrabold text-sm ${entry.total_pnl_pct >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                          {entry.total_pnl_pct >= 0 ? '+' : ''}{entry.total_pnl_pct.toFixed(2)}%
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right tabular-nums">
                        {entry.conquest_streak > 0 ? (
                          <span className="text-amber-500 font-bold">
                            🔥 {entry.conquest_streak}
                          </span>
                        ) : (
                          <span className="text-gray-300 dark:text-gray-600">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-right tabular-nums text-gray-600 dark:text-gray-400 font-medium">
                        {entry.win_rate > 0 ? `${entry.win_rate.toFixed(0)}%` : '—'}
                      </td>
                      <td className="px-4 py-3.5 text-right tabular-nums text-gray-500">
                        {entry.total_trades}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`text-xs font-bold ${RANK_COLORS[entry.doctrine_rank] ?? 'text-gray-400'}`}>
                          {entry.doctrine_rank}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full capitalize ${TIER_BADGE[entry.tier] ?? TIER_BADGE.citizen}`}>
                            {entry.tier}
                          </span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${entry.trading_mode === 'live' ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}`}>
                            {entry.trading_mode}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── CTA ── */}
        <div className="mt-12 bg-black dark:bg-gray-950 border border-gray-800 rounded-2xl p-8 text-center">
          <p className="text-sm font-extrabold text-white mb-2">Claim your spot on the board.</p>
          <p className="text-xs text-gray-400 mb-6 max-w-sm mx-auto">
            Start paper trading as a Citizen — free forever. Every trade builds your conquest streak and leaderboard rank.
          </p>
          <Link
            href="/enki"
            className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-500 text-black font-bold px-6 py-3 rounded-xl text-sm transition-all"
          >
            Start as Citizen — Free →
          </Link>
        </div>

      </div>
    </div>
  )
}
