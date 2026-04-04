'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import Link from 'next/link'
import { useWorkspace, PLAN_CONFIG } from '@/contexts/WorkspaceContext'

const PLATFORM_ICONS: Record<string, string> = {
  instagram: '📸', twitter: '🐦', linkedin: '💼', tiktok: '🎵',
  facebook: '📘', pinterest: '📌', youtube: '▶️', threads: '🧵',
  bluesky: '🦋', reddit: '🤖', discord: '💬', telegram: '✈️',
  mastodon: '🐘', snapchat: '👻', lemon8: '🍋', bereal: '📷',
}

const DAYS_OF_WEEK    = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const DAYS_OF_WEEK_XS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
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
  const [posts, setPosts]             = useState<any[]>([])
  const [loading, setLoading]         = useState(true)
  const [today]                       = useState(new Date())
  const [viewYear, setViewYear]       = useState(new Date().getFullYear())
  const [viewMonth, setViewMonth]     = useState(new Date().getMonth())
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [selectedPosts, setSelectedPosts] = useState<any[]>([])
  const router = useRouter()
  const { plan, activeWorkspace } = useWorkspace()

  const planConfig       = PLAN_CONFIG[plan as keyof typeof PLAN_CONFIG]
  const forwardLimitDays = (planConfig?.scheduleWeeks || 2) * 7
  const forwardLimitLabel =
    plan === 'free'   ? '2 weeks' :
    plan === 'pro'    ? '1 month' :
    '3 months'

  const limitDate = new Date()
  limitDate.setDate(limitDate.getDate() + forwardLimitDays)
  limitDate.setHours(23, 59, 59, 999)

  const firstOfNextMonth = new Date(viewYear, viewMonth + 1, 1)
  const canGoForward = firstOfNextMonth <= limitDate

  // Reload posts when active workspace changes
  useEffect(() => {
    if (!activeWorkspace) return
    setLoading(true)

    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      let calQuery = supabase
        .from('posts')
        .select('*')
        .eq('user_id', user.id)
        .not('scheduled_at', 'is', null)
        .order('scheduled_at', { ascending: true })

      // Only filter by workspace for client workspaces; personal shows all
      if (!activeWorkspace.is_personal) {
        calQuery = calQuery.eq('workspace_id', activeWorkspace.id)
      }

      const { data } = await calQuery

      setPosts(data || [])
      setLoading(false)
    }
    load()
  }, [router, activeWorkspace?.id])

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
  }

  const nextMonth = () => {
    if (!canGoForward) return
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
  }

  const postsByDate: Record<string, any[]> = {}
  posts.forEach(post => {
    if (!post.scheduled_at) return
    const d = new Date(post.scheduled_at)
    const key = formatDateKey(d.getFullYear(), d.getMonth(), d.getDate())
    if (!postsByDate[key]) postsByDate[key] = []
    postsByDate[key].push(post)
  })

  const daysInMonth = getDaysInMonth(viewYear, viewMonth)
  const firstDay    = getFirstDayOfMonth(viewYear, viewMonth)
  const totalCells  = Math.ceil((firstDay + daysInMonth) / 7) * 7

  const handleDayClick = (dateKey: string) => {
    const clicked = new Date(dateKey + 'T12:00:00')
    if (clicked > limitDate) return
    setSelectedDay(dateKey)
    setSelectedPosts(postsByDate[dateKey] || [])
  }

  const todayKey  = formatDateKey(today.getFullYear(), today.getMonth(), today.getDate())
  const monthPosts = posts.filter(p => {
    const d = new Date(p.scheduled_at)
    return d.getFullYear() === viewYear && d.getMonth() === viewMonth
  })

  return (
    <div className="min-h-dvh bg-theme flex">
      <Sidebar />
      <div className="md:ml-56 flex-1 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">Content Calendar</h1>
              <p className="text-sm text-gray-400 mt-0.5">
                {monthPosts.length} post{monthPosts.length !== 1 ? 's' : ''} in {MONTHS[viewMonth]}
                {activeWorkspace && !activeWorkspace.is_personal && (
                  <span className="ml-2 text-purple-500 font-semibold">· {activeWorkspace.client_name || activeWorkspace.name}</span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/bulk-scheduler"
                className="text-xs font-bold px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-xl hover:border-gray-400 transition-all">
                📆 Bulk
              </Link>
              <Link href="/compose"
                className="bg-black text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:opacity-80 transition-all">
                + New Post
              </Link>
            </div>
          </div>

          {!canGoForward && plan !== 'agency' && (
            <div className="mb-6 bg-amber-50 border border-amber-100 rounded-2xl px-5 py-3 flex flex-col sm:flex-row sm:items-center gap-3">
              <p className="text-xs text-amber-700 font-semibold flex-1">
                🔒 {plan.charAt(0).toUpperCase() + plan.slice(1)} plan limit reached ({forwardLimitLabel} ahead). Upgrade to schedule further out.
              </p>
              <Link href="/settings?tab=Plan"
                className="text-xs font-bold px-3 py-1.5 bg-black text-white rounded-xl hover:opacity-80 transition-all self-start sm:self-auto flex-shrink-0">
                Upgrade →
              </Link>
            </div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">

            {/* CALENDAR */}
            <div className="xl:col-span-3">
              <div className="bg-surface border border-theme rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                <div className="min-w-[320px]">
                <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-theme">
                  <button onClick={prevMonth}
                    className="w-8 h-8 flex items-center justify-center rounded-xl border border-gray-200 dark:border-gray-600 hover:border-gray-400 transition-all text-sm">
                    ←
                  </button>
                  <h2 className="text-base font-extrabold tracking-tight">
                    {MONTHS[viewMonth]} {viewYear}
                  </h2>
                  <button onClick={nextMonth} disabled={!canGoForward}
                    className={`w-8 h-8 flex items-center justify-center rounded-xl border transition-all text-sm ${
                      canGoForward ? 'border-gray-200 dark:border-gray-600 hover:border-gray-400' : 'border-gray-100 text-gray-300 dark:text-gray-600 cursor-not-allowed'
                    }`}>
                    →
                  </button>
                </div>

                <div className="grid grid-cols-7 border-b border-theme">
                  {DAYS_OF_WEEK.map((d, i) => (
                    <div key={d} className="py-2 text-center text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                      <span className="hidden sm:inline">{d}</span>
                      <span className="sm:hidden">{DAYS_OF_WEEK_XS[i]}</span>
                    </div>
                  ))}
                </div>

                {loading ? (
                  <div className="p-8 text-center">
                    <div className="text-gray-300 dark:text-gray-600 text-sm animate-pulse">Loading calendar...</div>
                  </div>
                ) : (
                  <div className="grid grid-cols-7">
                    {Array.from({ length: totalCells }).map((_, i) => {
                      const dayNum = i - firstDay + 1
                      const isCurrentMonth = dayNum >= 1 && dayNum <= daysInMonth
                      const dateKey = isCurrentMonth ? formatDateKey(viewYear, viewMonth, dayNum) : null
                      const dayPosts = dateKey ? (postsByDate[dateKey] || []) : []
                      const isToday       = dateKey === todayKey
                      const isSelected    = dateKey === selectedDay
                      const isBeyondLimit = dateKey ? new Date(dateKey + 'T12:00:00') > limitDate : false

                      return (
                        <div key={i}
                          onClick={() => dateKey && !isBeyondLimit && handleDayClick(dateKey)}
                          className={`group min-h-[70px] md:min-h-[90px] p-1.5 md:p-2 border-b border-r border-gray-50 dark:border-gray-800 transition-all ${
                            isCurrentMonth && !isBeyondLimit ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800' : 'bg-gray-50/50 dark:bg-gray-800/50'
                          } ${isSelected ? 'bg-blue-50' : ''} ${isBeyondLimit ? 'opacity-30 cursor-not-allowed' : ''}`}>
                          {isCurrentMonth && (
                            <>
                              <div className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold mb-1 ${
                                isToday    ? 'bg-black text-white' :
                                isSelected ? 'bg-blue-500 text-white' :
                                isBeyondLimit ? 'text-gray-300 dark:text-gray-600' :
                                'text-gray-600 dark:text-gray-300'
                              }`}>
                                {dayNum}
                              </div>
                              <div className="space-y-0.5">
                                {dayPosts.slice(0, 2).map(post => (
                                  <div key={post.id}
                                    className={`text-xs px-1 py-0.5 rounded truncate font-semibold leading-tight ${
                                      post.status === 'scheduled' ? 'bg-black text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                                    }`}>
                                    <span className="hidden sm:inline">
                                      {(post.platforms || []).slice(0, 2).map((p: string) => PLATFORM_ICONS[p] || '').join('')}
                                      {' '}{post.content?.slice(0, 12) || 'Post'}
                                    </span>
                                    <span className="sm:hidden">
                                      {(post.platforms || []).slice(0, 1).map((p: string) => PLATFORM_ICONS[p] || '📱')}
                                    </span>
                                  </div>
                                ))}
                                {dayPosts.length > 2 && (
                                  <div className="text-xs text-gray-400 dark:text-gray-500 px-1">+{dayPosts.length - 2}</div>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
                </div>{/* end min-w */}
                </div>{/* end overflow-x-auto */}
              </div>
            </div>

            {/* RIGHT PANEL */}
            <div className="space-y-4">
              {selectedDay ? (
                <div className="bg-surface border border-theme rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-xs font-bold text-gray-900 dark:text-gray-100">
                        {new Date(selectedDay + 'T12:00:00').toLocaleDateString('en-US', {
                          weekday: 'long', month: 'short', day: 'numeric'
                        })}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {selectedPosts.length} post{selectedPosts.length !== 1 ? 's' : ''} scheduled
                      </p>
                    </div>
                    <Link href="/compose"
                      className="text-xs font-bold bg-black text-white px-3 py-1.5 rounded-xl hover:opacity-80 transition-all">
                      + Add
                    </Link>
                  </div>
                  {selectedPosts.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-xs text-gray-400 mb-3">Nothing scheduled</p>
                      <Link href="/compose"
                        className="text-xs font-bold text-black underline hover:opacity-70">
                        Schedule a post →
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {selectedPosts.map(post => (
                        <Link key={post.id} href={`/queue?date=${selectedDay}`}
                          className="block p-3 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
                          <div className="flex items-center gap-1 mb-1">
                            {(post.platforms || []).slice(0, 4).map((p: string) => (
                              <span key={p} className="text-sm">{PLATFORM_ICONS[p] || '📱'}</span>
                            ))}
                            <span className="text-xs text-gray-400 dark:text-gray-500 ml-auto">
                              {new Date(post.scheduled_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">{post.content || 'No content'}</p>
                          <p className="text-xs text-blue-500 font-semibold mt-1.5">View full day schedule →</p>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-surface border border-theme rounded-2xl p-5 text-center">
                  <div className="text-3xl mb-2">📅</div>
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Click any day</p>
                  <p className="text-xs text-gray-400">to see or add posts for that date</p>
                </div>
              )}

              {/* MONTH STATS */}
              <div className="bg-surface border border-theme rounded-2xl p-5">
                <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-4">{MONTHS[viewMonth]} Stats</p>
                <div className="space-y-3">
                  {[
                    { label: 'Total scheduled',   value: monthPosts.length },
                    { label: 'Days with content', value: new Set(monthPosts.map(p => new Date(p.scheduled_at).toDateString())).size },
                    { label: 'Platforms covered', value: new Set(monthPosts.flatMap(p => p.platforms || [])).size },
                  ].map(stat => (
                    <div key={stat.label} className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</span>
                      <span className="text-sm font-extrabold">{stat.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* SCHEDULING WINDOW */}
              <div className="bg-surface border border-theme rounded-2xl p-5">
                <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-3">Scheduling Window</p>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-base">{plan === 'agency' ? '🏢' : plan === 'pro' ? '⚡' : '🔓'}</span>
                  <span className="text-xs font-bold capitalize">{plan} Plan</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Schedule up to <span className="font-bold text-black">{forwardLimitLabel}</span> ahead.
                </p>
                <p className="text-xs text-gray-300 dark:text-gray-600">
                  Until {limitDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
                {plan !== 'agency' && (
                  <Link href="/settings?tab=Plan"
                    className="inline-block mt-3 text-xs font-bold text-blue-600 hover:underline">
                    Upgrade for longer window →
                  </Link>
                )}
              </div>

              {/* UPCOMING */}
              <div className="bg-surface border border-theme rounded-2xl p-5">
                <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-3">Upcoming</p>
                {posts.filter(p => new Date(p.scheduled_at) >= today).slice(0, 4).length === 0 ? (
                  <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-2">No upcoming posts</p>
                ) : (
                  <div className="space-y-2">
                    {posts.filter(p => new Date(p.scheduled_at) >= today).slice(0, 4).map(post => {
                      const d = new Date(post.scheduled_at)
                      const dateKey = formatDateKey(d.getFullYear(), d.getMonth(), d.getDate())
                      return (
                        <Link key={post.id} href={`/queue?date=${dateKey}`}
                          className="block p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-all">
                          <div className="flex items-center gap-2">
                            <span className="text-sm flex-shrink-0">{PLATFORM_ICONS[(post.platforms || [])[0]] || '📱'}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold truncate">{post.content?.slice(0, 30) || 'No content'}</p>
                              <p className="text-xs text-gray-400 dark:text-gray-500">
                                {d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at {d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                        </Link>
                      )
                    })}
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