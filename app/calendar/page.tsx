'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import Link from 'next/link'

const PLATFORM_ICONS: Record<string, string> = {
  instagram: '📸', twitter: '🐦', linkedin: '💼', tiktok: '🎵',
  facebook: '📘', pinterest: '📌', youtube: '▶️', threads: '🧵',
  bluesky: '🦋', reddit: '🤖', discord: '💬', telegram: '✈️',
  mastodon: '🐘', snapchat: '👻', lemon8: '🍋', bereal: '📷',
}

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
]

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

function formatDateKey(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

export default function Calendar() {
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [today] = useState(new Date())
  const [viewYear, setViewYear] = useState(new Date().getFullYear())
  const [viewMonth, setViewMonth] = useState(new Date().getMonth())
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [selectedPosts, setSelectedPosts] = useState<any[]>([])
  const router = useRouter()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', user.id)
        .not('scheduled_at', 'is', null)
        .order('scheduled_at', { ascending: true })
      setPosts(data || [])
      setLoading(false)
    }
    load()
  }, [])

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
  }

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
  }

  // Group posts by date key
  const postsByDate: Record<string, any[]> = {}
  posts.forEach(post => {
    if (!post.scheduled_at) return
    const d = new Date(post.scheduled_at)
    const key = formatDateKey(d.getFullYear(), d.getMonth(), d.getDate())
    if (!postsByDate[key]) postsByDate[key] = []
    postsByDate[key].push(post)
  })

  const daysInMonth = getDaysInMonth(viewYear, viewMonth)
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth)
  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7

  const handleDayClick = (dateKey: string) => {
    setSelectedDay(dateKey)
    setSelectedPosts(postsByDate[dateKey] || [])
  }

  const todayKey = formatDateKey(today.getFullYear(), today.getMonth(), today.getDate())

  // Stats
  const monthPosts = posts.filter(p => {
    const d = new Date(p.scheduled_at)
    return d.getFullYear() === viewYear && d.getMonth() === viewMonth
  })

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="ml-56 flex-1 p-8">
        <div className="max-w-6xl mx-auto">

          {/* HEADER */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">Content Calendar</h1>
              <p className="text-sm text-gray-400 mt-0.5">
                {monthPosts.length} post{monthPosts.length !== 1 ? 's' : ''} scheduled in {MONTHS[viewMonth]}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/bulk-scheduler"
                className="text-xs font-bold px-4 py-2.5 border border-gray-200 rounded-xl hover:border-gray-400 transition-all">
                📆 Bulk Schedule
              </Link>
              <Link href="/compose"
                className="bg-black text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:opacity-80 transition-all">
                + New Post
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-6">

            {/* CALENDAR */}
            <div className="col-span-3">
              <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">

                {/* MONTH NAV */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                  <button onClick={prevMonth}
                    className="w-8 h-8 flex items-center justify-center rounded-xl border border-gray-200 hover:border-gray-400 transition-all text-sm">
                    ←
                  </button>
                  <h2 className="text-base font-extrabold tracking-tight">
                    {MONTHS[viewMonth]} {viewYear}
                  </h2>
                  <button onClick={nextMonth}
                    className="w-8 h-8 flex items-center justify-center rounded-xl border border-gray-200 hover:border-gray-400 transition-all text-sm">
                    →
                  </button>
                </div>

                {/* DAY HEADERS */}
                <div className="grid grid-cols-7 border-b border-gray-100">
                  {DAYS_OF_WEEK.map(d => (
                    <div key={d} className="py-2 text-center text-xs font-bold text-gray-400 uppercase tracking-wide">
                      {d}
                    </div>
                  ))}
                </div>

                {/* CALENDAR GRID */}
                {loading ? (
                  <div className="p-8 text-center">
                    <div className="text-gray-300 text-sm animate-pulse">Loading calendar...</div>
                  </div>
                ) : (
                  <div className="grid grid-cols-7">
                    {Array.from({ length: totalCells }).map((_, i) => {
                      const dayNum = i - firstDay + 1
                      const isCurrentMonth = dayNum >= 1 && dayNum <= daysInMonth
                      const dateKey = isCurrentMonth
                        ? formatDateKey(viewYear, viewMonth, dayNum)
                        : null
                      const dayPosts = dateKey ? (postsByDate[dateKey] || []) : []
                      const isToday = dateKey === todayKey
                      const isSelected = dateKey === selectedDay
                      const isWeekend = i % 7 === 0 || i % 7 === 6

                      return (
                        <div
                          key={i}
                          onClick={() => dateKey && handleDayClick(dateKey)}
                          className={`min-h-[90px] p-2 border-b border-r border-gray-50 transition-all ${
                            isCurrentMonth
                              ? 'cursor-pointer hover:bg-gray-50'
                              : 'bg-gray-50/50'
                          } ${isSelected ? 'bg-blue-50 border-blue-100' : ''} ${
                            isWeekend && isCurrentMonth ? 'bg-gray-50/30' : ''
                          }`}
                        >
                          {isCurrentMonth && (
                            <>
                              <div className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold mb-1 ${
                                isToday
                                  ? 'bg-black text-white'
                                  : isSelected
                                  ? 'bg-blue-500 text-white'
                                  : 'text-gray-600 hover:bg-gray-100'
                              }`}>
                                {dayNum}
                              </div>
                              <div className="space-y-0.5">
                                {dayPosts.slice(0, 2).map(post => (
                                  <div key={post.id}
                                    className={`text-xs px-1.5 py-0.5 rounded-lg truncate font-semibold ${
                                      post.status === 'scheduled'
                                        ? 'bg-black text-white'
                                        : 'bg-gray-100 text-gray-600'
                                    }`}>
                                    {(post.platforms || []).slice(0, 2).map((p: string) =>
                                      PLATFORM_ICONS[p] || ''
                                    ).join('')}{' '}
                                    {post.content?.slice(0, 15) || 'Post'}
                                  </div>
                                ))}
                                {dayPosts.length > 2 && (
                                  <div className="text-xs text-gray-400 px-1">
                                    +{dayPosts.length - 2} more
                                  </div>
                                )}
                              </div>
                              {dayPosts.length === 0 && (
                                <Link
                                  href={`/compose?date=${dateKey}`}
                                  onClick={e => e.stopPropagation()}
                                  className="hidden group-hover:block text-xs text-gray-300 hover:text-gray-500 transition-all">
                                  + Add
                                </Link>
                              )}
                            </>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT PANEL */}
            <div className="space-y-4">

              {/* SELECTED DAY DETAIL */}
              {selectedDay ? (
                <div className="bg-white border border-gray-100 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                        {new Date(selectedDay + 'T12:00:00').toLocaleDateString('en-US', {
                          weekday: 'long', month: 'long', day: 'numeric'
                        })}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {selectedPosts.length} post{selectedPosts.length !== 1 ? 's' : ''} scheduled
                      </p>
                    </div>
                    <Link href={`/compose?date=${selectedDay}`}
                      className="text-xs font-bold bg-black text-white px-3 py-1.5 rounded-xl hover:opacity-80 transition-all">
                      + Add
                    </Link>
                  </div>
                  {selectedPosts.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-xs text-gray-400 mb-3">Nothing scheduled</p>
                      <Link href={`/compose?date=${selectedDay}`}
                        className="text-xs font-bold text-black underline hover:opacity-70">
                        Schedule a post →
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {selectedPosts.map(post => (
                        <Link key={post.id} href={`/compose?draft=${post.id}`}
                          className="block p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all">
                          <div className="flex items-center gap-1 mb-1">
                            {(post.platforms || []).map((p: string) => (
                              <span key={p} className="text-sm">{PLATFORM_ICONS[p]}</span>
                            ))}
                            <span className="text-xs text-gray-400 ml-auto">
                              {new Date(post.scheduled_at).toLocaleTimeString('en-US', {
                                hour: '2-digit', minute: '2-digit'
                              })}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 line-clamp-2">
                            {post.content || 'No content'}
                          </p>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white border border-gray-100 rounded-2xl p-5 text-center">
                  <div className="text-3xl mb-2">📅</div>
                  <p className="text-xs font-bold text-gray-500 mb-1">Click any day</p>
                  <p className="text-xs text-gray-400">to see or add posts for that date</p>
                </div>
              )}

              {/* MONTH STATS */}
              <div className="bg-white border border-gray-100 rounded-2xl p-5">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-4">
                  {MONTHS[viewMonth]} Stats
                </p>
                <div className="space-y-3">
                  {[
                    { label: 'Total scheduled', value: monthPosts.length },
                    {
                      label: 'Days with content',
                      value: new Set(
                        monthPosts.map(p => new Date(p.scheduled_at).toDateString())
                      ).size
                    },
                    {
                      label: 'Platforms covered',
                      value: new Set(monthPosts.flatMap(p => p.platforms || [])).size
                    },
                  ].map(stat => (
                    <div key={stat.label} className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">{stat.label}</span>
                      <span className="text-sm font-extrabold">{stat.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* UPCOMING */}
              <div className="bg-white border border-gray-100 rounded-2xl p-5">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">
                  Upcoming
                </p>
                {posts.filter(p => new Date(p.scheduled_at) >= today).slice(0, 4).length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-2">
                    No upcoming posts
                  </p>
                ) : (
                  <div className="space-y-2">
                    {posts
                      .filter(p => new Date(p.scheduled_at) >= today)
                      .slice(0, 4)
                      .map(post => (
                        <Link key={post.id} href={`/compose?draft=${post.id}`}
                          className="block p-2 hover:bg-gray-50 rounded-xl transition-all">
                          <div className="flex items-center gap-2">
                            <span className="text-sm">
                              {PLATFORM_ICONS[(post.platforms || [])[0]] || '📱'}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold truncate">
                                {post.content?.slice(0, 30) || 'No content'}
                              </p>
                              <p className="text-xs text-gray-400">
                                {new Date(post.scheduled_at).toLocaleDateString('en-US', {
                                  month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                })}
                              </p>
                            </div>
                          </div>
                        </Link>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}