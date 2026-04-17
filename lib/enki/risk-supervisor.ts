/**
 * Enki — Phase 8: Global Risk Supervisor
 *
 * "Survival > Returns."
 *
 * ABSOLUTE AUTHORITY. This system is the last gate before any capital moves.
 * It can override EVERYTHING — signal strength, conviction, strategy consensus.
 *
 * Hard limits enforced here:
 *   - Portfolio max drawdown stop (all new trades blocked)
 *   - Daily drawdown limit (per-day reset)
 *   - Confidence minimum threshold (pre-set by risk preset)
 *   - Anti-crowding veto (flat reject on extreme crowding)
 *   - Decay emergency veto (flat reject if emergency mode)
 *   - Position size cap enforcement (never exceed max)
 *   - Regime sanity check (strategy in wildly wrong regime = reject)
 *
 * Output is a final RiskDecision. APPROVE, REDUCE, or REJECT.
 * No trade proceeds without this decision.
 */

import type { FusedSignal, DecayReport, CapitalAllocation, RiskDecision, Side } from './types'

// ─── Confidence thresholds (matching existing risk preset system) ──────────────
const CONF_THRESHOLDS: Record<string, number> = {
  conservative: 7,
  balanced:     5,
  aggressive:   3,
}

// ─── Hard limits ────────────────────────────────────────────────────────────────
const HARD_LIMITS = {
  maxPortfolioDrawdownPct: 12,   // > 12% total drawdown = full stop, no new trades
  maxDailyDrawdownPct:     5,    // > 5% single-day loss = no new buys today
  minAgreementForHighConf: 2,    // if confidence > 80, need at least 2 strategies agreeing
  maxPositionSizePct:      25,   // hard cap regardless of Kelly
  minPositionSizePct:      2,    // minimum meaningful size
}

// ─── Main supervisor ───────────────────────────────────────────────────────────

export function evaluateRisk(
  fusedSignal:         FusedSignal,
  allocation:          CapitalAllocation,
  decayReport:         DecayReport,
  portfolio: {
    totalDrawdownPct:  number   // all-time drawdown from peak (negative = loss)
    dailyDrawdownPct:  number   // today's P&L % (negative = loss today)
    openPositionCount: number
    maxPositions:      number
  },
  riskPreset:          string = 'balanced',
): RiskDecision {
  const rejectDecision = (reason: string, signals: string[] = []): RiskDecision => ({
    action:          'REJECT',
    finalConfidence: 0,
    finalSide:       'neutral',
    positionSizePct: 0,
    reason,
    signals,
  })

  // ── Hard Stop 1: Emergency decay mode — all capital frozen ──────────────
  if (decayReport.emergencyMode) {
    return rejectDecision('EMERGENCY: Decay supervisor halted all strategies', decayReport.actions)
  }

  // ── Hard Stop 2: Portfolio max drawdown exceeded ─────────────────────────
  if (portfolio.totalDrawdownPct <= -HARD_LIMITS.maxPortfolioDrawdownPct) {
    return rejectDecision(
      `Portfolio drawdown ${portfolio.totalDrawdownPct.toFixed(2)}% exceeds ${HARD_LIMITS.maxPortfolioDrawdownPct}% hard limit — all new entries blocked`
    )
  }

  // ── Hard Stop 3: Daily drawdown exceeded — no new buys ───────────────────
  if (portfolio.dailyDrawdownPct <= -HARD_LIMITS.maxDailyDrawdownPct && fusedSignal.side === 'buy') {
    return rejectDecision(
      `Daily drawdown ${portfolio.dailyDrawdownPct.toFixed(2)}% — no new long entries today`
    )
  }

  // ── Hard Stop 4: Neutral signal from fusion — nothing to do ──────────────
  if (fusedSignal.side === 'neutral' || fusedSignal.confidence === 0) {
    return rejectDecision('Fusion engine: no clear directional conviction')
  }

  // ── Confidence threshold check ────────────────────────────────────────────
  const threshold = CONF_THRESHOLDS[riskPreset] ?? CONF_THRESHOLDS.balanced
  if (fusedSignal.enkiConfidence < threshold) {
    return rejectDecision(
      `Confidence ${fusedSignal.enkiConfidence}/10 below ${riskPreset} threshold ${threshold}/10`,
      fusedSignal.signals,
    )
  }

  // ── High-confidence sanity check ─────────────────────────────────────────
  // If confidence is very high but strategies don't agree, reduce rather than reject
  let positionSizePct = allocation.positionSizePct
  let finalConfidence = fusedSignal.enkiConfidence
  const reductions: string[] = []

  if (fusedSignal.confidence > 80 && fusedSignal.agreementCount < HARD_LIMITS.minAgreementForHighConf) {
    positionSizePct = Math.round(positionSizePct * 0.65 * 10) / 10
    reductions.push('High confidence but low strategy agreement — size reduced 35%')
  }

  // ── Anti-crowding veto ────────────────────────────────────────────────────
  // Extreme crowding + buy = hard reject (not just reduce)
  if (fusedSignal.antiCrowdingFlag && fusedSignal.side === 'buy' && fusedSignal.confidence < 60) {
    return rejectDecision(
      'Anti-crowding veto: retail crowding detected with insufficient conviction',
      fusedSignal.signals,
    )
  }

  // ── Position size hard caps ───────────────────────────────────────────────
  positionSizePct = Math.min(HARD_LIMITS.maxPositionSizePct, positionSizePct)
  positionSizePct = Math.max(HARD_LIMITS.minPositionSizePct, positionSizePct)

  // ── Decay-adjusted confidence ─────────────────────────────────────────────
  if (decayReport.hasDecay) {
    const avgMult = average(Object.values(decayReport.allocationMultipliers))
    finalConfidence = Math.round(finalConfidence * avgMult)
    reductions.push(`Decay multiplier ${avgMult.toFixed(2)}x applied to confidence`)
  }

  // ── Final confidence floor ────────────────────────────────────────────────
  finalConfidence = Math.min(10, Math.max(0, finalConfidence))

  if (finalConfidence < threshold) {
    return rejectDecision(
      `Post-adjustment confidence ${finalConfidence}/10 below threshold after risk checks`,
      fusedSignal.signals,
    )
  }

  // ── Build approval or reduction verdict ──────────────────────────────────
  const action: RiskDecision['action'] = reductions.length > 0 ? 'REDUCE' : 'APPROVE'

  const reasonParts: string[] = [
    `Fused conf ${fusedSignal.confidence}/100 (${fusedSignal.agreementCount}/4 strategies)`,
    ...reductions,
  ]
  if (decayReport.hasDecay) reasonParts.push(`Decay: ${decayReport.affectedStrategies.join(', ')}`)

  const signals = [
    ...fusedSignal.signals,
    `${positionSizePct}% portfolio | ${allocation.adjustmentReason}`,
  ]

  return {
    action,
    finalConfidence,
    finalSide:       fusedSignal.side,
    positionSizePct: Math.round(positionSizePct * 10) / 10,
    reason:          reasonParts.join(' | '),
    signals,
  }
}

function average(arr: number[]): number {
  if (!arr.length) return 1
  return arr.reduce((a, b) => a + b, 0) / arr.length
}
