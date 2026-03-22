'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'
import { useWorkspace } from '@/contexts/WorkspaceContext'

function SkeletonBox({ className }: { className?: string }) {
  return <div className={`bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse ${className}`} />
}

type Post = {
  id: string
  content: string
  platforms: string[]
  scheduled_at: string
  status: string
  created_at: string
  analytics?: Record<string, any>
  platform_post_ids?: Record<string, string>
}

const PLATFORM_ICONS: Record<string, string> = {
  instagram: '📸', twitter: '🐦', linkedin: '💼', tiktok: '🎵',
  facebook: '📘', pinterest: '📌', youtube: '▶️', threads: '🧵',
  snapchat: '👻', bluesky: '🦋', reddit: '🤖', discord: '💬',
  telegram: '✈️', mastodon: '🐘', lemon8: '🍋', bereal: '📷',
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const DAYS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

const PLAN_FREE_RANGES: Record<string, string[]> = {
  free:   ['14', '30'],
  pro:    ['14', '30', '90'],
  agency: ['14', '30', '90', '180'],
}

const PLAN_CREDIT_RANGES: Record<string, Record<string, number>> = {
  free:   { '90': 2 },
  pro:    { '180': 2 },
  agency: {},
}

const RANGE_LABELS: Record<string, string> = {
  '14': '14d', '30': '30d', '90': '90d', '180': '6mo'
}

export default function Analytics() {
  const [posts, setPosts]           = useState<Post[]>([])
  const [loading, setLoading]       = useState(true)
  const [range, setRange]           = useState<'14' | '30' | '90' | '180'>('30')
  const [radarDismissed, setRadarDismissed] = useState(false)
  const [creditModal, setCreditModal]       = useState<{ range: string; cost: number } | null>(null)
  const [radarModal, setRadarModal]         = useState(false)
  const [pulseModal, setPulseModal]         = useState(false)
  const [radarLoading, setRadarLoading]     = useState(false)
  const [pulseLoading, setPulseLoading]     = useState(false)
  const [radarResult, setRadarResult]       = useState<string | null>(null)
  const [pulseResult, setPulseResult]       = useState<string | null>(null)
  const [nicheInput, setNicheInput]         = useState('')
  const router = useRouter()
  const { plan, credits, setCredits, activeWorkspace } = useWorkspace()

  const freeRanges   = PLAN_FREE_RANGES[plan]   || PLAN_FREE_RANGES.free
  const creditRanges = PLAN_CREDIT_RANGES[plan] || {}

  // Reload posts when active workspace changes
  useEffect(() => {
    if (!activeWorkspace) return
    setLoading(true)

    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', user.id)
        .eq('workspace_id', activeWorkspace.id)
        .order('created_at', { ascending: true })

      setPosts(data || [])
      setLoading(false)
      fetch('/api/analytics/sync', { method: 'POST' }).catch(() => {})
    }
    getData()
  }, [router, activeWorkspace?.id])

  const handleRangeClick = (r: '14' | '30' | '90' | '180') => {
    if (freeRanges.includes(r)) { setRange(r); return }
    if (creditRanges[r]) { setCreditModal({ range: r, cost: creditRanges[r] }); return }
  }

  const handleCreditUnlock = () => {
    if (!creditModal || credits < creditModal.cost) return
    setCredits(credits - creditModal.cost)
    setRange(creditModal.range as '14' | '30' | '90' | '180')
    setCreditModal(null)
  }

  const handleRunRadar = async () => {
    if (credits < 10) return
    const niche = nicheInput.trim() || 'social media content creation'
    setRadarLoading(true)
    setCredits(credits - 10)
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool: 'radar', content: niche, platform: 'general' }),
      })
      const data = await res.json()
      setRadarResult(data.result)
      setRadarModal(false)
    } catch {
      setRadarResult('Something went wrong. Please try again.')
    } finally {
      setRadarLoading(false)
    }
  }

  const handleRunPulse = async () => {
    if (credits < 10) return
    const niche = nicheInput.trim() || 'social media content creation'
    setPulseLoading(true)
    setCredits(credits - 10)
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool: 'pulse', content: niche, platform: 'general' }),
      })
      const data = await res.json()
      setPulseResult(data.result)
      setPulseModal(false)
    } catch {
      setPulseResult('Something went wrong. Please try again.')
    } finally {
      setPulseLoading(false)
    }
  }

  const now        = new Date()
  const rangeDays  = parseInt(range)
  const rangeStart = new Date(now)
  rangeStart.setDate(now.getDate() - rangeDays)

  const filteredPosts = posts.filter(p => new Date(p.created_at) >= rangeStart)
  const scheduled     = filteredPosts.filter(p => p.status === 'scheduled')
  const drafts        = filteredPosts.filter(p => p.status === 'draft')
  const published     = filteredPosts.filter(p => p.status === 'published')

  const platformCounts = filteredPosts.reduce((acc, post) => {
    post.platforms?.forEach(pl => { acc[pl] = (acc[pl] || 0) + 1 })
    return acc
  }, {} as Record<string, number>)
  const topPlatforms     = Object.entries(platformCounts).sort((a, b) => b[1] - a[1])
  const maxPlatformCount = topPlatforms[0]?.[1] || 1

  const daysToShow  = Math.min(rangeDays, 30)
  const dailyCounts = Array.from({ length: daysToShow }, (_, i) => {
    const d = new Date(now)
    d.setDate(now.getDate() - (daysToShow - 1 - i))
    const dateStr = d.toDateString()
    const count   = filteredPosts.filter(p => new Date(p.created_at).toDateString() === dateStr).length
    return { date: d, count, label: `${MONTHS[d.getMonth()]} ${d.getDate()}` }
  })
  const maxDailyCount = Math.max(...dailyCounts.map(d => d.count), 1)

  const dayOfWeekCounts = Array.from({ length: 7 }, (_, i) => {
    const count = filteredPosts.filter(p => new Date(p.created_at).getDay() === i).length
    return { day: DAYS[i], count }
  })
  const maxDayCount = Math.max(...dayOfWeekCounts.map(d => d.count), 1)

  const hourCounts = Array.from({ length: 24 }, (_, i) => {
    const count = filteredPosts.filter(p => new Date(p.scheduled_at || p.created_at).getHours() === i).length
    return { hour: i, count, label: i === 0 ? '12am' : i === 12 ? '12pm' : i < 12 ? `${i}am` : `${i - 12}pm` }
  })
  const maxHourCount = Math.max(...hourCounts.map(h => h.count), 1)
  const peakHour     = hourCounts.reduce((a, b) => a.count > b.count ? a : b)

  const monthCounts = Array.from({ length: 12 }, (_, i) => {
    const count = posts.filter(p =>
      new Date(p.created_at).getMonth() === i &&
      new Date(p.created_at).getFullYear() === now.getFullYear()
    ).length
    return { month: MONTHS[i], count }
  })
  const maxMonthCount = Math.max(...monthCounts.map(m => m.count), 1)

  let currentStreak = 0, longestStreak = 0, tempStreak = 0
  let currentStreakDone = false
  const todayMidnight = new Date(); todayMidnight.setHours(0, 0, 0, 0)
  for (let i = 0; i < 365; i++) {
    const d = new Date(todayMidnight); d.setDate(todayMidnight.getDate() - i)
    const hasPost = posts.some(p => {
      const pd = new Date(p.created_at); pd.setHours(0, 0, 0, 0)
      return pd.getTime() === d.getTime()
    })
    if (hasPost) {
      tempStreak++
      longestStreak = Math.max(longestStreak, tempStreak)
      if (!currentStreakDone) currentStreak = tempStreak
    } else {
      if (!currentStreakDone) currentStreakDone = true
      tempStreak = 0
    }
  }

  const oldestPost     = posts[0]
  const weeksSinceFirst = oldestPost
    ? Math.max((now.getTime() - new Date(oldestPost.created_at).getTime()) / (7 * 24 * 3600000), 1)
    : 1
  const avgPerWeek = (posts.length / weeksSinceFirst).toFixed(1)
  const avgLength  = filteredPosts.length > 0
    ? Math.round(filteredPosts.reduce((sum, p) => sum + (p.content?.length || 0), 0) / filteredPosts.length)
    : 0

  const daysSinceLastPost = posts.length > 0
    ? Math.floor((now.getTime() - new Date(posts[posts.length - 1].created_at).getTime()) / (24 * 3600000))
    : null
  const hasVideoGap = filteredPosts.length > 5 &&
    !filteredPosts.some(p => p.platforms?.includes('youtube') || p.platforms?.includes('tiktok'))

  const totalEngagement = published.reduce((sum, p) => {
    if (!p.analytics) return sum
    return sum + Object.values(p.analytics).reduce((s: number, e: any) => {
      return s + (e.likes || 0) + (e.reposts || 0) + (e.reactions || 0) + (e.replies || 0)
    }, 0)
  }, 0)

  const postsWithEngagement = published.filter(p => p.analytics && Object.keys(p.analytics).length > 0)

  const handleExportPDF = () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return
    printWindow.document.write(`
      <html>
        <head>
          <title>SocialMate Analytics Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; color: #111; }
            h1 { font-size: 24px; font-weight: 800; margin-bottom: 4px; }
            p { font-size: 13px; color: #666; margin-bottom: 32px; }
            .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 32px; }
            .card { border: 1px solid #eee; border-radius: 12px; padding: 16px; }
            .card-label { font-size: 11px; color: #999; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; }
            .card-value { font-size: 28px; font-weight: 800; }
            .card-sub { font-size: 11px; color: #999; margin-top: 4px; }
            .section { margin-bottom: 32px; }
            .section-title { font-size: 14px; font-weight: 700; margin-bottom: 16px; border-bottom: 1px solid #eee; padding-bottom: 8px; }
            .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f5f5f5; font-size: 13px; }
            .footer { margin-top: 48px; font-size: 11px; color: #aaa; border-top: 1px solid #eee; padding-top: 16px; }
          </style>
        </head>
        <body>
          <h1>SocialMate Analytics Report</h1>
          <p>Generated ${now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} · ${RANGE_LABELS[range]} range · ${activeWorkspace?.client_name || activeWorkspace?.name || 'My Workspace'}</p>
          <div class="grid">
            <div class="card"><div class="card-label">Total Posts</div><div class="card-value">${filteredPosts.length}</div><div class="card-sub">in selected range</div></div>
            <div class="card"><div class="card-label">Scheduled</div><div class="card-value">${scheduled.length}</div><div class="card-sub">queued up</div></div>
            <div class="card"><div class="card-label">Avg / Week</div><div class="card-value">${avgPerWeek}</div><div class="card-sub">posting frequency</div></div>
            <div class="card"><div class="card-label">Total Engagement</div><div class="card-value">${totalEngagement}</div><div class="card-sub">likes, reactions, reposts</div></div>
          </div>
          <div class="grid" style="grid-template-columns: repeat(3, 1fr)">
            <div class="card"><div class="card-label">Current Streak</div><div class="card-value">${currentStreak}</div><div class="card-sub">days · longest: ${longestStreak}</div></div>
            <div class="card"><div class="card-label">Peak Hour</div><div class="card-value">${peakHour.label}</div><div class="card-sub">${peakHour.count} posts at this hour</div></div>
            <div class="card"><div class="card-label">Avg Caption Length</div><div class="card-value">${avgLength}</div><div class="card-sub">characters</div></div>
          </div>
          <div class="section">
            <div class="section-title">Platform Breakdown</div>
            ${topPlatforms.map(([platform, count]) => `<div class="row"><span style="text-transform:capitalize">${platform}</span><strong>${count} posts</strong></div>`).join('')}
          </div>
          <div class="section">
            <div class="section-title">Post Status</div>
            <div class="row"><span>Published</span><strong>${published.length}</strong></div>
            <div class="row"><span>Scheduled</span><strong>${scheduled.length}</strong></div>
            <div class="row"><span>Drafts</span><strong>${drafts.length}</strong></div>
          </div>
          <div class="section">
            <div class="section-title">Best Days to Post</div>
            ${dayOfWeekCounts.map(d => `<div class="row"><span>${d.day}</span><strong>${d.count} posts</strong></div>`).join('')}
          </div>
          <div class="footer">SocialMate · Gilgamesh Enterprise LLC · socialmate.studio · Report generated ${new Date().toISOString()}</div>
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
  }

  return (
    <div className="min-h-screen bg-theme flex">
      <Sidebar />
      <div className="md:ml-56 flex-1 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">

          {/* MODALS */}
          {creditModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
              <div className="bg-surface rounded-2xl p-6 max-w-sm w-full shadow-xl">
                <div className="text-2xl mb-3">🔓</div>
                <h2 className="text-sm font-extrabold mb-1">Unlock {RANGE_LABELS[creditModal.range]} history</h2>
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
                  This will spend <span className="font-bold text-black">{creditModal.cost} AI credits</span> from your balance ({credits} remaining).
                </p>
                <div className="flex items-center gap-3">
                  <button onClick={handleCreditUnlock} disabled={credits < creditModal.cost}
                    className="flex-1 bg-black text-white text-xs font-bold py-2.5 rounded-xl hover:opacity-80 transition-all disabled:opacity-40">
                    {credits < creditModal.cost ? 'Not enough credits' : `Spend ${creditModal.cost} credits →`}
                  </button>
                  <button onClick={() => setCreditModal(null)}
                    className="px-4 py-2.5 border border-gray-200 dark:border-gray-600 text-xs font-bold text-gray-600 dark:text-gray-300 rounded-xl hover:border-gray-400 transition-all">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {radarModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
              <div className="bg-surface rounded-2xl p-6 max-w-sm w-full shadow-xl">
                <div className="text-2xl mb-3">📡</div>
                <h2 className="text-sm font-extrabold mb-1">Run SM-Radar</h2>
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Costs <span className="font-bold text-black">10 AI credits</span> ({credits} remaining)</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">AI analysis of real Reddit and YouTube data — content gaps, competitor weaknesses, and what to post this week.</p>
                <div className="mb-4">
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-1">Your niche or topic</label>
                  <input type="text" placeholder="e.g. fitness, tech reviews, cooking..."
                    value={nicheInput} onChange={e => setNicheInput(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-gray-400" />
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={handleRunRadar} disabled={credits < 20 || radarLoading}
                    className="flex-1 bg-black text-white text-xs font-bold py-2.5 rounded-xl hover:opacity-80 transition-all disabled:opacity-40">
                    {radarLoading ? 'Analyzing...' : credits < 20 ? 'Not enough credits' : 'Run SM-Radar — 20 credits'}
                  </button>
                  <button onClick={() => setRadarModal(false)}
                    className="px-4 py-2.5 border border-gray-200 dark:border-gray-600 text-xs font-bold text-gray-600 dark:text-gray-300 rounded-xl hover:border-gray-400 transition-all">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {pulseModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
              <div className="bg-surface rounded-2xl p-6 max-w-sm w-full shadow-xl">
                <div className="text-2xl mb-3">🔥</div>
                <h2 className="text-sm font-extrabold mb-1">Run SM-Pulse</h2>
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Costs <span className="font-bold text-black">10 AI credits</span> ({credits} remaining)</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">See what's trending in your niche right now — powered by real Reddit and YouTube data.</p>
                <div className="mb-4">
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-1">Your niche or topic</label>
                  <input type="text" placeholder="e.g. fitness, tech reviews, cooking..."
                    value={nicheInput} onChange={e => setNicheInput(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-gray-400" />
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={handleRunPulse} disabled={credits < 20 || pulseLoading}
                    className="flex-1 bg-black text-white text-xs font-bold py-2.5 rounded-xl hover:opacity-80 transition-all disabled:opacity-40">
                    {pulseLoading ? 'Scanning trends...' : credits < 20 ? 'Not enough credits' : 'Run SM-Pulse — 20 credits'}
                  </button>
                  <button onClick={() => setPulseModal(false)}
                    className="px-4 py-2.5 border border-gray-200 dark:border-gray-600 text-xs font-bold text-gray-600 dark:text-gray-300 rounded-xl hover:border-gray-400 transition-all">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {radarResult && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
              <div className="bg-surface rounded-2xl p-6 max-w-2xl w-full shadow-xl max-h-[80vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">📡</span>
                    <h2 className="text-sm font-extrabold">SM-Radar Results</h2>
                  </div>
                  <button onClick={() => setRadarResult(null)} className="text-gray-400 dark:text-gray-500 hover:text-black text-xl">✕</button>
                </div>
                <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{radarResult}</div>
                <div className="flex gap-3 mt-6">
                  <button onClick={() => navigator.clipboard.writeText(radarResult)}
                    className="flex-1 py-2.5 border border-gray-200 dark:border-gray-600 text-xs font-bold text-gray-600 dark:text-gray-300 rounded-xl hover:border-gray-400 transition-all">
                    Copy Results
                  </button>
                  <button onClick={() => setRadarResult(null)}
                    className="flex-1 py-2.5 bg-black text-white text-xs font-bold rounded-xl hover:opacity-80 transition-all">
                    Done
                  </button>
                </div>
              </div>
            </div>
          )}

          {pulseResult && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
              <div className="bg-surface rounded-2xl p-6 max-w-2xl w-full shadow-xl max-h-[80vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🔥</span>
                    <h2 className="text-sm font-extrabold">SM-Pulse Results</h2>
                  </div>
                  <button onClick={() => setPulseResult(null)} className="text-gray-400 dark:text-gray-500 hover:text-black text-xl">✕</button>
                </div>
                <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{pulseResult}</div>
                <div className="flex gap-3 mt-6">
                  <button onClick={() => navigator.clipboard.writeText(pulseResult)}
                    className="flex-1 py-2.5 border border-gray-200 dark:border-gray-600 text-xs font-bold text-gray-600 dark:text-gray-300 rounded-xl hover:border-gray-400 transition-all">
                    Copy Results
                  </button>
                  <button onClick={() => setPulseResult(null)}
                    className="flex-1 py-2.5 bg-black text-white text-xs font-bold rounded-xl hover:opacity-80 transition-all">
                    Done
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* HEADER */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">Analytics</h1>
              <p className="text-sm text-gray-400 mt-0.5">
                Real data from your posting activity
                {activeWorkspace && !activeWorkspace.is_personal && (
                  <span className="ml-2 text-purple-500 font-semibold">· {activeWorkspace.client_name || activeWorkspace.name}</span>
                )}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {plan === 'agency' && (
                <button onClick={handleExportPDF}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-600 text-xs font-bold text-gray-600 dark:text-gray-300 rounded-xl hover:border-gray-400 transition-all">
                  📄 Export PDF
                </button>
              )}
              <div className="flex items-center gap-1 bg-surface border border-theme rounded-xl p-1 overflow-x-auto">
                {(['14', '30', '90', '180'] as const).map(r => {
                  const isFree      = freeRanges.includes(r)
                  const creditCost  = creditRanges[r]
                  const isActive    = range === r
                  const isHardLocked = !isFree && !creditCost
                  return (
                    <button key={r} onClick={() => handleRangeClick(r)} disabled={isHardLocked}
                      className={`relative px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                        isActive      ? 'bg-black text-white' :
                        isHardLocked  ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' :
                        'text-gray-500 dark:text-gray-400 hover:text-black'
                      }`}>
                      {RANGE_LABELS[r]}
                      {creditCost && !isFree && <span className="ml-1 text-amber-500 font-bold">{creditCost}cr</span>}
                      {isHardLocked && <span className="ml-1">🔒</span>}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {plan === 'free' && (
            <div className="mb-6 bg-theme border border-theme-md rounded-2xl px-5 py-3">
              <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold">
                📊 Free plan includes 14-day & 30-day history
                <span className="text-gray-400 dark:text-gray-500 font-normal"> · 90-day costs 2 credits · </span>
                <Link href="/pricing" className="text-black font-bold underline">Upgrade to Pro to unlock 90-day free</Link>
              </p>
            </div>
          )}
          {plan === 'pro' && (
            <div className="mb-6 bg-theme border border-theme-md rounded-2xl px-5 py-3">
              <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold">
                📊 Pro plan includes up to 90-day history
                <span className="text-gray-400 dark:text-gray-500 font-normal"> · 6-month costs 2 credits · </span>
                <Link href="/pricing" className="text-black font-bold underline">Upgrade to Agency to unlock free</Link>
              </p>
            </div>
          )}

          {!radarDismissed && (
            <div className="mb-6 bg-black rounded-2xl px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-4 text-white">
              <div className="flex items-start gap-3 flex-1">
                <span className="text-2xl flex-shrink-0">📡</span>
                <div>
                  <p className="text-xs font-extrabold">SM-Radar — Real Trend Intelligence</p>
                  <p className="text-xs text-gray-400 mt-0.5">AI analysis of real Reddit and YouTube data — content gaps, competitor weaknesses, and what to post this week. 20 credits.</p>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <button onClick={() => setRadarModal(true)}
                  className="text-xs font-bold px-4 py-2 bg-white text-black rounded-xl hover:opacity-80 transition-all">
                  Try SM-Radar
                </button>
                <button onClick={() => setRadarDismissed(true)} className="text-xs text-gray-500 hover:text-gray-300 transition-all">
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {!loading && (daysSinceLastPost !== null && daysSinceLastPost > 3 || hasVideoGap) && (
            <div className="mb-6 bg-orange-50 border border-orange-100 rounded-2xl px-5 py-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-base">🕳️</span>
                <p className="text-xs font-extrabold text-orange-800">Content Gap Detected</p>
              </div>
              <div className="space-y-1">
                {daysSinceLastPost !== null && daysSinceLastPost > 3 && (
                  <p className="text-xs text-orange-700">
                    You haven't posted in <span className="font-bold">{daysSinceLastPost} days</span>. Consistent posting keeps your audience engaged.
                  </p>
                )}
                {hasVideoGap && (
                  <p className="text-xs text-orange-700">No video content in this period — video posts typically drive higher engagement.</p>
                )}
              </div>
              <Link href="/compose"
                className="inline-block mt-3 text-xs font-bold px-3 py-1.5 bg-orange-500 text-white rounded-xl hover:opacity-80 transition-all">
                Create a post now →
              </Link>
            </div>
          )}

          {/* STAT CARDS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {loading ? [1,2,3,4].map(i => (
              <div key={i} className="bg-surface border border-theme rounded-2xl p-5">
                <SkeletonBox className="h-3 w-16 mb-4" />
                <SkeletonBox className="h-8 w-12 mb-2" />
                <SkeletonBox className="h-3 w-20" />
              </div>
            )) : (
              [
                { label: 'Total Posts',      value: filteredPosts.length, icon: '📝', sub: 'in selected range'         },
                { label: 'Scheduled',        value: scheduled.length,     icon: '📅', sub: 'queued up'                 },
                { label: 'Avg / Week',       value: avgPerWeek,           icon: '📈', sub: 'posting frequency'         },
                { label: 'Total Engagement', value: totalEngagement,      icon: '❤️', sub: 'likes, reactions, reposts' },
              ].map(stat => (
                <div key={stat.label} className="bg-surface border border-theme rounded-2xl p-4 md:p-5">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide leading-tight">{stat.label}</span>
                    <span className="text-base flex-shrink-0">{stat.icon}</span>
                  </div>
                  <div className="text-2xl md:text-3xl font-extrabold tracking-tight mb-1">{stat.value}</div>
                  <div className="text-xs text-gray-400 dark:text-gray-500">{stat.sub}</div>
                </div>
              ))
            )}
          </div>

          {/* STREAK / PEAK / STATUS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-surface border border-theme rounded-2xl p-5 flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0">🔥</div>
              <div>
                <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">Current Streak</p>
                <p className="text-2xl font-extrabold tracking-tight">{currentStreak} <span className="text-sm font-semibold text-gray-400 dark:text-gray-500">days</span></p>
                <p className="text-xs text-gray-400 dark:text-gray-500">Longest: {longestStreak} days</p>
              </div>
            </div>
            <div className="bg-surface border border-theme rounded-2xl p-5 flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0">⏰</div>
              <div>
                <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">Peak Hour</p>
                <p className="text-2xl font-extrabold tracking-tight">{peakHour.label}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">{peakHour.count} posts at this hour</p>
              </div>
            </div>
            <div className="bg-surface border border-theme rounded-2xl p-5">
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-3">Post Status</p>
              {loading ? <SkeletonBox className="h-12" /> : (
                <div className="space-y-2">
                  {[
                    { label: 'Scheduled', count: scheduled.length, color: 'bg-blue-400'  },
                    { label: 'Draft',     count: drafts.length,    color: 'bg-gray-300'  },
                    { label: 'Published', count: published.length, color: 'bg-green-400' },
                  ].map(s => (
                    <div key={s.label} className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${s.color}`} />
                      <span className="text-xs text-gray-500 dark:text-gray-400 flex-1">{s.label}</span>
                      <span className="text-xs font-bold">{s.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {postsWithEngagement.length > 0 && (
            <div className="bg-surface border border-theme rounded-2xl p-5 mb-6">
              <h2 className="text-sm font-bold tracking-tight mb-4">Engagement by Post</h2>
              <div className="space-y-3">
                {postsWithEngagement.slice(0, 5).map(post => {
                  const eng      = post.analytics || {}
                  const totalEng = Object.values(eng).reduce((s: number, e: any) =>
                    s + (e.likes || 0) + (e.reposts || 0) + (e.reactions || 0) + (e.replies || 0), 0)
                  return (
                    <div key={post.id} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold truncate">{post.content?.slice(0, 60)}...</p>
                        <div className="flex items-center gap-2 mt-1">
                          {post.platforms?.map(p => (
                            <span key={p} className="text-xs">{PLATFORM_ICONS[p] || '📱'}</span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        {Object.entries(eng).map(([platform, data]: [string, any]) => (
                          <div key={platform} className="text-center">
                            <span className="text-xs">{PLATFORM_ICONS[platform] || '📱'}</span>
                            <p className="text-xs font-bold">{(data.likes || 0) + (data.reposts || 0) + (data.reactions || 0)}</p>
                          </div>
                        ))}
                        <div className="text-center">
                          <p className="text-xs text-gray-400 dark:text-gray-500">Total</p>
                          <p className="text-sm font-extrabold">{totalEng}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* MAIN CHARTS GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">

              <div className="bg-surface border border-theme rounded-2xl p-5">
                <h2 className="text-sm font-bold tracking-tight mb-4">Daily Activity</h2>
                {loading ? <SkeletonBox className="h-32" /> : (
                  <div className="flex items-end gap-1 h-32">
                    {dailyCounts.map((day, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap z-10">
                          {day.count} · {day.label}
                        </div>
                        <div className="w-full flex items-end justify-center" style={{ height: '112px' }}>
                          <div
                            className={`w-full rounded-t-md transition-all ${day.count > 0 ? 'bg-black hover:opacity-70' : 'bg-gray-100 dark:bg-gray-800'}`}
                            style={{ height: day.count > 0 ? `${Math.max((day.count / maxDailyCount) * 100, 8)}%` : '4px' }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex justify-between mt-2">
                  <span className="text-xs text-gray-400 dark:text-gray-500">{dailyCounts[0]?.label}</span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">{dailyCounts[dailyCounts.length - 1]?.label}</span>
                </div>
              </div>

              <div className="bg-surface border border-theme rounded-2xl p-5">
                <h2 className="text-sm font-bold tracking-tight mb-4">Best Days to Post</h2>
                {loading ? <SkeletonBox className="h-24" /> : (
                  <div className="flex items-end gap-2 h-24">
                    {dayOfWeekCounts.map((day, i) => {
                      const pct   = maxDayCount > 0 ? (day.count / maxDayCount) * 100 : 0
                      const isTop = day.count === maxDayCount && day.count > 0
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                          <div className="w-full flex items-end justify-center" style={{ height: '72px' }}>
                            <div
                              className={`w-full rounded-t-lg transition-all ${isTop ? 'bg-black' : day.count > 0 ? 'bg-gray-200 dark:bg-gray-700' : 'bg-gray-100 dark:bg-gray-800'}`}
                              style={{ height: day.count > 0 ? `${Math.max(pct, 10)}%` : '4px' }}
                            />
                          </div>
                          <span className={`text-xs font-semibold ${isTop ? 'text-black dark:text-white' : 'text-gray-400 dark:text-gray-500'}`}>{day.day}</span>
                          <span className="text-xs text-gray-400 dark:text-gray-500">{day.count}</span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              <div className="bg-surface border border-theme rounded-2xl p-5">
                <h2 className="text-sm font-bold tracking-tight mb-4">Best Times to Post</h2>
                {loading ? <SkeletonBox className="h-16" /> : (
                  <div>
                    <div className="flex gap-1 flex-wrap">
                      {hourCounts.map(h => {
                        const pct = maxHourCount > 0 ? h.count / maxHourCount : 0
                        const bg  = pct === 0 ? 'bg-gray-100' : pct < 0.25 ? 'bg-gray-300' : pct < 0.5 ? 'bg-gray-400' : pct < 0.75 ? 'bg-gray-600' : 'bg-black'
                        return (
                          <div key={h.hour} className="group relative">
                            <div className={`w-7 h-7 md:w-8 md:h-8 rounded-lg ${bg} transition-all`} />
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap z-10">
                              {h.label}: {h.count}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-gray-400 dark:text-gray-500">
                      <span>12am</span><span>6am</span><span>12pm</span><span>6pm</span><span>11pm</span>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <span className="text-xs text-gray-400 dark:text-gray-500">Less</span>
                      {['bg-gray-100','bg-gray-300','bg-gray-400','bg-gray-600','bg-black'].map((c, i) => (
                        <div key={i} className={`w-4 h-4 rounded ${c}`} />
                      ))}
                      <span className="text-xs text-gray-400 dark:text-gray-500">More</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-surface border border-theme rounded-2xl p-5">
                <h2 className="text-sm font-bold tracking-tight mb-4">Posts by Month — {now.getFullYear()}</h2>
                {loading ? <SkeletonBox className="h-24" /> : (
                  <div className="flex items-end gap-1 md:gap-2 h-24">
                    {monthCounts.map((m, i) => {
                      const isCurrent = i === now.getMonth()
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                          <div className="w-full flex items-end justify-center" style={{ height: '72px' }}>
                            <div
                              className={`w-full rounded-t-lg transition-all ${isCurrent ? 'bg-black' : m.count > 0 ? 'bg-gray-200 dark:bg-gray-700' : 'bg-gray-100 dark:bg-gray-800'}`}
                              style={{ height: m.count > 0 ? `${Math.max((m.count / maxMonthCount) * 100, 8)}%` : '4px' }}
                            />
                          </div>
                          <span className={`text-xs ${isCurrent ? 'font-bold text-black dark:text-white' : 'text-gray-400 dark:text-gray-500'} hidden sm:block`}>{m.month}</span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="space-y-6">
              <div className="bg-surface border border-theme rounded-2xl p-5">
                <h2 className="text-sm font-bold tracking-tight mb-4">Platform Breakdown</h2>
                {loading
                  ? <div className="space-y-3">{[1,2,3,4].map(i => <SkeletonBox key={i} className="h-6" />)}</div>
                  : topPlatforms.length === 0
                  ? <div className="text-center py-6"><p className="text-xs text-gray-400 dark:text-gray-500">No posts yet</p></div>
                  : (
                    <div className="space-y-3">
                      {topPlatforms.map(([platform, count]) => (
                        <div key={platform}>
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm">{PLATFORM_ICONS[platform] || '📱'}</span>
                              <span className="text-xs font-semibold capitalize">{platform}</span>
                            </div>
                            <span className="text-xs font-bold">{count}</span>
                          </div>
                          <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                            <div className="bg-black h-2 rounded-full transition-all"
                              style={{ width: `${(count / maxPlatformCount) * 100}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                }
              </div>

              <div className="bg-surface border border-theme rounded-2xl p-5">
                <h2 className="text-sm font-bold tracking-tight mb-4">Content Insights</h2>
                {loading ? <SkeletonBox className="h-32" /> : (
                  <div className="space-y-4">
                    {[
                      { label: 'Avg Caption Length', value: avgLength + ' chars', sub: avgLength < 100 ? 'Short & punchy' : avgLength < 300 ? 'Medium length' : 'Long form', icon: '✍️' },
                      { label: 'Most Used Platform', value: topPlatforms[0]?.[0] ? topPlatforms[0][0].charAt(0).toUpperCase() + topPlatforms[0][0].slice(1) : '—', sub: topPlatforms[0] ? `${topPlatforms[0][1]} posts` : 'No posts yet', icon: topPlatforms[0] ? PLATFORM_ICONS[topPlatforms[0][0]] : '📱' },
                      { label: 'Draft Rate', value: filteredPosts.length > 0 ? `${Math.round((drafts.length / filteredPosts.length) * 100)}%` : '0%', sub: 'posts left as drafts', icon: '📂' },
                      { label: 'Posts with Engagement', value: postsWithEngagement.length, sub: 'synced from platforms', icon: '❤️' },
                    ].map(insight => (
                      <div key={insight.label} className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gray-50 dark:bg-gray-800 rounded-xl flex items-center justify-center text-base flex-shrink-0">{insight.icon}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-400 dark:text-gray-500">{insight.label}</p>
                          <p className="text-sm font-bold truncate">{insight.value}</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">{insight.sub}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-surface border border-theme rounded-2xl p-5">
                <h2 className="text-sm font-bold tracking-tight mb-2">Consistency Score</h2>
                {loading ? <SkeletonBox className="h-20" /> : (() => {
                  const score = Math.min(Math.round((parseFloat(avgPerWeek) / 7) * 100), 100)
                  const label = score >= 80 ? 'Excellent' : score >= 50 ? 'Good' : score >= 25 ? 'Building' : 'Just Starting'
                  const color = score >= 80 ? 'text-green-600' : score >= 50 ? 'text-blue-600' : score >= 25 ? 'text-orange-500' : 'text-gray-400'
                  return (
                    <>
                      <div className="flex items-end gap-2 mb-2">
                        <span className={`text-4xl font-extrabold tracking-tight ${color}`}>{score}</span>
                        <span className="text-gray-400 dark:text-gray-500 text-sm mb-1">/100</span>
                      </div>
                      <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2 mb-2">
                        <div className="bg-black h-2 rounded-full transition-all" style={{ width: `${score}%` }} />
                      </div>
                      <p className={`text-xs font-semibold ${color}`}>{label}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Based on {avgPerWeek} posts/week average</p>
                    </>
                  )
                })()}
              </div>

              <div className="bg-black rounded-2xl p-5 text-white">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">🔥</span>
                  <p className="text-xs font-extrabold">SM-Pulse</p>
                  <span className="text-xs font-bold px-2 py-0.5 bg-white text-black rounded-full">20 credits</span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed mb-3">
                  See what's trending in your niche right now — powered by real Reddit and YouTube data.
                </p>
                <button onClick={() => setPulseModal(true)}
                  className="text-xs font-bold px-4 py-2 bg-white text-black rounded-xl hover:opacity-80 transition-all inline-block">
                  {pulseLoading ? 'Scanning...' : 'Try SM-Pulse →'}
                </button>
              </div>

              {plan !== 'agency' && (
                <div className={`rounded-2xl p-5 border ${plan === 'free' ? 'bg-blue-50 border-blue-100' : 'bg-purple-50 border-purple-100'}`}>
                  <p className={`text-xs font-bold mb-1 ${plan === 'free' ? 'text-blue-700' : 'text-purple-700'}`}>
                    {plan === 'free' ? '⚡ Unlock 90-day history free' : '🏢 Unlock 6-month history free'}
                  </p>
                  <p className={`text-xs mb-3 ${plan === 'free' ? 'text-blue-600' : 'text-purple-600'}`}>
                    {plan === 'free' ? 'Pro plan includes 90-day analytics — no credits needed.' : 'Agency plan includes full 6-month history.'}
                  </p>
                  <Link href="/pricing"
                    className={`block text-center text-white text-xs font-bold px-3 py-2 rounded-xl hover:opacity-80 transition-all ${plan === 'free' ? 'bg-blue-600' : 'bg-purple-600'}`}>
                    {plan === 'free' ? 'Upgrade to Pro →' : 'Upgrade to Agency →'}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}