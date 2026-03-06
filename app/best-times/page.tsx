'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const HOURS = Array.from({ length: 24 }, (_, i) => {
  const h = i % 12 || 12
  const ampm = i < 12 ? 'am' : 'pm'
  return `${h}${ampm}`
})

const PLATFORM_AVERAGES = [
  { platform: 'Instagram', icon: '📸', best: 'Tue–Fri, 9am–11am & 2pm–5pm',   peak: 'Wednesday 11am' },
  { platform: 'LinkedIn',  icon: '💼', best: 'Tue–Thu, 8am–10am & 12pm–1pm',  peak: 'Tuesday 9am'    },
  { platform: 'TikTok',    icon: '🎵', best: 'Tue, Thu, Fri 7am–9am & 7pm–9pm', peak: 'Friday 7pm'   },
  { platform: 'Twitter',   icon: '🐦', best: 'Mon–Fri, 8am–10am & 12pm–1pm',  peak: 'Wednesday 9am'  },
  { platform: 'Facebook',  icon: '📘', best: 'Wed–Fri, 9am–1pm',              peak: 'Wednesday 11am' },
  { platform: 'Pinterest', icon: '📌', best: 'Sat & Sun, 8pm–11pm',           peak: 'Saturday 9pm'   },
  { platform: 'YouTube',   icon: '▶️', best: 'Thu–Sat, 12pm–4pm',             peak: 'Saturday 3pm'   },
  { platform: 'Bluesky',   icon: '🦋', best: 'Mon–Fri, 8am–10am',             peak: 'Tuesday 9am'    },
]

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
        .select('scheduled_at, published_at')
        .eq('user_id', user.id)
        .not('scheduled_at', 'is', null)
      const map: Record<string, number> = {}
      ;(data || []).forEach(post => {
        const d = new Date(post.scheduled_at || post.published_at)
        const key = `${d.getDay()}-${d.getHours()}`
        map[key] = (map[key] || 0) + 1
      })
      setHeatmap(map)
      setPostCount((data || []).length)
      setLoading(false)
    }
    load()
  }, [])

  const maxVal = Math.max(...Object.values(heatmap), 1)

  const getCellColor = (day: number, hour: number) => {
    const val = heatmap[`${day}-${hour}`] || 0
    if (val === 0) return 'bg-gray-50'
    const intensity = val / maxVal
    if (intensity < 0.25) return 'bg-black/20'
    if (intensity < 0.5)  return 'bg-black/40'
    if (intensity < 0.75) return 'bg-black/60'
    return 'bg-black/90'
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="ml-56 flex-1 p-8">
        <div className="max-w-5xl mx-auto">

          <div className="mb-8">
            <h1 className="text-2xl font-extrabold tracking-tight">Best Times to Post</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Your personal posting heatmap + industry averages for every platform
            </p>
          </div>

          {/* PERSONAL HEATMAP */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-extrabold">Your Posting Heatmap</h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  {postCount > 0
                    ? `Based on ${postCount} scheduled post${postCount !== 1 ? 's' : ''}`
                    : 'Schedule more posts to see your personal pattern'}
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span>Less</span>
                {['bg-gray-100', 'bg-black/20', 'bg-black/40', 'bg-black/70', 'bg-black'].map(c => (
                  <div key={c} className={`w-3 h-3 rounded-sm ${c}`} />
                ))}
                <span>More</span>
              </div>
            </div>

            {loading ? (
              <div className="bg-gray-100 rounded-xl h-48 animate-pulse" />
            ) : postCount < 5 ? (
              <div className="bg-gray-50 rounded-2xl p-8 text-center">
                <p className="text-sm font-bold text-gray-400 mb-2">Not enough data yet</p>
                <p className="text-xs text-gray-400">
                  Schedule at least 5 posts to see your personal heatmap.
                  Until then, use the industry averages below.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <div className="min-w-[600px]">
                  {/* HOUR LABELS */}
                  <div className="flex mb-1 ml-10">
                    {HOURS.map((h, i) => (
                      <div key={i} className="flex-1 text-center">
                        {i % 3 === 0 && (
                          <span className="text-xs text-gray-400">{h}</span>
                        )}
                      </div>
                    ))}
                  </div>
                  {/* GRID */}
                  {DAYS.map((day, dayIdx) => (
                    <div key={day} className="flex items-center mb-1">
                      <span className="text-xs text-gray-400 w-10 flex-shrink-0">{day}</span>
                      {HOURS.map((_, hourIdx) => (
                        <div key={hourIdx}
                          className={`flex-1 h-6 rounded-sm mr-0.5 transition-all cursor-default ${getCellColor(dayIdx, hourIdx)}`}
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
          <div className="bg-white border border-gray-100 rounded-2xl p-6">
            <div className="mb-5">
              <h2 className="text-sm font-extrabold">Industry Averages</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                General best practices — your audience may differ. Use your heatmap when you have data.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PLATFORM_AVERAGES.map(p => (
                <div key={p.platform}
                  className="flex items-start gap-3 p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all">
                  <span className="text-2xl flex-shrink-0">{p.icon}</span>
                  <div>
                    <p className="text-sm font-extrabold mb-1">{p.platform}</p>
                    <p className="text-xs text-gray-500 leading-relaxed">{p.best}</p>
                    <div className="flex items-center gap-1 mt-1.5">
                      <span className="text-xs font-bold text-black">🏆 Peak:</span>
                      <span className="text-xs font-semibold text-gray-600">{p.peak}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* TIPS */}
          <div className="mt-6 bg-black rounded-2xl p-5 text-white">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Pro tips</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { icon: '🧪', tip: 'Test different times for 2–4 weeks before drawing conclusions.' },
                { icon: '🌍', tip: 'Adjust for your audience\'s timezone — not yours.' },
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