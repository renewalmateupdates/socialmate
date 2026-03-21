'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'
import { useWorkspace } from '@/contexts/WorkspaceContext'

const CREDIT_COST = 10

export default function ContentGapPage() {
  const router = useRouter()
  const { credits, setCredits, plan } = useWorkspace()
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [niche, setNiche] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.push('/login')
      else setLoading(false)
    })
  }, [router])

  const handleAnalyze = async () => {
    if (!niche.trim()) { setError('Enter your niche to continue'); return }
    if (credits < CREDIT_COST) { setError(`You need at least ${CREDIT_COST} credits to run this scan`); return }
    setAnalyzing(true)
    setError('')
    setResult(null)

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool: 'content_gap', content: niche, platform: 'general' }),
      })
      const data = await res.json()
      if (data.error) { setError(data.error); setAnalyzing(false); return }
      setResult(data.result)
      setCredits(credits - CREDIT_COST)
    } catch {
      setError('Something went wrong. Please try again.')
    }
    setAnalyzing(false)
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-theme">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-theme flex">
      <Sidebar />
      <main className="md:ml-56 flex-1 p-4 md:p-8">
        <div className="max-w-3xl mx-auto">

          <div className="flex items-start justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">🕳️</span>
                <h1 className="text-2xl font-extrabold tracking-tight">Content Gap Detector</h1>
              </div>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                Spot underserved topics and missing content in your niche before your audience notices.
              </p>
            </div>
            <div className="text-right">
              <div className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1">Cost per scan</div>
              <div className="text-xl font-extrabold">{CREDIT_COST} <span className="text-sm font-semibold text-gray-400 dark:text-gray-500">credits</span></div>
              <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{credits} remaining</div>
            </div>
          </div>

          <div className="bg-surface border border-theme rounded-2xl p-5 mb-6">
            <h2 className="text-sm font-extrabold mb-3">What the detector catches</h2>
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: '🕳️', label: 'Content gaps',   desc: 'Topics underserved or missing entirely in your niche' },
                { icon: '❓', label: 'Audience questions', desc: 'What your audience is asking that nobody answers well' },
                { icon: '📐', label: 'Format gaps',    desc: 'Content formats your niche is underusing' },
              ].map(item => (
                <div key={item.label} className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <span className="text-2xl block mb-2">{item.icon}</span>
                  <p className="text-xs font-bold text-gray-900 dark:text-gray-100 mb-1">{item.label}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-surface border border-theme rounded-2xl p-5 mb-6">
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide block mb-2">Your niche</label>
            <input
              type="text"
              value={niche}
              onChange={e => setNiche(e.target.value)}
              placeholder="e.g. personal finance for millennials, fitness for busy parents..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-black transition-all"
            />
          </div>

          <div className="bg-black rounded-2xl p-6 mb-6 text-white flex items-center justify-between">
            <div>
              <p className="text-sm font-extrabold mb-1">
                {result ? '✅ Analysis complete' : 'Analyze your content gaps'}
              </p>
              <p className="text-xs text-gray-400">
                {result
                  ? 'Scroll down to see your full gap analysis.'
                  : 'AI scans your niche and surfaces exactly what content opportunities you\'re missing.'}
              </p>
            </div>
            <button
              onClick={handleAnalyze}
              disabled={analyzing || credits < CREDIT_COST}
              className="flex-shrink-0 bg-white text-black text-xs font-extrabold px-5 py-2.5 rounded-xl hover:opacity-80 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2">
              {analyzing ? (
                <>
                  <div className="w-3 h-3 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  Detecting gaps...
                </>
              ) : (
                `🕳️ Detect Gaps — ${CREDIT_COST} credits`
              )}
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 rounded-2xl px-4 py-3 mb-4">
              <p className="text-xs font-semibold text-red-500">❌ {error}</p>
            </div>
          )}

          {result && (
            <div className="bg-surface border border-theme rounded-2xl p-6 mb-6">
              <h2 className="text-sm font-extrabold mb-4">Gap Analysis — {niche}</h2>
              <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{result}</div>
              <div className="mt-5 pt-4 border-t border-theme flex items-center justify-between">
                <p className="text-xs text-gray-400 dark:text-gray-500">Use these insights to fill gaps in your content strategy.</p>
                <Link href="/compose"
                  className="text-xs font-bold px-4 py-2 bg-black text-white rounded-xl hover:opacity-80 transition-all">
                  Create content →
                </Link>
              </div>
            </div>
          )}

          {credits < CREDIT_COST && (
            <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-center justify-between">
              <p className="text-xs font-semibold text-red-600">
                You need at least {CREDIT_COST} credits to run a gap analysis. You have {credits} remaining.
              </p>
              <Link href="/settings?tab=Plan"
                className="text-xs font-bold px-3 py-1.5 bg-red-500 text-white rounded-xl hover:opacity-80 transition-all flex-shrink-0 ml-4">
                Upgrade →
              </Link>
            </div>
          )}

        </div>
      </main>
    </div>
  )
}
