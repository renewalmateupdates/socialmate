/**
 * Enki Truth Mode — Minimal scientifically testable strategy layer.
 *
 * Two strategies only. No fusion. No magic numbers beyond standard
 * technical thresholds. No Reddit. No Fear & Greed.
 *
 * Purpose: determine whether any real edge exists before rebuilding complexity.
 *
 * Rules (NON-NEGOTIABLE during the experiment):
 *   - No parameter changes while data is collecting
 *   - No new signals added mid-experiment
 *   - If parameters change → reset dataset
 *
 * Minimum sample to draw conclusions: 50 trades per strategy.
 */

import {
  enkiCalcRSI,
  enkiCalcMACD,
  enkiCalcEMA,
  enkiCalcBB,
  enkiCalcADX,
  enkiCalcATR,
  enkiCalcPearsonCorr,
} from './indicators'

// ─── Types ────────────────────────────────────────────────────────────────────

export type TruthStrategy   = 'momentum' | 'mean_reversion'
export type TruthConfidence = 'MEDIUM' | 'HIGH'

export interface TruthSignal {
  side:                  'buy'    // Truth Mode is long-only
  strategy:              TruthStrategy
  confidence:            TruthConfidence
  congressionalBoost:    boolean  // whether the +1 level was applied
  adxAtEntry:            number | null
  rsiAtEntry:            number | null
  atrAtEntry:            number | null
  stopPrice:             number   // entry_price - 1.5 * ATR
  tp1Price:              number   // entry_price + 2.0 * ATR
  tp2Price:              number   // entry_price + 3.5 * ATR
}

export interface CongressRecord {
  members:    number
  latestDate: string  // YYYY-MM-DD
}

// ─── Strategy 1: Momentum ─────────────────────────────────────────────────────
// Signal: EMA9 > EMA21 AND MACD hist > 0 AND ADX > 25
// Confidence: HIGH if ADX > 35, MEDIUM if ADX 25-35
// Regime: only fires in trending markets

export function scoreTruthMomentum(
  closes:  number[],
  highs:   number[],
  lows:    number[],
  volumes: number[],
): { signal: TruthSignal; currentPrice: number; atr: number } | null {
  const adx    = enkiCalcADX(highs, lows, closes)
  const macd   = enkiCalcMACD(closes)
  const ema9   = enkiCalcEMA(closes, 9)
  const ema21  = enkiCalcEMA(closes, 21)
  const atr    = enkiCalcATR(highs, lows, closes)
  const price  = closes[closes.length - 1]

  if (adx === null || macd === null || !ema9.length || !ema21.length || atr === null) return null

  // Regime gate: must be trending
  if (adx < 25) return null

  // Both EMA and MACD must agree (dual confirmation — not single-indicator)
  const emaGolden = ema9[ema9.length - 1] > ema21[ema21.length - 1]
  const macdBull  = macd.hist > 0

  if (!emaGolden || !macdBull) return null

  const confidence: TruthConfidence = adx > 35 ? 'HIGH' : 'MEDIUM'

  return {
    signal: {
      side:               'buy',
      strategy:           'momentum',
      confidence,
      congressionalBoost: false,
      adxAtEntry:         adx,
      rsiAtEntry:         null,
      atrAtEntry:         atr,
      stopPrice:          price - 1.5 * atr,
      tp1Price:           price + 2.0 * atr,
      tp2Price:           price + 3.5 * atr,
    },
    currentPrice: price,
    atr,
  }
}

// ─── Strategy 2: Mean Reversion ───────────────────────────────────────────────
// Signal: RSI < 32 AND price < BB lower AND RSI is rising vs 3 days ago
// The RSI rising filter is the key anti-falling-knife protection.
// Confidence: HIGH if RSI < 28, MEDIUM otherwise

export function scoreTruthMeanReversion(
  closes: number[],
  highs:  number[],
  lows:   number[],
): { signal: TruthSignal; currentPrice: number; atr: number } | null {
  if (closes.length < 30) return null

  const rsiNow   = enkiCalcRSI(closes)
  const rsi3ago  = enkiCalcRSI(closes.slice(0, -3))  // RSI as of 3 bars ago
  const bb       = enkiCalcBB(closes)
  const atr      = enkiCalcATR(highs, lows, closes)
  const price    = closes[closes.length - 1]

  if (rsiNow === null || rsi3ago === null || bb === null || atr === null) return null

  // Must be genuinely oversold — not just "below 40"
  if (rsiNow >= 32) return null

  // Must be at or below BB lower (overextended to the downside)
  if (price >= bb.lower) return null

  // RSI must be rising vs 3 days ago — this is the anti-falling-knife filter.
  // If RSI is still declining, we may be catching a falling knife.
  if (rsiNow <= rsi3ago) return null

  const confidence: TruthConfidence = rsiNow < 28 ? 'HIGH' : 'MEDIUM'

  return {
    signal: {
      side:               'buy',
      strategy:           'mean_reversion',
      confidence,
      congressionalBoost: false,
      adxAtEntry:         null,
      rsiAtEntry:         rsiNow,
      atrAtEntry:         atr,
      stopPrice:          price - 1.5 * atr,
      tp1Price:           price + 2.0 * atr,
      tp2Price:           price + 3.5 * atr,
    },
    currentPrice: price,
    atr,
  }
}

