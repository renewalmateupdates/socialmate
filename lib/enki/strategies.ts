/**
 * Enki — Phase 1: Four Isolated Strategy Implementations
 *
 * Each strategy is fully independent:
 * - Its own signal logic
 * - Its own regime detection
 * - Its own confidence scoring (0–100)
 * - Its own lifecycle (can be killed by decay system independently)
 *
 * Strategies do NOT share state. The fusion engine combines them.
 */

import {
  enkiCalcRSI,
  enkiCalcMACD,
  enkiCalcEMA,
  enkiCalcBB,
  enkiCalcATR,
  enkiCalcADX,
  enkiVolumeSpike,
  enkiCalcBBWidth,
  enkiCalcATRTrend,
} from './indicators'
import type { StrategySignal, MarketContext, Regime } from './types'

// ─────────────────────────────────────────────────────────────────────────────
// STRATEGY 1 — MOMENTUM
// Regime: trending (ADX > 20). Trend-following logic.
// Alpha source: capturing sustained directional moves early in the trend.
// ─────────────────────────────────────────────────────────────────────────────

export function scoreMomentum(
  closes:  number[],
  highs:   number[],
  lows:    number[],
  volumes: number[],
): StrategySignal {
  const adx     = enkiCalcADX(highs, lows, closes)
  const macd    = enkiCalcMACD(closes)
  const ema9    = enkiCalcEMA(closes, 9)
  const ema21   = enkiCalcEMA(closes, 21)
  const volSpike = enkiVolumeSpike(volumes)

  const regime: Regime = adx === null ? 'unknown'
    : adx > 35 ? 'trending'
    : adx > 20 ? 'trending'
    : 'ranging'

  // Strategy is inactive in ranging/unknown markets
  if (regime !== 'trending' || adx === null) {
    return { strategy: 'momentum', side: 'neutral', confidence: 0, regime, signals: [], active: true }
  }

  const emaGolden = ema9.length > 0 && ema21.length > 0 && ema9[ema9.length - 1] > ema21[ema21.length - 1]
  const emaDeath  = ema9.length > 0 && ema21.length > 0 && ema9[ema9.length - 1] < ema21[ema21.length - 1]
  const macdBull  = macd !== null && macd.hist > 0 && macd.macd > macd.signal
  const macdBear  = macd !== null && macd.hist < 0 && macd.macd < macd.signal

  let buySignals: string[]  = []
  let sellSignals: string[] = []

  if (emaGolden) buySignals.push('EMA9>EMA21 momentum')
  if (emaDeath)  sellSignals.push('EMA9<EMA21 downtrend')

  if (macd !== null) {
    if (macdBull) buySignals.push(`MACD bullish (hist ${macd.hist > 0 ? '+' : ''}${macd.hist.toFixed(3)})`)
    if (macdBear) sellSignals.push(`MACD bearish (hist ${macd.hist.toFixed(3)})`)
  }

  // Both must agree: no single-indicator momentum trades
  const strongBuy  = emaGolden && macdBull
  const strongSell = emaDeath  && macdBear

  if (!strongBuy && !strongSell) {
    return { strategy: 'momentum', side: 'neutral', confidence: 0, regime, signals: [], active: true }
  }

  const side = strongBuy ? 'buy' : 'sell'

  // Confidence: ADX strength (20–60 pts) + MACD magnitude (0–20) + volume (0–10) + trend bonus (0–10)
  const adxContrib  = Math.min(40, (adx - 20) * 1.4)          // 0–40 pts
  const macdContrib = macd ? Math.min(20, Math.abs(macd.hist) / closes[closes.length - 1] * 8000) : 0
  const volContrib  = volSpike ? 10 : 0
  const trendBonus  = adx > 35 ? 10 : 0

  const confidence = Math.round(Math.min(100, 30 + adxContrib + macdContrib + volContrib + trendBonus))

  const signals = side === 'buy' ? buySignals : sellSignals
  if (volSpike) signals.push('Volume spike confirmation')
  if (adx > 35) signals.push(`ADX ${adx.toFixed(1)} — strong trend`)

  return { strategy: 'momentum', side, confidence, regime, signals, active: true }
}

// ─────────────────────────────────────────────────────────────────────────────
// STRATEGY 2 — MEAN REVERSION
// Regime: ranging (ADX < 25). RSI + Bollinger Band extremity.
// Alpha source: price returning to statistical mean after overextension.
// ─────────────────────────────────────────────────────────────────────────────

