'use client'
import { useState } from 'react'

const PACKS = [
  {
    id:       'soma_75',
    label:    'Single Run',
    credits:  75,
    amount:   '$4.99',
    desc:     '1 full week of content generation',
    popular:  false,
  },
  {
    id:       'soma_225',
    label:    'Triple Pack',
    credits:  225,
    amount:   '$12.99',
    desc:     '3 generation runs — best value',
    popular:  true,
  },
  {
    id:       'soma_500',
    label:    'Power Pack',
    credits:  500,
    amount:   '$24.99',
    desc:     '6+ runs — for power users',
    popular:  false,
  },
]

export default function SomaCreditPacks({ workspaceId }: { workspaceId: string | null }) {
  const [loading, setLoading] = useState<string | null>(null)
  const [error,   setError]   = useState('')

  async function purchase(packId: string) {
    if (!workspaceId) { setError('No workspace found.'); return }
    setLoading(packId)
    setError('')
    const res = await fetch('/api/soma/credits/purchase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pack_id: packId, workspace_id: workspaceId }),
    })
    const data = await res.json()
    setLoading(null)
    if (data.url) {
      window.location.href = data.url
    } else if (data.error === 'Pack not yet configured') {
      setError('Credit packs coming soon — check back shortly.')
    } else {
      setError(data.error || 'Something went wrong.')
    }
  }

  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wide text-secondary mb-3">Buy SOMA Credits</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {PACKS.map(pack => (
          <div
            key={pack.id}
            className={`relative border rounded-2xl p-4 flex flex-col gap-2 ${
              pack.popular
                ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/20'
                : 'border-theme bg-surface'
            }`}
          >
            {pack.popular && (
              <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-amber-400 text-black text-xs font-black px-3 py-0.5 rounded-full">
                Popular
              </span>
            )}
            <div>
              <p className="font-black text-primary text-sm">{pack.label}</p>
              <p className="text-2xl font-black text-amber-500">{pack.amount}</p>
              <p className="text-xs text-secondary mt-0.5">{pack.credits} credits · {pack.desc}</p>
            </div>
            <button
              onClick={() => purchase(pack.id)}
              disabled={loading === pack.id}
              className={`mt-auto w-full py-2 rounded-xl text-sm font-black transition-all disabled:opacity-50 ${
                pack.popular
                  ? 'bg-amber-400 hover:bg-amber-300 text-black'
                  : 'bg-background border border-theme hover:border-amber-400 text-primary'
              }`}
            >
              {loading === pack.id ? 'Redirecting…' : 'Buy Now'}
            </button>
          </div>
        ))}
      </div>
      {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
    </div>
  )
}
