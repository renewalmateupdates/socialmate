'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Post = {
  id: string
  content: string
  platforms: string[]
  scheduled_at: string
  status: string
}

const PLATFORM_ICONS: Record<string, string> = {
  instagram: '📸', twitter: '🐦', linkedin: '💼', tiktok: '🎵',
  facebook: '📘', pinterest: '📌', youtube: '▶️', threads: '🧵',
  snapchat: '👻', bluesky: '🦋', reddit: '🤖', discord: '💬',
  telegram: '✈️', mastodon: '🐘', lemon8: '🍋', bereal: '📷',
  whatsapp: '💚',
}

const STATUS_COLORS: Record<string, string> = {
  scheduled: 'bg-blue-50 border-blue-200 text-blue-700',
  draft: 'bg-gray-50 border-gray-200 text-gray-500',
  published: 'bg-green-50 border-green-200 text-green-700',
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

export default function Calendar() {
  const [user, setUser] = useState<any>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [today] = useState(new Date())
  const [viewYear, setViewYear] = useState(new Date().getFullYear())
  const [viewMonth, setViewMonth] = useState(new Date().getMonth())
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [dragOverDay, setDragOverDay] = useState<number | null>(null)
  const [previewPost, setPreviewPost] = useState<Post | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [view, setView] = useState<'month' | 'week'>('month')
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
      const start = new Date(viewYear, viewMonth, 1).toISOString()
      const end = new Date(viewYear, viewMonth + 1, 0, 23, 59, 59).toISOString()
      const { data } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', user.id)
        .gte('scheduled_at', start)
        .lte('scheduled_at', end)
        .order('scheduled_at', { ascending: true })
      setPosts(data || [])
      setLoading(false)
    }
    getData()
  }, [viewYear, viewMonth])

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const getPostsForDay = (day: number) => {
    return posts.filter(p => {
      if (!p.scheduled_at) return false
      const d = new Date(p.scheduled_at)
      return d.getFullYear() === viewYear && d.getMonth() === viewMonth && d.getDate() === day
    })
  }

  const handleDragStart = (e: React.DragEvent, postId: string) => {
    setDraggingId(postId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent, day: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverDay(day)
  }

  const handleDrop = async (e: React.DragEvent, day: number) => {
    e.preventDefault()
    if (!draggingId) return
    const post = posts.find(p => p.id === draggingId)
    if (!post) return

    const oldDate = new Date(post.scheduled_at)
    const newDate = new Date(viewYear, viewMonth, day, oldDate.getHours(), oldDate.getMinutes())

    const { error } = await supabase
      .from('posts')
      .update({ scheduled_at: newDate.toISOString() })
      .eq('id', draggingId)

    if (!error) {
      setPosts(prev => prev.map(p =>
        p.id === draggingId ? { ...p, scheduled_at: newDate.toISOString() } : p
      ))
      showToast(`Post rescheduled to ${MONTHS[viewMonth]} ${day}`, 'success')
    } else {
      showToast('Failed to reschedule post', 'error')
    }

    setDraggingId(null)
    setDragOverDay(null)
  }

  const handleDragEnd = () => {
    setDraggingId(null)
    setDragOverDay(null)
  }

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
    setSelectedDay(null)
  }

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
    setSelectedDay(null)
  }

  const goToToday = () => {
    setViewYear(today.getFullYear())
    setViewMonth(today.getMonth())
    setSelectedDay(today.getDate())
  }

  const daysInMonth = getDaysInMonth(viewYear, viewMonth)
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth)
  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7

  const selectedDayPosts = selectedDay ? getPostsForDay(selectedDay) : []

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const deletePost = async (id: string) => {
    await supabase.from('posts').delete().eq('id', id)
    setPosts(prev => prev.filter(p => p.id !== id))
    setPreviewPost(null)
    showToast('Post deleted', 'success')
  }

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
            { icon: "📅", label: "Calendar", href: "/calendar", active: true },
            { icon: "✏️", label: "Compose", href: "/compose" },
            { icon: "📂", label: "Drafts", href: "/drafts" },
            { icon: "⏳", label: "Queue", href: "/queue" },
            { icon: "#️⃣", label: "Hashtags", href: "/hashtags" },
            { icon: "🖼️", label: "Media Library", href: "/media" },
            { icon: "📝", label: "Templates", href: "/templates" },
            { icon: "🔗", label: "Link in Bio", href: "/link-in-bio" },
            { icon: "📆", label: "Bulk Scheduler", href: "/bulk-scheduler" },
          ].map(item => (
            <Link key={item.label} href={item.href} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${'active' in item && item.active ? 'bg-gray-100 text-black' : 'text-gray-500 hover:bg-gray-50 hover:text-black'}`}>
              <span>{item.icon}</span>{item.label}
            </Link>
          ))}
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-3 py-2 mt-3">Insights</div>
          {[
            { icon: "📊", label: "Analytics", href: "/analytics" },
            { icon: "🔍", label: "Best Times", href: "/best-times" },
          ].map(item => (
            <Link key={item.label} href={item.href} className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-black transition-all">
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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">Calendar</h1>
            <p className="text-sm text-gray-400 mt-0.5">Drag and drop to reschedule posts</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={goToToday} className="text-sm font-semibold px-4 py-2 border border-gray-200 rounded-xl hover:border-gray-400 transition-all">
              Today
            </button>
            <Link href="/compose" className="bg-black text-white text-sm font-semibold px-4 py-2 rounded-xl hover:opacity-80 transition-all">
              + New Post
            </Link>
          </div>
        </div>

        {/* MONTH NAV */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button onClick={prevMonth} className="w-8 h-8 flex items-center justify-center rounded-xl border border-gray-200 hover:border-gray-400 transition-all text-sm">←</button>
            <h2 className="text-lg font-extrabold tracking-tight min-w-[160px] text-center">
              {MONTHS[viewMonth]} {viewYear}
            </h2>
            <button onClick={nextMonth} className="w-8 h-8 flex items-center justify-center rounded-xl border border-gray-200 hover:border-gray-400 transition-all text-sm">→</button>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span className="w-2 h-2 rounded-full bg-blue-400 inline-block"></span> Scheduled
            <span className="w-2 h-2 rounded-full bg-gray-300 inline-block ml-2"></span> Draft
            <span className="w-2 h-2 rounded-full bg-green-400 inline-block ml-2"></span> Published
          </div>
        </div>

        <div className="flex gap-6">
          {/* CALENDAR GRID */}
          <div className="flex-1">
            {/* Day headers */}
            <div className="grid grid-cols-7 mb-1">
              {DAYS.map(d => (
                <div key={d} className="text-xs font-semibold text-gray-400 text-center py-2">{d}</div>
              ))}
            </div>

            {/* Cells */}
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: totalCells }).map((_, i) => {
                const dayNum = i - firstDay + 1
                const isValid = dayNum >= 1 && dayNum <= daysInMonth
                const isToday = isValid && dayNum === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear()
                const isSelected = isValid && dayNum === selectedDay
                const isDragOver = isValid && dayNum === dragOverDay
                const dayPosts = isValid ? getPostsForDay(dayNum) : []

                return (
                  <div
                    key={i}
                    onClick={() => isValid && setSelectedDay(dayNum === selectedDay ? null : dayNum)}
                    onDragOver={e => isValid && handleDragOver(e, dayNum)}
                    onDrop={e => isValid && handleDrop(e, dayNum)}
                    className={`min-h-[90px] rounded-xl p-1.5 border transition-all cursor-pointer ${
                      !isValid ? 'border-transparent' :
                      isDragOver ? 'border-black bg-black/5 scale-[1.02]' :
                      isSelected ? 'border-black bg-black/5' :
                      isToday ? 'border-blue-200 bg-blue-50/50' :
                      'border-gray-100 bg-white hover:border-gray-300'
                    }`}
                  >
                    {isValid && (
                      <>
                        <div className={`text-xs font-bold mb-1 w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-black text-white' : 'text-gray-600'}`}>
                          {dayNum}
                        </div>
                        <div className="space-y-0.5">
                          {dayPosts.slice(0, 3).map(post => (
                            <div
                              key={post.id}
                              draggable
                              onDragStart={e => handleDragStart(e, post.id)}
                              onDragEnd={handleDragEnd}
                              onClick={e => { e.stopPropagation(); setPreviewPost(post); setSelectedDay(dayNum) }}
                              className={`text-xs px-1.5 py-0.5 rounded-md border truncate cursor-grab active:cursor-grabbing transition-all hover:opacity-80 ${STATUS_COLORS[post.status] || STATUS_COLORS.draft} ${draggingId === post.id ? 'opacity-30' : ''}`}
                            >
                              {post.platforms?.[0] ? PLATFORM_ICONS[post.platforms[0]] : '📝'} {post.content?.slice(0, 20)}...
                            </div>
                          ))}
                          {dayPosts.length > 3 && (
                            <div className="text-xs text-gray-400 px-1">+{dayPosts.length - 3} more</div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Month stats */}
            <div className="grid grid-cols-3 gap-3 mt-4">
              {[
                { label: 'Scheduled', value: posts.filter(p => p.status === 'scheduled').length, color: 'text-blue-600' },
                { label: 'Drafts', value: posts.filter(p => p.status === 'draft').length, color: 'text-gray-500' },
                { label: 'Published', value: posts.filter(p => p.status === 'published').length, color: 'text-green-600' },
              ].map(stat => (
                <div key={stat.label} className="bg-white border border-gray-100 rounded-2xl p-4 text-center">
                  <div className={`text-2xl font-extrabold tracking-tight ${stat.color}`}>{stat.value}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{stat.label} this month</div>
                </div>
              ))}
            </div>
          </div>

          {/* DAY PANEL */}
          {selectedDay && (
            <div className="w-72 flex-shrink-0">
              <div className="bg-white border border-gray-100 rounded-2xl p-5 sticky top-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-sm tracking-tight">
                    {MONTHS[viewMonth]} {selectedDay}
                  </h3>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/compose?date=${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`}
                      className="text-xs font-semibold px-3 py-1.5 bg-black text-white rounded-xl hover:opacity-80 transition-all"
                    >
                      + Post
                    </Link>
                    <button onClick={() => setSelectedDay(null)} className="text-gray-400 hover:text-black text-lg leading-none">×</button>
                  </div>
                </div>

                {selectedDayPosts.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-3xl mb-2">📭</div>
                    <p className="text-sm text-gray-400">No posts on this day</p>
                    <Link href="/compose" className="text-xs font-semibold text-black underline mt-2 inline-block">
                      Create one →
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedDayPosts.map(post => (
                      <div
                        key={post.id}
                        onClick={() => setPreviewPost(post)}
                        className="p-3 rounded-xl border border-gray-100 hover:border-gray-300 cursor-pointer transition-all group"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1 flex-wrap">
                            {post.platforms?.slice(0, 4).map(pl => (
                              <span key={pl} className="text-sm">{PLATFORM_ICONS[pl] || '📱'}</span>
                            ))}
                            {post.platforms?.length > 4 && <span className="text-xs text-gray-400">+{post.platforms.length - 4}</span>}
                          </div>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[post.status] || STATUS_COLORS.draft}`}>
                            {post.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 line-clamp-2">{post.content}</p>
                        {post.scheduled_at && (
                          <p className="text-xs text-gray-400 mt-1.5">
                            🕐 {new Date(post.scheduled_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* POST PREVIEW MODAL */}
      {previewPost && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6" onClick={() => setPreviewPost(null)}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div>
                <div className="flex items-center gap-1 flex-wrap mb-1">
                  {previewPost.platforms?.map(pl => (
                    <span key={pl} className="text-base">{PLATFORM_ICONS[pl] || '📱'}</span>
                  ))}
                </div>
                <p className="text-xs text-gray-400">
                  {previewPost.scheduled_at && new Date(previewPost.scheduled_at).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${STATUS_COLORS[previewPost.status] || STATUS_COLORS.draft}`}>
                  {previewPost.status}
                </span>
                <button onClick={() => setPreviewPost(null)} className="text-gray-400 hover:text-black text-xl leading-none">×</button>
              </div>
            </div>
            <div className="p-6">
              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{previewPost.content}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">Platforms:</span>
                {previewPost.platforms?.map(pl => (
                  <span key={pl} className="text-xs font-semibold bg-gray-100 px-2 py-0.5 rounded-full capitalize">{pl}</span>
                ))}
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex gap-2">
              <Link
                href={`/compose?edit=${previewPost.id}`}
                className="flex-1 py-2.5 text-sm font-semibold border border-gray-200 rounded-xl hover:border-gray-400 transition-all text-center"
              >
                ✏️ Edit
              </Link>
              <button
                onClick={() => deletePost(previewPost.id)}
                className="flex-1 py-2.5 text-sm font-semibold bg-red-500 text-white rounded-xl hover:opacity-80 transition-all"
              >
                🗑️ Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl text-sm font-semibold shadow-lg ${toast.type === 'success' ? 'bg-black text-white' : 'bg-red-500 text-white'}`}>
          {toast.type === 'success' ? '✅' : '❌'} {toast.message}
        </div>
      )}
    </div>
  )
}