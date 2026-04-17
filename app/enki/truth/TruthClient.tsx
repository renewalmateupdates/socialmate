'use client'

import { useEffect, useState } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface StratStats {
  strategy: 'momentum' | 'mean_reversion'
  total_trades: number
  wins: number
  losses: number
  win_rate: number
  avg_win_pct: number
  avg_loss_pct: number
  profit_factor: number | null
  total_pnl_pct: number
  high_conf_trades: number
  high_conf_wins: number
  medium_conf_trades: number
  medium_conf_wins: number
  congress_trades: number
  congress_wins: number
  max_consecutive_losses: number
}

interface OpenPos {
  id: string
  symbol: string
  strategy: string
  confidence: string
  congressional_boost: boolean
  entry_price: number
  stop_price: number
  tp1_price: number
  tp2_price: number
  tp1_hit: boolean
  tp2_hit: boolean
  remaining_qty: number
  position_usd: number
  entry_time: string
}

interface ClosedTrade {
  id: string
  symbol: string
  strategy: string
  confidence: string
  pnl_pct: number | null
  pnl_dollar: number | null
  win: boolean | null
  exit_reason: string | null
  entry_time: string
  exit_time: string | null
  tp1_hit: boolean
  tp2_hit: boolean
  stop_loss_hit: boolean
  trailing_stop_hit: boolean
}

interface EquityPoint {
  date: string
  pnl_pct: number
  cumulative: number
}

