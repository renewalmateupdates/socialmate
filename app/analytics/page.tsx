'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'
import { useWorkspace } from '@/contexts/WorkspaceContext'

function SkeletonBox({ className }: { className?: string }) {
  return <div className={`bg-gray-100 rounded-xl animate-pulse ${className}`} />
}

type Post = {
  id: string
  content: string
  platforms: string[]
  scheduled_at: string
  status: string
  created_at: string
}

const PLATFORM_ICONS: Record<string, string> = {
  instagram: '📸', twitter: '🐦', linkedin: '💼', tiktok: '🎵',
  facebook: '📘', pinterest: '📌', youtube: '▶️', threads: '🧵',
  snapchat: '👻', bluesky: '🦋', reddit: '🤖', discord: '💬',
  telegram: '✈️', mastodon: '🐘', lemon8: '🍋', bereal: '📷',
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

// What each plan can access
const PLAN_RANGES: Record<string, string[]> = {
  free:   ['7', '30'],
  pro:    ['7', '30', '90'],
  agency: ['7', '30', '90', 'all'],
}

const RANGE_LABELS: Record<string, string> = {
  '7': '7d', '30': '30d', '90': '90d', 'all': 'All Time'
}

const RANGE_REQUIRED_PLAN: Record<string, string> = {
  '90': 'Pro', 'all': 'Agency'
}

export default function Analytics() {
  const [user, setUser] = useState<any>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [range, setRange] = useState<'7' | '30' | '90' | 'all'>('30')
  const [lockedRange, setLockedRange] = useState<string | null>(null)
  const router = useRouter()
  const { plan } = useWorkspace()

  const allowedRanges = PLAN_RANGES[plan] || PLAN_RANGES.free

  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUser(user)
      const { data } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
      setPosts(data || [])
      setLoading(false)
    }
    getData()
  }, [])

  const handleRangeClick = (r: '7' | '30' | '90' | 'all') => {
    if (!allowedRanges.includes(r)) {
      setLockedRange(r)
      return
    }
    setLockedRange(null)
    setRange(r)
  }

  const now = new Date()
  const rangeDays = range === 'all' ? 9999 : parseInt(range)
  const rangeStart = new Date(now)
  rangeStart.setDate(now.getDate() - rangeDays)

  const filteredPosts = posts.filter(p => range === 'all' || new Date(p.created_at) >= rangeStart)
  const scheduled = filteredPosts.filter(p => p.status === 'scheduled')
  const drafts = filteredPosts.filter(p => p.status === 'draft')
  const published = filteredPosts.filter(p => p.status === 'published')

  const platformCounts = filteredPosts.reduce((acc, post) => {
    post.platforms?.forEach(pl => { acc[pl] = (acc[pl] || 0) + 1 })
    return acc
  }, {} as Record<string, number>)
  const topPlatforms = Object.entries(platformCounts).sort((a, b) => b[1] - a[1])
  const maxPlatformCount = topPlatforms[0]?.[1] || 1

  const daysToShow = Math.min(rangeDays === 9999 ? 30 : rangeDays, 30)
  const dailyCounts = Array.from({ length: daysToShow }, (_, i) => {
    const d = new Date(now)
    d.setDate(now.getDate() - (daysToShow - 1 - i))
    const dateStr = d.toDateString()
    const count = filteredPosts.filter(p => new Date(p.created_at).toDateString() === dateStr).length
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
  const peakHour = hourCounts.reduce((a, b) => a.count > b.count ? a : b)

  const monthCounts = Array.from({ length: 12 }, (_, i) => {
    const count = posts.filter(p => new Date(p.created_at).getMonth() === i && new Date(p.created_at).getFullYear() === now.getFullYear()).length
    return { month: MONTHS[i], count }
  })
  const maxMonthCount = Math.max(...monthCounts.map(m => m.count), 1)

  let currentStreak = 0, longestStreak = 0, tempStreak = 0
  const today = new Date(); today.setHours(0,0,0,0)
  for (let i = 0; i < 365; i++) {
    const d = new Date(today); d.setDate(today.getDate() - i)
    const hasPost = posts.some(p => new Date(p.created_at).toDateString() === d.toDateString())
    if (hasPost) { tempStreak++; if (i === 0 || i === currentStreak) currentStreak = tempStreak; longestStreak = Math.max(longestStreak, tempStreak) }
    else { tempStreak = 0 }
  }

  const oldestPost = posts[0]
  const weeksSinceFirst = oldestPost ? Math.max((now.getTime() - new Date(oldestPost.created_at).getTime()) / (7 * 24 * 3600000), 1) : 1
  const avgPerWeek = (posts.length / weeksSinceFirst).toFixed(1)
  const avgLength = filteredPosts.length > 0 ? Math.round(filteredPosts.reduce((sum, p) => sum + (p.content?.length || 0), 0) / filteredPosts.length) : 0

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="ml-56 flex-1 p-8">
        <div className="max-w-7xl mx-auto">

          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">Analytics</h1>
              <p className="text-sm text-gray-400 mt-0.5">Real data from your posting activity</p>
            </div>
            <div className="flex items-center gap-1 bg-white border border-gray-100 rounded-xl p-1">
              {(['7', '30', '90', 'all'] as const).map(r => {
                const allowed = allowedRanges.includes(r)
                const isActive = range === r
                return (
                  <button key={r} onClick={() => handleRangeClick(r)}
                    className={`relative px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      isActive ? 'bg-black text-white'
                      : allowed ? 'text-gray-500 hover:text-black'
                      : 'text-gray-300 cursor-pointer'
                    }`}>
                    {RANGE_LABELS[r]}
                    {!allowed && <span className="ml-1 text-gray-300">🔒</span>}
                  </button>
                )
              })}
            </div>
          </div>

          {/* LOCKED RANGE NUDGE */}
          {lockedRange && !allowedRanges.includes(lockedRange) && (
            <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-amber-800">
                  {RANGE_LABELS[lockedRange]} history requires {RANGE_REQUIRED_PLAN[lockedRange]}
                </p>
                <p className="text-xs text-amber-600 mt-0.5">
                  {lockedRange === '90' ? 'Pro plan includes 90-day analytics history.' : 'Agency plan includes full all-time history.'}
                </p>
              </div>
              <Link href="/pricing"
                className="bg-black text-white text-xs font-bold px-4 py-2 rounded-xl hover:opacity-80 transition-all flex-shrink-0 ml-4">
                Upgrade →
              </Link>
            </div>
          )}

          {/* PLAN HISTORY BANNER */}
          {plan === 'free' && (
            <div className="mb-6 bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3 flex items-center justify-between">
              <p className="text-xs text-gray-500 font-semibold">
                📊 Free plan includes up to 30-day history · <span className="text-gray-400 font-normal">Upgrade for 90-day and all-time data</span>
              </p>
              <Link href="/pricing" className="text-xs font-bold text-black underline ml-4">Upgrade →</Link>
            </div>
          )}

          <div className="grid grid-cols-4 gap-4 mb-6">
            {loading ? [1,2,3,4].map(i => (
              <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5">
                <SkeletonBox className="h-3 w-16 mb-4" />
                <SkeletonBox className="h-8 w-12 mb-2" />
                <SkeletonBox className="h-3 w-20" />
              </div>
            )) : (
              [
                { label: 'Total Posts', value: filteredPosts.length, icon: '📝', sub: 'in selected range' },
                { label: 'Scheduled', value: scheduled.length, icon: '📅', sub: 'queued up' },
                { label: 'Avg / Week', value: avgPerWeek, icon: '📈', sub: 'posting frequency' },
                { label: 'Avg Length', value: avgLength, icon: '✍️', sub: 'characters per post' },
              ].map(stat => (
                <div key={stat.label} className="bg-white border border-gray-100 rounded-2xl p-5">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{stat.label}</span>
                    <span className="text-base">{stat.icon}</span>
                  </div>
                  <div className="text-3xl font-extrabold tracking-tight mb-1">{stat.value}</div>
                  <div className="text-xs text-gray-400">{stat.sub}</div>
                </div>
              ))
            )}
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white border border-gray-100 rounded-2xl p-5 flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0">🔥</div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Current Streak</p>
                <p className="text-2xl font-extrabold tracking-tight">{currentStreak} <span className="text-sm font-semibold text-gray-400">days</span></p>
                <p className="text-xs text-gray-400">Longest: {longestStreak} days</p>
              </div>
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl p-5 flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0">⏰</div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Peak Hour</p>
                <p className="text-2xl font-extrabold tracking-tight">{peakHour.label}</p>
                <p className="text-xs text-gray-400">{peakHour.count} posts at this hour</p>
              </div>
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl p-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Post Status</p>
              {loading ? <SkeletonBox className="h-12" /> : (
                <div className="space-y-2">
                  {[
                    { label: 'Scheduled', count: scheduled.length, color: 'bg-blue-400' },
                    { label: 'Draft', count: drafts.length, color: 'bg-gray-300' },
                    { label: 'Published', count: published.length, color: 'bg-green-400' },
                  ].map(s => (
                    <div key={s.label} className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${s.color}`} />
                      <span className="text-xs text-gray-500 flex-1">{s.label}</span>
                      <span className="text-xs font-bold">{s.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 space-y-6">
              <div className="bg-white border border-gray-100 rounded-2xl p-5">
                <h2 className="text-sm font-bold tracking-tight mb-4">Daily Activity</h2>
                {loading ? <SkeletonBox className="h-32" /> : (
                  <div className="flex items-end gap-1 h-32">
                    {dailyCounts.map((day, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap z-10">
                          {day.count} · {day.label}
                        </div>
                        <div className="w-full flex items-end justify-center" style={{ height: '112px' }}>
                          <div className={`w-full rounded-t-md transition-all ${day.count > 0 ? 'bg-black hover:opacity-70' : 'bg-gray-100'}`}
                            style={{ height: day.count > 0 ? `${Math.max((day.count / maxDailyCount) * 100, 8)}%` : '4px' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex justify-between mt-2">
                  <span className="text-xs text-gray-400">{dailyCounts[0]?.label}</span>
                  <span className="text-xs text-gray-400">{dailyCounts[dailyCounts.length - 1]?.label}</span>
                </div>
              </div>

              <div className="bg-white border border-gray-100 rounded-2xl p-5">
                <h2 className="text-sm font-bold tracking-tight mb-4">Best Days to Post</h2>
                {loading ? <SkeletonBox className="h-24" /> : (
                  <div className="flex items-end gap-3 h-24">
                    {dayOfWeekCounts.map((day, i) => {
                      const pct = maxDayCount > 0 ? (day.count / maxDayCount) * 100 : 0
                      const isTop = day.count === maxDayCount && day.count > 0
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                          <div className="w-full flex items-end justify-center" style={{ height: '72px' }}>
                            <div className={`w-full rounded-t-lg transition-all ${isTop ? 'bg-black' : day.count > 0 ? 'bg-gray-200' : 'bg-gray-100'}`}
                              style={{ height: day.count > 0 ? `${Math.max(pct, 10)}%` : '4px' }} />
                          </div>
                          <span className={`text-xs font-semibold ${isTop ? 'text-black' : 'text-gray-400'}`}>{day.day}</span>
                          <span className="text-xs text-gray-400">{day.count}</span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              <div className="bg-white border border-gray-100 rounded-2xl p-5">
                <h2 className="text-sm font-bold tracking-tight mb-4">Best Times to Post</h2>
                {loading ? <SkeletonBox className="h-16" /> : (
                  <div>
                    <div className="flex gap-1 flex-wrap">
                      {hourCounts.map(h => {
                        const pct = maxHourCount > 0 ? h.count / maxHourCount : 0
                        const bg = pct === 0 ? 'bg-gray-100' : pct < 0.25 ? 'bg-gray-300' : pct < 0.5 ? 'bg-gray-400' : pct < 0.75 ? 'bg-gray-600' : 'bg-black'
                        return (
                          <div key={h.hour} className="group relative">
                            <div className={`w-8 h-8 rounded-lg ${bg} transition-all`} />
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap z-10">
                              {h.label}: {h.count}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-gray-400">
                      <span>12am</span><span>6am</span><span>12pm</span><span>6pm</span><span>11pm</span>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <span className="text-xs text-gray-400">Less</span>
                      {['bg-gray-100','bg-gray-300','bg-gray-400','bg-gray-600','bg-black'].map((c, i) => (
                        <div key={i} className={`w-4 h-4 rounded ${c}`} />
                      ))}
                      <span className="text-xs text-gray-400">More</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-white border border-gray-100 rounded-2xl p-5">
                <h2 className="text-sm font-bold tracking-tight mb-4">Posts by Month — {now.getFullYear()}</h2>
                {loading ? <SkeletonBox className="h-24" /> : (
                  <div className="flex items-end gap-2 h-24">
                    {monthCounts.map((m, i) => {
                      const isCurrent = i === now.getMonth()
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                          <div className="w-full flex items-end justify-center" style={{ height: '72px' }}>
                            <div className={`w-full rounded-t-lg transition-all ${isCurrent ? 'bg-black' : m.count > 0 ? 'bg-gray-200' : 'bg-gray-100'}`}
                              style={{ height: m.count > 0 ? `${Math.max((m.count / maxMonthCount) * 100, 8)}%` : '4px' }} />
                          </div>
                          <span className={`text-xs ${isCurrent ? 'font-bold text-black' : 'text-gray-400'}`}>{m.month}</span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white border border-gray-100 rounded-2xl p-5">
                <h2 className="text-sm font-bold tracking-tight mb-4">Platform Breakdown</h2>
                {loading ? <div className="space-y-3">{[1,2,3,4].map(i => <SkeletonBox key={i} className="h-6" />)}</div>
                : topPlatforms.length === 0 ? <div className="text-center py-6"><p className="text-xs text-gray-400">No posts yet</p></div>
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
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div className="bg-black h-2 rounded-full transition-all" style={{ width: `${(count / maxPlatformCount) * 100}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white border border-gray-100 rounded-2xl p-5">
                <h2 className="text-sm font-bold tracking-tight mb-4">Content Insights</h2>
                {loading ? <SkeletonBox className="h-32" /> : (
                  <div className="space-y-4">
                    {[
                      { label: 'Avg Caption Length', value: avgLength + ' chars', sub: avgLength < 100 ? 'Short & punchy' : avgLength < 300 ? 'Medium length' : 'Long form', icon: '✍️' },
                      { label: 'Most Used Platform', value: topPlatforms[0]?.[0] ? topPlatforms[0][0].charAt(0).toUpperCase() + topPlatforms[0][0].slice(1) : '—', sub: topPlatforms[0] ? `${topPlatforms[0][1]} posts` : 'No posts yet', icon: topPlatforms[0] ? PLATFORM_ICONS[topPlatforms[0][0]] : '📱' },
                      { label: 'Draft Rate', value: filteredPosts.length > 0 ? `${Math.round((drafts.length / filteredPosts.length) * 100)}%` : '0%', sub: 'posts left as drafts', icon: '📂' },
                      { label: 'Total Platforms Used', value: topPlatforms.length, sub: 'different platforms', icon: '📱' },
                    ].map(insight => (
                      <div key={insight.label} className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gray-50 rounded-xl flex items-center justify-center text-base flex-shrink-0">{insight.icon}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-400">{insight.label}</p>
                          <p className="text-sm font-bold truncate">{insight.value}</p>
                          <p className="text-xs text-gray-400">{insight.sub}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white border border-gray-100 rounded-2xl p-5">
                <h2 className="text-sm font-bold tracking-tight mb-2">Consistency Score</h2>
                {loading ? <SkeletonBox className="h-20" /> : (() => {
                  const score = Math.min(Math.round((parseFloat(avgPerWeek) / 7) * 100), 100)
                  const label = score >= 80 ? 'Excellent' : score >= 50 ? 'Good' : score >= 25 ? 'Building' : 'Just Starting'
                  const color = score >= 80 ? 'text-green-600' : score >= 50 ? 'text-blue-600' : score >= 25 ? 'text-orange-500' : 'text-gray-400'
                  return (
                    <>
                      <div className="flex items-end gap-2 mb-2">
                        <span className={`text-4xl font-extrabold tracking-tight ${color}`}>{score}</span>
                        <span className="text-gray-400 text-sm mb-1">/100</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
                        <div className="bg-black h-2 rounded-full transition-all" style={{ width: `${score}%` }} />
                      </div>
                      <p className={`text-xs font-semibold ${color}`}>{label}</p>
                      <p className="text-xs text-gray-400 mt-1">Based on {avgPerWeek} posts/week average</p>
                    </>
                  )
                })()}
              </div>

              {/* UPGRADE CARD for free/pro */}
              {plan !== 'agency' && (
                <div className={`rounded-2xl p-5 border ${plan === 'free' ? 'bg-blue-50 border-blue-100' : 'bg-purple-50 border-purple-100'}`}>
                  <p className={`text-xs font-bold mb-1 ${plan === 'free' ? 'text-blue-700' : 'text-purple-700'}`}>
                    {plan === 'free' ? '⚡ Unlock more history' : '🏢 Unlock all-time history'}
                  </p>
                  <p className={`text-xs mb-3 ${plan === 'free' ? 'text-blue-600' : 'text-purple-600'}`}>
                    {plan === 'free' ? 'Pro plan includes 90-day analytics history.' : 'Agency plan includes full all-time data.'}
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