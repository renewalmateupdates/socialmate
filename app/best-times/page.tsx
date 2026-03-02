'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'

function SkeletonBox({ className }: { className?: string }) {
  return <div className={`bg-gray-100 rounded-xl animate-pulse ${className}`} />
}

type Post = {
  id: string
  platforms: string[]
  scheduled_at: string
  status: string
  created_at: string
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const PLATFORM_ICONS: Record<string, string> = {
  instagram: '📸', twitter: '🐦', linkedin: '💼', tiktok: '🎵',
  facebook: '📘', pinterest: '📌', youtube: '▶️', threads: '🧵',
  snapchat: '👻', bluesky: '🦋', reddit: '🤖', discord: '💬',
  telegram: '✈️', mastodon: '🐘', lemon8: '🍋', bereal: '📷',
}

const INDUSTRY_BEST_TIMES: Record<string, { day: string; time: string; note: string }[]> = {
  instagram: [
    { day: 'Monday', time: '11:00 AM', note: 'High engagement at start of week' },
    { day: 'Wednesday', time: '11:00 AM', note: 'Midweek peak' },
    { day: 'Friday', time: '10:00 AM–12:00 PM', note: 'End of week engagement spike' },
  ],
  twitter: [
    { day: 'Wednesday', time: '9:00 AM', note: 'Highest retweet activity' },
    { day: 'Thursday', time: '9:00 AM', note: 'Strong mid-morning engagement' },
    { day: 'Friday', time: '9:00 AM', note: 'High engagement before weekend' },
  ],
  linkedin: [
    { day: 'Tuesday', time: '10:00 AM–12:00 PM', note: 'Professional peak hours' },
    { day: 'Wednesday', time: '8:00 AM–10:00 AM', note: 'Before work browsing' },
    { day: 'Thursday', time: '9:00 AM', note: 'Consistent high engagement' },
  ],
  tiktok: [
    { day: 'Tuesday', time: '9:00 AM', note: 'High morning views' },
    { day: 'Thursday', time: '12:00 PM', note: 'Lunchtime scroll peak' },
    { day: 'Friday', time: '5:00 PM', note: 'End of day entertainment' },
  ],
  facebook: [
    { day: 'Wednesday', time: '11:00 AM–1:00 PM', note: 'Lunchtime peak' },
    { day: 'Thursday', time: '1:00 PM–3:00 PM', note: 'Afternoon engagement' },
    { day: 'Friday', time: '1:00 PM', note: 'Pre-weekend browsing' },
  ],
}

export default function BestTimes() {
  const [user, setUser] = useState<any>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPlatform, setSelectedPlatform] = useState('instagram')
  const router = useRouter()

  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUser(user)
      const { data } = await supabase
        .from('posts')
        .select('id, platforms, scheduled_at, status, created_at')
        .eq('user_id', user.id)
        .not('scheduled_at', 'is', null)
        .order('scheduled_at', { ascending: true })
      setPosts(data || [])
      setLoading(false)
    }
    getData()
  }, [])

  const platformPosts = posts.filter(p => p.platforms?.includes(selectedPlatform))
  const allPlatformsUsed = Array.from(new Set(posts.flatMap(p => p.platforms || [])))

  const hourCounts = Array.from({ length: 24 }, (_, h) => {
    const count = platformPosts.filter(p => new Date(p.scheduled_at).getHours() === h).length
    const label = h === 0 ? '12am' : h === 12 ? '12pm' : h < 12 ? `${h}am` : `${h - 12}pm`
    return { hour: h, count, label }
  })

  const dayCounts = Array.from({ length: 7 }, (_, d) => {
    const count = platformPosts.filter(p => new Date(p.scheduled_at).getDay() === d).length
    return { day: DAYS_SHORT[d], fullDay: DAYS[d], count }
  })

  const maxHour = Math.max(...hourCounts.map(h => h.count), 1)
  const maxDay = Math.max(...dayCounts.map(d => d.count), 1)

  const topHours = [...hourCounts].sort((a, b) => b.count - a.count).slice(0, 3).filter(h => h.count > 0)
  const topDays = [...dayCounts].sort((a, b) => b.count - a.count).slice(0, 3).filter(d => d.count > 0)

  const industryTimes = INDUSTRY_BEST_TIMES[selectedPlatform] || []
  const hasData = platformPosts.length >= 3

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />

      <div className="ml-56 flex-1 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">Best Times</h1>
            <p className="text-sm text-gray-400 mt-0.5">When to post for maximum reach</p>
          </div>
          <Link href="/compose" className="bg-black text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:opacity-80 transition-all">
            + Schedule Post
          </Link>
        </div>

        <div className="flex items-center gap-2 mb-6 flex-wrap">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Platform:</span>
          {(allPlatformsUsed.length > 0 ? allPlatformsUsed : Object.keys(INDUSTRY_BEST_TIMES)).map(p => (
            <button key={p} onClick={() => setSelectedPlatform(p)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${selectedPlatform === p ? 'bg-black text-white border-black' : 'bg-white border-gray-200 text-gray-500 hover:border-gray-400'}`}>
              <span>{PLATFORM_ICONS[p] || '📱'}</span>
              <span className="capitalize">{p}</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-6">
            {!hasData && (
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3">
                <span className="text-xl">💡</span>
                <div>
                  <p className="text-sm font-bold text-blue-700">Not enough data yet</p>
                  <p className="text-xs text-blue-500 mt-0.5">
                    Schedule at least 3 posts on {selectedPlatform} to see your personal best times. For now, we're showing industry averages below.
                  </p>
                </div>
              </div>
            )}

            <div className="bg-white border border-gray-100 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold tracking-tight">Best Hours to Post</h2>
                <span className="text-xs text-gray-400">{platformPosts.length} posts analyzed</span>
              </div>
              {loading ? <SkeletonBox className="h-32" /> : (
                <>
                  <div className="flex items-end gap-1 h-28 mb-3">
                    {hourCounts.map(h => {
                      const pct = (h.count / maxHour) * 100
                      const isTop = topHours.some(t => t.hour === h.hour)
                      return (
                        <div key={h.hour} className="flex-1 group relative flex flex-col items-center">
                          {h.count > 0 && (
                            <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap z-10">
                              {h.count} post{h.count !== 1 ? 's' : ''} · {h.label}
                            </div>
                          )}
                          <div className="w-full flex items-end justify-center" style={{ height: '100px' }}>
                            <div className={`w-full rounded-t-md transition-all ${isTop && hasData ? 'bg-black' : h.count > 0 ? 'bg-gray-300' : 'bg-gray-100'}`}
                              style={{ height: h.count > 0 ? `${Math.max(pct, 6)}%` : '3px' }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>12am</span><span>6am</span><span>12pm</span><span>6pm</span><span>11pm</span>
                  </div>
                </>
              )}
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-5">
              <h2 className="text-sm font-bold tracking-tight mb-4">Best Days to Post</h2>
              {loading ? <SkeletonBox className="h-24" /> : (
                <div className="flex items-end gap-3 h-24">
                  {dayCounts.map((d, i) => {
                    const pct = maxDay > 0 ? (d.count / maxDay) * 100 : 0
                    const isTop = topDays[0]?.day === d.day && hasData
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <div className="w-full flex items-end justify-center" style={{ height: '72px' }}>
                          <div className={`w-full rounded-t-xl transition-all ${isTop ? 'bg-black' : d.count > 0 ? 'bg-gray-200' : 'bg-gray-100'}`}
                            style={{ height: d.count > 0 ? `${Math.max(pct, 10)}%` : '4px' }} />
                        </div>
                        <span className={`text-xs font-semibold ${isTop ? 'text-black' : 'text-gray-400'}`}>{d.day}</span>
                        <span className="text-xs text-gray-300">{d.count}</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold tracking-tight">
                  {PLATFORM_ICONS[selectedPlatform]} Industry Best Times for <span className="capitalize">{selectedPlatform}</span>
                </h2>
                <span className="text-xs text-gray-400">Based on global averages</span>
              </div>
              <div className="space-y-3">
                {industryTimes.map((slot, i) => (
                  <div key={i} className="flex items-start gap-4 p-3 bg-gray-50 rounded-xl">
                    <div className="w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0">
                      #{i + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold">{slot.day}</p>
                        <span className="text-xs font-semibold text-gray-500">{slot.time}</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{slot.note}</p>
                    </div>
                    <Link href={`/compose`}
                      className="text-xs font-semibold px-3 py-1.5 bg-black text-white rounded-xl hover:opacity-80 transition-all flex-shrink-0">
                      Schedule
                    </Link>
                  </div>
                ))}
                {industryTimes.length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-4">No industry data available for this platform yet</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {hasData && topHours.length > 0 && (
              <div className="bg-white border border-gray-100 rounded-2xl p-5">
                <h2 className="text-sm font-bold tracking-tight mb-4">Your Top Hours</h2>
                <div className="space-y-3">
                  {topHours.map((h, i) => (
                    <div key={h.hour} className="flex items-center gap-3">
                      <div className="w-7 h-7 bg-black text-white rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0">
                        #{i + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold">{h.label}</p>
                        <p className="text-xs text-gray-400">{h.count} post{h.count !== 1 ? 's' : ''}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {hasData && topDays.length > 0 && (
              <div className="bg-white border border-gray-100 rounded-2xl p-5">
                <h2 className="text-sm font-bold tracking-tight mb-4">Your Top Days</h2>
                <div className="space-y-3">
                  {topDays.map((d, i) => (
                    <div key={d.day} className="flex items-center gap-3">
                      <div className="w-7 h-7 bg-black text-white rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0">
                        #{i + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold">{d.fullDay}</p>
                        <p className="text-xs text-gray-400">{d.count} post{d.count !== 1 ? 's' : ''}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white border border-gray-100 rounded-2xl p-5">
              <h2 className="text-sm font-bold tracking-tight mb-4">Quick Tips</h2>
              <div className="space-y-3 text-xs text-gray-500">
                {[
                  { icon: '📱', tip: 'Most people check social media first thing in the morning (7–9 AM)' },
                  { icon: '☀️', tip: 'Lunchtime (12–1 PM) sees a consistent spike across all platforms' },
                  { icon: '🌙', tip: 'Evening (7–9 PM) is peak scroll time for Instagram and TikTok' },
                  { icon: '📆', tip: 'Mid-week (Tue–Thu) typically outperforms weekends for engagement' },
                  { icon: '🔁', tip: 'Consistency matters more than perfect timing — post regularly' },
                ].map((tip, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="flex-shrink-0">{tip.icon}</span>
                    <p className="leading-relaxed">{tip.tip}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-black text-white rounded-2xl p-5">
              <h2 className="text-sm font-bold mb-2">Schedule for peak time</h2>
              <p className="text-xs text-white/70 mb-4">Use the compose page to schedule your next post at the optimal time</p>
              <Link href="/compose"
                className="block text-center bg-white text-black text-xs font-bold py-2.5 rounded-xl hover:opacity-80 transition-all">
                Compose Now →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}