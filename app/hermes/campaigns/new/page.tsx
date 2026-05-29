'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const CHANNELS = [
  { id: 'email',    label: 'Email',    icon: '📧', desc: 'Via Hunter.io + Resend. Best for agencies & freelancers.' },
  { id: 'bluesky',  label: 'Bluesky',  icon: '🦋', desc: 'DM via AT Protocol. Great for creators & builders.' },
  { id: 'mastodon', label: 'Mastodon', icon: '🐘', desc: 'Direct mention as DM. Open-source communities.' },
]

const COMING_CHANNELS = [
  { label: 'LinkedIn', icon: '💼', reason: 'Partner API required' },
  { label: 'X / Twitter', icon: '✖️', reason: '$100/mo API access' },
]

export default function NewCampaignPage() {
  const router = useRouter()
  const [name, setName]                 = useState('')
  const [goal, setGoal]                 = useState('')
  const [persona, setPersona]           = useState('')
  const [channels, setChannels]         = useState<string[]>(['email'])
  const [mode, setMode]                 = useState<'draft' | 'auto'>('draft')
  const [sequenceDays, setSequenceDays] = useState([0, 3, 7])
  const [loading, setLoading]           = useState(false)
  const [error, setError]               = useState<string | null>(null)

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
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-xl mx-auto px-6 py-8">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-8 text-sm">
          <Link href="/hermes/dashboard" className="text-gray-500 hover:text-white transition-colors">← HERMES</Link>
          <span className="text-gray-700">/</span>
          <span className="text-gray-300">New Campaign</span>
        </div>

        <h1 className="text-2xl font-extrabold mb-1">New Campaign</h1>
        <p className="text-sm text-gray-500 mb-8">HERMES will write, schedule, and send your outreach automatically.</p>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Name */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Campaign Name *</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Agency Outreach — May 2026"
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
              placeholder="e.g. Get social media agencies on Agency plan ($20/mo)"
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
              placeholder="e.g. Freelance social media managers handling 3–10 clients, looking to cut tool costs"
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-400 transition-colors resize-none"
            />
            <p className="text-xs text-gray-600 mt-1">HERMES uses this to personalize every message.</p>
          </div>

          {/* Channels */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Channels *</label>
            <div className="space-y-2">
              {CHANNELS.map(ch => (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => toggleChannel(ch.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
                    channels.includes(ch.id)
                      ? 'bg-amber-400/10 border-amber-400/30 text-white'
                      : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-500'
                  }`}>
                  <span className="text-xl">{ch.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold">{ch.label}</p>
                    <p className="text-xs text-gray-500">{ch.desc}</p>
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 transition-all ${
                    channels.includes(ch.id)
                      ? 'bg-amber-400 border-amber-400'
                      : 'border-gray-600'
                  }`} />
                </button>
              ))}

              {/* Coming soon */}
              {COMING_CHANNELS.map(ch => (
                <div
                  key={ch.label}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-800 bg-gray-900/50 opacity-50 cursor-not-allowed">
                  <span className="text-xl grayscale">{ch.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-500">{ch.label}</p>
                    <p className="text-xs text-gray-600">{ch.reason}</p>
                  </div>
                  <span className="text-xs bg-gray-800 text-gray-600 px-2 py-0.5 rounded-full border border-gray-700 flex-shrink-0">soon</span>
                </div>
              ))}
            </div>
          </div>

          {/* Mode */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Mode</label>
            <div className="grid grid-cols-2 gap-3">
              {([
                { id: 'draft', icon: '✏️', label: 'Draft Mode', desc: 'AI writes messages for your review. You send manually.' },
                { id: 'auto',  icon: '⚡', label: 'Auto-Send',  desc: 'AI writes and sends follow-ups automatically on schedule.' },
              ] as const).map(m => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMode(m.id)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    mode === m.id
                      ? m.id === 'auto'
                        ? 'bg-purple-500/10 border-purple-500/40'
                        : 'bg-gray-800 border-gray-500'
                      : 'bg-gray-900 border-gray-700 hover:border-gray-500'
                  }`}>
                  <p className="text-sm font-bold mb-1">{m.icon} {m.label}</p>
                  <p className="text-xs text-gray-500">{m.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Sequence */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Follow-up Schedule</label>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>Intro sent immediately · follow-ups on the days below</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 px-3 py-2 bg-gray-800 rounded-lg text-xs text-center text-gray-400">
                  Day 0<br/><span className="text-white font-bold">Intro</span>
                </div>
                <span className="text-gray-700 text-sm">→</span>
                <div className="flex-1 px-3 py-2 bg-gray-800 rounded-lg text-xs text-center">
                  <span className="text-gray-500">Day </span>
                  <input
                    type="number" min={1}
                    value={sequenceDays[1] ?? 3}
                    onChange={e => updateDay(1, e.target.value)}
                    className="w-8 bg-transparent text-white font-bold focus:outline-none text-center"
                  />
                  <br/><span className="text-gray-400">Follow-up 1</span>
                </div>
                <span className="text-gray-700 text-sm">→</span>
                <div className="flex-1 px-3 py-2 bg-gray-800 rounded-lg text-xs text-center">
                  <span className="text-gray-500">Day </span>
                  <input
                    type="number" min={1}
                    value={sequenceDays[2] ?? 7}
                    onChange={e => updateDay(2, e.target.value)}
                    className="w-8 bg-transparent text-white font-bold focus:outline-none text-center"
                  />
                  <br/><span className="text-gray-400">Follow-up 2</span>
                </div>
                <span className="text-gray-700 text-sm">→</span>
                <div className="flex-1 px-3 py-2 bg-gray-800 rounded-lg text-xs text-center text-gray-400">
                  Auto<br/><span className="text-white font-bold">Break-up</span>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || channels.length === 0}
            className="w-full py-3.5 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-black font-extrabold rounded-xl transition-all text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-400/10">
            {loading
              ? <><div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> Creating...</>
              : 'Create Campaign →'}
          </button>
        </form>
      </div>
    </div>
  )
}
