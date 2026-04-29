'use client'
import { useState, useEffect } from 'react'
import { useWorkspace } from '@/contexts/WorkspaceContext'
import Link from 'next/link'

const GOALS = [
  { id: 'brand_deal',    label: '💰 Brand Deal / Sponsorship' },
  { id: 'collaboration', label: '🤝 Creative Collaboration'    },
  { id: 'partnership',   label: '🔗 Business Partnership'      },
  { id: 'client_pitch',  label: '📊 Client Pitch'             },
  { id: 'press',         label: '📰 Press / Media Coverage'   },
  { id: 'other',         label: '✉️ Other'                    },
]

const TONES = [
  { id: 'professional', label: 'Professional' },
  { id: 'casual',       label: 'Casual'       },
  { id: 'bold',         label: 'Bold'         },
  { id: 'friendly',     label: 'Friendly'     },
]

type Draft = {
  id: string
  target_name: string
  goal: string
  subject: string
  body: string
  created_at: string
}

export default function EmailOutreachPage() {
  const { workspaceId, credits } = useWorkspace()

  const [targetName,    setTargetName]    = useState('')
  const [goal,          setGoal]          = useState('brand_deal')
  const [yourPitch,     setYourPitch]     = useState('')
  const [tone,          setTone]          = useState('professional')
  const [contextNotes,  setContextNotes]  = useState('')
  const [loading,       setLoading]       = useState(false)
  const [result,        setResult]        = useState<{ subject: string; body: string } | null>(null)
  const [error,         setError]         = useState('')
  const [copied,        setCopied]        = useState<'subject' | 'body' | 'all' | null>(null)
  const [drafts,        setDrafts]        = useState<Draft[]>([])
  const [showHistory,   setShowHistory]   = useState(false)

  useEffect(() => {
    if (!workspaceId) return
    fetch(`/api/agents/email-outreach?workspace_id=${workspaceId}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.drafts) setDrafts(d.drafts) })
  }, [workspaceId])

  async function generate() {
    if (!targetName.trim() || !yourPitch.trim()) {
      setError('Fill in the target name and your pitch.')
      return
    }
    setLoading(true)
    setError('')
    setResult(null)

    const res = await fetch('/api/agents/email-outreach', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        target_name:    targetName,
        goal,
        your_pitch:     yourPitch,
        tone,
        context_notes:  contextNotes,
        workspace_id:   workspaceId,
      }),
    })
    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      if (data.error === 'insufficient_credits') {
        setError('Not enough credits. Buy more in Settings → Plan.')
      } else {
        setError(data.error || 'Something went wrong.')
      }
      return
    }

    setResult(data)
    // Refresh history
    fetch(`/api/agents/email-outreach?workspace_id=${workspaceId}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.drafts) setDrafts(d.drafts) })
  }

  function copy(text: string, type: 'subject' | 'body' | 'all') {
    navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  const remaining = credits?.remaining ?? 0

  return (
    <div className="min-h-screen bg-background p-6 md:p-10 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link href="/agents" className="text-xs text-secondary hover:text-primary mb-4 inline-block">← Back to Agents</Link>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">✉️</span>
          <h1 className="text-2xl font-black text-primary">Email Outreach Agent</h1>
        </div>
        <p className="text-secondary text-sm">
          Write cold outreach emails for brand deals, collabs, client pitches — personalized and ready to send in seconds.
        </p>
        <div className="mt-2 flex items-center gap-3 text-xs text-secondary">
          <span className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full font-semibold">5 credits / email</span>
          <span>{remaining} credits remaining</span>
        </div>
      </div>

      {/* Form */}
      <div className="bg-surface border border-theme rounded-2xl p-6 mb-6 space-y-5">
        {/* Target */}
        <div>
          <label className="block text-xs font-bold text-secondary uppercase tracking-wide mb-1">Who are you reaching out to?</label>
          <input
            type="text"
            value={targetName}
            onChange={e => setTargetName(e.target.value)}
            placeholder="e.g. Nike, Morning Brew, Sarah at Acme Co."
            className="w-full bg-background border border-theme rounded-xl px-4 py-2.5 text-sm text-primary placeholder:text-gray-400 focus:outline-none focus:border-amber-400"
          />
        </div>

        {/* Goal */}
        <div>
          <label className="block text-xs font-bold text-secondary uppercase tracking-wide mb-2">What's the goal?</label>
          <div className="flex flex-wrap gap-2">
            {GOALS.map(g => (
              <button
                key={g.id}
                onClick={() => setGoal(g.id)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
                  goal === g.id
                    ? 'bg-amber-400 text-black border-amber-400'
                    : 'bg-background border-theme text-secondary hover:border-amber-400'
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>

        {/* Your pitch */}
        <div>
          <label className="block text-xs font-bold text-secondary uppercase tracking-wide mb-1">Your pitch — who are you & what do you offer?</label>
          <textarea
            value={yourPitch}
            onChange={e => setYourPitch(e.target.value)}
            rows={3}
            placeholder="e.g. I run a creator tools newsletter with 8k subscribers in the indie founder niche. I do one sponsored spot per week and my open rate is 52%."
            className="w-full bg-background border border-theme rounded-xl px-4 py-2.5 text-sm text-primary placeholder:text-gray-400 focus:outline-none focus:border-amber-400 resize-none"
          />
        </div>

        {/* Tone */}
        <div>
          <label className="block text-xs font-bold text-secondary uppercase tracking-wide mb-2">Tone</label>
          <div className="flex gap-2 flex-wrap">
            {TONES.map(t => (
              <button
                key={t.id}
                onClick={() => setTone(t.id)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
                  tone === t.id
                    ? 'bg-amber-400 text-black border-amber-400'
                    : 'bg-background border-theme text-secondary hover:border-amber-400'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Optional context */}
        <div>
          <label className="block text-xs font-bold text-secondary uppercase tracking-wide mb-1">
            Anything specific to mention? <span className="font-normal normal-case">(optional)</span>
          </label>
          <input
            type="text"
            value={contextNotes}
            onChange={e => setContextNotes(e.target.value)}
            placeholder="e.g. They just launched a new product line, or I saw their campaign last week"
            className="w-full bg-background border border-theme rounded-xl px-4 py-2.5 text-sm text-primary placeholder:text-gray-400 focus:outline-none focus:border-amber-400"
          />
        </div>

        {error && <p className="text-xs text-red-500">{error}</p>}

        <button
          onClick={generate}
          disabled={loading || remaining < 5}
          className="w-full bg-amber-400 hover:bg-amber-300 disabled:opacity-50 disabled:cursor-not-allowed text-black font-black py-3 rounded-xl transition-all text-sm"
        >
          {loading ? 'Writing your email…' : '✉️ Generate Email — 5 credits'}
        </button>

        {remaining < 5 && (
          <p className="text-xs text-center text-red-500">
            Not enough credits. <Link href="/settings?tab=Plan" className="underline">Buy more →</Link>
          </p>
        )}
      </div>

      {/* Result */}
      {result && (
        <div className="bg-surface border border-amber-400 rounded-2xl p-6 mb-6 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wide text-amber-500">Your Email</p>
            <button
              onClick={() => copy(`Subject: ${result.subject}\n\n${result.body}`, 'all')}
              className="text-xs font-semibold text-secondary hover:text-primary border border-theme px-3 py-1 rounded-lg transition-all"
            >
              {copied === 'all' ? '✓ Copied!' : 'Copy all'}
            </button>
          </div>

          {/* Subject */}
          <div className="bg-background border border-theme rounded-xl p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-secondary uppercase tracking-wide">Subject</span>
              <button
                onClick={() => copy(result.subject, 'subject')}
                className="text-xs text-secondary hover:text-primary"
              >
                {copied === 'subject' ? '✓ Copied' : 'Copy'}
              </button>
            </div>
            <p className="text-sm font-semibold text-primary">{result.subject}</p>
          </div>

          {/* Body */}
          <div className="bg-background border border-theme rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-secondary uppercase tracking-wide">Body</span>
              <button
                onClick={() => copy(result.body, 'body')}
                className="text-xs text-secondary hover:text-primary"
              >
                {copied === 'body' ? '✓ Copied' : 'Copy'}
              </button>
            </div>
            <p className="text-sm text-primary whitespace-pre-wrap leading-relaxed">{result.body}</p>
          </div>

          <button
            onClick={generate}
            disabled={loading || remaining < 5}
            className="text-xs text-secondary hover:text-primary font-semibold border border-theme px-4 py-2 rounded-xl transition-all disabled:opacity-50"
          >
            {loading ? 'Regenerating…' : '↻ Regenerate'}
          </button>
        </div>
      )}

      {/* History */}
      {drafts.length > 0 && (
        <div className="bg-surface border border-theme rounded-2xl p-6">
          <button
            onClick={() => setShowHistory(h => !h)}
            className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wide text-secondary"
          >
            <span>Previous Emails ({drafts.length})</span>
            <span>{showHistory ? '▲' : '▼'}</span>
          </button>
          {showHistory && (
            <div className="mt-4 space-y-3">
              {drafts.map(d => (
                <button
                  key={d.id}
                  onClick={() => setResult({ subject: d.subject, body: d.body })}
                  className="w-full text-left border border-theme rounded-xl p-4 hover:border-amber-400 transition-all"
                >
                  <p className="text-xs font-bold text-primary truncate">{d.subject}</p>
                  <p className="text-xs text-secondary mt-0.5">To: {d.target_name} · {new Date(d.created_at).toLocaleDateString()}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
