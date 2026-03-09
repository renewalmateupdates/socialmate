'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'
import { useWorkspace } from '@/contexts/WorkspaceContext'

const SAMPLE_INSIGHTS = [
  { label: 'Best performing format',   value: 'How-to lists',        detail: '3.2× avg engagement vs other formats',     icon: '📋' },
  { label: 'Best day to post',         value: 'Tuesday',             detail: 'Consistently highest reach day',           icon: '📅' },
  { label: 'Best time window',         value: '9 AM – 11 AM',        detail: 'Peak audience activity in your timezone',  icon: '⏰' },
  { label: 'Top performing length',    value: '150–280 chars',       detail: 'Sweet spot before engagement drops off',   icon: '📏' },
  { label: 'Strongest hook style',     value: 'Question openers',    detail: '2.1× more comments than statements',       icon: '🎣' },
  { label: 'Underperforming content',  value: 'Promotional posts',   detail: '67% below your average engagement rate',  icon: '⚠️' },
]

const SAMPLE_TOP_POSTS = [
  { preview: 'How I went from 0 to 10k followers in 90 days (thread)...', engagement: '4.2k', platform: 'LinkedIn' },
  { preview: 'Unpopular opinion: consistency beats quality every time...', engagement: '3.8k', platform: 'LinkedIn' },
  { preview: '5 tools I use every single day as a solo creator....',       engagement: '2.1k', platform: 'LinkedIn' },
]

export default function SMRadarPage() {
  const router = useRouter()
  const { plan, credits, setCredits } = useWorkspace()
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [generated, setGenerated] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.push('/login')
      else setLoading(false)
    })
  }, [router])

  const handleGenerate = async () => {
    if (credits < 3) return
    setGenerating(true)
    await new Promise(r => setTimeout(r, 2000))
    setCredits(credits - 3)
    setGenerated(true)
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
      <main className="ml-56 flex-1 p-8">
        <div className="max-w-3xl mx-auto">

          {/* HEADER */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">📊</span>
                <h1 className="text-2xl font-extrabold tracking-tight">SM-Radar</h1>
              </div>
              <p className="text-sm text-gray-400">
                Understand what's actually working in your own content — and why.
              </p>
            </div>
            <div className="text-right">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Cost per report</div>
              <div className="text-xl font-extrabold">3 <span className="text-sm font-semibold text-gray-400">credits</span></div>
              <div className="text-xs text-gray-400 mt-0.5">{credits} remaining</div>
            </div>
          </div>

          {/* WHAT IT ANALYZES */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-6">
            <h2 className="text-sm font-extrabold mb-3">What SM-Radar analyzes</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: '📅', label: 'Posting timing',    desc: 'Best days and times based on your actual results'         },
                { icon: '📏', label: 'Content length',    desc: 'Optimal character count for your audience'                },
                { icon: '🎣', label: 'Hook styles',       desc: 'Which opening formats drive the most engagement'          },
                { icon: '🏷️', label: 'Topic clusters',    desc: 'Which themes consistently outperform your average'        },
                { icon: '📋', label: 'Post formats',      desc: 'Lists vs stories vs questions — what works for you'       },
                { icon: '⚠️', label: 'Content gaps',      desc: 'What you\'ve stopped posting that used to perform well'   },
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

          {/* GENERATE BUTTON */}
          <div className="bg-black rounded-2xl p-6 mb-6 text-white flex items-center justify-between">
            <div>
              <p className="text-sm font-extrabold mb-1">
                {generated ? '✅ Report ready — insights below' : 'Generate your performance report'}
              </p>
              <p className="text-xs text-gray-400">
                {generated
                  ? 'Based on your connected account data'
                  : 'Requires at least one connected social account with post history.'}
              </p>
            </div>
            <button
              onClick={handleGenerate}
              disabled={generating || credits < 3}
              className="flex-shrink-0 bg-white text-black text-xs font-extrabold px-5 py-2.5 rounded-xl hover:opacity-80 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2">
              {generating ? (
                <>
                  <div className="w-3 h-3 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  Analyzing...
                </>
              ) : (
                '📊 Generate Report — 3 credits'
              )}
            </button>
          </div>

          {/* RESULTS */}
          {generated && (
            <>
              <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-4">
                <h2 className="text-sm font-extrabold mb-4">Your Performance Insights</h2>
                <div className="space-y-3">
                  {SAMPLE_INSIGHTS.map((insight, i) => (
                    <div key={i} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{insight.icon}</span>
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">{insight.label}</p>
                          <p className="text-sm font-extrabold text-gray-900">{insight.value}</p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 text-right max-w-xs">{insight.detail}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-4">
                <h2 className="text-sm font-extrabold mb-4">Your Top Performing Posts</h2>
                <div className="space-y-3">
                  {SAMPLE_TOP_POSTS.map((post, i) => (
                    <div key={i} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                      <div className="flex-1 min-w-0 mr-4">
                        <p className="text-xs font-semibold text-gray-700 truncate">{post.preview}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{post.platform}</p>
                      </div>
                      <span className="text-xs font-extrabold text-green-600 bg-green-50 px-2.5 py-1 rounded-xl flex-shrink-0">
                        {post.engagement} engagements
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-black text-white rounded-2xl p-5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-extrabold mb-1">Apply these insights now</p>
                  <p className="text-xs text-gray-400">Open Compose and write your next post using what's working.</p>
                </div>
                <Link href="/compose"
                  className="flex-shrink-0 bg-white text-black text-xs font-bold px-4 py-2.5 rounded-xl hover:opacity-80 transition-all">
                  Open Compose →
                </Link>
              </div>
            </>
          )}

          {/* PREVIEW STATE */}
          {!generated && (
            <div className="bg-white border border-gray-100 rounded-2xl p-5">
              <h2 className="text-sm font-extrabold mb-4">Sample insight preview</h2>
              <div className="space-y-3 opacity-40 pointer-events-none select-none">
                {SAMPLE_INSIGHTS.slice(0, 3).map((_, i) => (
                  <div key={i} className="flex items-center justify-between py-3 border-b border-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-200 rounded-full" />
                      <div>
                        <div className="w-24 h-2.5 bg-gray-200 rounded mb-1.5" />
                        <div className="w-32 h-3 bg-gray-300 rounded" />
                      </div>
                    </div>
                    <div className="w-40 h-2.5 bg-gray-100 rounded" />
                  </div>
                ))}
              </div>
              <p className="text-xs text-center text-gray-400 mt-4">Generate a report to see your real data</p>
            </div>
          )}

          {credits < 3 && (
            <div className="mt-4 bg-red-50 border border-red-100 rounded-2xl p-4 flex items-center justify-between">
              <p className="text-xs font-semibold text-red-600">
                You need at least 3 credits to generate a report. You have {credits} remaining.
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