export function scoreMeanReversion(
  closes:  number[],
  highs:   number[],
  lows:    number[],
  volumes: number[],
): StrategySignal {
  const adx   = enkiCalcADX(highs, lows, closes)
  const rsi   = enkiCalcRSI(closes)
  const bb    = enkiCalcBB(closes)
  const price = closes[closes.length - 1]

  const regime: Regime = adx === null ? 'unknown'
    : adx > 30 ? 'trending'
    : adx > 20 ? 'ranging'
    : 'ranging'

  // Mean reversion only works in ranging markets; disabled when strongly trending
  if (adx !== null && adx > 30) {
    return { strategy: 'mean_reversion', side: 'neutral', confidence: 0, regime, signals: [`ADX ${adx.toFixed(1)} — trending, mean reversion suppressed`], active: true }
  }

  if (rsi === null || bb === null) {
    return { strategy: 'mean_reversion', side: 'neutral', confidence: 0, regime, signals: [], active: true }
  }

  const belowBB   = price <= bb.lower * 1.02   // within 2% of lower band
  const aboveBB   = price >= bb.upper * 0.98
  const oversold  = rsi < 40
  const overbought = rsi > 60

  const buySetup  = oversold  && belowBB
  const sellSetup = overbought && aboveBB

  if (!buySetup && !sellSetup) {
    return { strategy: 'mean_reversion', side: 'neutral', confidence: 0, regime, signals: [], active: true }
  }

  const side = buySetup ? 'buy' : 'sell'

  // Confidence: RSI extremity (0–40) + BB distance (0–30) + ADX penalty
  let rsiContrib = 0
  if (buySetup) {
    rsiContrib = rsi < 25 ? 40 : rsi < 30 ? 30 : rsi < 35 ? 20 : 10
  } else {
    rsiContrib = rsi > 75 ? 40 : rsi > 70 ? 30 : rsi > 65 ? 20 : 10
  }

  const bbBand    = buySetup ? bb.lower : bb.upper
  const bbDist    = Math.abs(price - bbBand) / (bb.upper - bb.lower)  // 0–1+
  const bbContrib = Math.min(30, bbDist * 60)

  // ADX moderation: mild trend = slight confidence penalty
  const adxPenalty = adx ? Math.min(20, Math.max(0, (adx - 15) * 1.5)) : 0

  const confidence = Math.round(Math.min(100, Math.max(0, 20 + rsiContrib + bbContrib - adxPenalty)))

  const signals: string[] = []
  if (buySetup) {
    signals.push(`RSI oversold (${rsi.toFixed(1)})`)
    if (price < bb.lower) signals.push(`Below BB lower ($${bb.lower.toFixed(2)})`)
    else signals.push(`Near BB lower ($${bb.lower.toFixed(2)})`)
  } else {
    signals.push(`RSI overbought (${rsi.toFixed(1)})`)
    if (price > bb.upper) signals.push(`Above BB upper ($${bb.upper.toFixed(2)})`)
    else signals.push(`Near BB upper ($${bb.upper.toFixed(2)})`)
  }
  if (adx) signals.push(`ADX ${adx.toFixed(1)} — ranging regime`)

  return { strategy: 'mean_reversion', side, confidence, regime, signals, active: true }
}

// ─────────────────────────────────────────────────────────────────────────────
// STRATEGY 3 — SENTIMENT
// Composite of Fear & Greed, Congressional trades, Reddit/WSB momentum.
// Alpha source: contrarian positioning vs retail crowding + insider alignment.
// ─────────────────────────────────────────────────────────────────────────────

export function scoreSentiment(
  symbol:     string,
  marketCtx:  MarketContext,
): StrategySignal {
  const { fearGreed, congress, reddit } = marketCtx
  const cong   = congress[symbol]
  const social = reddit[symbol]

  const signals: string[] = []
  let buyScore  = 0
  let sellScore = 0

  // ── Fear & Greed ────────────────────────────────────────────────────────────
  // Contrarian: fear = potential buy, greed = potential sell
  if (fearGreed !== null) {
    if (fearGreed <= 25) {
      buyScore  += 35
      signals.push(`F&G extreme fear (${fearGreed}) — contrarian buy`)
    } else if (fearGreed <= 40) {
      buyScore  += 20
      signals.push(`F&G fear zone (${fearGreed}) — mild contrarian buy`)
    } else if (fearGreed >= 80) {
      sellScore += 35
      signals.push(`F&G extreme greed (${fearGreed}) — contrarian sell`)
    } else if (fearGreed >= 65) {
      sellScore += 15
      signals.push(`F&G greed zone (${fearGreed}) — mild contrarian sell`)
    }
  }

  // ── Congressional trades (institutional smart money) ────────────────────────
  if (cong?.buy) {
    buyScore += 30
    signals.push(`Congress buy (${cong.members} member${cong.members > 1 ? 's' : ''})`)
  }
  if (cong?.sell && !cong.buy) {
    sellScore += 20
    signals.push('Congress sell — insider distribution')
  }

  // ── Reddit / WSB momentum (temporal edge: early is good, top 3 is crowded) ──
  if (social) {
    if (social.rank <= 3) {
      // Most mentioned = extremely crowded → anti-crowding sell signal
      sellScore += 20
      signals.push(`WSB top #${social.rank} — overcrowded, anti-crowding sell`)
    } else if (social.rank <= 10) {
      // Trending but not top → still has room → mild buy confirmation
      buyScore  += 15
      signals.push(`WSB trending #${social.rank} (${social.mentions} mentions)`)
    } else if (social.rank <= 25) {
      // Early signal
      buyScore  += 10
      signals.push(`WSB early mention #${social.rank}`)
    }
  }

  if (buyScore === 0 && sellScore === 0) {
    return { strategy: 'sentiment', side: 'neutral', confidence: 0, regime: 'unknown', signals: [], active: true }
  }

  // Need clear winner by 15+ pts for a signal (reduces noise from single weak signal)
  const gap = Math.abs(buyScore - sellScore)
  if (gap < 15) {
    return { strategy: 'sentiment', side: 'neutral', confidence: 0, regime: 'unknown', signals: [`Sentiment mixed (buy:${buyScore} sell:${sellScore})`], active: true }
  }

  const side       = buyScore > sellScore ? 'buy' : 'sell'
  const winScore   = Math.max(buyScore, sellScore)
  const confidence = Math.round(Math.min(100, winScore * 0.85))  // cap at 85 — sentiment alone is never a full signal

  return { strategy: 'sentiment', side, confidence, regime: 'unknown', signals, active: true }
}