interface TruthData {
  stats: StratStats[]
  open: OpenPos[]
  closed: ClosedTrade[]
  equityCurve: EquityPoint[]
  spyReturn3mo: number | null
  progress: { momentum: number; mean_reversion: number; target: number }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function pct(v: number | null | undefined, decimals = 1) {
  if (v == null) return '—'
  return `${v >= 0 ? '+' : ''}${v.toFixed(decimals)}%`
}

function badge(label: string, color: string) {
  return (
    <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded ${color}`}>
      {label}
    </span>
  )
}

function ProgressBar({ value, target }: { value: number; target: number }) {
  const pct = Math.min(100, (value / target) * 100)
  const done = value >= target
  return (
    <div className="mt-1">
      <div className="flex justify-between text-xs text-zinc-400 mb-1">
        <span>{value} trades</span>
        <span>{done ? '✓ Sufficient sample' : `${target - value} more needed`}</span>
      </div>
      <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${done ? 'bg-emerald-500' : 'bg-violet-500'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

// ─── Strategy card ────────────────────────────────────────────────────────────

function StratCard({ s, progress }: { s: StratStats; progress: number }) {
  const label    = s.strategy === 'momentum' ? 'Momentum' : 'Mean Reversion'
  const hrWin    = s.high_conf_trades ? ((s.high_conf_wins / s.high_conf_trades) * 100).toFixed(1) : '—'
  const mrWin    = s.medium_conf_trades ? ((s.medium_conf_wins / s.medium_conf_trades) * 100).toFixed(1) : '—'
  const cgWin    = s.congress_trades ? ((s.congress_wins / s.congress_trades) * 100).toFixed(1) : '—'
  const hasSample = s.total_trades >= 50

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-bold text-white">{label}</h3>
        {hasSample
          ? badge('Sample ready', 'bg-emerald-900/60 text-emerald-400')
          : badge('Collecting data', 'bg-violet-900/60 text-violet-400')}
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4 text-center">
        <div>
          <div className="text-xl font-bold text-white">{(s.win_rate * 100).toFixed(1)}%</div>
          <div className="text-xs text-zinc-500">Win Rate</div>
        </div>
        <div>
          <div className={`text-xl font-bold ${s.profit_factor && s.profit_factor >= 1.5 ? 'text-emerald-400' : 'text-red-400'}`}>
            {s.profit_factor ? s.profit_factor.toFixed(2) : '—'}
          </div>
          <div className="text-xs text-zinc-500">Profit Factor</div>
        </div>
        <div>
          <div className={`text-xl font-bold ${s.total_pnl_pct >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {pct(s.total_pnl_pct)}
          </div>
          <div className="text-xs text-zinc-500">Total P&amp;L</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs text-zinc-400 mb-4">
        <div>Avg Win: <span className="text-emerald-400 font-semibold">{pct(s.avg_win_pct)}</span></div>
        <div>Avg Loss: <span className="text-red-400 font-semibold">{pct(s.avg_loss_pct)}</span></div>
        <div>Trades: <span className="text-white font-semibold">{s.total_trades}</span></div>
        <div>Max Consec. L: <span className="text-red-400 font-semibold">{s.max_consecutive_losses}</span></div>
      </div>

      <div className="border-t border-zinc-800 pt-3 space-y-1 text-xs text-zinc-400">
        <div className="flex justify-between">
          <span>HIGH conf ({s.high_conf_trades} trades)</span>
          <span className="font-semibold text-white">{hrWin}% WR</span>
        </div>
        <div className="flex justify-between">
          <span>MEDIUM conf ({s.medium_conf_trades} trades)</span>
          <span className="font-semibold text-white">{mrWin}% WR</span>
        </div>
        <div className="flex justify-between">
          <span>Congress boost ({s.congress_trades} trades)</span>
          <span className="font-semibold text-white">{cgWin}% WR</span>
        </div>
      </div>

      <div className="mt-4">
        <div className="text-xs text-zinc-500 mb-1">Experiment progress (50 trades needed)</div>
        <ProgressBar value={progress} target={50} />
      </div>
    </div>
  )
}

// ─── Equity curve (sparkline SVG) ─────────────────────────────────────────────

function EquityCurve({ points }: { points: EquityPoint[] }) {
  if (points.length < 2) {
    return (
      <div className="flex items-center justify-center h-32 text-zinc-600 text-sm">
        Not enough trades yet
      </div>
    )
  }
  const vals   = points.map(p => p.cumulative)
  const min    = Math.min(0, ...vals)
  const max    = Math.max(0, ...vals)
  const range  = max - min || 1
  const W = 500, H = 100
  const pts = points.map((p, i) => {
    const x = (i / (points.length - 1)) * W
    const y = H - ((p.cumulative - min) / range) * H
    return `${x},${y}`
  }).join(' ')
  const zeroY = H - ((0 - min) / range) * H
  const positive = points[points.length - 1].cumulative >= 0

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-32" preserveAspectRatio="none">
      <line x1="0" y1={zeroY} x2={W} y2={zeroY} stroke="#3f3f46" strokeWidth="1" strokeDasharray="4 4" />
      <polyline
        points={pts}
        fill="none"
        stroke={positive ? '#34d399' : '#f87171'}
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function TruthClient() {
  const [data, setData]     = useState<TruthData | null>(null)
  const [error, setError]   = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/enki/truth')
      .then(r => r.ok ? r.json() : Promise.reject(r.statusText))
      .then(setData)
      .catch(e => setError(String(e)))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh] text-zinc-500 text-sm">
      Loading…
    </div>
  )
  if (error) return (
    <div className="flex items-center justify-center min-h-[60vh] text-red-400 text-sm">
      {error}
    </div>
  )
  if (!data) return null

  const { stats, open, closed, equityCurve, spyReturn3mo, progress } = data
  const totalClosed = closed.length
  const totalCumPnl = equityCurve.length ? equityCurve[equityCurve.length - 1].cumulative : 0
  const beatsSpy    = spyReturn3mo != null && totalCumPnl > spyReturn3mo

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">

      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-2xl font-bold text-white">Truth Mode</h1>
          {badge('Parallel Experiment', 'bg-violet-900/60 text-violet-300')}
        </div>
        <p className="text-sm text-zinc-400 max-w-2xl">
          Two strategies only. No fusion, no magic numbers. Goal: determine whether any real edge exists
          before adding complexity. Conclusions require ≥50 trades per strategy.
        </p>
      </div>

      {/* Rules reminder */}
      <div className="bg-amber-950/40 border border-amber-800/50 rounded-lg px-4 py-3 text-xs text-amber-300 space-y-1">
        <div className="font-bold text-amber-200 mb-1">NON-NEGOTIABLE EXPERIMENT RULES</div>
        <div>• No parameter changes while data is collecting — if you change anything, reset the dataset</div>
        <div>• No new signals added mid-experiment</div>
        <div>• Minimum 50 trades per strategy before drawing any conclusions</div>
      </div>

      {/* Summary bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-white">{totalClosed}</div>
          <div className="text-xs text-zinc-500 mt-1">Closed Trades</div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 text-center">
          <div className={`text-2xl font-bold ${totalCumPnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {pct(totalCumPnl)}
          </div>
          <div className="text-xs text-zinc-500 mt-1">Cumulative P&amp;L</div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 text-center">
          <div className={`text-2xl font-bold ${spyReturn3mo == null ? 'text-zinc-400' : beatsSpy ? 'text-emerald-400' : 'text-red-400'}`}>
            {spyReturn3mo != null ? pct(spyReturn3mo) : '—'}
          </div>
          <div className="text-xs text-zinc-500 mt-1">SPY 3-mo (baseline)</div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-white">{open.length}</div>
          <div className="text-xs text-zinc-500 mt-1">Open Positions</div>
        </div>
      </div>

      {/* Equity curve */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-white">Equity Curve</h2>
          {spyReturn3mo != null && (
            <span className={`text-xs font-semibold ${beatsSpy ? 'text-emerald-400' : 'text-red-400'}`}>
              {beatsSpy ? '▲ Beating SPY' : '▼ Below SPY'}
            </span>
          )}
        </div>
        <EquityCurve points={equityCurve} />
      </div>

      {/* Per-strategy cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {(['momentum', 'mean_reversion'] as const).map(strat => {
          const s = stats.find(x => x.strategy === strat)
          if (!s) {
            return (
              <div key={strat} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 text-zinc-500 text-sm flex items-center justify-center min-h-[200px]">
                {strat === 'momentum' ? 'Momentum' : 'Mean Reversion'} — no data yet
              </div>
            )
          }
          return (
            <StratCard
              key={strat}
              s={s}
              progress={strat === 'momentum' ? progress.momentum : progress.mean_reversion}
            />
          )
        })}
      </div>

      {/* Open positions */}
      {open.length > 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white mb-3">Open Positions ({open.length})</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-zinc-300">
              <thead>
                <tr className="text-zinc-500 border-b border-zinc-800">
                  <th className="text-left pb-2 pr-3">Symbol</th>
                  <th className="text-left pb-2 pr-3">Strategy</th>
                  <th className="text-left pb-2 pr-3">Conf</th>
                  <th className="text-right pb-2 pr-3">Entry</th>
                  <th className="text-right pb-2 pr-3">Stop</th>
                  <th className="text-right pb-2 pr-3">TP1</th>
                  <th className="text-right pb-2 pr-3">TP2</th>
                  <th className="text-left pb-2">Flags</th>
                </tr>
              </thead>
              <tbody>
                {open.map(p => (
                  <tr key={p.id} className="border-b border-zinc-800/50">
                    <td className="py-2 pr-3 font-bold text-white">{p.symbol}</td>
                    <td className="py-2 pr-3 capitalize">{p.strategy.replace('_', ' ')}</td>
                    <td className="py-2 pr-3">
                      <span className={`font-semibold ${p.confidence === 'HIGH' ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {p.confidence}
                      </span>
                    </td>
                    <td className="py-2 pr-3 text-right">${p.entry_price.toFixed(2)}</td>
                    <td className="py-2 pr-3 text-right text-red-400">${p.stop_price.toFixed(2)}</td>
                    <td className={`py-2 pr-3 text-right ${p.tp1_hit ? 'text-emerald-400 line-through' : ''}`}>
                      ${p.tp1_price.toFixed(2)}
                    </td>
                    <td className={`py-2 pr-3 text-right ${p.tp2_hit ? 'text-emerald-400 line-through' : ''}`}>
                      ${p.tp2_price.toFixed(2)}
                    </td>
                    <td className="py-2 flex gap-1 flex-wrap">
                      {p.tp1_hit && badge('TP1 ✓', 'bg-emerald-900/50 text-emerald-400')}
                      {p.tp2_hit && badge('TP2 ✓', 'bg-emerald-900/50 text-emerald-400')}
                      {p.congressional_boost && badge('Congress', 'bg-blue-900/50 text-blue-400')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent closed trades */}
      {closed.length > 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white mb-3">
            Closed Trades ({closed.length})
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-zinc-300">
              <thead>
                <tr className="text-zinc-500 border-b border-zinc-800">
                  <th className="text-left pb-2 pr-3">Symbol</th>
                  <th className="text-left pb-2 pr-3">Strategy</th>
                  <th className="text-left pb-2 pr-3">Conf</th>
                  <th className="text-right pb-2 pr-3">P&amp;L %</th>
                  <th className="text-right pb-2 pr-3">P&amp;L $</th>
                  <th className="text-left pb-2 pr-3">Exit Reason</th>
                  <th className="text-left pb-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {[...closed].reverse().slice(0, 50).map(t => (
                  <tr key={t.id} className="border-b border-zinc-800/50">
                    <td className="py-2 pr-3 font-bold text-white">{t.symbol}</td>
                    <td className="py-2 pr-3 capitalize">{t.strategy.replace('_', ' ')}</td>
                    <td className="py-2 pr-3">
                      <span className={`font-semibold ${t.confidence === 'HIGH' ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {t.confidence}
                      </span>
                    </td>
                    <td className={`py-2 pr-3 text-right font-semibold ${t.win ? 'text-emerald-400' : 'text-red-400'}`}>
                      {pct(t.pnl_pct)}
                    </td>
                    <td className={`py-2 pr-3 text-right ${t.win ? 'text-emerald-400' : 'text-red-400'}`}>
                      {t.pnl_dollar != null ? `$${t.pnl_dollar.toFixed(2)}` : '—'}
                    </td>
                    <td className="py-2 pr-3 text-zinc-400">{t.exit_reason ?? '—'}</td>
                    <td className="py-2 text-zinc-500">
                      {t.exit_time ? new Date(t.exit_time).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {closed.length === 0 && open.length === 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-10 text-center text-zinc-500">
          <div className="text-4xl mb-3">🔬</div>
          <div className="text-sm font-semibold text-zinc-400 mb-1">Experiment not started</div>
          <div className="text-xs">Enable Truth Mode in your Enki settings to begin collecting data.</div>
        </div>
      )}
    </div>
  )
}
