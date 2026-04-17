/**
 * Enki — Phase 2: Capital Allocation Intelligence Layer
 *
 * "Capital allocation is the real alpha."
 *
 * Answers: "How much capital should this trade receive RIGHT NOW?"
 *
 * Considers:
 *   - Fused signal conviction (higher confidence → larger size)
 *   - Strategy performance history (better track record → more capital)
 *   - Volatility-adjusted sizing (ATR-based position risk normalization)
 *   - Decay penalties (decaying strategies get less capital)
 *   - Portfolio correlation exposure (crowded → smaller sizes)
 *   - Global risk cap (never exceed max regardless of signal strength)
 */

import type { FusedSignal, StrategyPerformance, DecayReport, CapitalAllocation, StrategyWeights } from './types'

// ─── Position size caps by tier ────────────────────────────────────────────────
const POSITION_CAPS = {
  conservative: { min: 2,  max: 8  },
  balanced:     { min: 5,  max: 18 },
  aggressive:   { min: 8,  max: 25 },
} as const

type RiskPreset = keyof typeof POSITION_CAPS

// ─── Main allocator ────────────────────────────────────────────────────────────

export function allocateCapital(
  fusedSignal:    FusedSignal,
  baseKellyPct:   number | null,    // half-Kelly from trade history (null if < 20 trades)
  doctrineSize:   number,           // doctrine config: position_size_pct
  strategyPerf:   StrategyPerformance[],
  decayReport:    DecayReport,
  riskPreset:     string = 'balanced',
): CapitalAllocation {
  const preset = (POSITION_CAPS[riskPreset as RiskPreset] ?? POSITION_CAPS.balanced)

  // ── 1. Base position size ─────────────────────────────────────────────────
  // Kelly wins if we have enough history; falls back to doctrine config
  let sizePct = baseKellyPct ?? doctrineSize

  // ── 2. Conviction scalar — confidence drives size within the allowed band ─
  // fusedSignal.confidence 0–100 maps to a 0.5–1.5 multiplier
  const convictionMult = 0.5 + (fusedSignal.confidence / 100)
  sizePct = sizePct * convictionMult

  // ── 3. Agreement bonus — unanimous strategies justify larger position ─────
  if (fusedSignal.agreementCount >= 3) sizePct *= 1.15
  if (fusedSignal.agreementCount === 4) sizePct *= 1.10

  // ── 4. Anti-crowding penalty ──────────────────────────────────────────────
  if (fusedSignal.antiCrowdingFlag) sizePct *= 0.50

  // ── 5. Temporal edge bonus — early signals justify larger commitment ───────
  if (fusedSignal.temporalEdgeMultiplier > 1.15) sizePct *= 1.10
  if (fusedSignal.temporalEdgeMultiplier < 0.90) sizePct *= 0.75

  // ── 6. Strategy performance weighting ────────────────────────────────────
  // Compute weighted performance score (0.5–1.5 range)
  const perfMult = computePerformanceMultiplier(fusedSignal, strategyPerf)
  sizePct *= perfMult

  // ── 7. Decay penalty ─────────────────────────────────────────────────────
  if (decayReport.hasDecay) {
    const avgDecayMult = average(Object.values(decayReport.allocationMultipliers))
    sizePct *= avgDecayMult
  }

  // ── 8. Emergency de-risking ───────────────────────────────────────────────
  if (decayReport.emergencyMode) sizePct = 0

  // ── 9. Clamp to preset limits ─────────────────────────────────────────────
  sizePct = Math.round(Math.min(preset.max, Math.max(preset.min, sizePct)) * 10) / 10

  // ── Strategy weights (informational, not used for sizing here) ────────────
  const strategyWeights = computeStrategyWeights(fusedSignal, strategyPerf)

  const adjustmentReason = buildReason(fusedSignal, decayReport, convictionMult, perfMult)

  return { positionSizePct: sizePct, strategyWeights, adjustmentReason }
}

// ─── Performance-based multiplier ─────────────────────────────────────────────

function computePerformanceMultiplier(
  fusedSignal:  FusedSignal,
  strategyPerf: StrategyPerformance[],
): number {
  if (!strategyPerf.length) return 1.0  // no history yet — neutral

  // Find which strategies contributed to this signal
  const activeStrategies = Object.entries(fusedSignal.strategyBreakdown)
    .filter(([, s]) => s.side === fusedSignal.side && s.confidence > 30)
    .map(([name]) => name)

  if (!activeStrategies.length) return 1.0

  const mults: number[] = []
  for (const name of activeStrategies) {
    const perf = strategyPerf.find(p => p.strategy === name)
    if (!perf || perf.tradeCount < 10) {
      mults.push(1.0)  // insufficient history — neutral
      continue
    }
    const winRate = perf.winCount / perf.tradeCount
    // Win rate 50% → 1.0x, 60% → 1.3x, 40% → 0.7x, linear in between
    const winMult  = 0.7 + winRate * 0.6  // 0.7–1.3 range
    // Sharpe contribution: positive Sharpe boosts, negative penalizes
    const sharpeMult = perf.currentSharpe > 0
      ? Math.min(1.25, 1 + perf.currentSharpe * 0.15)
      : Math.max(0.60, 1 + perf.currentSharpe * 0.25)

    mults.push(winMult * sharpeMult)
  }

  return Math.max(0.50, Math.min(1.50, average(mults)))
}

// ─── Strategy weight vector (for attribution & future rebalancing) ─────────────

function computeStrategyWeights(
  fusedSignal:  FusedSignal,
  strategyPerf: StrategyPerformance[],
): Record<string, number> {
  const base: Record<string, number> = {
    momentum:       0.35,
    mean_reversion: 0.30,
    sentiment:      0.20,
    volatility:     0.15,
  }

  if (!strategyPerf.length) return base

  // Scale weights by Sharpe ratio (positive Sharpe = more weight)
  const sharpeMap: Record<string, number> = {}
  for (const p of strategyPerf) {
    sharpeMap[p.strategy] = Math.max(0.1, 1 + p.currentSharpe * 0.2)
  }

  let totalAdj = 0
  const adj: Record<string, number> = {}
  for (const [name, w] of Object.entries(base)) {
    adj[name] = w * (sharpeMap[name] ?? 1.0)
    totalAdj += adj[name]
  }

  // Normalize to sum to 1.0
  const normalized: Record<string, number> = {}
  for (const [name, w] of Object.entries(adj)) {
    normalized[name] = Math.round((w / totalAdj) * 100) / 100
  }

  return normalized
}

function average(arr: number[]): number {
  if (!arr.length) return 1
  return arr.reduce((a, b) => a + b, 0) / arr.length
}

function buildReason(
  fusedSignal: FusedSignal,
  decayReport: DecayReport,
  convMult:    number,
  perfMult:    number,
): string {
  const parts: string[] = []
  parts.push(`Conviction ${Math.round(convMult * 100)}%`)
  if (fusedSignal.agreementCount >= 3) parts.push(`${fusedSignal.agreementCount} strategies agree`)
  if (fusedSignal.antiCrowdingFlag)   parts.push('anti-crowd 50%')
  if (decayReport.hasDecay)           parts.push(`decay penalty (${decayReport.affectedStrategies.join(', ')})`)
  if (Math.abs(perfMult - 1) > 0.05) parts.push(`perf factor ${perfMult.toFixed(2)}x`)
  return parts.join(' | ')
}
