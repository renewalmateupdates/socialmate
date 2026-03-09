'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'
import { useWorkspace } from '@/contexts/WorkspaceContext'

const SAMPLE_GAPS = [
  {
    type: 'Gone quiet',
    topic: 'How-to educational posts',
    detail: 'Used to average 2× your engagement. Last posted 23 days ago.',
    urgency: 'high',
    action: 'Write a how-to post',
  },
  {
    type: 'Missed trend',
    topic: 'AI productivity content',
    detail: 'Trending +340% in your niche. You haven\'t posted on this topic yet.',
    urgency: 'high',
    action: 'Create AI content',
  },
  {
    type: 'Posting gap',
    topic: 'Tuesday morning window',
    detail: 'Your best-performing time slot — no post scheduled this week.',
    urgency: 'medium',
    action: 'Schedule a post',
  },
  {
    type: 'Format gap',
    topic: 'Thread / multi-part posts',
    detail: 'Strong format for your audience. You haven\'t used it in 30+ days.',
    urgency: 'medium',
    action: 'Write a thread',
  },
  {
    type: 'Audience gap',
    topic: 'Behind-the-scenes content',
    detail: 'High-save format. Only 2 posts this quarter vs 12 in Q1.',
    urgency: 'low',
    action: 'Share your process',
  },
]

const URGENCY_STYLES: Record<string, { badge: string; dot: string }> = {
  high:   { badge: 'bg-red-50 text-red-600',    dot: 'bg-red-400'    },
  medium: { badge: 'bg-yellow-50 text-yellow-600', dot: 'bg-yellow-400' },
  low:    { badge: 'bg-gray-100 text-gray-500',  dot: 'bg-gray-300'   },
}

