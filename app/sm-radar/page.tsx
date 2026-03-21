'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'
import { useWorkspace } from '@/contexts/WorkspaceContext'

const CREDIT_COST = 20

export default function SMRadarPage() {
  const router = useRouter()
  const { credits, setCredits } = useWorkspace()
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [niche, setNiche] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.push('/login')
      else setLoading(false)
    })
  }, [router])

  const handleGenerate = async () => {
    if (credits < CREDIT_COST) return
    setGenerating(true)
    setError('')
    setResult(null)

    const nicheVal = niche.trim() || 'social media content creation'

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool: 'radar', content: nicheVal, platform: 'general' }),
      })
      const data = await res.json()
      if (!res.ok || data.error) { setError('Report generation failed. Please try again.'); setGenerating(false); return }
      setResult(data.result)
      setCredits(credits - CREDIT_COST)
    } catch {
      setError('Network error. Please try again.')
    }
    setGenerating(false)
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <main className="md:ml-56 flex-1 p-4 md:p-8">
        <div className="max-w-3xl mx-auto">

          {/* HEADER */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">📡</span>
                <h1 className="text-2xl font-extrabold tracking-tight">SM-Radar</h1>
              </div>
              <p className="text-sm text-gray-400">
                AI analysis of real Reddit and YouTube data — content gaps, competitor weaknesses, and what to post this week.
              </p>
            </div>
            <div className="flex-shrink-0">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Cost per report</div>
              <div className="text-xl font-extrabold">{CREDIT_COST} <span className="text-sm font-semibold text-gray-400">credits</span></div>
              <div className="text-xs text-gray-400 mt-0.5">{credits} remaining</div>
            </div>
          </div>

          {/* WHAT IT ANALYZES */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-6">
            <h2 className="text-sm font-extrabold mb-4">What SM-Radar analyzes</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { icon: '🕳️', label: 'Content gaps',        desc: 'Topics being asked about but not answered well in your niche'    },
                { icon: '🔭', label: 'Competitor weak spots', desc: 'What competitors are missing that you can own'                  },
                { icon: '📋', label: 'Best post formats',    desc: 'Which content structures are working right now in your niche'   },
                { icon: '🎣', label: 'Hook styles',          desc: 'Opening formats driving the most engagement this week'          },
                { icon: '📅', label: 'Timing signals',       desc: 'When your niche audience is most active and engaged'            },
                { icon: '⚡', label: 'This week\'s opportunity', desc: 'One concrete content angle you should post on right now'    },
              ].map(item => (
                <div key={item.label} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                  <span className="text-lg flex-shrink-0">{item.icon}</span>
                  <div>
                    <p className="text-xs font-bold text-gray-900">{item.label}</p>
                    <p className="text-xs text-gray-400 leading-relaxed mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* NICHE INPUT */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-4">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-2">
              Your niche or topic
            </label>
            <input
              type="text"
              value={niche}
              onChange={e => setNiche(e.target.value)}
              placeholder="e.g. fitness, SaaS marketing, cooking, personal finance..."
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400"
            />
            <p className="text-xs text-gray-400 mt-1.5">Leave blank to default to social media content creation.</p>
          </div>

          {/* GENERATE BUTTON */}
          <div className="bg-black rounded-2xl p-5 md:p-6 mb-6 text-white">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-sm font-extrabold mb-1">
                  {result ? '✅ Report ready — insights below' : 'Generate your Radar report'}
                </p>
                <p className="text-xs text-gray-400">
                  {result
                    ? 'Based on live Reddit and YouTube data for your niche'
                    : `Powered by real Reddit and YouTube data. Costs ${CREDIT_COST} credits.`}
                </p>
              </div>
              <button
                onClick={handleGenerate}
                disabled={generating || credits < CREDIT_COST}
                className="self-start sm:self-auto flex-shrink-0 bg-white text-black text-xs font-extrabold px-5 py-2.5 rounded-xl hover:opacity-80 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2">
                {generating ? (
                  <>
                    <div className="w-3 h-3 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  `📡 Generate Report — ${CREDIT_COST} credits`
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
            <>
              <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-extrabold">Your Radar Report</h2>
                  <button
                    onClick={() => navigator.clipboard.writeText(result)}
                    className="text-xs font-bold px-3 py-1.5 border border-gray-200 rounded-xl hover:border-gray-400 transition-all">
                    Copy
                  </button>
                </div>
                <pre className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap font-sans bg-gray-50 rounded-xl p-4">
                  {result}
                </pre>
              </div>

              <div className="bg-black text-white rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-extrabold mb-1">Apply these insights now</p>
                  <p className="text-xs text-gray-400">Open Compose and write your next post using what's working.</p>
                </div>
                <Link href="/compose"
                  className="self-start sm:self-auto flex-shrink-0 bg-white text-black text-xs font-bold px-4 py-2.5 rounded-xl hover:opacity-80 transition-all">
                  Open Compose →
                </Link>
              </div>
            </>
          )}

          {/* PREVIEW STATE */}
          {!result && !generating && (
            <div className="bg-white border border-gray-100 rounded-2xl p-5">
              <h2 className="text-sm font-extrabold mb-4">What your report will include</h2>
              <div className="space-y-3 opacity-40 pointer-events-none select-none">
                {[1,2,3,4].map(i => (
                  <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0" />
                    <div className="flex-1">
                      <div className="w-24 h-2.5 bg-gray-200 rounded mb-1.5" />
                      <div className="w-48 h-3 bg-gray-300 rounded" />
                    </div>
                    <div className="w-32 h-2.5 bg-gray-100 rounded hidden sm:block" />
                  </div>
                ))}
              </div>
              <p className="text-xs text-center text-gray-400 mt-4">Enter your niche above and generate a report to see real insights</p>
            </div>
          )}

          {/* LOW CREDITS */}
          {credits < CREDIT_COST && (
            <div className="mt-4 bg-red-50 border border-red-100 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center gap-3">
              <p className="text-xs font-semibold text-red-600 flex-1">
                You need at least {CREDIT_COST} credits to generate a report. You have {credits} remaining.
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