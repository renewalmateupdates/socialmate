/**
 * Enki Strategy Engine — Shared Type System
 *
 * Every layer of the hedge fund OS speaks this type language.
 * Keep this file the single source of truth for all cross-module contracts.
 */

export type StrategyName = 'momentum' | 'mean_reversion' | 'sentiment' | 'volatility'
export type Side         = 'buy' | 'sell' | 'neutral'
export type Regime       = 'trending' | 'ranging' | 'volatile' | 'unknown'

// ─── Per-strategy output ──────────────────────────────────────────────────────

export interface StrategySignal {
  strategy:   StrategyName
  side:       Side
  confidence: number   // 0–100 internal scale
  regime:     Regime   // market regime this strategy detected
  signals:    string[] // human-readable labels for the trade reason
  active:     boolean  // false = disabled by decay system
}

// ─── Market context (fetched once per scan cycle) ────────────────────────────

export interface MarketContext {
  fearGreed: number | null
  congress:  Record<string, { buy: boolean; sell: boolean; members: number; latestDate?: string }>
  reddit:    Record<string, { rank: number; mentions: number }>
}

// ─── Signal Fusion output ─────────────────────────────────────────────────────

export interface FusedSignal {
  side:                  Side
  confidence:            number   // 0–100 fused composite score
  enkiConfidence:        number   // 0–10 (mapped for legacy scan compat)
  regime:                Regime
  signals:               string[] // merged strategy signal labels
  strategyBreakdown:     Record<StrategyName, StrategySignal>
  agreementCount:        number   // 0–4 strategies agreeing on direction
  antiCrowdingFlag:      boolean  // true = late crowded retail signal detected
  temporalEdgeMultiplier: number  // 0.7–1.3 (early vs late signal timing)
}

// ─── Per-strategy rolling performance (stored in enki_strategy_performance) ──

export interface StrategyPerformance {
  strategy:           StrategyName
  tradeCount:         number
  winCount:           number
  totalPnlPct:        number
  rollingSharpePeak:  number   // highest ever computed rolling Sharpe
  currentSharpe:      number
  decayScore:         number   // 0 = healthy, 1 = fully decayed
  isDisabled:         boolean
  disabledUntil:      string | null  // ISO timestamp
}

// ─── Alpha Decay Detection output ────────────────────────────────────────────

export interface DecayReport {
  hasDecay:               boolean
  affectedStrategies:     StrategyName[]
  allocationMultipliers:  Record<StrategyName, number>  // 0.0–1.0 per strategy
  emergencyMode:          boolean   // true = portfolio-level breach → all halt
  actions:                string[]  // log entries for what was triggered
}

// ─── Capital Allocation output ────────────────────────────────────────────────

export interface CapitalAllocation {
  positionSizePct:  number   // final % of portfolio to deploy
  strategyWeights:  Record<StrategyName, number>  // how each strategy contributed
  adjustmentReason: string
}

// ─── Global Risk Supervisor final verdict ────────────────────────────────────

export interface RiskDecision {
  action:           'APPROVE' | 'REDUCE' | 'REJECT'
  finalConfidence:  number   // 0–10 legacy compat (passed back into scan)
  finalSide:        Side
  positionSizePct:  number
  reason:           string
  signals:          string[] // final enriched signal list for trade reason field
}

// ─── Strategy weight vector (dynamic, adjusted by performance) ───────────────

export interface StrategyWeights {
  momentum:        number  // default 0.35
  mean_reversion:  number  // default 0.30
  sentiment:       number  // default 0.20
  volatility:      number  // default 0.15
}

export const DEFAULT_STRATEGY_WEIGHTS: StrategyWeights = {
  momentum:       0.35,
  mean_reversion: 0.30,
  sentiment:      0.20,
  volatility:     0.15,
}

// ─── Confidence thresholds by risk preset ────────────────────────────────────

export const CONFIDENCE_THRESHOLDS = {
  conservative: 80,  // 8/10 on legacy scale
  balanced:     60,  // 6/10
  aggressive:   40,  // 4/10
} as const

// ─── Decay detection thresholds ──────────────────────────────────────────────

export const DECAY_THRESHOLDS = {
  sharpePeakDecayRatio:  0.5,   // current < peak * 0.5 → flag
  minWinRateForActive:   0.38,  // win rate < 38% over last 20 trades → flag
  minTradesForDecay:     15,    // need at least this many trades before decay check
  disableDurationHours:  24,    // hours to disable a strategy after red decay
  emergencyDrawdownPct:  10,    // portfolio drawdown % that triggers emergency mode
}
