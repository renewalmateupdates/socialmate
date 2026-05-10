'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const CHANNELS = [
  { id: 'email',    label: 'Email',    icon: '📧' },
  { id: 'bluesky',  label: 'Bluesky',  icon: '🦋' },
  { id: 'mastodon', label: 'Mastodon', icon: '🐘' },
]

export default function NewCampaignPage() {
  const router = useRouter()
  const [name, setName]                   = useState('')
  const [goal, setGoal]                   = useState('')
  const [persona, setPersona]             = useState('')
  const [channels, setChannels]           = useState<string[]>(['email'])
  const [mode, setMode]                   = useState<'draft' | 'auto'>('draft')
  const [sequenceDays, setSequenceDays]   = useState([0, 3, 7])
  const [loading, setLoading]             = useState(false)
  const [error, setError]                 = useState<string | null>(null)

  const toggleChannel = (ch: string) => {
    setChannels(prev => prev.includes(ch) ? prev.filter(c => c !== ch) : [...prev, ch])
  }

  const updateDay = (idx: number, val: string) => {
    const n = parseInt(val)
    if (isNaN(n) || n < 0) return
    setSequenceDays(prev => { const next = [...prev]; next[idx] = n; return next })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) { setError('Campaign name is required'); return }
    if (channels.length === 0) { setError('Select at least one channel'); return }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/hermes/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, goal, persona_description: persona, channels, sequence_days: sequenceDays, mode }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed'); return }
      router.push(`/hermes/campaigns/${data.campaign.id}`)
    } catch { setError('Something went wrong') }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/hermes" className="text-gray-500 hover:text-white transition-colors text-sm">← HERMES</Link>
          <span className="text-gray-700">/</span>
          <span className="text-sm text-gray-300">New Campaign</span>
        </div>

        <h1 className="text-2xl font-extrabold mb-6">New Campaign</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Campaign Name *</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Podcast Guest Pitches"
              required
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-400 transition-colors"
            />
          </div>

          {/* Goal */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Goal</label>
            <input
              value={goal}
              onChange={e => setGoal(e.target.value)}
              placeholder="e.g. Get booked as a podcast guest to talk SocialMate"
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-400 transition-colors"
            />
          </div>

          {/* Persona */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Target Persona</label>
            <textarea
              value={persona}
              onChange={e => setPersona(e.target.value)}
              rows={3}
              placeholder="e.g. Indie hackers + creator economy podcast hosts with 1k-50k listeners"
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-400 transition-colors resize-none"
            />
          </div>

          {/* Channels */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Channels *</label>
            <div className="flex gap-3">
              {CHANNELS.map(ch => (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => toggleChannel(ch.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                    channels.includes(ch.id)
                      ? 'bg-amber-400/10 border-amber-400/40 text-amber-400'
                      : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-500'
                  }`}>
                  <span>{ch.icon}</span>
                  <span>{ch.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Mode */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Mode</label>
            <div className="flex gap-3">
              {(['draft', 'auto'] as const).map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={`flex-1 py-3 rounded-xl border text-sm font-bold transition-all ${
                    mode === m
                      ? m === 'auto'
                        ? 'bg-purple-500/10 border-purple-500/40 text-purple-400'
                        : 'bg-gray-800 border-gray-600 text-white'
                      : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-500'
                  }`}>
                  {m === 'draft' ? '✏️ Draft mode' : '⚡ Auto-send'}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {mode === 'draft'
                ? 'AI writes messages for your review. You send manually.'
                : 'AI writes and sends follow-ups automatically on schedule.'}
            </p>
          </div>

          {/* Sequence days */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Follow-up Schedule (days after intro)</label>
            <div className="flex gap-3 items-center">
              <div className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-300">
                Day 0 — Intro
              </div>
              <span className="text-gray-600">→</span>
              <div className="flex-1">
                <div className="flex items-center gap-2 bg-gray-900 border border-gray-700 rounded-xl px-4 py-3">
                  <span className="text-xs text-gray-500">Day</span>
                  <input
                    type="number"
                    min={1}
                    value={sequenceDays[1] ?? 3}
                    onChange={e => updateDay(1, e.target.value)}
                    className="w-12 bg-transparent text-sm text-white focus:outline-none text-center"
                  />
                  <span className="text-xs text-gray-500 ml-auto">Follow-up 1</span>
                </div>
              </div>
              <span className="text-gray-600">→</span>
              <div className="flex-1">
                <div className="flex items-center gap-2 bg-gray-900 border border-gray-700 rounded-xl px-4 py-3">
                  <span className="text-xs text-gray-500">Day</span>
                  <input
                    type="number"
                    min={1}
                    value={sequenceDays[2] ?? 7}
                    onChange={e => updateDay(2, e.target.value)}
                    className="w-12 bg-transparent text-sm text-white focus:outline-none text-center"
                  />
                  <span className="text-xs text-gray-500 ml-auto">Follow-up 2</span>
                </div>
              </div>
            </div>
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-amber-400 hover:bg-amber-500 disabled:opacity-50 text-black font-extrabold rounded-xl transition-all text-sm flex items-center justify-center gap-2">
            {loading
              ? <><div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> Creating...</>
              : 'Create Campaign →'}
          </button>
        </form>
      </div>
    </div>
  )
}
