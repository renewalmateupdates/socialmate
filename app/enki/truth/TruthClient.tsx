'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'

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

interface SpyCurvePoint {
  cumulative: number
}

interface TruthData {
  stats: StratStats[]
  open: OpenPos[]
  closed: ClosedTrade[]
  equityCurve: EquityPoint[]
  spyReturn3mo: number | null
  spyCurve: SpyCurvePoint[]
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
  const fill = Math.min(100, (value / target) * 100)
  const done = value >= target
  return (
    <div className="mt-1">
      <div className="flex justify-between text-xs text-zinc-400 mb-1">
        <span>{value} / {target} trades</span>
        <span>{done ? '✓ Sufficient sample' : `${target - value} more needed`}</span>
      </div>
      <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${done ? 'bg-emerald-500' : 'bg-violet-500'}`}
          style={{ width: `${fill}%` }}
        />
      </div>
    </div>
  )
}

// ─── Sanity warnings ──────────────────────────────────────────────────────────

function SanityWarnings({ stats, totalClosed }: { stats: StratStats[]; totalClosed: number }) {
  const warnings: string[] = []

  if (totalClosed < 20) {
    warnings.push('Not enough data yet — results are not statistically meaningful')
  }

  for (const s of stats) {
    if (s.total_trades > 0 && s.total_trades < 15) {
      const name = s.strategy === 'momentum' ? 'Momentum' : 'Mean Reversion'
      warnings.push(`Low sample size for ${name} (${s.total_trades} trades)`)
    }

    // If HIGH and MEDIUM win rates are within 5pp of each other, confidence scoring isn't validated
    if (s.high_conf_trades >= 5 && s.medium_conf_trades >= 5) {
      const highWR   = s.high_conf_wins / s.high_conf_trades
      const mediumWR = s.medium_conf_wins / s.medium_conf_trades
      if (Math.abs(highWR - mediumWR) < 0.05) {
        const name = s.strategy === 'momentum' ? 'Momentum' : 'Mean Reversion'
        warnings.push(`${name}: Confidence scoring not yet validated — HIGH and MEDIUM win rates are similar`)
      }
    }
  }

  if (warnings.length === 0) return null

  return (
    <div className="space-y-2">
      {warnings.map((w, i) => (
        <div key={i} className="flex items-start gap-2 bg-amber-950/40 border border-amber-800/50 rounded-lg px-4 py-3 text-xs text-amber-300">
          <span className="shrink-0 mt-0.5">⚠️</span>
          <span>{w}</span>
        </div>
      ))}
    </div>
  )
}

// ─── Strategy card ────────────────────────────────────────────────────────────

function StratCard({ s, progress }: { s: StratStats; progress: number }) {
  const label      = s.strategy === 'momentum' ? 'Momentum' : 'Mean Reversion'
  const hrWin      = s.high_conf_trades ? ((s.high_conf_wins / s.high_conf_trades) * 100).toFixed(1) : '—'
  const mrWin      = s.medium_conf_trades ? ((s.medium_conf_wins / s.medium_conf_trades) * 100).toFixed(1) : '—'
  const cgWin      = s.congress_trades ? ((s.congress_wins / s.congress_trades) * 100).toFixed(1) : '—'
  const hasSample  = s.total_trades >= 50
  const lowSample  = s.total_trades > 0 && s.total_trades < 15

  return (
    <div className={`bg-zinc-900 border rounded-xl p-5 ${lowSample ? 'border-amber-800/60' : 'border-zinc-800'}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-bold text-white">{label}</h3>
        {hasSample
          ? badge('Sample ready', 'bg-emerald-900/60 text-emerald-400')
          : lowSample
            ? badge('Low sample', 'bg-amber-900/60 text-amber-400')
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

// ─── Equity curve with SPY overlay ───────────────────────────────────────────

function EquityCurve({ points, spyCurve }: { points: EquityPoint[]; spyCurve: SpyCurvePoint[] }) {
  if (points.length < 2) {
    return (
      <div className="flex items-center justify-center h-32 text-zinc-600 text-sm">
        Not enough trades yet
      </div>
    )
  }

  const W = 500, H = 100

  const enkiVals = points.map(p => p.cumulative)
  const spyVals  = spyCurve.map(p => p.cumulative)
  const allVals  = [...enkiVals, ...spyVals, 0]
  const min      = Math.min(...allVals)
  const max      = Math.max(...allVals)
  const range    = max - min || 1

  const toY = (v: number) => H - ((v - min) / range) * H
  const zeroY = toY(0)

  const enkiPts = points.map((p, i) => `${(i / (points.length - 1)) * W},${toY(p.cumulative)}`).join(' ')
  const spyPts  = spyCurve.length >= 2
    ? spyCurve.map((p, i) => `${(i / (spyCurve.length - 1)) * W},${toY(p.cumulative)}`).join(' ')
    : null

  const positive = enkiVals[enkiVals.length - 1] >= 0

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-32" preserveAspectRatio="none">
        {/* Zero line */}
        <line x1="0" y1={zeroY} x2={W} y2={zeroY} stroke="#3f3f46" strokeWidth="1" strokeDasharray="4 4" />
        {/* SPY baseline */}
        {spyPts && (
          <polyline
            points={spyPts}
            fill="none"
            stroke="#6366f1"
            strokeWidth="1.5"
            strokeLinejoin="round"
            strokeDasharray="6 3"
            opacity="0.6"
          />
        )}
        {/* Enki equity curve */}
        <polyline
          points={enkiPts}
          fill="none"
          stroke={positive ? '#34d399' : '#f87171'}
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
      {spyPts && (
        <div className="flex items-center gap-4 mt-2 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-5 h-0.5 bg-emerald-400"></span>
            Truth Mode
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-5 h-0.5 bg-indigo-400 opacity-60" style={{ background: 'repeating-linear-gradient(to right, #6366f1 0, #6366f1 4px, transparent 4px, transparent 7px)' }}></span>
            SPY (buy &amp; hold)
          </span>
        </div>
      )}
    </div>
  )
}

// ─── CSV export ───────────────────────────────────────────────────────────────

function exportCSV(closed: ClosedTrade[]) {
  const headers = ['id', 'symbol', 'strategy', 'confidence', 'congressional_boost', 'entry_time', 'exit_time', 'exit_reason', 'pnl_pct', 'pnl_dollar', 'win', 'tp1_hit', 'tp2_hit', 'stop_loss_hit', 'trailing_stop_hit']
  const rows = closed.map(t => [
    t.id, t.symbol, t.strategy, t.confidence,
    t.tp1_hit || t.tp2_hit || t.stop_loss_hit || t.trailing_stop_hit ? 'true' : 'false',
    t.entry_time, t.exit_time ?? '', t.exit_reason ?? '',
    t.pnl_pct ?? '', t.pnl_dollar ?? '', t.win ?? '',
    t.tp1_hit, t.tp2_hit, t.stop_loss_hit, t.trailing_stop_hit,
  ])
  const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `enki-truth-trades-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// ─── Truth Mode OFF hero ──────────────────────────────────────────────────────

function TruthModeOffHero({ onStart, starting }: { onStart: () => void; starting: boolean }) {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Page header */}
      <div className="flex items-center gap-3 mb-2">
        <h1 className="text-2xl font-bold text-white">Truth Mode</h1>
        {badge('Parallel Experiment', 'bg-violet-900/60 text-violet-300')}
      </div>

      {/* Hero CTA */}
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-8 sm:p-10 text-center space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-zinc-800 border border-zinc-700 text-3xl mx-auto">
          🔬
        </div>

        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Truth Mode is not running</h2>
          <p className="text-sm text-zinc-400 max-w-xl mx-auto leading-relaxed">
            Truth Mode runs a simplified two-strategy trading system in parallel to validate real performance.
            Results are recorded separately and do not affect your main portfolio.
            Parameters lock once started to preserve data integrity.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-500 shrink-0" />
            Momentum strategy
          </span>
          <span className="hidden sm:block text-zinc-700">·</span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-500 shrink-0" />
            Mean Reversion strategy
          </span>
          <span className="hidden sm:block text-zinc-700">·</span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
            50 trades minimum for valid results
          </span>
        </div>

        <button
          onClick={onStart}
          disabled={starting}
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl transition-colors min-h-[44px]"
        >
          {starting ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Starting…
            </>
          ) : (
            'Start Truth Mode'
          )}
        </button>

        <p className="text-xs text-zinc-600 max-w-sm mx-auto">
          The scan runs every 15 minutes. Your Risk Profile and Position Size settings will be locked while Truth Mode is active.
        </p>
      </div>

      {/* Rules reminder */}
      <div className="bg-amber-950/40 border border-amber-800/50 rounded-lg px-4 py-3 text-xs text-amber-300 space-y-1">
        <div className="font-bold text-amber-200 mb-1">NON-NEGOTIABLE EXPERIMENT RULES</div>
        <div>• No parameter changes while data is collecting — if you change anything, reset the dataset</div>
        <div>• No new signals added mid-experiment</div>
        <div>• Minimum 50 trades per strategy before drawing any conclusions</div>
      </div>
    </div>
  )
}

// ─── Truth Mode ON status bar ─────────────────────────────────────────────────

function TruthModeRunningBar({ onStop, stopping }: { onStop: () => void; stopping: boolean }) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-emerald-950/40 border border-emerald-800/50 rounded-xl px-4 py-3">
      <div className="flex items-center gap-3">
        {/* Pulsing green dot */}
        <span className="relative flex h-3 w-3 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
        </span>
        <span className="text-sm font-semibold text-emerald-300">
          Truth Mode Running
        </span>
        <span className="text-xs text-emerald-600 hidden sm:inline">— scanning every 15 minutes</span>
      </div>
      <button
        onClick={onStop}
        disabled={stopping}
        className="shrink-0 px-4 py-2 text-xs font-semibold text-zinc-300 border border-zinc-600 hover:border-zinc-500 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors min-h-[44px]"
      >
        {stopping ? 'Stopping…' : 'Stop Truth Mode'}
      </button>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function TruthClient() {
  const [data, setData]             = useState<TruthData | null>(null)
  const [error, setError]           = useState<string | null>(null)
  const [loading, setLoading]       = useState(true)
  const [truthEnabled, setTruthEnabled] = useState<boolean | null>(null)
  const [toggling, setToggling]     = useState(false)

  const loadAll = useCallback(async () => {
    try {
      const [truthRes, profileRes] = await Promise.all([
        fetch('/api/enki/truth'),
        fetch('/api/enki/profile'),
      ])
      if (!truthRes.ok) throw new Error(truthRes.statusText)
      const [truthJson, profileJson] = await Promise.all([
        truthRes.json(),
        profileRes.json(),
      ])
      setData(truthJson)
      setTruthEnabled(Boolean(profileJson.profile?.truth_mode_enabled))
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  async function handleStart() {
    setToggling(true)
    try {
      await fetch('/api/enki/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ truth_mode_enabled: true }),
      })
      setTruthEnabled(true)
    } catch (e) {
      console.error('Truth mode start error:', e)
    } finally {
      setToggling(false)
    }
  }

  async function handleStop() {
    if (!confirm('Stopping Truth Mode will reset your experiment. All recorded trades will be cleared and you will start fresh next time. Are you sure?')) {
      return
    }
    setToggling(true)
    try {
      await fetch('/api/enki/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ truth_mode_enabled: false }),
      })
      setTruthEnabled(false)
    } catch (e) {
      console.error('Truth mode stop error:', e)
    } finally {
      setToggling(false)
    }
  }

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

  // Show OFF hero when truth mode is disabled
  if (truthEnabled === false) {
    return <TruthModeOffHero onStart={handleStart} starting={toggling} />
  }

  if (!data) return null

  const { stats, open, closed, equityCurve, spyReturn3mo, spyCurve, progress } = data
  const totalClosed = closed.length
  const totalCumPnl = equityCurve.length ? equityCurve[equityCurve.length - 1].cumulative : 0
  const beatsSpy    = spyReturn3mo != null && totalCumPnl > spyReturn3mo

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between">
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
        {closed.length > 0 && (
          <button
            onClick={() => exportCSV(closed)}
            className="shrink-0 ml-4 px-3 py-2 text-xs font-semibold text-zinc-300 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg transition-colors"
          >
            Export CSV
          </button>
        )}
      </div>

      {/* Running status bar with Stop button */}
      <TruthModeRunningBar onStop={handleStop} stopping={toggling} />

      {/* Rules reminder */}
      <div className="bg-amber-950/40 border border-amber-800/50 rounded-lg px-4 py-3 text-xs text-amber-300 space-y-1">
        <div className="font-bold text-amber-200 mb-1">NON-NEGOTIABLE EXPERIMENT RULES</div>
        <div>• No parameter changes while data is collecting — if you change anything, reset the dataset</div>
        <div>• No new signals added mid-experiment</div>
        <div>• Minimum 50 trades per strategy before drawing any conclusions</div>
      </div>

      {/* Sanity warnings */}
      <SanityWarnings stats={stats} totalClosed={totalClosed} />

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

      {/* Progress bars */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-white mb-4">Experiment Progress</h2>
        <div className="space-y-4">
          <div>
            <div className="text-xs text-zinc-400 mb-1">Momentum</div>
            <ProgressBar value={progress.momentum} target={50} />
          </div>
          <div>
            <div className="text-xs text-zinc-400 mb-1">Mean Reversion</div>
            <ProgressBar value={progress.mean_reversion} target={50} />
          </div>
        </div>
      </div>

      {/* Equity curve */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-white">Equity Curve vs SPY</h2>
          {spyReturn3mo != null && (
            <span className={`text-xs font-semibold ${beatsSpy ? 'text-emerald-400' : 'text-red-400'}`}>
              {beatsSpy ? '▲ Beating SPY' : '▼ Below SPY'}
            </span>
          )}
        </div>
        <EquityCurve points={equityCurve} spyCurve={spyCurve} />
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

      {/* Closed trades */}
      {closed.length > 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-white">Closed Trades ({closed.length})</h2>
          </div>
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

      {/* Empty state — running but no trades yet */}
      {closed.length === 0 && open.length === 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-10 text-center text-zinc-500">
          <div className="text-4xl mb-3">🔬</div>
          <div className="text-sm font-semibold text-zinc-400 mb-1">Waiting for first signals</div>
          <div className="text-xs">Truth Mode is running. The scanner checks for signals every 15 minutes during market hours.</div>
        </div>
      )}
    </div>
  )
}
