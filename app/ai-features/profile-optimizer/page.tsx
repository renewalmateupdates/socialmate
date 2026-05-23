'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Sidebar from '@/components/Sidebar'
import Link from 'next/link'
import { useWorkspace } from '@/contexts/WorkspaceContext'

type Platform = 'twitter' | 'linkedin' | 'instagram' | 'tiktok' | 'bluesky' | 'general'
type Goal = 'Get more followers' | 'Drive website traffic' | 'Get clients' | 'Build brand awareness' | 'Get collaborations'

const PLATFORMS: { id: Platform; label: string; emoji: string }[] = [
  { id: 'twitter',   label: 'X / Twitter', emoji: '𝕏'  },
  { id: 'linkedin',  label: 'LinkedIn',    emoji: '💼' },
  { id: 'instagram', label: 'Instagram',   emoji: '📸' },
  { id: 'tiktok',    label: 'TikTok',      emoji: '🎵' },
  { id: 'bluesky',   label: 'Bluesky',     emoji: '🦋' },
  { id: 'general',   label: 'General',     emoji: '✍️' },
]

const GOALS: Goal[] = [
  'Get more followers',
  'Drive website traffic',
  'Get clients',
  'Build brand awareness',
  'Get collaborations',
]

interface Improvement {
  issue: string
  fix: string
}

interface OptimizerResult {
  score: number
  scoreLabel: string
  improvements: Improvement[]
  rewrite: string
}

function ScoreRing({ score }: { score: number }) {
  const radius = 36
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  const color =
    score >= 70 ? '#22c55e'
    : score >= 50 ? '#f59e0b'
    : '#ef4444'

  return (
    <div className="relative flex items-center justify-center w-24 h-24">
      <svg width="96" height="96" className="rotate-[-90deg]">
        <circle cx="48" cy="48" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="8" className="dark:stroke-gray-700" />
        <circle
          cx="48" cy="48" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-xl font-extrabold text-gray-900 dark:text-gray-100">{score}</span>
        <span className="text-xs font-bold text-gray-400">/100</span>
      </div>
    </div>
  )
}

