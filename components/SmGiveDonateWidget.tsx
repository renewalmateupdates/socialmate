'use client'
import { useState } from 'react'

const DONATION_AMOUNTS = [5, 10, 25, 50]

// Amber/warm design tokens matching /give page
const amber = '#F59E0B'

export default function SmGiveDonateWidget() {
  const [customAmount, setCustomAmount] = useState('')
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleDonate = async () => {
    const amount = customAmount ? parseFloat(customAmount) : selectedAmount
    if (!amount || amount <= 0) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/donations/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, donation_type: 'charity' }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        setError('Something went wrong. Please try again.')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const activeAmount = customAmount ? parseFloat(customAmount) : selectedAmount

  return (
    <div style={{
      background: 'rgba(245,158,11,0.05)',
      border: '1px solid rgba(245,158,11,0.25)',
      borderRadius: 20,
      padding: '40px 36px',
      maxWidth: 560,
      margin: '0 auto',
    }}>
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <span style={{
          display: 'inline-block',
          fontSize: 11, fontWeight: 800, color: amber,
          textTransform: 'uppercase' as const, letterSpacing: '0.1em',
          background: 'rgba(245,158,11,0.1)',
          border: '1px solid rgba(245,158,11,0.25)',
          borderRadius: 20, padding: '4px 14px', marginBottom: 16,
        }}>
          100% goes to charity
        </span>
        <h3 style={{ fontSize: 22, fontWeight: 800, color: '#f1f1f1', margin: '0 0 8px', letterSpacing: '-0.01em' }}>
          Donate to SM-Give ❤️
        </h3>
        <p style={{ fontSize: 14, color: '#9ca3af', margin: 0, lineHeight: 1.6, maxWidth: 400, marginLeft: 'auto', marginRight: 'auto' }}>
          Every dollar goes directly to school supplies, baby essentials, and homeless care packages. Nothing held back.
        </p>
      </div>

      {/* Amount selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' as const, justifyContent: 'center', marginBottom: 20 }}>
        {DONATION_AMOUNTS.map(amount => (
          <button key={amount}
            onClick={() => { setSelectedAmount(amount); setCustomAmount('') }}
            style={{
              padding: '10px 20px',
              borderRadius: 12,
              fontSize: 14, fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s',
              border: selectedAmount === amount && !customAmount
                ? `2px solid ${amber}`
                : '2px solid #2a2a2a',
              background: selectedAmount === amount && !customAmount
                ? 'rgba(245,158,11,0.15)'
                : '#161616',
              color: selectedAmount === amount && !customAmount
                ? amber
                : '#9ca3af',
            }}>
            ${amount}
          </button>
        ))}
        <div style={{
          display: 'flex', alignItems: 'center',
          border: customAmount ? `2px solid ${amber}` : '2px solid #2a2a2a',
          borderRadius: 12, overflow: 'hidden',
          background: '#161616',
        }}>
          <span style={{ padding: '10px 12px', fontSize: 14, color: '#6b7280', background: '#111' }}>$</span>
          <input
            type="number"
            placeholder="Custom"
            value={customAmount}
            min="1"
            onChange={e => { setCustomAmount(e.target.value); setSelectedAmount(null) }}
            style={{
              width: 80, padding: '10px 12px', fontSize: 14,
              outline: 'none', background: '#161616',
              color: '#f1f1f1', border: 'none',
            }}
          />
        </div>
      </div>

      {error && (
        <p style={{ textAlign: 'center', fontSize: 13, color: '#ef4444', marginBottom: 12 }}>{error}</p>
      )}

      <button
        onClick={handleDonate}
        disabled={!activeAmount || activeAmount <= 0 || loading}
        style={{
          display: 'block',
          width: '100%',
          padding: '14px 24px',
          borderRadius: 12,
          background: !activeAmount || activeAmount <= 0 ? '#2a2a2a' : amber,
          color: !activeAmount || activeAmount <= 0 ? '#6b7280' : '#000',
          fontSize: 15, fontWeight: 800,
          border: 'none', cursor: !activeAmount || activeAmount <= 0 ? 'not-allowed' : 'pointer',
          transition: 'all 0.15s',
          opacity: loading ? 0.7 : 1,
        }}>
        {loading ? 'Redirecting to Stripe...' : 'Donate to SM-Give ❤️'}
      </button>

      <p style={{ textAlign: 'center', fontSize: 12, color: '#4b5563', marginTop: 14, lineHeight: 1.6 }}>
        Payments processed securely via Stripe. Voluntary — not a subscription.
        100% of this donation is allocated to SM-Give charity.
      </p>
    </div>
  )
}
