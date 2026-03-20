'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import Link from 'next/link'

const DAYS  = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const HOURS = Array.from({ length: 24 }, (_, i) => {
  const h = i % 12 || 12
  const ampm = i < 12 ? 'am' : 'pm'
  return `${h}${ampm}`
})

const PLATFORM_AVERAGES = [
  // Live now
  { platform: 'Discord',   icon: '💬', status: 'live', best: 'Weekdays 4pm–9pm, weekends all day',       peak: 'Saturday 7pm'   },
  { platform: 'Bluesky',   icon: '🦋', status: 'live', best: 'Mon–Fri, 8am–10am',                        peak: 'Tuesday 9am'    },
  { platform: 'Telegram',  icon: '✈️', status: 'live', best: 'Mon–Fri, 8am–10am & 6pm–8pm',              peak: 'Wednesday 8am'  },
  { platform: 'Mastodon',  icon: '🐘', status: 'live', best: 'Mon–Fri, 9am–11am (local timezone)',        peak: 'Tuesday 10am'   },
  // Coming soon
  { platform: 'LinkedIn',  icon: '💼', status: 'soon', best: 'Tue–Thu, 8am–10am & 12pm–1pm',             peak: 'Tuesday 9am'    },
  { platform: 'YouTube',   icon: '▶️', status: 'soon', best: 'Thu–Sat, 12pm–4pm',                        peak: 'Saturday 3pm'   },
  { platform: 'Pinterest', icon: '📌', status: 'soon', best: 'Sat & Sun, 8pm–11pm',                      peak: 'Saturday 9pm'   },
  { platform: 'Reddit',    icon: '🤖', status: 'soon', best: 'Mon–Fri, 6am–8am & 12pm–1pm (EST)',        peak: 'Monday 8am'     },
  // Planned
  { platform: 'Instagram', icon: '📸', status: 'planned', best: 'Tue–Fri, 9am–11am & 2pm–5pm',          peak: 'Wednesday 11am' },
  { platform: 'TikTok',    icon: '🎵', status: 'planned', best: 'Tue, Thu, Fri 7am–9am & 7pm–9pm',      peak: 'Friday 7pm'     },
  { platform: 'X/Twitter', icon: '🐦', status: 'planned', best: 'Mon–Fri, 8am–10am & 12pm–1pm',         peak: 'Wednesday 9am'  },
  { platform: 'Facebook',  icon: '📘', status: 'planned', best: 'Wed–Fri, 9am–1pm',                      peak: 'Wednesday 11am' },
]

const LIVE_PLATFORMS    = PLATFORM_AVERAGES.filter(p => p.status === 'live')
const SOON_PLATFORMS    = PLATFORM_AVERAGES.filter(p => p.status === 'soon')
const PLANNED_PLATFORMS = PLATFORM_AVERAGES.filter(p => p.status === 'planned')

