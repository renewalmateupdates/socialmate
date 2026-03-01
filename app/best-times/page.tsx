'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

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

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const GENERAL_BEST_TIMES: Record<string, { days: string[], hours: string[], tip: string }> = {
  instagram: { days: ['Tuesday', 'Wednesday', 'Thursday'], hours: ['8am–10am', '11am–1pm', '7pm–9pm'], tip: 'Engagement peaks mid-week during lunch and evenings' },
  twitter: { days: ['Monday', 'Wednesday', 'Thursday'], hours: ['8am–10am', '12pm–1pm', '5pm–6pm'], tip: 'Tweet during commute hours and lunch breaks' },
  linkedin: { days: ['Tuesday', 'Wednesday', 'Thursday'], hours: ['7am–9am', '12pm–1pm', '5pm–6pm'], tip: 'Professionals engage before work and during lunch' },
  tiktok: { days: ['Tuesday', 'Thursday', 'Friday'], hours: ['6am–10am', '7pm–9pm', '10pm–11pm'], tip: 'TikTok audiences are most active early morning and late evening' },
  facebook: { days: ['Wednesday', 'Thursday', 'Friday'], hours: ['9am–12pm', '1pm–3pm'], tip: 'Facebook users engage most mid-morning and early afternoon' },
  pinterest: { days: ['Saturday', 'Sunday'], hours: ['8pm–11pm', '2pm–4pm'], tip: 'Pinterest is a weekend platform — plan accordingly' },
  youtube: { days: ['Thursday', 'Friday', 'Saturday'], hours: ['12pm–4pm', '8pm–11pm'], tip: 'Upload Thursday/Friday to catch weekend viewing' },
  threads: { days: ['Monday', 'Wednesday', 'Friday'], hours: ['9am–11am', '7pm–9pm'], tip: 'Similar patterns to Instagram — morning and evening' },
  bluesky: { days: ['Tuesday', 'Wednesday', 'Thursday'], hours: ['9am–11am', '12pm–2pm'], tip: 'Tech-forward audience engages during work hours' },
  reddit: { days: ['Monday', 'Sunday'], hours: ['6am–8am', '7pm–10pm'], tip: 'Reddit is busy early morning and late night' },
}

function formatHour(h: number) {
  if (h === 0) return '12am'
  if (h === 12) return '12pm'
  return h < 12 ? `${h}am` : `${h - 12}pm`
}

