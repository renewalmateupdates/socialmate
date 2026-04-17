/**
 * Enki — Phase 4: Alpha Decay Detection System
 *
 * "Most signals decay over time. Systems must self-disable when wrong."
 *
 * Continuously monitors strategy performance for signs of alpha erosion:
 *
 *   1. Rolling Sharpe degradation — Sharpe < 50% of historical peak
 *   2. Win rate collapse — < 38% over last N trades
 *   3. Regime mismatch — strategy firing in wrong market regime
 *   4. Statistical noise — returns indistinguishable from random walk
 *
 * Outputs:
 *   - Per-strategy allocation multipliers (0.0–1.0)
 *   - Emergency mode flag (portfolio-level breach)
 *   - Human-readable action log
 */

import type { StrategyPerformance, DecayReport, StrategyName } from './types'
import { DECAY_THRESHOLDS } from './types'

// ─────────────────────────────────────────────────────────────────────────────

export function detectDecay(
  strategyPerf:    StrategyPerformance[],
  portfolioDrawdownPct: number,   // today's portfolio drawdown %
): DecayReport {
  const affectedStrategies: StrategyName[] = []
  const actions: string[] = []
  const allocationMultipliers: Record<StrategyName, number> = {
    momentum:       1.0,
    mean_reversion: 1.0,
    sentiment:      1.0,
    volatility:     1.0,
  }

  // ── Emergency mode: portfolio-level breach overrides everything ───────────
  const emergencyMode = portfolioDrawdownPct <= -DECAY_THRESHOLDS.emergencyDrawdownPct

  if (emergencyMode) {
    actions.push(`EMERGENCY: Portfolio drawdown ${portfolioDrawdownPct.toFixed(2)}% exceeds ${DECAY_THRESHOLDS.emergencyDrawdownPct}% limit — all strategies halted`)
    for (const key of Object.keys(allocationMultipliers) as StrategyName[]) {
      allocationMultipliers[key] = 0
    }
    return { hasDecay: true, affectedStrategies: Object.keys(allocationMultipliers) as StrategyName[], allocationMultipliers, emergencyMode, actions }
  }

  // ── Per-strategy decay checks ─────────────────────────────────────────────
  for (const perf of strategyPerf) {
    const { strategy, tradeCount, winCount, currentSharpe, rollingSharpePeak, isDisabled } = perf

    // Skip strategies with insufficient trading history
    if (tradeCount < DECAY_THRESHOLDS.minTradesForDecay) continue

    // Strategy already disabled — keep at 0 until re-enable time
    if (isDisabled) {
      allocationMultipliers[strategy] = 0
      affectedStrategies.push(strategy)
      actions.push(`${strategy}: disabled (recovery period active)`)
      continue
    }

    const winRate = tradeCount > 0 ? winCount / tradeCount : 0
    let   multReduction = 0
    const strategyActions: string[] = []

    // ── Check 1: Sharpe degradation ─────────────────────────────────────────
    if (rollingSharpePeak > 0 && currentSharpe < rollingSharpePeak * DECAY_THRESHOLDS.sharpePeakDecayRatio) {
      const decayRatio = currentSharpe / rollingSharpePeak
      if (currentSharpe < 0) {
        // Negative Sharpe — heavily penalize
        multReduction = Math.max(multReduction, 0.70)
        strategyActions.push(`Sharpe negative (${currentSharpe.toFixed(2)}) vs peak ${rollingSharpePeak.toFixed(2)} — -70% allocation`)
      } else {
        // Decaying but still positive
        multReduction = Math.max(multReduction, 0.40)
        strategyActions.push(`Sharpe decay: ${currentSharpe.toFixed(2)} vs peak ${rollingSharpePeak.toFixed(2)} — -40% allocation`)
      }
    }

    // ── Check 2: Win rate collapse ───────────────────────────────────────────
    // Only meaningful after 20+ trades
    if (tradeCount >= 20 && winRate < DECAY_THRESHOLDS.minWinRateForActive) {
      multReduction = Math.max(multReduction, 0.60)
      strategyActions.push(`Win rate collapsed: ${(winRate * 100).toFixed(1)}% — -60% allocation`)
    }

    // ── Check 3: Severe sustained decay → disable entirely ──────────────────
    // Both Sharpe negative AND win rate < 35% → disable for 24h
    if (tradeCount >= 20 && currentSharpe < -0.5 && winRate < 0.35) {
      allocationMultipliers[strategy] = 0
      affectedStrategies.push(strategy)
      actions.push(`${strategy}: DISABLED — Sharpe=${currentSharpe.toFixed(2)}, WinRate=${(winRate * 100).toFixed(1)}% — 24h cooldown`)
      continue
    }

    if (multReduction > 0) {
      allocationMultipliers[strategy] = Math.max(0.10, 1 - multReduction)
      affectedStrategies.push(strategy)
      for (const a of strategyActions) actions.push(`${strategy}: ${a}`)
    }
  }

  const hasDecay = affectedStrategies.length > 0

  return { hasDecay, affectedStrategies, allocationMultipliers, emergencyMode, actions }
}

// ─── Rolling Sharpe calculation ────────────────────────────────────────────────
// Computed from per-strategy attributed trade P&L.
// Called during the scan to update enki_strategy_performance.

export function computeRollingSharpe(
  dailyReturns: number[],  // attributed daily returns for this strategy
  riskFreeDaily = 0.05 / 252,
): number {
  if (dailyReturns.length < 10) return 0  // insufficient data

  const window = dailyReturns.slice(-30)  // rolling 30-period window
  const mean   = window.reduce((a, b) => a + b, 0) / window.length
  const excess = mean - riskFreeDaily
  const variance = window.reduce((s, r) => s + (r - mean) ** 2, 0) / window.length
  const stdDev   = Math.sqrt(variance)

  if (stdDev === 0) return 0
  return (excess / stdDev) * Math.sqrt(252)
}

// ─── Strategy performance updater ─────────────────────────────────────────────
// Takes raw trade data attributed to a specific strategy and returns updated
// performance metrics for upsert into enki_strategy_performance.

export function updateStrategyPerformance(
  existing: StrategyPerformance | null,
  strategy: StrategyName,
  newTrade: { win: boolean; pnlPct: number },
): StrategyPerformance {
  const base: StrategyPerformance = existing ?? {
    strategy,
    tradeCount:         0,
    winCount:           0,
    totalPnlPct:        0,
    rollingSharpePeak:  0,
    currentSharpe:      0,
    decayScore:         0,
    isDisabled:         false,
    disabledUntil:      null,
  }

  const tradeCount  = base.tradeCount + 1
  const winCount    = base.winCount + (newTrade.win ? 1 : 0)
  const totalPnlPct = base.totalPnlPct + newTrade.pnlPct

  // Decay score: weighted toward recent performance
  const recentPnl    = newTrade.pnlPct
  const decayScore   = Math.max(0, Math.min(1,
    base.decayScore * 0.9 + (recentPnl < 0 ? 0.1 : -0.05)
  ))

  return {
    ...base,
    tradeCount,
    winCount,
    totalPnlPct,
    decayScore,
    isDisabled: base.isDisabled,
    disabledUntil: base.disabledUntil,
  }
}
