/**
 * Enki — Strategy Engine Orchestrator (Public API)
 *
 * This is the single entry point the scan loop calls.
 *
 * Phase coverage:
 *   Phase 1 — Multi-strategy engine (4 isolated strategies)
 *   Phase 2 — Capital allocation intelligence
 *   Phase 3 — Signal fusion + alpha synthesis
 *   Phase 4 — Alpha decay detection
 *   Phase 6 — Strategy orchestration (activation rules, conflict resolution)
 *   Phase 7 — Self-improving feedback (performance attribution on close)
 *   Phase 8 — Global risk supervisor
 *
 * Two public functions:
 *   enkiAnalyzeSymbol()  — per-symbol signal analysis (called in fetch-prices step)
 *   enkiMakeRiskDecision() — per-user risk/sizing gate (called in scan-user step)
 */

import { scoreMomentum, scoreMeanReversion, scoreSentiment, scoreVolatility } from './strategies'
import { fuseSignals } from './signal-fusion'
import { allocateCapital } from './capital-allocator'
import { detectDecay } from './decay-detector'
import { evaluateRisk } from './risk-supervisor'
import type {
  FusedSignal, RiskDecision, StrategyPerformance,
  MarketContext, StrategyName, StrategySignal,
} from './types'

export type { FusedSignal, RiskDecision, StrategyPerformance, MarketContext }

// ─────────────────────────────────────────────────────────────────────────────
// PHASE 6: Strategy Orchestration — activation rules per regime
// Each strategy has conditions under which it is eligible to fire.
// The orchestrator checks these before passing to the fusion engine.
// ─────────────────────────────────────────────────────────────────────────────

function applyOrchestrationRules(
  strategies: Record<StrategyName, StrategySignal>,
  strategyPerf: StrategyPerformance[],
): Record<StrategyName, StrategySignal> {
  const names = Object.keys(strategies) as StrategyName[]

  for (const name of names) {
    const sig  = strategies[name]
    const perf = strategyPerf.find(p => p.strategy === name)

    // Kill switch: strategy explicitly disabled by decay system
    if (perf?.isDisabled) {
      strategies[name] = { ...sig, active: false, side: 'neutral', confidence: 0 }
      continue
    }

    // Regime conflict resolution: momentum fires in trending, mean_reversion in ranging.
    // When they both fire in opposite directions, the one in its native regime wins.
    // The other gets suppressed to avoid confusion — handled in fusion weights.
    // (No hard suppression here — let fusion handle via regime multiplier.)
  }

  // Conflict resolution: if momentum(buy) and mean_reversion(sell) → zero both
  // This prevents the fusion engine from having to resolve a perfect 50/50 split.
  const momSide = strategies.momentum.side
  const mrSide  = strategies.mean_reversion.side
  if (momSide !== 'neutral' && mrSide !== 'neutral' && momSide !== mrSide) {
    // Suppress the weaker signal (lower confidence)
    if (strategies.momentum.confidence >= strategies.mean_reversion.confidence) {
      strategies.mean_reversion = { ...strategies.mean_reversion, side: 'neutral', confidence: 0 }
    } else {
      strategies.momentum = { ...strategies.momentum, side: 'neutral', confidence: 0 }
    }
  }

  return strategies
}

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC API 1: Per-symbol analysis (runs in fetch-prices step, shared across users)
// ─────────────────────────────────────────────────────────────────────────────

export function enkiAnalyzeSymbol(
  symbol:      string,
  closes:      number[],
  highs:       number[],
  lows:        number[],
  volumes:     number[],
  marketCtx:   MarketContext,
  strategyPerf: StrategyPerformance[] = [],
): FusedSignal {
  // ── Phase 1: Run 4 isolated strategies ────────────────────────────────────
  let strategies: Record<StrategyName, StrategySignal> = {
    momentum:       scoreMomentum(closes, highs, lows, volumes),
    mean_reversion: scoreMeanReversion(closes, highs, lows, volumes),
    sentiment:      scoreSentiment(symbol, marketCtx),
    volatility:     scoreVolatility(closes, highs, lows, volumes),
  }

  // ── Phase 6: Apply orchestration rules ────────────────────────────────────
  strategies = applyOrchestrationRules(strategies, strategyPerf)

  // ── Phase 3: Fuse signals into composite conviction ───────────────────────
  const fused = fuseSignals(strategies, symbol, marketCtx)

  return fused
}

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC API 2: Per-user risk & sizing decision (runs inside scan-user step)
// ─────────────────────────────────────────────────────────────────────────────

export function enkiMakeRiskDecision(
  fusedSignal:    FusedSignal,
  baseKellyPct:   number | null,
  doctrineSize:   number,
  strategyPerf:   StrategyPerformance[],
  portfolio: {
    totalDrawdownPct:  number
    dailyDrawdownPct:  number
    openPositionCount: number
    maxPositions:      number
  },
  riskPreset: string = 'balanced',
): RiskDecision {
  // ── Phase 4: Decay detection ───────────────────────────────────────────────
  const decayReport = detectDecay(strategyPerf, portfolio.totalDrawdownPct)

  // ── Phase 2: Capital allocation ────────────────────────────────────────────
  const allocation = allocateCapital(
    fusedSignal,
    baseKellyPct,
    doctrineSize,
    strategyPerf,
    decayReport,
    riskPreset,
  )

  // ── Phase 8: Global risk supervisor — final authority ─────────────────────
  const decision = evaluateRisk(
    fusedSignal,
    allocation,
    decayReport,
    portfolio,
    riskPreset,
  )

  return decision
}

// ─────────────────────────────────────────────────────────────────────────────
// PHASE 7: Self-Improving Feedback — Signal Attribution on Trade Close
// Called after a position closes to attribute P&L to the strategies
// that were active when the trade was opened.
// ─────────────────────────────────────────────────────────────────────────────

export interface TradeAttribution {
  strategy:   StrategyName
  pnlPct:     number
  win:        boolean
  confidence: number
}

export function enkiAttributeTrade(
  strategyBreakdown: Record<StrategyName, StrategySignal> | null | undefined,
  tradeSide:         'buy' | 'sell',
  pnlPct:            number,
): TradeAttribution[] {
  if (!strategyBreakdown) return []

  const win = pnlPct > 0
  const attributions: TradeAttribution[] = []

  for (const [name, sig] of Object.entries(strategyBreakdown) as [StrategyName, StrategySignal][]) {
    // Only attribute to strategies that agreed with the actual trade direction
    if (sig.side !== tradeSide || !sig.active) continue

    attributions.push({
      strategy:   name,
      pnlPct,
      win,
      confidence: sig.confidence,
    })
  }

  return attributions
}
