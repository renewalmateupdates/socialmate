/**
 * Enki — Pure Technical Indicator Math
 * All functions are stateless, zero side-effects. Importable by any module.
 */

export function enkiCalcEMA(values: number[], period: number): number[] {
  if (values.length < period) return []
  const k = 2 / (period + 1)
  const emas: number[] = []
  let ema = values.slice(0, period).reduce((a, b) => a + b, 0) / period
  emas.push(ema)
  for (let i = period; i < values.length; i++) {
    ema = values[i] * k + ema * (1 - k)
    emas.push(ema)
  }
  return emas
}

export function enkiCalcRSI(closes: number[], period = 14): number | null {
  if (closes.length < period + 1) return null
  const slice = closes.slice(-(period + 1))
  let gains = 0, losses = 0
  for (let i = 1; i < slice.length; i++) {
    const diff = slice[i] - slice[i - 1]
    if (diff > 0) gains += diff; else losses -= diff
  }
  const avgGain = gains / period
  const avgLoss = losses / period
  if (avgLoss === 0) return 100
  return 100 - 100 / (1 + avgGain / avgLoss)
}

export function enkiCalcMACD(closes: number[]): { macd: number; signal: number; hist: number } | null {
  if (closes.length < 35) return null
  const ema12 = enkiCalcEMA(closes, 12)
  const ema26 = enkiCalcEMA(closes, 26)
  if (!ema12.length || !ema26.length) return null
  const minLen = Math.min(ema12.length, ema26.length)
  const macdLine: number[] = []
  for (let i = 0; i < minLen; i++) {
    macdLine.push(ema12[ema12.length - minLen + i] - ema26[ema26.length - minLen + i])
  }
  if (macdLine.length < 9) return null
  const signalLine = enkiCalcEMA(macdLine, 9)
  if (!signalLine.length) return null
  const macd = macdLine[macdLine.length - 1]
  const sig  = signalLine[signalLine.length - 1]
  return { macd, signal: sig, hist: macd - sig }
}

export function enkiCalcBB(closes: number[], period = 20, mult = 2): { upper: number; lower: number; mid: number } | null {
  if (closes.length < period) return null
  const slice = closes.slice(-period)
  const mid   = slice.reduce((a, b) => a + b, 0) / period
  const std   = Math.sqrt(slice.reduce((s, v) => s + (v - mid) ** 2, 0) / period)
  return { upper: mid + mult * std, lower: mid - mult * std, mid }
}

export function enkiCalcATR(highs: number[], lows: number[], closes: number[], period = 14): number | null {
  if (highs.length < period + 1) return null
  const trs: number[] = []
  for (let i = 1; i < highs.length; i++) {
    trs.push(Math.max(
      highs[i] - lows[i],
      Math.abs(highs[i] - closes[i - 1]),
      Math.abs(lows[i]  - closes[i - 1])
    ))
  }
  if (trs.length < period) return null
  return trs.slice(-period).reduce((a, b) => a + b, 0) / period
}

export function enkiVolumeSpike(volumes: number[], period = 20): boolean {
  if (volumes.length < period + 1) return false
  const avg = volumes.slice(-period - 1, -1).reduce((a, b) => a + b, 0) / period
  return avg > 0 && volumes[volumes.length - 1] > avg * 1.5
}

export function enkiCalcADX(highs: number[], lows: number[], closes: number[], period = 14): number | null {
  if (highs.length < period * 2 + 1) return null
  const trs: number[] = [], plusDM: number[] = [], minusDM: number[] = []
  for (let i = 1; i < highs.length; i++) {
    trs.push(Math.max(highs[i] - lows[i], Math.abs(highs[i] - closes[i-1]), Math.abs(lows[i] - closes[i-1])))
    const up = highs[i] - highs[i-1], dn = lows[i-1] - lows[i]
    plusDM.push(up > dn && up > 0 ? up : 0)
    minusDM.push(dn > up && dn > 0 ? dn : 0)
  }
  let atrW  = trs.slice(0, period).reduce((a, b) => a + b, 0)
  let plusW  = plusDM.slice(0, period).reduce((a, b) => a + b, 0)
  let minusW = minusDM.slice(0, period).reduce((a, b) => a + b, 0)
  const dxVals: number[] = []
  for (let i = period; i < trs.length; i++) {
    atrW   = atrW   - atrW  / period + trs[i]
    plusW  = plusW  - plusW / period + plusDM[i]
    minusW = minusW - minusW/ period + minusDM[i]
    if (atrW === 0) continue
    const diPlus = (plusW / atrW) * 100, diMinus = (minusW / atrW) * 100
    const dxDenom = diPlus + diMinus
    if (dxDenom === 0) continue
    dxVals.push(Math.abs(diPlus - diMinus) / dxDenom * 100)
  }
  if (dxVals.length < period) return null
  return dxVals.slice(-period).reduce((a, b) => a + b, 0) / period
}

export function enkiCalcPearsonCorr(a: number[], b: number[]): number {
  const n = Math.min(a.length, b.length)
  if (n < 5) return 0
  const as = a.slice(-n), bs = b.slice(-n)
  const ma = as.reduce((s, v) => s + v, 0) / n
  const mb = bs.reduce((s, v) => s + v, 0) / n
  let num = 0, da = 0, db = 0
  for (let i = 0; i < n; i++) {
    const va = as[i] - ma, vb = bs[i] - mb
    num += va * vb; da += va * va; db += vb * vb
  }
  const denom = Math.sqrt(da * db)
  return denom === 0 ? 0 : num / denom
}

/** BB width as % of midline — measures volatility compression/expansion. */
export function enkiCalcBBWidth(closes: number[]): number | null {
  const bb = enkiCalcBB(closes)
  if (!bb || bb.mid === 0) return null
  return (bb.upper - bb.lower) / bb.mid
}

/** Average ATR over a longer lookback to detect ATR expansion (rising vol). */
export function enkiCalcATRTrend(highs: number[], lows: number[], closes: number[]): 'expanding' | 'contracting' | 'neutral' | null {
  const atrShort = enkiCalcATR(highs, lows, closes, 7)
  const atrLong  = enkiCalcATR(highs, lows, closes, 21)
  if (atrShort === null || atrLong === null) return null
  const ratio = atrShort / atrLong
  if (ratio > 1.25) return 'expanding'
  if (ratio < 0.80) return 'contracting'
  return 'neutral'
}