export default function BestTimes() {
  const [user, setUser] = useState<any>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all')
  const router = useRouter()

  const AI_CREDITS_LEFT = 15
  const AI_CREDITS_TOTAL = 15
  const ACCOUNTS_USED = 0
  const ACCOUNTS_TOTAL = 16

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

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const filteredPosts = selectedPlatform === 'all'
    ? posts
    : posts.filter(p => p.platforms?.includes(selectedPlatform))

  const usedPlatforms = Array.from(new Set(posts.flatMap(p => p.platforms || [])))

  // Hour heatmap from real data
  const hourCounts = Array.from({ length: 24 }, (_, h) => {
    const count = filteredPosts.filter(p => {
      const d = new Date(p.scheduled_at || p.created_at)
      return d.getHours() === h
    }).length
    return { hour: h, count, label: formatHour(h) }
  })
  const maxHour = Math.max(...hourCounts.map(h => h.count), 1)
  const peakHours = [...hourCounts].sort((a, b) => b.count - a.count).slice(0, 3).filter(h => h.count > 0)

  // Day heatmap from real data
  const dayCounts = Array.from({ length: 7 }, (_, d) => {
    const count = filteredPosts.filter(p => {
      const date = new Date(p.scheduled_at || p.created_at)
      return date.getDay() === d
    }).length
    return { day: DAYS[d], short: DAYS_SHORT[d], count }
  })
  const maxDay = Math.max(...dayCounts.map(d => d.count), 1)
  const peakDay = [...dayCounts].sort((a, b) => b.count - a.count)[0]

  // 24x7 heatmap grid
  const heatmap = Array.from({ length: 7 }, (_, day) =>
    Array.from({ length: 24 }, (_, hour) => {
      const count = filteredPosts.filter(p => {
        const d = new Date(p.scheduled_at || p.created_at)
        return d.getDay() === day && d.getHours() === hour
      }).length
      return count
    })
  )
  const maxHeatmap = Math.max(...heatmap.flat(), 1)

  const hasData = filteredPosts.length >= 5

  const generalRec = selectedPlatform !== 'all' ? GENERAL_BEST_TIMES[selectedPlatform] : null

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* SIDEBAR */}
      <div className="w-56 bg-white border-r border-gray-100 flex flex-col fixed h-full">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-black rounded-lg flex items-center justify-center text-white text-sm font-bold">S</div>
            <span className="font-bold text-base tracking-tight">SocialMate</span>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-3 py-2">Content</div>
          {[
            { icon: "🏠", label: "Dashboard", href: "/dashboard" },
            { icon: "📅", label: "Calendar", href: "/calendar" },
            { icon: "✏️", label: "Compose", href: "/compose" },
            { icon: "📂", label: "Drafts", href: "/drafts" },
            { icon: "⏳", label: "Queue", href: "/queue" },
            { icon: "#️⃣", label: "Hashtags", href: "/hashtags" },
            { icon: "🖼️", label: "Media Library", href: "/media" },
            { icon: "📝", label: "Templates", href: "/templates" },
            { icon: "🔗", label: "Link in Bio", href: "/link-in-bio" },
            { icon: "📆", label: "Bulk Scheduler", href: "/bulk-scheduler" },
          ].map(item => (
            <Link key={item.label} href={item.href} className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-black transition-all">
              <span>{item.icon}</span>{item.label}
            </Link>
          ))}
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-3 py-2 mt-3">Insights</div>
          {[
            { icon: "📊", label: "Analytics", href: "/analytics" },
            { icon: "🔍", label: "Best Times", href: "/best-times", active: true },
          ].map(item => (
            <Link key={item.label} href={item.href} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${'active' in item && item.active ? 'bg-gray-100 text-black' : 'text-gray-500 hover:bg-gray-50 hover:text-black'}`}>
              <span>{item.icon}</span>{item.label}
            </Link>
          ))}
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-3 py-2 mt-3">Settings</div>
          {[
            { icon: "🔗", label: "Accounts", href: "/accounts" },
            { icon: "👥", label: "Team", href: "/team" },
            { icon: "⚙️", label: "Settings", href: "/settings" },
            { icon: "🎁", label: "Referrals", href: "/referral" },
            { icon: "🔔", label: "Notifications", href: "/notifications" },
            { icon: "🔎", label: "Search", href: "/search" },
          ].map(item => (
            <Link key={item.label} href={item.href} className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-black transition-all">
              <span>{item.icon}</span>{item.label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-100 space-y-3">
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-gray-500">AI Credits</span>
              <span className="text-xs font-bold text-gray-700">{AI_CREDITS_LEFT}/{AI_CREDITS_TOTAL}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div className="bg-black h-1.5 rounded-full" style={{ width: `${(AI_CREDITS_LEFT / AI_CREDITS_TOTAL) * 100}%` }} />
            </div>
            <p className="text-xs text-gray-400 mt-1.5">{AI_CREDITS_LEFT} credits remaining</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-gray-500">Accounts</span>
              <span className="text-xs font-bold text-gray-700">{ACCOUNTS_USED}/{ACCOUNTS_TOTAL}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div className="bg-black h-1.5 rounded-full" style={{ width: `${(ACCOUNTS_USED / ACCOUNTS_TOTAL) * 100}%` }} />
            </div>
            <p className="text-xs text-gray-400 mt-1.5">{ACCOUNTS_TOTAL - ACCOUNTS_USED} slots remaining</p>
          </div>
          <Link href="/pricing" className="w-full block text-center bg-black text-white text-xs font-semibold px-4 py-2 rounded-xl hover:opacity-80 transition-all">
            ⚡ Upgrade to Pro
          </Link>
          <div className="px-1">
            <div className="text-xs text-gray-400 truncate mb-1">{user?.email}</div>
            <button onClick={handleSignOut} className="w-full text-left px-0 py-1 text-xs text-gray-400 hover:text-black transition-all">Sign out</button>
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div className="ml-56 flex-1 p-8">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">Best Times to Post</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {hasData ? 'Based on your actual posting history' : 'Industry recommendations + your data as you post more'}
            </p>
          </div>
          <Link href="/compose" className="bg-black text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:opacity-80 transition-all">
            ✏️ Schedule a Post
          </Link>
        </div>

        {/* PLATFORM FILTER */}
        <div className="flex items-center gap-2 flex-wrap mb-6">
          <button
            onClick={() => setSelectedPlatform('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${selectedPlatform === 'all' ? 'bg-black text-white border-black' : 'border-gray-200 text-gray-500 hover:border-gray-400'}`}
          >
            All Platforms
          </button>
          {Object.keys(GENERAL_BEST_TIMES).map(p => (
            <button
              key={p}
              onClick={() => setSelectedPlatform(p)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${selectedPlatform === p ? 'bg-black text-white border-black' : 'border-gray-200 text-gray-500 hover:border-gray-400'}`}
            >
              <span>{PLATFORM_ICONS[p]}</span>
              <span className="capitalize hidden sm:inline">{p}</span>
            </button>
          ))}
        </div>

        {/* DATA STATUS BANNER */}
        {!loading && !hasData && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex items-center gap-3">
            <span className="text-xl">💡</span>
            <div className="flex-1">
              <p className="text-sm font-bold text-amber-800">Showing industry recommendations</p>
              <p className="text-xs text-amber-600 mt-0.5">Schedule at least 5 posts to unlock personalized best time recommendations based on your data.</p>
            </div>
            <Link href="/compose" className="text-xs font-semibold px-3 py-1.5 bg-amber-500 text-white rounded-xl hover:opacity-80 transition-all flex-shrink-0">
              Start Posting →
            </Link>
          </div>
        )}

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-6">

            {/* FULL HEATMAP */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5">
              <h2 className="text-sm font-bold tracking-tight mb-1">Weekly Heatmap</h2>
              <p className="text-xs text-gray-400 mb-4">{hasData ? 'Your actual posting frequency by day and hour' : 'Recommended posting windows'}</p>

              {loading ? <SkeletonBox className="h-40" /> : (
                <div className="overflow-x-auto">
                  <div className="min-w-[600px]">
                    {/* Hour labels */}
                    <div className="flex mb-1 ml-10">
                      {[0, 3, 6, 9, 12, 15, 18, 21].map(h => (
                        <div key={h} className="flex-1 text-xs text-gray-400 text-center">{formatHour(h)}</div>
                      ))}
                    </div>

                    {/* Grid */}
                    {hasData ? (
                      heatmap.map((dayRow, dayIdx) => (
                        <div key={dayIdx} className="flex items-center gap-1 mb-1">
                          <div className="w-8 text-xs text-gray-400 text-right pr-1 flex-shrink-0">{DAYS_SHORT[dayIdx]}</div>
                          <div className="flex gap-0.5 flex-1">
                            {dayRow.map((count, hourIdx) => {
                              const pct = count / maxHeatmap
                              const bg = pct === 0 ? 'bg-gray-100' : pct < 0.25 ? 'bg-gray-300' : pct < 0.5 ? 'bg-gray-500' : pct < 0.75 ? 'bg-gray-700' : 'bg-black'
                              return (
                                <div
                                  key={hourIdx}
                                  className={`h-6 rounded flex-1 ${bg} transition-all group relative`}
                                  title={`${DAYS[dayIdx]} ${formatHour(hourIdx)}: ${count} posts`}
                                />
                              )
                            })}
                          </div>
                        </div>
                      ))
                    ) : (
                      // General recommendations heatmap
                      Array.from({ length: 7 }, (_, dayIdx) => {
                        const rec = generalRec || null
                        return (
                          <div key={dayIdx} className="flex items-center gap-1 mb-1">
                            <div className="w-8 text-xs text-gray-400 text-right pr-1 flex-shrink-0">{DAYS_SHORT[dayIdx]}</div>
                            <div className="flex gap-0.5 flex-1">
                              {Array.from({ length: 24 }, (_, h) => {
                                const isGoodHour = [8,9,10,11,12,17,18,19,20].includes(h)
                                const isGoodDay = [1,2,3,4].includes(dayIdx)
                                const intensity = isGoodDay && isGoodHour ? 'bg-black' : isGoodHour || isGoodDay ? 'bg-gray-300' : 'bg-gray-100'
                                return <div key={h} className={`h-6 rounded flex-1 ${intensity}`} />
                              })}
                            </div>
                          </div>
                        )
                      })
                    )}

                    {/* Legend */}
                    <div className="flex items-center gap-2 mt-3 justify-end">
                      <span className="text-xs text-gray-400">Less</span>
                      {['bg-gray-100', 'bg-gray-300', 'bg-gray-500', 'bg-gray-700', 'bg-black'].map((c, i) => (
                        <div key={i} className={`w-4 h-4 rounded ${c}`} />
                      ))}
                      <span className="text-xs text-gray-400">More</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* BEST DAYS BAR CHART */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5">
              <h2 className="text-sm font-bold tracking-tight mb-1">Best Days</h2>
              <p className="text-xs text-gray-400 mb-4">{hasData ? 'Days you post most frequently' : 'Recommended days based on industry data'}</p>
              {loading ? <SkeletonBox className="h-24" /> : (
                <div className="flex items-end gap-2 h-24">
                  {(hasData ? dayCounts : DAYS.map((d, i) => ({
                    day: d, short: DAYS_SHORT[i],
                    count: [1,2,3,4].includes(i) ? 3 : [0,6].includes(i) ? 1 : 2
                  }))).map((day, i) => {
                    const max = hasData ? maxDay : 3
                    const pct = (day.count / max) * 100
                    const isTop = hasData ? day.day === peakDay?.day : [1,2,3].includes(i)
                    return (
                      <div key={day.day} className="flex-1 flex flex-col items-center gap-1">
                        <div className="w-full flex items-end justify-center" style={{ height: '72px' }}>
                          <div
                            className={`w-full rounded-t-lg transition-all ${isTop ? 'bg-black' : 'bg-gray-200'}`}
                            style={{ height: `${Math.max(pct, 8)}%` }}
                          />
                        </div>
                        <span className={`text-xs font-semibold ${isTop ? 'text-black' : 'text-gray-400'}`}>{day.short}</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* BEST HOURS */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5">
              <h2 className="text-sm font-bold tracking-tight mb-1">Best Hours</h2>
              <p className="text-xs text-gray-400 mb-4">{hasData ? 'Hours with the most scheduled posts' : 'Peak engagement windows by industry data'}</p>
              {loading ? <SkeletonBox className="h-24" /> : (
                <div className="space-y-2">
                  {(hasData ? peakHours : [
                    { label: '8am – 10am', count: 3 },
                    { label: '12pm – 1pm', count: 2 },
                    { label: '7pm – 9pm', count: 2 },
                  ].map((h, i) => ({ hour: i, count: h.count, label: h.label }))).map((h, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-xs font-bold w-6 text-gray-400">#{i + 1}</span>
                      <span className="text-sm font-semibold w-20">{h.label}</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-2">
                        <div
                          className="bg-black h-2 rounded-full transition-all"
                          style={{ width: `${(h.count / (hasData ? peakHours[0]?.count || 1 : 3)) * 100}%` }}
                        />
                      </div>
                      {hasData && <span className="text-xs text-gray-400 w-12 text-right">{h.count} posts</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COL */}
          <div className="space-y-6">

            {/* QUICK STATS */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5">
              <h2 className="text-sm font-bold tracking-tight mb-4">Your Stats</h2>
              {loading ? <SkeletonBox className="h-32" /> : (
                <div className="space-y-4">
                  {[
                    { label: 'Total Posts', value: posts.length, icon: '📝' },
                    { label: 'Platforms Used', value: usedPlatforms.length, icon: '📱' },
                    { label: 'Best Day', value: hasData ? peakDay?.day?.slice(0, 3) || '—' : 'Wed', icon: '📅' },
                    { label: 'Best Hour', value: hasData && peakHours[0] ? peakHours[0].label : '9am', icon: '⏰' },
                  ].map(stat => (
                    <div key={stat.label} className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-50 rounded-xl flex items-center justify-center text-sm flex-shrink-0">{stat.icon}</div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-400">{stat.label}</p>
                        <p className="text-sm font-bold">{stat.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* PLATFORM RECOMMENDATIONS */}
            {generalRec && selectedPlatform !== 'all' && (
              <div className="bg-white border border-gray-100 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">{PLATFORM_ICONS[selectedPlatform]}</span>
                  <h2 className="text-sm font-bold tracking-tight capitalize">{selectedPlatform} Tips</h2>
                </div>
                <p className="text-xs text-gray-500 mb-4 leading-relaxed">{generalRec.tip}</p>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Best Days</p>
                    <div className="flex flex-wrap gap-1">
                      {generalRec.days.map(d => (
                        <span key={d} className="text-xs font-semibold bg-black text-white px-2 py-0.5 rounded-full">{d.slice(0, 3)}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Best Hours</p>
                    <div className="flex flex-wrap gap-1">
                      {generalRec.hours.map(h => (
                        <span key={h} className="text-xs font-semibold bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">{h}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ALL PLATFORM RECS */}
            {selectedPlatform === 'all' && (
              <div className="bg-white border border-gray-100 rounded-2xl p-5">
                <h2 className="text-sm font-bold tracking-tight mb-4">Platform Tips</h2>
                <div className="space-y-3">
                  {Object.entries(GENERAL_BEST_TIMES).slice(0, 6).map(([platform, rec]) => (
                    <button
                      key={platform}
                      onClick={() => setSelectedPlatform(platform)}
                      className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-all text-left group"
                    >
                      <span className="text-base">{PLATFORM_ICONS[platform]}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold capitalize">{platform}</p>
                        <p className="text-xs text-gray-400 truncate">{rec.days.slice(0, 2).join(', ')}</p>
                      </div>
                      <span className="text-gray-300 group-hover:text-black transition-colors text-sm">→</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* CTA */}
            <div className="bg-black text-white rounded-2xl p-5">
              <p className="text-sm font-bold mb-1">🔍 Unlock deeper insights</p>
              <p className="text-xs text-white/60 mb-4">Schedule more posts to get personalized best-time recommendations based on your own audience data.</p>
              <Link href="/bulk-scheduler" className="block w-full py-2.5 bg-white text-black text-xs font-bold rounded-xl hover:opacity-80 transition-all text-center">
                Bulk Schedule Posts →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}