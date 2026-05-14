'use client'
import { useState } from 'react'

export default function GuideEmailCapture() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !email.includes('@')) { setError('Enter a valid email'); return }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/gils-guide/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      if (res.ok) { setDone(true) } else { setError('Something went wrong — try again') }
    } catch { setError('Something went wrong — try again') }
    finally { setLoading(false) }
  }

  return (
    <div className="my-16 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-8 text-center">
      {done ? (
        <>
          <div className="text-4xl mb-3">📬</div>
          <p className="text-lg font-extrabold text-white mb-2">You're in!</p>
          <p className="text-sm text-gray-400">Check your inbox — I sent you the full guide. New volumes land there first.</p>
        </>
      ) : (
        <>
          <div className="text-3xl mb-3">📖</div>
          <p className="text-base font-extrabold text-white mb-2">Get new guides when they drop</p>
          <p className="text-sm text-gray-400 mb-6 max-w-sm mx-auto leading-relaxed">
            No courses. No upsells. Just the real stuff — straight to your inbox, free forever.
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-sm mx-auto">
            <input
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setError('') }}
              placeholder="your@email.com"
              className="flex-1 px-4 py-3 rounded-xl bg-[#111] border border-[#2a2a2a] text-white placeholder-gray-600 text-sm focus:outline-none focus:border-amber-500/50 transition-colors"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-3 bg-amber-500 hover:bg-amber-400 text-black text-sm font-bold rounded-xl transition-all disabled:opacity-50 flex-shrink-0">
              {loading ? '...' : 'Get notified →'}
            </button>
          </form>
          {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
          <p className="text-xs text-gray-700 mt-3">No spam. Unsubscribe anytime.</p>
        </>
      )}
    </div>
  )
}
