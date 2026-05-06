'use client'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

const AMOUNTS = [5, 10, 25, 50]

export default function GiveDonate() {
  const searchParams = useSearchParams()
  const [selected, setSelected] = useState(10)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const donated = searchParams.get('donated') === 'true'

  if (donated) {
    return (
      <div className="text-center p-8 rounded-2xl" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)' }}>
        <div className="text-4xl mb-3">🎉</div>
        <p className="font-extrabold text-lg text-green-400 mb-1">Thank you so much.</p>
        <p className="text-sm text-gray-400">Your donation goes directly to SM-Give — school supplies, baby essentials, and care packages for people who need it.</p>
      </div>
    )
  }

  async function handleDonate() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/give/donate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: selected }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        setError(data.error || 'Something went wrong. Try again.')
      }
    } catch {
      setError('Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="text-center">
      <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#F59E0B' }}>
        Direct donation — SM-Give
      </p>
      <p className="text-sm mb-5" style={{ color: '#9ca3af', lineHeight: 1.6 }}>
        100% of your donation funds school supplies, baby essentials, and homeless care packages.
        No login required.
      </p>
      <div className="flex justify-center gap-3 flex-wrap mb-5">
        {AMOUNTS.map(amt => (
          <button
            key={amt}
            onClick={() => setSelected(amt)}
            className="px-5 py-2.5 rounded-xl text-sm font-bold transition-all"
            style={{
              background: selected === amt ? '#F59E0B' : 'rgba(245,158,11,0.08)',
              color:      selected === amt ? '#000'    : '#d1d5db',
              border:     selected === amt ? '1px solid #F59E0B' : '1px solid rgba(245,158,11,0.2)',
            }}
          >
            ${amt}
          </button>
        ))}
      </div>
      <button
        onClick={handleDonate}
        disabled={loading}
        className="w-full max-w-xs mx-auto flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-extrabold transition-all"
        style={{
          background: loading ? 'rgba(245,158,11,0.5)' : '#F59E0B',
          color: '#000',
          opacity: loading ? 0.7 : 1,
          cursor: loading ? 'not-allowed' : 'pointer',
        }}
      >
        {loading ? 'Redirecting…' : `Donate $${selected} →`}
      </button>
      {error && <p className="mt-3 text-xs text-red-400">{error}</p>}
      <p className="mt-3 text-xs" style={{ color: '#4b5563' }}>
        Secured by Stripe. No account required.
      </p>
    </div>
  )
}