// ─────────────────────────────────────────────────────────────────────────────
// STRATEGY 4 — VOLATILITY
// Regime classification via ATR trend and BB squeeze/expansion.
// Alpha source: volatility expansion after compression → breakout capture.
// Also flags blow-off tops (extreme expansion + overbought).
// ─────────────────────────────────────────────────────────────────────────────

export function scoreVolatility(
  closes:  number[],
  highs:   number[],
  lows:    number[],
  volumes: number[],
): StrategySignal {
  const atr       = enkiCalcATR(highs, lows, closes)
  const atrTrend  = enkiCalcATRTrend(highs, lows, closes)
  const bbWidth   = enkiCalcBBWidth(closes)
  const rsi       = enkiCalcRSI(closes)
  const volSpike  = enkiVolumeSpike(volumes)
  const price     = closes[closes.length - 1]
  const bb        = enkiCalcBB(closes)
  const macd      = enkiCalcMACD(closes)

  if (atr === null || atrTrend === null || bbWidth === null) {
    return { strategy: 'volatility', side: 'neutral', confidence: 0, regime: 'unknown', signals: [], active: true }
  }

  const regime: Regime = atrTrend === 'expanding' ? 'volatile' : atrTrend === 'contracting' ? 'ranging' : 'unknown'

  const signals: string[] = []
  let side: 'buy' | 'sell' | 'neutral' = 'neutral'
  let confidence = 0

  // ── SETUP 1: Volatility Squeeze → Breakout ────────────────────────────────
  // BB very tight + ATR contracting + MACD turning positive = imminent breakout
  const isSqueeze = bbWidth < 0.04  // BB width < 4% of price = tight squeeze

  if (isSqueeze && atrTrend === 'contracting') {
    // Directional hint: MACD histogram direction shows which way the breakout goes
    if (macd && macd.hist > 0) {
      side       = 'buy'
      confidence = Math.min(100, 50 + (volSpike ? 20 : 0) + (rsi !== null && rsi < 55 ? 10 : 0))
      signals.push(`BB squeeze (width ${(bbWidth * 100).toFixed(1)}%) + ATR contracting — breakout setup`)
      if (macd.hist > 0) signals.push('MACD positive — upward breakout bias')
    } else if (macd && macd.hist < 0) {
      side       = 'sell'
      confidence = Math.min(100, 50 + (volSpike ? 20 : 0))
      signals.push(`BB squeeze (width ${(bbWidth * 100).toFixed(1)}%) + ATR contracting — breakdown setup`)
      signals.push('MACD negative — downward breakout bias')
    }
  }

  // ── SETUP 2: Blow-off Top (Volatility Expansion + Overbought) ────────────
  // ATR expanding rapidly + price at/above BB upper + RSI overbought = mean-rev sell
  const isBlowOff = atrTrend === 'expanding' && bb !== null && price >= bb.upper * 0.98 && rsi !== null && rsi > 68

  if (isBlowOff && side === 'neutral') {
    side       = 'sell'
    confidence = Math.min(100, 45 + (rsi !== null && rsi > 75 ? 20 : 0) + (volSpike ? 15 : 0))
    signals.push(`Blow-off top: ATR expanding + RSI ${rsi?.toFixed(1)} + price at BB upper`)
  }

  // ── SETUP 3: Vol Contraction after High-Vol Sell-off → Recovery Buy ──────
  // ATR contracting after high vol + RSI oversold = selling exhaustion
  const isExhaustion = atrTrend === 'contracting' && rsi !== null && rsi < 35 && bb !== null && price <= bb.lower * 1.03

  if (isExhaustion && side === 'neutral') {
    side       = 'buy'
    confidence = Math.min(100, 40 + (rsi < 25 ? 20 : rsi < 30 ? 10 : 0))
    signals.push(`Vol exhaustion: ATR contracting + RSI ${rsi?.toFixed(1)} + oversold`)
  }

  return { strategy: 'volatility', side, confidence, regime, signals, active: true }
}
