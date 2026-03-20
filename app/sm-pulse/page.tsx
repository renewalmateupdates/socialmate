'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'
import { useWorkspace } from '@/contexts/WorkspaceContext'

const CREDIT_COST = 10

export default function SMPulsePage() {
  const router = useRouter()
  const { credits, setCredits } = useWorkspace()
  const [loading, setLoading] = useState(true)
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [lastScanned, setLastScanned] = useState<string | null>(null)
  const [niche, setNiche] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.push('/login')
      else setLoading(false)
    })
  }, [router])

  const handleScan = async () => {
    if (credits < CREDIT_COST) return
    setScanning(true)
    setError('')
    setResult(null)

    const nicheVal = niche.trim() || 'social media content creation'

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool: 'pulse', content: nicheVal, platform: 'general' }),
      })
      const data = await res.json()
      if (!res.ok || data.error) { setError('Scan failed. Please try again.'); setScanning(false); return }
      setResult(data.result)
      setCredits(credits - CREDIT_COST)
      setLastScanned('Just now')
    } catch {
      setError('Network error. Please try again.')
    }
    setScanning(false)
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

          {/* HEADER */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">🔥</span>
                <h1 className="text-2xl font-extrabold tracking-tight">SM-Pulse</h1>
              </div>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                Scan what's trending in your niche right now — before it peaks.
              </p>
            </div>
            <div className="flex items-center gap-3 sm:text-right flex-shrink-0">
              <div>
                <div className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1">Cost per scan</div>
                <div className="text-xl font-extrabold">{CREDIT_COST} <span className="text-sm font-semibold text-gray-400 dark:text-gray-500">credits</span></div>
                <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{credits} remaining</div>
              </div>
            </div>
          </div>

          {/* HOW IT WORKS */}
          <div className="bg-surface border border-theme rounded-2xl p-5 mb-6">
            <h2 className="text-sm font-extrabold mb-4">How SM-Pulse works</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { step: '1', title: 'Scan triggered',        desc: 'SM-Pulse queries trending signals across Reddit and YouTube in your niche.' },
                { step: '2', title: 'Patterns detected',     desc: 'AI identifies hashtag spikes, viral post formats, and engagement anomalies.' },
                { step: '3', title: 'Opportunities surfaced', desc: 'You get a ranked list of trends to act on before they hit peak saturation.' },
              ].map(item => (
                <div key={item.step} className="flex sm:flex-col items-start sm:items-center gap-3 sm:gap-0 sm:text-center">
                  <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-xs font-extrabold flex-shrink-0 sm:mx-auto sm:mb-2">
                    {item.step}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900 dark:text-gray-100 mb-1">{item.title}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* NICHE INPUT */}
          <div className="bg-surface border border-theme rounded-2xl p-5 mb-4">
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide block mb-2">
              Your niche or topic
            </label>
            <input
              type="text"
              value={niche}
              onChange={e => setNiche(e.target.value)}
              placeholder="e.g. fitness, SaaS marketing, cooking, personal finance..."
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400"
            />
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">Leave blank to default to social media content creation.</p>
          </div>

          {/* SCAN BUTTON */}
          <div className="bg-black rounded-2xl p-5 md:p-6 mb-6 text-white">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-sm font-extrabold mb-1">
                  {result ? '✅ Scan complete — results below' : 'Ready to scan your niche'}
                </p>
                <p className="text-xs text-gray-400">
                  {lastScanned ? `Last scanned: ${lastScanned}` : `Powered by real Reddit and YouTube data. Costs ${CREDIT_COST} credits.`}
                </p>
              </div>
              <button
                onClick={handleScan}
                disabled={scanning || credits < CREDIT_COST}
                className="flex-shrink-0 self-start sm:self-auto bg-white text-black text-xs font-extrabold px-5 py-2.5 rounded-xl hover:opacity-80 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2">
                {scanning ? (
                  <>
                    <div className="w-3 h-3 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    Scanning...
                  </>
                ) : (
                  `🔥 Run Scan — ${CREDIT_COST} credits`
                )}
              </button>
            </div>
          </div>

          {/* ERROR */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-100 rounded-2xl px-5 py-3">
              <p className="text-xs text-red-600 font-semibold">{error}</p>
            </div>
          )}

          {/* RESULTS */}
          {result && (
            <div className="bg-surface border border-theme rounded-2xl p-5 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-extrabold">Trending Now in Your Niche</h2>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 dark:text-gray-500">Just scanned</span>
                  <button
                    onClick={() => { navigator.clipboard.writeText(result) }}
                    className="text-xs font-bold px-3 py-1.5 border border-gray-200 rounded-xl hover:border-gray-400 transition-all">
                    Copy
                  </button>
                </div>
              </div>
              <div className="prose prose-sm max-w-none">
                <pre className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap font-sans bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                  {result}
                </pre>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <p className="text-xs text-gray-400 dark:text-gray-500 flex-1">
                  Use these trends to guide your next posts. Act within 24–48 hours for best reach.
                </p>
                <Link href="/compose"
                  className="flex-shrink-0 text-xs font-bold px-4 py-2 bg-black text-white rounded-xl hover:opacity-80 transition-all">
                  Compose a post →
                </Link>
              </div>
            </div>
          )}

          {/* PREVIEW STATE — blurred sample results */}
          {!result && !scanning && (
            <div className="relative bg-surface border border-theme rounded-2xl overflow-hidden">
              <div className="p-5 filter blur-sm pointer-events-none select-none" aria-hidden="true">
                <h2 className="text-sm font-extrabold mb-4">🔥 Trending Now in Your Niche</h2>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-xs text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap font-sans">
{`## TOP TRENDING TOPICS THIS WEEK

🚀 #1 — AI productivity workflows (+340% engagement spike)
   Why it's trending: New ChatGPT feature dropped Tuesday, Reddit r/productivity exploded
   Best format: "I tried X for 7 days" story format
   Peak window: Next 18–24 hours

📈 #2 — Founder burnout & mental health
   Why it's trending: Viral Twitter thread, 3.2M impressions
   Best format: Raw, vulnerable short-form video
   Peak window: 2–3 days remaining

🎯 #3 — "Silent quitting" → "Loud thriving"
   Why it's trending: Counter-narrative gaining traction
   Best format: Before/after carousel
   Peak window: 4–5 days

💡 RECOMMENDED ACTION:
   Post on topic #1 within 24h using the story format.
   Engage with the burnout thread before creating your post.`}
                </div>
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/70 backdrop-blur-[2px]">
                <div className="text-center px-6">
                  <div className="text-3xl mb-3">🔥</div>
                  <p className="text-sm font-extrabold mb-1">Your trend report appears here</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs">Enter your niche above and run a scan to unlock real-time trend intelligence for your content.</p>
                </div>
              </div>
            </div>
          )}

          {/* LOW CREDITS */}
          {credits < CREDIT_COST && (
            <div className="mt-4 bg-red-50 border border-red-100 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center gap-3">
              <p className="text-xs font-semibold text-red-600 flex-1">
                You need at least {CREDIT_COST} credits to run a scan. You have {credits} remaining.
              </p>
              <Link href="/settings?tab=Plan"
                className="self-start sm:self-auto text-xs font-bold px-3 py-1.5 bg-red-500 text-white rounded-xl hover:opacity-80 transition-all flex-shrink-0">
                Get more credits →
              </Link>
            </div>
          )}

        </div>
      </main>
    </div>
  )
}