export default function BestTimes() {
  const [loading, setLoading] = useState(true)
  const [heatmap, setHeatmap] = useState<Record<string, number>>({})
  const [postCount, setPostCount] = useState(0)
  const router = useRouter()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data } = await supabase
        .from('posts')
        .select('scheduled_at, created_at')
        .eq('user_id', user.id)
        .not('scheduled_at', 'is', null)

      const map: Record<string, number> = {}
      ;(data || []).forEach(post => {
        const raw = post.scheduled_at ?? post.created_at
        if (!raw) return
        const d = new Date(raw)
        const key = `${d.getDay()}-${d.getHours()}`
        map[key] = (map[key] || 0) + 1
      })
      setHeatmap(map)
      setPostCount((data || []).length)
      setLoading(false)
    }
    load()
  }, [router])

  const maxVal = Math.max(...Object.values(heatmap), 1)

  const getCellColor = (day: number, hour: number) => {
    const val = heatmap[`${day}-${hour}`] || 0
    if (val === 0) return 'bg-gray-100'
    const intensity = val / maxVal
    if (intensity < 0.25) return 'bg-black/20'
    if (intensity < 0.5)  return 'bg-black/40'
    if (intensity < 0.75) return 'bg-black/70'
    return 'bg-black'
  }

  const PlatformCard = ({ p }: { p: typeof PLATFORM_AVERAGES[0] }) => (
    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all">
      <span className="text-2xl flex-shrink-0">{p.icon}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-sm font-extrabold">{p.platform}</p>
          {p.status === 'soon' && (
            <span className="text-xs font-bold px-1.5 py-0.5 bg-blue-50 text-blue-500 rounded-full">Soon</span>
          )}
          {p.status === 'planned' && (
            <span className="text-xs font-bold px-1.5 py-0.5 bg-gray-100 text-gray-400 rounded-full">Planned</span>
          )}
        </div>
        <p className="text-xs text-gray-500 leading-relaxed">{p.best}</p>
        <div className="flex items-center gap-1 mt-1.5">
          <span className="text-xs font-bold text-black">🏆 Peak:</span>
          <span className="text-xs font-semibold text-gray-600">{p.peak}</span>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-theme flex">
      <Sidebar />
      <div className="md:ml-56 flex-1 p-4 md:p-8">
        <div className="max-w-5xl mx-auto">

          {/* HEADER */}
          <div className="mb-8">
            <h1 className="text-2xl font-extrabold tracking-tight">Best Times to Post</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Your personal posting heatmap + industry averages for every platform
            </p>
          </div>

          {/* PERSONAL HEATMAP */}
          <div className="bg-surface border border-theme rounded-2xl p-5 md:p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-sm font-extrabold">Your Posting Heatmap</h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  {postCount > 0
                    ? `Based on ${postCount} scheduled post${postCount !== 1 ? 's' : ''}`
                    : 'Schedule more posts to see your personal pattern'}
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400 flex-shrink-0">
                <span>Less</span>
                {['bg-gray-100', 'bg-black/20', 'bg-black/40', 'bg-black/70', 'bg-black'].map((c, i) => (
                  <div key={i} className={`w-3 h-3 rounded-sm ${c}`} />
                ))}
                <span>More</span>
              </div>
            </div>

            {loading ? (
              <div className="bg-gray-100 rounded-xl h-48 animate-pulse" />
            ) : postCount < 5 ? (
              <div className="bg-gray-50 rounded-2xl p-8 text-center">
                <p className="text-sm font-bold text-gray-400 mb-2">Not enough data yet</p>
                <p className="text-xs text-gray-400 mb-4">
                  Schedule at least 5 posts to see your personal heatmap. Use the industry averages below for now.
                </p>
                <Link href="/compose"
                  className="inline-block text-xs font-bold px-4 py-2 bg-black text-white rounded-xl hover:opacity-80 transition-all">
                  Schedule a post →
                </Link>
              </div>
            ) : (
              // Heatmap — full scroll container so labels and grid move together
              <div className="overflow-x-auto">
                <div className="min-w-[600px]">
                  {/* Hour labels */}
                  <div className="flex mb-1 ml-10">
                    {HOURS.map((h, i) => (
                      <div key={i} className="flex-1 text-center">
                        {i % 3 === 0 && <span className="text-xs text-gray-400">{h}</span>}
                      </div>
                    ))}
                  </div>
                  {/* Day rows */}
                  {DAYS.map((day, dayIdx) => (
                    <div key={day} className="flex items-center mb-1">
                      <span className="text-xs text-gray-400 w-10 flex-shrink-0">{day}</span>
                      {HOURS.map((_, hourIdx) => (
                        <div key={hourIdx}
                          className={`flex-1 h-6 rounded-sm mr-0.5 transition-all ${getCellColor(dayIdx, hourIdx)}`}
                          title={`${day} ${HOURS[hourIdx]}: ${heatmap[`${dayIdx}-${hourIdx}`] || 0} posts`}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* INDUSTRY AVERAGES */}
          <div className="bg-surface border border-theme rounded-2xl p-5 md:p-6">
            <div className="mb-5">
              <h2 className="text-sm font-extrabold">Industry Averages</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                General best practices — your audience may differ. Use your heatmap when you have enough data.
              </p>
            </div>

            <div className="mb-5">
              <div className="flex items-center gap-2 mb-3">
                <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">Live now</p>
                <span className="text-xs font-semibold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">4 platforms</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {LIVE_PLATFORMS.map(p => <PlatformCard key={p.platform} p={p} />)}
              </div>
            </div>

            <div className="mb-5">
              <div className="flex items-center gap-2 mb-3">
                <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">Coming very soon</p>
                <span className="text-xs font-semibold bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">Awaiting approval</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SOON_PLATFORMS.map(p => <PlatformCard key={p.platform} p={p} />)}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">Planned</p>
                <span className="text-xs font-semibold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">On the roadmap</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PLANNED_PLATFORMS.map(p => <PlatformCard key={p.platform} p={p} />)}
              </div>
            </div>
          </div>

          {/* TIPS */}
          <div className="mt-6 bg-black rounded-2xl p-5 text-white">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Pro tips</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { icon: '🧪', tip: 'Test different times for 2–4 weeks before drawing conclusions.' },
                { icon: '🌍', tip: "Adjust for your audience's timezone — not yours." },
                { icon: '📊', tip: 'Check your Analytics page to see which posts actually performed best.' },
              ].map(item => (
                <div key={item.tip} className="flex items-start gap-2">
                  <span className="flex-shrink-0">{item.icon}</span>
                  <p className="text-xs text-gray-400 leading-relaxed">{item.tip}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}