export default function ProfileOptimizerPage() {
  const router = useRouter()
  const { credits, applyCredits } = useWorkspace()
  const [loading, setLoading] = useState(true)

  const [platform, setPlatform] = useState<Platform>('twitter')
  const [currentBio, setCurrentBio] = useState('')
  const [goal, setGoal] = useState<Goal>('Get more followers')

  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<OptimizerResult | null>(null)
  const [copiedRewrite, setCopiedRewrite] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.push('/login?redirect=/ai-features/profile-optimizer')
      else setLoading(false)
    })
  }, [router])

  async function analyze() {
    setError('')
    if (!currentBio.trim()) { setError('Paste your current bio first.'); return }
    if (credits < 5) { setError('Not enough credits. You need 5 credits.'); return }

    setGenerating(true)
    setResult(null)
    try {
      const res = await fetch('/api/ai/profile-optimizer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform, currentBio, goal }),
      })
      const data = await res.json()
      if (!res.ok || data.error) {
        if (data.error === 'rate_limited') {
          setError(data.message || "You're going too fast — wait 30 seconds and try again.")
        } else {
          setError(data.error || 'Something went wrong. Please try again.')
        }
        return
      }
      setResult({
        score: data.score,
        scoreLabel: data.scoreLabel,
        improvements: data.improvements,
        rewrite: data.rewrite,
      })
      if (typeof data.monthlyRemaining === 'number') {
        applyCredits(data.monthlyRemaining, data.earnedRemaining ?? 0, data.paidRemaining ?? 0)
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  function copyRewrite() {
    if (!result?.rewrite) return
    navigator.clipboard.writeText(result.rewrite).then(() => {
      setCopiedRewrite(true)
      setTimeout(() => setCopiedRewrite(false), 2000)
    })
  }

  const scoreBg =
    result && result.score >= 70
      ? 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800'
      : result && result.score >= 50
      ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800'
      : result
      ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800'
      : ''

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-theme">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black dark:border-white" />
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-theme flex">
      <Sidebar />
      <main className="md:ml-56 flex-1 p-4 md:p-8">
        <div className="max-w-2xl mx-auto">

          <div className="flex items-center gap-3 mb-2">
            <Link href="/ai-features" className="text-xs text-gray-400 hover:text-gray-200 transition-colors">
              ← AI Features
            </Link>
          </div>

          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
                <span>🔍</span> Profile Optimizer
              </h1>
              <p className="text-sm text-gray-400 mt-1">Score your bio, get 3 fixes, and see an AI-rewritten version.</p>
            </div>
            <div className="text-right px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Credits</p>
              <p className="text-xl font-extrabold text-gray-900 dark:text-gray-100">{credits}</p>
            </div>
          </div>

          <div className="bg-surface border border-theme rounded-2xl p-6 mb-6">
            <div className="flex flex-col gap-5">

              {/* Platform selector */}
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                  Platform
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {PLATFORMS.map(p => (
                    <button
                      key={p.id}
                      onClick={() => setPlatform(p.id)}
                      className={`flex items-center gap-2 py-2.5 px-3 rounded-xl border text-sm font-bold transition-all ${
                        platform === p.id
                          ? 'bg-amber-400 text-black border-amber-400'
                          : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-amber-400 dark:hover:border-amber-500'
                      }`}
                    >
                      <span>{p.emoji}</span>
                      <span className="truncate">{p.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Current bio */}
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                  Paste your current bio
                </label>
                <textarea
                  value={currentBio}
                  onChange={e => setCurrentBio(e.target.value)}
                  placeholder="Paste your existing bio here…"
                  rows={4}
                  style={{ fontSize: '16px' }}
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 outline-none focus:border-amber-400 dark:focus:border-amber-500 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 placeholder-gray-300 dark:placeholder-gray-600 resize-none transition-colors"
                />
                <p className="mt-1 text-xs text-gray-400 text-right">{currentBio.length} chars</p>
              </div>

              {/* Goal */}
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                  Primary goal for this profile
                </label>
                <div className="flex flex-wrap gap-2">
                  {GOALS.map(g => (
                    <button
                      key={g}
                      onClick={() => setGoal(g)}
                      className={`text-xs font-bold px-3.5 py-2 rounded-full border transition-all ${
                        goal === g
                          ? 'bg-amber-400 text-black border-amber-400'
                          : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-amber-400 dark:hover:border-amber-500'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={analyze}
                disabled={generating || !currentBio.trim()}
                className="w-full bg-amber-400 hover:bg-amber-500 disabled:opacity-40 disabled:cursor-not-allowed text-black text-sm font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                {generating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    Analyzing your bio…
                  </>
                ) : (
                  <>🔍 Analyze & Optimize — 5 credits</>
                )}
              </button>

              {error && (
                <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl px-3 py-2">
                  <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}
            </div>
          </div>

          {result && (
            <div className="flex flex-col gap-4">

              {/* Score card */}
              <div className={`border rounded-2xl p-5 flex items-center gap-6 ${scoreBg}`}>
                <ScoreRing score={result.score} />
                <div>
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Bio Score</p>
                  <p className="text-2xl font-extrabold text-gray-900 dark:text-gray-100">{result.scoreLabel}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {result.score >= 70
                      ? 'Solid bio — a few tweaks and you\'re golden.'
                      : result.score >= 50
                      ? 'Good start — some key things to fix below.'
                      : 'Needs rework — apply the fixes below to level up.'}
                  </p>
                </div>
              </div>

              {/* Improvements */}
              <div className="bg-surface border border-theme rounded-2xl p-5">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">3 Things to Fix</p>
                <div className="flex flex-col gap-3">
                  {result.improvements.map((imp, i) => (
                    <div key={i} className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 text-xs font-extrabold flex items-center justify-center">
                        {i + 1}
                      </span>
                      <div>
                        <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{imp.issue}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Fix: {imp.fix}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rewritten bio */}
              <div className="bg-surface border border-theme rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">✨</span>
                    <p className="text-sm font-extrabold text-gray-900 dark:text-gray-100">Rewritten Version</p>
                  </div>
                  <button
                    onClick={copyRewrite}
                    className="text-xs font-bold px-3 py-1.5 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:opacity-80 transition-all"
                  >
                    {copiedRewrite ? '✓ Copied!' : '📋 Copy'}
                  </button>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {result.rewrite}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={analyze}
                  disabled={generating}
                  className="flex-1 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-bold py-2.5 rounded-xl hover:border-amber-400 dark:hover:border-amber-500 transition-all disabled:opacity-40"
                >
                  🔄 Re-analyze
                </button>
                <Link
                  href="/ai-features/bio-writer"
                  className="flex-1 text-center bg-black dark:bg-white text-white dark:text-black text-sm font-bold py-2.5 rounded-xl hover:opacity-80 transition-all"
                >
                  ✍️ Write new bio →
                </Link>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  )
}