export default function ContentGapPage() {
  const router = useRouter()
  const { credits, setCredits } = useWorkspace()
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [analyzed, setAnalyzed] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.push('/login')
      else setLoading(false)
    })
  }, [router])

  const handleAnalyze = async () => {
    if (credits < 2) return
    setAnalyzing(true)
    await new Promise(r => setTimeout(r, 1800))
    setCredits(credits - 2)
    setAnalyzed(true)
    setAnalyzing(false)
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black" />
      </div>
    )
  }

  const highCount = SAMPLE_GAPS.filter(g => g.urgency === 'high').length
  const medCount  = SAMPLE_GAPS.filter(g => g.urgency === 'medium').length
  const lowCount  = SAMPLE_GAPS.filter(g => g.urgency === 'low').length

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <main className="ml-56 flex-1 p-8">
        <div className="max-w-3xl mx-auto">

          {/* HEADER */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">🕵️</span>
                <h1 className="text-2xl font-extrabold tracking-tight">Content Gap Detector</h1>
              </div>
              <p className="text-sm text-gray-400">
                Spot what's missing from your content strategy before your audience notices.
              </p>
            </div>
            <div className="text-right">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Cost per scan</div>
              <div className="text-xl font-extrabold">2 <span className="text-sm font-semibold text-gray-400">credits</span></div>
              <div className="text-xs text-gray-400 mt-0.5">{credits} remaining</div>
            </div>
          </div>

          {/* WHAT IT CATCHES */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-6">
            <h2 className="text-sm font-extrabold mb-3">What the detector catches</h2>
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: '🔇', label: 'Gone quiet',    desc: 'High-performing topics you\'ve stopped posting about'     },
                { icon: '📅', label: 'Posting gaps',  desc: 'Time slots where your audience expects you but you\'re silent' },
                { icon: '📈', label: 'Missed trends', desc: 'Trending topics in your niche you haven\'t touched yet'    },
              ].map(item => (
                <div key={item.label} className="text-center p-4 bg-gray-50 rounded-xl">
                  <span className="text-2xl block mb-2">{item.icon}</span>
                  <p className="text-xs font-bold text-gray-900 mb-1">{item.label}</p>
                  <p className="text-xs text-gray-400 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ANALYZE BUTTON */}
          <div className="bg-black rounded-2xl p-6 mb-6 text-white flex items-center justify-between">
            <div>
              <p className="text-sm font-extrabold mb-1">
                {analyzed ? '✅ Analysis complete — gaps found below' : 'Analyze your content strategy'}
              </p>
              <p className="text-xs text-gray-400">
                {analyzed
                  ? `Found ${SAMPLE_GAPS.length} gaps — ${highCount} high priority`
                  : 'Scans your post history and flags anything that\'s fallen through the cracks.'}
              </p>
            </div>
            <button
              onClick={handleAnalyze}
              disabled={analyzing || credits < 2}
              className="flex-shrink-0 bg-white text-black text-xs font-extrabold px-5 py-2.5 rounded-xl hover:opacity-80 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2">
              {analyzing ? (
                <>
                  <div className="w-3 h-3 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  Detecting gaps...
                </>
              ) : (
                '🕵️ Detect Gaps — 2 credits'
              )}
            </button>
          </div>

          {/* RESULTS */}
          {analyzed && (
            <>
              {/* SUMMARY */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                {[
                  { label: 'High priority', count: highCount, color: 'text-red-600',    bg: 'bg-red-50 border-red-100'      },
                  { label: 'Medium',        count: medCount,  color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-100' },
                  { label: 'Low',           count: lowCount,  color: 'text-gray-600',   bg: 'bg-gray-50 border-gray-200'     },
                ].map(item => (
                  <div key={item.label} className={`border rounded-2xl p-4 text-center ${item.bg}`}>
                    <p className={`text-2xl font-extrabold ${item.color}`}>{item.count}</p>
                    <p className="text-xs text-gray-500 font-semibold mt-0.5">{item.label}</p>
                  </div>
                ))}
              </div>

              <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-4">
                <h2 className="text-sm font-extrabold mb-4">Gaps Detected</h2>
                <div className="space-y-3">
                  {SAMPLE_GAPS.map((gap, i) => {
                    const style = URGENCY_STYLES[gap.urgency]
                    return (
                      <div key={i} className="flex items-start justify-between gap-4 py-3 border-b border-gray-50 last:border-0">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${style.dot}`} />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                              <p className="text-sm font-bold text-gray-900">{gap.topic}</p>
                              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${style.badge}`}>
                                {gap.type}
                              </span>
                            </div>
                            <p className="text-xs text-gray-400 leading-relaxed">{gap.detail}</p>
                          </div>
                        </div>
                        <Link
                          href="/compose"
                          className="flex-shrink-0 text-xs font-bold px-3 py-1.5 bg-black text-white rounded-xl hover:opacity-80 transition-all">
                          {gap.action} →
                        </Link>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="bg-black text-white rounded-2xl p-5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-extrabold mb-1">Fill your biggest gap now</p>
                  <p className="text-xs text-gray-400">Jump into Compose and tackle the highest priority item first.</p>
                </div>
                <Link href="/compose"
                  className="flex-shrink-0 bg-white text-black text-xs font-bold px-4 py-2.5 rounded-xl hover:opacity-80 transition-all">
                  Open Compose →
                </Link>
              </div>
            </>
          )}

          {/* PREVIEW STATE */}
          {!analyzed && (
            <div className="bg-white border border-gray-100 rounded-2xl p-5">
              <h2 className="text-sm font-extrabold mb-4">Example gaps you might find</h2>
              <div className="space-y-3">
                {SAMPLE_GAPS.slice(0, 3).map((gap, i) => {
                  const style = URGENCY_STYLES[gap.urgency]
                  return (
                    <div key={i} className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0 opacity-50">
                      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${style.dot}`} />
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-sm font-bold text-gray-900">{gap.topic}</p>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${style.badge}`}>
                            {gap.type}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400">{gap.detail}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
              <p className="text-xs text-center text-gray-400 mt-4">Run an analysis to see your actual gaps</p>
            </div>
          )}

          {credits < 2 && (
            <div className="mt-4 bg-red-50 border border-red-100 rounded-2xl p-4 flex items-center justify-between">
              <p className="text-xs font-semibold text-red-600">
                You need at least 2 credits to run a gap analysis. You have {credits} remaining.
              </p>
              <Link href="/settings?tab=Referrals"
                className="text-xs font-bold px-3 py-1.5 bg-red-500 text-white rounded-xl hover:opacity-80 transition-all flex-shrink-0 ml-4">
                Earn credits →
              </Link>
            </div>
          )}

        </div>
      </main>
    </div>
  )
}