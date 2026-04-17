/**
 * Enki — Phase 3: Signal Fusion + Alpha Synthesis Engine
 *
 * "Edge comes from combinations, not indicators."
 *
 * Takes 4 isolated strategy signals and produces ONE composite conviction score.
 *
 * Layers applied (in order):
 *   1. Weighted vote (confidence × weight per strategy)
 *   2. Agreement bonus (more strategies agreeing = stronger conviction)
 *   3. Regime alignment multiplier (strategy in its native regime = boost)
 *   4. Temporal edge multiplier (early vs late signal timing)
 *   5. Anti-crowding filter (discount if retail already crowded this name)
 *   6. Disagreement penalty (strategies in conflict = lower conviction)
 */

import type {
  StrategySignal, StrategyName, Side, Regime, FusedSignal,
  MarketContext, StrategyWeights, DecayReport,
} from './types'
import { DEFAULT_STRATEGY_WEIGHTS } from './types'

// ─── Regime alignment multipliers ─────────────────────────────────────────────
// Each strategy performs best in specific regimes. Reward when aligned.
const REGIME_ALIGNMENT: Record<StrategyName, Regime[]> = {
  momentum:       ['trending'],
  mean_reversion: ['ranging'],
  sentiment:      ['unknown', 'ranging', 'trending'],  // regime-agnostic
  volatility:     ['volatile', 'ranging'],
}

function regimeMultiplier(strategy: StrategyName, regime: Regime): number {
  return REGIME_ALIGNMENT[strategy].includes(regime) ? 1.15 : 0.85
}

// ─── Temporal edge score ───────────────────────────────────────────────────────
// Congressional trades: freshness matters. Reddit: early rank better than top-3.
function computeTemporalEdge(
  symbol:     string,
  marketCtx:  MarketContext,
  side:       Side,
): number {
  let multiplier = 1.0

  const cong   = marketCtx.congress[symbol]
  const social = marketCtx.reddit[symbol]

  // Congressional recency premium
  if (cong?.buy && side === 'buy' && cong.latestDate) {
    const daysSince = (Date.now() - new Date(cong.latestDate).getTime()) / 86_400_000
    if (daysSince <= 7)  multiplier += 0.20  // fresh insider buy
    else if (daysSince <= 14) multiplier += 0.10
  }

  // Reddit temporal edge: trending but not yet top 5 = sweet spot
  if (social) {
    if (social.rank <= 3 && side === 'buy')   multiplier -= 0.25  // overcrowded = late
    else if (social.rank <= 5)                 multiplier -= 0.10
    else if (social.rank <= 15 && side === 'buy') multiplier += 0.10  // early stage
  }

  return Math.max(0.70, Math.min(1.30, multiplier))
}

// ─── Anti-crowding detection ───────────────────────────────────────────────────
// Detects when a setup is likely already crowded by retail.
function isAntiCrowded(symbol: string, marketCtx: MarketContext, side: Side): boolean {
  const { fearGreed, reddit } = marketCtx
  const social = reddit[symbol]

  // Top 3 WSB + extreme greed + buy signal = classic crowded top
  if (side === 'buy' && social?.rank && social.rank <= 3 && fearGreed !== null && fearGreed >= 75) return true

  // Extreme greed alone on a buy is cautionary
  if (side === 'buy' && fearGreed !== null && fearGreed >= 85) return true

  return false
}

// ─── Main fusion function ─────────────────────────────────────────────────────

