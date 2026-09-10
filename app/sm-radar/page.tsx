'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'
import { useWorkspace } from '@/contexts/WorkspaceContext'
import { CalendarDays, CheckCircle2, Clock, ClipboardList, Fish, History, Radar, Search, Telescope, Zap } from 'lucide-react'

const CREDIT_COST = 20

type ScanRecord = { id: string; niche: string; result: string; created_at: string }

function timeAgo(iso: string): string {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export default function SMRadarPage() {
  const router = useRouter()
  const { credits, setCredits } = useWorkspace()
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [niche, setNiche] = useState('')
  const [error, setError] = useState('')
  const [history, setHistory] = useState<ScanRecord[]>([])

  const loadHistory = () => {
    fetch('/api/ai/scan-history?tool=radar')
      .then(r => r.json())
      .then(d => setHistory(d.scans ?? []))
      .catch(() => {})
  }

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.push('/login')
      else { setLoading(false); loadHistory() }
    })
  }, [router])

  const viewPastScan = (scan: ScanRecord) => {
    setResult(scan.result)
    setNiche(scan.niche)
    setError('')
  }

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
      if (!res.ok || data.error) {
        // Surface what the server actually said — see /sm-pulse.
        setError(data.error || 'Report generation failed. Please try again.')
        setGenerating(false)
        return
      }
      setResult(data.result)
      setCredits(typeof data.creditsRemaining === 'number' ? data.creditsRemaining : credits - CREDIT_COST)
      loadHistory()
    } catch {
      setError('Network error. Please try again.')
    }
    setGenerating(false)
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-theme">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black dark:border-amber-500" />
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-theme flex">
      <Sidebar />
      <main className="md:ml-56 flex-1 p-4 md:p-8">
        <div className="max-w-3xl mx-auto">

          {/* HEADER */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Radar className="w-6 h-6" strokeWidth={1.75} />
                <h1 className="text-2xl font-extrabold tracking-tight">SM-Radar</h1>
              </div>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                AI analysis of real Reddit and YouTube data — content gaps, competitor weaknesses, and what to post this week.
              </p>
            </div>
            <div className="flex-shrink-0">
              <div className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1">Cost per report</div>
              <div className="text-xl font-extrabold">{CREDIT_COST} <span className="text-sm font-semibold text-gray-400 dark:text-gray-500">credits</span></div>
              <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{credits} remaining</div>
            </div>
          </div>

          {/* WHAT IT ANALYZES */}
          <div className="bg-surface border border-theme rounded-2xl p-5 mb-6">
            <h2 className="text-sm font-extrabold mb-4">What SM-Radar analyzes</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { icon: Search,    label: 'Content gaps',        desc: 'Topics being asked about but not answered well in your niche'    },
                { icon: Telescope, label: 'Competitor weak spots', desc: 'What competitors are missing that you can own'                  },
                { icon: ClipboardList, label: 'Best post formats',    desc: 'Which content structures are working right now in your niche'   },
                { icon: Fish,      label: 'Hook styles',          desc: 'Opening formats driving the most engagement this week'          },
                { icon: CalendarDays, label: 'Timing signals',       desc: 'When your niche audience is most active and engaged'            },
                { icon: Zap,       label: 'This week\'s opportunity', desc: 'One concrete content angle you should post on right now'    },
              ].map(item => (
                <div key={item.label} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <item.icon className="w-5 h-5 flex-shrink-0" strokeWidth={1.75} />
                  <div>
                    <p className="text-xs font-bold text-gray-900 dark:text-gray-100">{item.label}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 leading-relaxed mt-0.5">{item.desc}</p>
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

          {/* GENERATE BUTTON */}
          <div className="bg-black rounded-2xl p-5 md:p-6 mb-6 text-white">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-sm font-extrabold mb-1">
                  {result ? <><CheckCircle2 size={14} strokeWidth={2} className="inline align-text-bottom mr-1.5" />Report ready — insights below</> : 'Generate your Radar report'}
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
                  <><Radar size={14} strokeWidth={2} /> Generate Report — {CREDIT_COST} credits</>
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
              <div className="bg-surface border border-theme rounded-2xl p-5 mb-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-extrabold">Your Radar Report</h2>
                  <button
                    onClick={() => navigator.clipboard.writeText(result)}
                    className="text-xs font-bold px-3 py-1.5 border border-gray-200 rounded-xl hover:border-gray-400 transition-all">
                    Copy
                  </button>
                </div>
                <pre className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap font-sans bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
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

          {/* PREVIEW STATE — blurred sample report */}
          {!result && !generating && (
            <div className="relative bg-surface border border-theme rounded-2xl overflow-hidden">
              <div className="p-5 filter blur-sm pointer-events-none select-none" aria-hidden="true">
                <h2 className="text-sm font-extrabold mb-4">📡 Your Growth Intelligence Report</h2>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-xs text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap font-sans">
{`## SM-RADAR: PERSONAL GROWTH INTELLIGENCE

📊 CONTENT GAP ANALYSIS
   Your biggest missed opportunity: Long-form educational content
   Competitors post 4x more "how-to" content than you
   Gap score: 8.4/10 — HIGH priority

🎯 YOUR #1 CONTENT STRATEGY THIS WEEK
   Format: 5-step educational carousel
   Topic: "How I [outcome] in [timeframe] without [common obstacle]"
   Post on: Tuesday or Wednesday, 9–11am
   Expected reach boost: +40–60% vs. your current average

🔍 COMPETITOR WEAKNESSES YOU CAN EXPLOIT
   • @competitor1 has 0 video content — video beats text 3:1 in your niche
   • No one in your niche posts on Sundays — wide-open posting window
   • "Personal story" posts get 2x engagement — underutilized by all competitors

💡 THIS WEEK'S SINGLE BEST MOVE:
   Record a 60-second "what I wish I knew" video and post Sunday at 10am.`}
                </div>
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/70 backdrop-blur-[2px]">
                <div className="text-center px-6">
                  <Radar className="w-8 h-8 mx-auto mb-3" strokeWidth={1.5} />
                  <p className="text-sm font-extrabold mb-1">Your growth report appears here</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs">Enter your niche above and generate a report to unlock personalized content strategy intelligence.</p>
                </div>
              </div>
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

          {/* RECENT REPORTS — reports used to vanish the moment you left the page */}
          {history.length > 0 && (
            <div className="mt-6 bg-surface border border-theme rounded-2xl p-5">
              <h2 className="text-sm font-extrabold mb-3 flex items-center gap-1.5"><History className="w-4 h-4" strokeWidth={2} /> Recent reports</h2>
              <div className="space-y-1.5">
                {history.map(scan => (
                  <button
                    key={scan.id}
                    onClick={() => viewPastScan(scan)}
                    className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all text-left">
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 truncate">{scan.niche || 'social media content creation'}</span>
                    <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0 inline-flex items-center gap-1"><Clock size={11} strokeWidth={2} /> {timeAgo(scan.created_at)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  )
}