'use client'
import { useState, useCallback, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'
import { useWorkspace } from '@/contexts/WorkspaceContext'

interface Post {
  id: string
  content: string
  platforms: string[]
  scheduled_at: string | null
  status: 'scheduled' | 'published' | 'draft'
  created_at: string
}

const PLATFORM_ICONS: Record<string, string> = {
  instagram: '📸', twitter: '🐦', linkedin: '💼', tiktok: '🎵',
  facebook: '📘', pinterest: '📌', youtube: '▶️', threads: '🧵',
  snapchat: '👻', bluesky: '🦋', reddit: '🤖', discord: '💬',
  telegram: '✈️', mastodon: '🐘', lemon8: '🍋', bereal: '📷',
}

const STATUS_DOT: Record<string, string> = {
  scheduled: 'bg-blue-400',
  published: 'bg-green-400',
  draft: 'bg-gray-300 dark:bg-gray-500',
}

const STATUS_BADGE: Record<string, string> = {
  scheduled: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  published: 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  draft: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function getPostDateKey(post: Post): string {
  const raw = post.scheduled_at || post.created_at
  return toDateKey(new Date(raw))
}

function formatTime(isoString: string | null): string {
  if (!isoString) return ''
  return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function buildCalendarDays(year: number, month: number): Date[] {
  const firstDay = new Date(year, month, 1)
  const lastDay  = new Date(year, month + 1, 0)
  const startPad = firstDay.getDay()
  const days: Date[] = []
  for (let i = startPad - 1; i >= 0; i--) {
    days.push(new Date(year, month, -i))
  }
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push(new Date(year, month, d))
  }
  while (days.length < 42) {
    days.push(new Date(year, month + 1, days.length - startPad - lastDay.getDate() + 1))
  }
  return days
}

function SkeletonBox({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg ${className ?? ''}`} />
}

export default function CalendarPage() {
  const router = useRouter()
  const { activeWorkspace } = useWorkspace()
  const today    = new Date()
  const todayKey = toDateKey(today)

  const [currentYear,  setCurrentYear]  = useState(today.getFullYear())
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [posts,        setPosts]        = useState<Post[]>([])
  const [loading,      setLoading]      = useState(true)
  const [selectedDay,  setSelectedDay]  = useState<string | null>(null)

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    const start = new Date(currentYear, currentMonth - 1, 1).toISOString()
    const end   = new Date(currentYear, currentMonth + 2, 0, 23, 59, 59).toISOString()
    let query = supabase
      .from('posts')
      .select('id, content, platforms, scheduled_at, status, created_at')
      .eq('user_id', user.id)
      .gte('created_at', start)
      .lte('created_at', end)
      .order('scheduled_at', { ascending: true, nullsFirst: false })
    if (activeWorkspace && !activeWorkspace.is_personal) {
      query = query.eq('workspace_id', activeWorkspace.id)
    }
    const { data } = await query
    setPosts((data as Post[]) ?? [])
    setLoading(false)
  }, [currentYear, currentMonth, activeWorkspace, router])

  useEffect(() => { fetchPosts() }, [fetchPosts])

  const postMap = posts.reduce<Record<string, Post[]>>((acc, post) => {
    const key = getPostDateKey(post)
    if (!acc[key]) acc[key] = []
    acc[key].push(post)
    return acc
  }, {})

  const monthStart    = new Date(currentYear, currentMonth, 1)
  const monthEnd      = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59)
  const monthHasPosts = posts.some(post => {
    const d = new Date(post.scheduled_at || post.created_at)
    return d >= monthStart && d <= monthEnd
  })

  const days = buildCalendarDays(currentYear, currentMonth)

  const prevMonth = () => {
    setSelectedDay(null)
    if (currentMonth === 0) { setCurrentYear(y => y - 1); setCurrentMonth(11) }
    else setCurrentMonth(m => m - 1)
  }
  const nextMonth = () => {
    setSelectedDay(null)
    if (currentMonth === 11) { setCurrentYear(y => y + 1); setCurrentMonth(0) }
    else setCurrentMonth(m => m + 1)
  }
  const goToToday = () => {
    setCurrentYear(today.getFullYear())
    setCurrentMonth(today.getMonth())
    setSelectedDay(todayKey)
  }

  const selectedPosts = selectedDay ? (postMap[selectedDay] ?? []) : []

  return (
    <div className="min-h-dvh bg-theme flex">
      <Sidebar />
      <div className="md:ml-56 flex-1 p-4 md:p-8">
        <div className="max-w-5xl mx-auto">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">
                Content Calendar
                {activeWorkspace && !activeWorkspace.is_personal && (
                  <span className="ml-2 text-sm font-semibold text-purple-500">
                    — {(activeWorkspace as any).client_name || activeWorkspace.name}
                  </span>
                )}
              </h1>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">
                Monthly view of all your scheduled, published, and draft posts
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/compose"
                className="text-xs font-bold px-4 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-xl hover:opacity-80 transition-all">
                + New Post
              </Link>
              <Link href="/queue"
                className="text-xs font-bold px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl hover:border-gray-400 transition-all">
                Queue
              </Link>
            </div>
          </div>

          {/* Month navigator */}
          <div className="bg-surface border border-theme rounded-2xl p-4 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button onClick={prevMonth}
                  className="w-9 h-9 rounded-xl border border-theme flex items-center justify-center text-sm font-bold hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                  aria-label="Previous month">
                  ‹
                </button>
                <h2 className="text-lg font-extrabold tracking-tight min-w-[160px] text-center">
                  {MONTH_NAMES[currentMonth]} {currentYear}
                </h2>
                <button onClick={nextMonth}
                  className="w-9 h-9 rounded-xl border border-theme flex items-center justify-center text-sm font-bold hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                  aria-label="Next month">
                  ›
                </button>
              </div>
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-400 inline-block" />Scheduled
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-green-400 inline-block" />Published
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-gray-300 dark:bg-gray-500 inline-block" />Draft
                  </span>
                </div>
                <button onClick={goToToday}
                  className="text-xs font-bold px-3 py-1.5 border border-gray-200 dark:border-gray-600 rounded-xl hover:border-gray-400 transition-all">
                  Today
                </button>
              </div>
            </div>
          </div>

          {/* Calendar grid */}
          <div className="bg-surface border border-theme rounded-2xl overflow-hidden mb-4">
            <div className="grid grid-cols-7 border-b border-theme">
              {DAY_LABELS.map(day => (
                <div key={day} className="py-2 text-center text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                  <span className="hidden sm:inline">{day}</span>
                  <span className="sm:hidden">{day.slice(0, 1)}</span>
                </div>
              ))}
            </div>

            {loading ? (
              <div className="grid grid-cols-7">
                {Array.from({ length: 42 }).map((_, i) => (
                  <div key={i} className="border-b border-r border-theme p-2 min-h-[80px]">
                    <SkeletonBox className="w-6 h-4 mb-2" />
                    <SkeletonBox className="w-full h-3 mb-1" />
                    <SkeletonBox className="w-3/4 h-3" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-7">
                {days.map((day, i) => {
                  const key         = toDateKey(day)
                  const isCurrentMo = day.getMonth() === currentMonth
                  const isToday     = key === todayKey
                  const isSelected  = key === selectedDay
                  const dayPosts    = postMap[key] ?? []
                  const visible     = dayPosts.slice(0, 3)
                  const overflow    = dayPosts.length - visible.length
                  return (
                    <button
                      key={i}
                      onClick={() => setSelectedDay(isSelected ? null : key)}
                      className={[
                        'text-left p-1.5 sm:p-2 border-b border-r border-theme transition-all focus:outline-none min-h-[70px] sm:min-h-[85px]',
                        i % 7 === 6 ? 'border-r-0' : '',
                        isCurrentMo ? '' : 'opacity-40',
                        isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800/40',
                      ].join(' ')}>
                      <div className="flex items-center justify-between mb-1">
                        <span className={[
                          'text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full',
                          isToday
                            ? 'bg-orange-500 text-white'
                            : isCurrentMo
                              ? 'text-gray-800 dark:text-gray-100'
                              : 'text-gray-400 dark:text-gray-600',
                        ].join(' ')}>
                          {day.getDate()}
                        </span>
                        {isSelected && <span className="text-[9px] text-blue-500 font-bold">▼</span>}
                      </div>

                      {/* Desktop: text pills */}
                      <div className="space-y-0.5 hidden sm:block">
                        {visible.map(post => (
                          <div key={post.id} className="flex items-center gap-1 min-w-0">
                            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${STATUS_DOT[post.status] ?? STATUS_DOT.draft}`} />
                            <span className="text-[10px] text-gray-500 dark:text-gray-400 truncate leading-tight">
                              {post.platforms?.[0] ? (PLATFORM_ICONS[post.platforms[0]] ?? '') + ' ' : ''}
                              {post.content.slice(0, 16)}{post.content.length > 16 ? '…' : ''}
                            </span>
                          </div>
                        ))}
                        {overflow > 0 && (
                          <span className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold pl-2.5">+{overflow} more</span>
                        )}
                      </div>

                      {/* Mobile: dot indicators */}
                      {dayPosts.length > 0 && (
                        <div className="flex items-center gap-0.5 flex-wrap mt-0.5 sm:hidden">
                          {dayPosts.slice(0, 5).map(post => (
                            <span key={post.id} className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[post.status] ?? STATUS_DOT.draft}`} />
                          ))}
                          {dayPosts.length > 5 && <span className="text-[9px] text-gray-400 font-bold leading-none">+</span>}
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Empty state */}
          {!loading && !monthHasPosts && (
            <div className="bg-surface border border-theme rounded-2xl p-10 text-center mb-4">
              <p className="text-3xl mb-3">📅</p>
              <p className="font-bold text-gray-700 dark:text-gray-200 mb-1">No posts this month</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mb-5">
                Schedule your first post to see it appear here.
              </p>
              <Link href="/compose"
                className="inline-block text-sm font-bold px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl hover:opacity-80 transition-all">
                Schedule your first post →
              </Link>
            </div>
          )}

          {/* Day detail panel */}
          {selectedDay && (
            <div className="bg-surface border border-theme rounded-2xl p-5 mb-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-extrabold text-base">
                    {new Date(selectedDay + 'T12:00:00').toLocaleDateString([], {
                      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
                    })}
                  </h3>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                    {selectedPosts.length === 0
                      ? 'No posts on this day'
                      : `${selectedPosts.length} post${selectedPosts.length !== 1 ? 's' : ''}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/compose?date=${selectedDay}`}
                    className="text-xs font-bold px-3 py-1.5 bg-black dark:bg-white text-white dark:text-black rounded-xl hover:opacity-80 transition-all">
                    + Add post
                  </Link>
                  <button
                    onClick={() => setSelectedDay(null)}
                    className="w-8 h-8 flex items-center justify-center rounded-xl border border-theme text-xs text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-all">
                    ✕
                  </button>
                </div>
              </div>

              {selectedPosts.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-3xl mb-2">✨</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500">
                    Nothing scheduled — a great day to add content!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedPosts.map(post => (
                    <div key={post.id}
                      className="border border-theme rounded-xl p-4 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-all">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                            {(post.platforms ?? []).length > 0
                              ? post.platforms.map(p => (
                                  <span key={p} className="text-base" title={p}>
                                    {PLATFORM_ICONS[p] ?? '📄'}
                                  </span>
                                ))
                              : <span className="text-xs text-gray-400">No platforms</span>
                            }
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed">
                            {post.content.slice(0, 80)}{post.content.length > 80 ? '…' : ''}
                          </p>
                          {(post.scheduled_at || post.created_at) && (
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">
                              🕐 {formatTime(post.scheduled_at || post.created_at)}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full capitalize ${STATUS_BADGE[post.status] ?? STATUS_BADGE.draft}`}>
                            {post.status}
                          </span>
                          <Link
                            href={post.status === 'draft' ? `/compose?id=${post.id}` : '/queue'}
                            className="text-xs text-blue-500 hover:text-blue-700 dark:hover:text-blue-300 font-semibold transition-colors">
                            {post.status === 'draft' ? 'Edit →' : 'View in Queue →'}
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Mobile legend */}
          <div className="flex sm:hidden items-center justify-center gap-4 text-xs text-gray-400 dark:text-gray-500 pb-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400 inline-block" />Scheduled
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-green-400 inline-block" />Published
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-gray-300 dark:bg-gray-500 inline-block" />Draft
            </span>
          </div>

        </div>
      </div>
    </div>
  )
}