export function fuseSignals(
  strategies:  Record<StrategyName, StrategySignal>,
  symbol:      string,
  marketCtx:   MarketContext,
  weights?:    StrategyWeights,
  decayReport?: DecayReport,
): FusedSignal {
  const w = weights ?? DEFAULT_STRATEGY_WEIGHTS

  // Apply decay multipliers — disabled strategies get weight 0
  const effectiveWeights: StrategyWeights = {
    momentum:       w.momentum       * (decayReport?.allocationMultipliers.momentum       ?? 1),
    mean_reversion: w.mean_reversion * (decayReport?.allocationMultipliers.mean_reversion ?? 1),
    sentiment:      w.sentiment      * (decayReport?.allocationMultipliers.sentiment      ?? 1),
    volatility:     w.volatility     * (decayReport?.allocationMultipliers.volatility     ?? 1),
  }

  const names = Object.keys(strategies) as StrategyName[]

  // ── Step 1: Weighted vote ─────────────────────────────────────────────────
  let weightedBuy  = 0
  let weightedSell = 0
  let totalWeight  = 0

  for (const name of names) {
    const sig = strategies[name]
    if (!sig.active || sig.side === 'neutral') continue

    const w = effectiveWeights[name]
    const alignMult = regimeMultiplier(name, sig.regime)
    const adjusted  = sig.confidence * w * alignMult

    if (sig.side === 'buy')  weightedBuy  += adjusted
    if (sig.side === 'sell') weightedSell += adjusted
    totalWeight += w
  }

  if (totalWeight === 0) {
    return neutralFused(strategies)
  }

  const rawBuyConf  = weightedBuy  / totalWeight
  const rawSellConf = weightedSell / totalWeight

  // No clear winner: need 15+ pt gap to commit to a direction
  if (Math.abs(rawBuyConf - rawSellConf) < 15) {
    return neutralFused(strategies)
  }

  const fusedSide: Side = rawBuyConf > rawSellConf ? 'buy' : 'sell'
  let   fusedConf       = Math.max(rawBuyConf, rawSellConf)

  // ── Step 2: Agreement bonus ───────────────────────────────────────────────
  const agreementCount = names.filter(n => strategies[n].side === fusedSide).length
  if (agreementCount >= 3) fusedConf = Math.min(100, fusedConf * 1.15)  // 3+ strategies agree
  if (agreementCount === 4) fusedConf = Math.min(100, fusedConf * 1.10)  // unanimous = extra 10%

  // ── Step 3: Disagreement penalty ─────────────────────────────────────────
  const disagreeCount = names.filter(n => {
    const s = strategies[n]
    return s.active && s.side !== 'neutral' && s.side !== fusedSide
  }).length
  if (disagreeCount >= 2) fusedConf *= 0.80  // 2+ strategies disagree = sharp penalty

  // ── Step 4: Temporal edge ─────────────────────────────────────────────────
  const temporalEdge = computeTemporalEdge(symbol, marketCtx, fusedSide)
  fusedConf *= temporalEdge

  // ── Step 5: Anti-crowding ─────────────────────────────────────────────────
  const antiCrowding = isAntiCrowded(symbol, marketCtx, fusedSide)
  if (antiCrowding) fusedConf *= 0.65  // heavy discount on crowded setups

  // ── Step 6: Normalize and build output ───────────────────────────────────
  fusedConf = Math.round(Math.min(100, Math.max(0, fusedConf)))

  // Determine dominant regime from active strategies
  const regimeCounts: Partial<Record<Regime, number>> = {}
  for (const name of names) {
    const r = strategies[name].regime
    regimeCounts[r] = (regimeCounts[r] ?? 0) + 1
  }
  const regime = (Object.entries(regimeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'unknown') as Regime

  // Merge signal labels (keep most informative across all strategies)
  const allSignals: string[] = []
  for (const name of names) {
    const sig = strategies[name]
    if (sig.side === fusedSide && sig.signals.length > 0) {
      allSignals.push(...sig.signals.slice(0, 2))
    }
  }
  if (agreementCount >= 3) allSignals.push(`${agreementCount}/4 strategies aligned`)
  if (antiCrowding)        allSignals.push('Anti-crowding filter applied')

  // Map to 0–10 for legacy scan compatibility
  const enkiConfidence = Math.round(fusedConf / 10)

  return {
    side:                   fusedSide,
    confidence:             fusedConf,
    enkiConfidence,
    regime,
    signals:                allSignals,
    strategyBreakdown:      strategies,
    agreementCount,
    antiCrowdingFlag:       antiCrowding,
    temporalEdgeMultiplier: temporalEdge,
  }
}

function neutralFused(strategies: Record<StrategyName, StrategySignal>): FusedSignal {
  return {
    side:                   'neutral',
    confidence:             0,
    enkiConfidence:         0,
    regime:                 'unknown',
    signals:                [],
    strategyBreakdown:      strategies,
    agreementCount:         0,
    antiCrowdingFlag:       false,
    temporalEdgeMultiplier: 1.0,
  }
}