// ─── Congressional Filter ─────────────────────────────────────────────────────
// Boosts MEDIUM → HIGH if ≥2 members bought the same ticker in the last 14 days.
// This is a filter only — it cannot generate a trade on its own.

export function applyCongressionalBoost(
  signal:   TruthSignal,
  congress: CongressRecord | null | undefined,
): TruthSignal {
  if (!congress) return signal
  if (congress.members < 2) return signal

  const daysSince = (Date.now() - new Date(congress.latestDate).getTime()) / 86_400_000
  if (daysSince > 14) return signal

  // Boost MEDIUM → HIGH (cap at HIGH — cannot go above)
  return {
    ...signal,
    confidence:         'HIGH',
    congressionalBoost: signal.confidence === 'MEDIUM',  // only flag if it actually changed
  }
}

// ─── Congressional Data Fetcher (Truth Mode specific) ─────────────────────────
// Separate from the existing enkiFetchCongressTrades — this one returns:
//   - latestDate (critical for the 14-day window check)
//   - members count (requires ≥2 for the filter to activate)

export async function fetchTruthCongressData(
  symbols: string[],
): Promise<Record<string, CongressRecord>> {
  try {
    const res = await fetch(
      'https://house-stock-watcher-data.s3-us-west-2.amazonaws.com/data/all_transactions.json',
      { headers: { 'User-Agent': 'Mozilla/5.0' } }
    )
    if (!res.ok) return {}

    const txs: Array<{ ticker: string; transaction_date: string; type: string }> = await res.json()

    const cutoff = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
    const symSet = new Set(symbols.map(s => s.toUpperCase()))

    const raw: Record<string, { members: number; latestDate: string }> = {}

    for (const tx of txs) {
      const sym = tx.ticker?.toUpperCase().replace('$', '')
      if (!sym || !symSet.has(sym)) continue
      if (tx.transaction_date < cutoff) continue

      const type = tx.type?.toLowerCase() ?? ''
      if (!type.includes('purchase')) continue

      if (!raw[sym]) raw[sym] = { members: 0, latestDate: tx.transaction_date }
      raw[sym].members++
      if (tx.transaction_date > raw[sym].latestDate) raw[sym].latestDate = tx.transaction_date
    }

    // Only return records with ≥2 member purchases — single-member buys don't qualify
    return Object.fromEntries(Object.entries(raw).filter(([, v]) => v.members >= 2))
  } catch {
    return {}
  }
}

// ─── Position tracking helpers ────────────────────────────────────────────────

export interface TruthOpenPosition {
  id:               string
  symbol:           string
  strategy:         TruthStrategy
  confidence:       TruthConfidence
  entryPrice:       number
  qty:              number
  remainingQty:     number
  positionUsd:      number
  atrAtEntry:       number
  highestPriceSeen: number
  stopPrice:        number
  tp1Price:         number
  tp2Price:         number
  tp1Hit:           boolean
  tp2Hit:           boolean
}

/** Compute ATR-based trailing stop percentage (same formula as main scan). */
export function computeTrailPct(atrAtEntry: number, entryPrice: number, tp1Hit: boolean, tp2Hit: boolean): number {
  const basePct = Math.max(2, Math.min(10, Math.round((atrAtEntry / entryPrice) * 200 * 10) / 10))
  if (tp2Hit) return 2
  if (tp1Hit) return 3
  return basePct
}

/** Kelly sizing from a list of closed truth trades. Returns % of portfolio to deploy. */
export function computeTruthKelly(
  closedTrades: Array<{ win: boolean; pnlPct: number }>,
): number {
  if (closedTrades.length < 20) return 5  // insufficient history — flat 5%

  const wins   = closedTrades.filter(t => t.win)
  const losses = closedTrades.filter(t => !t.win)
  if (!wins.length || !losses.length) return 5

  const W      = wins.length / closedTrades.length
  const avgWin = wins.reduce((s, t) => s + t.pnlPct, 0) / wins.length
  const avgLoss = Math.abs(losses.reduce((s, t) => s + t.pnlPct, 0) / losses.length)

  if (avgLoss === 0) return 5

  const R     = avgWin / avgLoss
  const kelly = (W * (R + 1) - 1) / R
  return Math.max(5, Math.min(20, (kelly / 2) * 100))
}

/** Pearson correlation re-export for Truth Mode position guard. */
export { enkiCalcPearsonCorr as truthCalcCorrelation }
