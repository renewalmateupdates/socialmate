'use client'
import { useEffect, useState } from 'react'

type GiveStats = {
  total_cents: number
  count: number
  breakdown: Record<string, number>
}

const SOURCE_LABELS: Record<string, string> = {
  subscription: 'Subscriptions',
  donation: 'Donations',
  affiliate_unclaimed: 'Unclaimed Affiliates',
  merch: 'Merch',
}

export default function GiveLiveCounter() {
  const [data, setData] = useState<GiveStats | null>(null)

  useEffect(() => {
    fetch('/api/give/stats').then(r => r.json()).then(setData)
  }, [])

  const total = data ? (data.total_cents / 100).toFixed(2) : '—'
  const count = data?.count ?? 0
  const breakdown = data?.breakdown ?? {}
  const breakdownEntries = Object.entries(breakdown).filter(([, v]) => v > 0)

  return (
    <div style={{
      display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-start', gap: 10,
      background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)',
      borderRadius: 16, padding: '14px 22px', marginBottom: 32,
      maxWidth: 480, width: '100%',
    }}>
      {/* Top row: pulse + label + amount */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ position: 'relative', display: 'inline-flex', flexShrink: 0 }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#10B981', display: 'block' }} />
          <span style={{
            position: 'absolute', top: 0, left: 0, width: 10, height: 10,
            borderRadius: '50%', background: '#10B981', opacity: 0.4,
            animation: 'smgive-ping 1.5s cubic-bezier(0,0,0.2,1) infinite',
          }} />
        </span>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#10B981', whiteSpace: 'nowrap' }}>Live · SM-Give Fund</span>
          <span style={{ fontSize: 20, fontWeight: 900, color: '#f1f1f1', letterSpacing: '-0.02em' }}>${total}</span>
          <span style={{ fontSize: 12, color: '#6b7280' }}>across {count} contribution{count !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Breakdown row */}
      {breakdownEntries.length > 0 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', paddingLeft: 20 }}>
          {breakdownEntries.map(([source, cents]) => (
            <span key={source} style={{
              fontSize: 11, color: '#9ca3af',
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 6, padding: '3px 8px',
            }}>
              {SOURCE_LABELS[source] ?? source}: ${(cents / 100).toFixed(2)}
            </span>
          ))}
        </div>
      )}

      <style>{`@keyframes smgive-ping { 75%,100% { transform: scale(2); opacity: 0; } }`}</style>
    </div>
  )
}
