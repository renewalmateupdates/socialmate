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
  telegram: '✈️', mastodon: '🐘', lemon8: '🍋', bereal: '📷', whatsapp: '💚',
}

function timeFromNow(dateStr: string) {
  const diff = new Date(dateStr).getTime() - Date.now()
  const mins = Math.floor(Math.abs(diff) / 60000)
  const hours = Math.floor(Math.abs(diff) / 3600000)
  const days = Math.floor(Math.abs(diff) / 86400000)
  if (diff < 0) return 'Overdue'
  if (mins < 60) return `in ${mins}m`
  if (hours < 24) return `in ${hours}h`
  return `in ${days}d`
}

function formatDateTime(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

export default function Queue() {
  const [user, setUser] = useState<any>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'upcoming' | 'overdue' | 'all'>('upcoming')
  const [platformFilter, setPlatformFilter] = useState('all')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [preview, setPreview] = useState<Post | null>(null)
  const [rescheduleId, setRescheduleId] = useState<string | null>(null)
  const [rescheduleTime, setRescheduleTime] = useState('')
  const [bulkTime, setBulkTime] = useState('')
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [search, setSearch] = useState('')
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
        .eq('status', 'scheduled')
        .order('scheduled_at', { ascending: true })
      setPosts(data || [])
      setLoading(false)
    }
    getData()
  }, [])

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const now = new Date()
  const upcoming = posts.filter(p => new Date(p.scheduled_at) >= now)
  const overdue = posts.filter(p => new Date(p.scheduled_at) < now)

  const allPlatforms = Array.from(new Set(posts.flatMap(p => p.platforms || [])))

  const filtered = posts.filter(p => {
    const matchFilter =
      filter === 'all' ? true :
      filter === 'upcoming' ? new Date(p.scheduled_at) >= now :
      new Date(p.scheduled_at) < now
    const matchPlatform = platformFilter === 'all' || p.platforms?.includes(platformFilter)
    const matchSearch = p.content?.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchPlatform && matchSearch
  })

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selected.size === filtered.length) setSelected(new Set())
    else setSelected(new Set(filtered.map(p => p.id)))
  }

  const handleDelete = async (id: string) => {
    await supabase.from('posts').delete().eq('id', id)
    setPosts(prev => prev.filter(p => p.id !== id))
    setPreview(null)
    showToast('Post removed from queue', 'success')
  }

  const handleBulkDelete = async () => {
    const ids = Array.from(selected)
    await supabase.from('posts').delete().in('id', ids)
    setPosts(prev => prev.filter(p => !selected.has(p.id)))
    setSelected(new Set())
    showToast(`${ids.length} post${ids.length !== 1 ? 's' : ''} removed`, 'success')
  }

  const handleReschedule = async (id: string, time: string) => {
    if (!time) { showToast('Pick a time', 'error'); return }
    const { error } = await supabase
      .from('posts')
      .update({ scheduled_at: new Date(time).toISOString() })
      .eq('id', id)
    if (error) { showToast('Failed to reschedule', 'error'); return }
    setPosts(prev => prev.map(p => p.id === id ? { ...p, scheduled_at: new Date(time).toISOString() } : p))
    setRescheduleId(null)
    setRescheduleTime('')
    setPreview(null)
    showToast('Post rescheduled!', 'success')
  }

  const handleMoveToDraft = async (id: string) => {
    await supabase.from('posts').update({ status: 'draft', scheduled_at: null }).eq('id', id)
    setPosts(prev => prev.filter(p => p.id !== id))
    setPreview(null)
    showToast('Moved to drafts', 'success')
  }

  const handleBulkReschedule = async () => {
    if (!bulkTime) { showToast('Pick a time', 'error'); return }
    const ids = Array.from(selected)
    const base = new Date(bulkTime)
    for (let i = 0; i < ids.length; i++) {
      const t = new Date(base.getTime() + i * 3600000)
      await supabase.from('posts').update({ scheduled_at: t.toISOString() }).eq('id', ids[i])
      setPosts(prev => prev.map(p => p.id === ids[i] ? { ...p, scheduled_at: t.toISOString() } : p))
    }
    setSelected(new Set())
    setBulkTime('')
    showToast(`${ids.length} post${ids.length !== 1 ? 's' : ''} rescheduled!`, 'success')
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const groupByDay = (posts: Post[]) => {
    const groups: Record<string, Post[]> = {}
    posts.forEach(p => {
      const day = new Date(p.scheduled_at).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
      if (!groups[day]) groups[day] = []
      groups[day].push(p)
    })
    return groups
  }

  const grouped = groupByDay(filtered)

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
            { icon: "⏳", label: "Queue", href: "/queue", active: true },
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">Queue</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {loading ? 'Loading...' : `${upcoming.length} upcoming · ${overdue.length} overdue`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/bulk-scheduler" className="text-sm font-semibold px-4 py-2.5 border border-gray-200 rounded-xl hover:border-gray-400 transition-all">
              📆 Bulk Add
            </Link>
            <Link href="/compose" className="bg-black text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:opacity-80 transition-all">
              + Schedule Post
            </Link>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {loading ? (
            [1,2,3,4].map(i => <SkeletonBox key={i} className="h-20 rounded-2xl" />)
          ) : (
            [
              { label: 'Total Queued', value: posts.length, icon: '⏳', color: 'text-black' },
              { label: 'Upcoming', value: upcoming.length, icon: '📅', color: 'text-blue-600' },
              { label: 'Overdue', value: overdue.length, icon: '⚠️', color: 'text-red-500' },
              { label: 'Today', value: posts.filter(p => new Date(p.scheduled_at).toDateString() === now.toDateString()).length, icon: '🌅', color: 'text-green-600' },
            ].map(stat => (
              <div key={stat.label} className="bg-white border border-gray-100 rounded-2xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{stat.label}</span>
                  <span>{stat.icon}</span>
                </div>
                <div className={`text-2xl font-extrabold tracking-tight ${stat.color}`}>{stat.value}</div>
              </div>
            ))
          )}
        </div>

        {/* OVERDUE BANNER */}
        {!loading && overdue.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xl">⚠️</span>
              <div>
                <p className="text-sm font-bold text-red-700">{overdue.length} post{overdue.length !== 1 ? 's' : ''} missed their scheduled time</p>
                <p className="text-xs text-red-400">Reschedule them or move to drafts</p>
              </div>
            </div>
            <button onClick={() => setFilter('overdue')} className="text-xs font-semibold px-3 py-1.5 bg-red-500 text-white rounded-xl hover:opacity-80 transition-all">
              View Overdue →
            </button>
          </div>
        )}

        {/* CONTROLS */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <div className="flex items-center gap-1 bg-white border border-gray-100 rounded-xl p-1">
            {([
              { id: 'upcoming', label: `Upcoming (${upcoming.length})` },
              { id: 'overdue', label: `Overdue (${overdue.length})` },
              { id: 'all', label: `All (${posts.length})` },
            ] as const).map(f => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filter === f.id ? 'bg-black text-white' : 'text-gray-500 hover:text-black'}`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
            <input
              type="text"
              placeholder="Search queue..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 bg-white"
            />
          </div>
          {allPlatforms.length > 0 && (
            <select
              value={platformFilter}
              onChange={e => setPlatformFilter(e.target.value)}
              className="text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none bg-white"
            >
              <option value="all">All Platforms</option>
              {allPlatforms.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          )}
        </div>

        {/* BULK ACTION BAR */}
        {selected.size > 0 && (
          <div className="bg-black text-white rounded-2xl px-5 py-3 mb-4 flex items-center gap-4">
            <span className="text-sm font-semibold">{selected.size} selected</span>
            <div className="flex items-center gap-2 flex-1">
              <input
                type="datetime-local"
                value={bulkTime}
                onChange={e => setBulkTime(e.target.value)}
                className="text-xs px-3 py-1.5 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:border-white/50"
              />
              <button
                onClick={handleBulkReschedule}
                disabled={!bulkTime}
                className="text-xs font-semibold px-3 py-1.5 bg-white text-black rounded-xl hover:opacity-80 transition-all disabled:opacity-40"
              >
                📅 Reschedule All
              </button>
              <button
                onClick={handleBulkDelete}
                className="text-xs font-semibold px-3 py-1.5 bg-red-500 text-white rounded-xl hover:opacity-80 transition-all"
              >
                🗑️ Remove All
              </button>
            </div>
            <button onClick={() => setSelected(new Set())} className="text-white/60 hover:text-white text-lg">×</button>
          </div>
        )}

        {/* QUEUE LIST */}
        {loading ? (
          <div className="space-y-3">
            {[1,2,3,4].map(i => <SkeletonBox key={i} className="h-24 rounded-2xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-2xl p-16 text-center">
            <div className="text-5xl mb-4">📭</div>
            <h2 className="text-lg font-bold tracking-tight mb-2">
              {search ? 'No posts match your search' : filter === 'overdue' ? 'No overdue posts' : 'Queue is empty'}
            </h2>
            <p className="text-gray-400 text-sm mb-6">
              {search ? 'Try a different search term.' : 'Schedule posts to see them here.'}
            </p>
            {!search && (
              <Link href="/compose" className="bg-black text-white text-sm font-semibold px-6 py-3 rounded-xl hover:opacity-80 transition-all">
                Schedule a Post →
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Select all row */}
            <div className="flex items-center gap-3 px-2">
              <input
                type="checkbox"
                checked={selected.size === filtered.length && filtered.length > 0}
                onChange={toggleSelectAll}
                className="w-4 h-4 rounded accent-black cursor-pointer"
              />
              <span className="text-xs text-gray-400 font-semibold">Select all</span>
            </div>

            {Object.entries(grouped).map(([day, dayPosts]) => (
              <div key={day}>
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">{day}</h3>
                  <div className="flex-1 h-px bg-gray-100" />
                  <span className="text-xs text-gray-400">{dayPosts.length} post{dayPosts.length !== 1 ? 's' : ''}</span>
                </div>
                <div className="space-y-2">
                  {dayPosts.map(post => {
                    const t = timeFromNow(post.scheduled_at)
                    const isOverdue = t === 'Overdue'
                    return (
                      <div
                        key={post.id}
                        className={`flex items-center gap-3 p-4 bg-white rounded-2xl border transition-all group cursor-pointer ${
                          selected.has(post.id) ? 'border-black ring-1 ring-black' :
                          isOverdue ? 'border-red-100 hover:border-red-200' :
                          'border-gray-100 hover:border-gray-300'
                        }`}
                        onClick={() => setPreview(post)}
                      >
                        <input
                          type="checkbox"
                          checked={selected.has(post.id)}
                          onChange={() => toggleSelect(post.id)}
                          onClick={e => e.stopPropagation()}
                          className="w-4 h-4 rounded accent-black cursor-pointer flex-shrink-0"
                        />

                        {/* Time indicator */}
                        <div className={`w-14 flex-shrink-0 text-center`}>
                          <p className="text-xs font-bold">{new Date(post.scheduled_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                          <p className={`text-xs font-semibold ${isOverdue ? 'text-red-500' : 'text-gray-400'}`}>{t}</p>
                        </div>

                        <div className={`w-0.5 h-10 rounded-full flex-shrink-0 ${isOverdue ? 'bg-red-200' : 'bg-gray-100'}`} />

                        {/* Platform icons */}
                        <div className="flex items-center gap-0.5 flex-shrink-0">
                          {post.platforms?.slice(0, 3).map(pl => (
                            <span key={pl} className="text-base">{PLATFORM_ICONS[pl] || '📱'}</span>
                          ))}
                          {post.platforms?.length > 3 && <span className="text-xs text-gray-400">+{post.platforms.length - 3}</span>}
                        </div>

                        {/* Content */}
                        <p className="text-sm text-gray-700 flex-1 truncate">{post.content}</p>

                        {/* Actions */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0">
                          {rescheduleId === post.id ? (
                            <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                              <input
                                type="datetime-local"
                                value={rescheduleTime}
                                onChange={e => setRescheduleTime(e.target.value)}
                                className="text-xs px-2 py-1 border border-gray-200 rounded-lg focus:outline-none"
                              />
                              <button onClick={() => handleReschedule(post.id, rescheduleTime)} className="text-xs font-semibold px-2 py-1 bg-black text-white rounded-lg hover:opacity-80">✓</button>
                              <button onClick={() => setRescheduleId(null)} className="text-xs px-2 py-1 border border-gray-200 rounded-lg hover:border-gray-400">×</button>
                            </div>
                          ) : (
                            <>
                              <button
                                onClick={e => { e.stopPropagation(); setRescheduleId(post.id); setRescheduleTime('') }}
                                className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-400 hover:text-black transition-all text-sm"
                                title="Reschedule"
                              >📅</button>
                              <Link
                                href={`/compose?edit=${post.id}`}
                                onClick={e => e.stopPropagation()}
                                className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-400 hover:text-black transition-all text-sm"
                                title="Edit"
                              >✏️</Link>
                              <button
                                onClick={e => { e.stopPropagation(); handleMoveToDraft(post.id) }}
                                className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-400 hover:text-black transition-all text-sm"
                                title="Move to drafts"
                              >📂</button>
                              <button
                                onClick={e => { e.stopPropagation(); handleDelete(post.id) }}
                                className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-red-50 text-gray-300 hover:text-red-400 transition-all text-lg leading-none"
                                title="Delete"
                              >×</button>
                            </>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PREVIEW MODAL */}
      {preview && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6" onClick={() => setPreview(null)}>
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div>
                <div className="flex items-center gap-1 flex-wrap mb-1">
                  {preview.platforms?.map(pl => (
                    <span key={pl} className="text-base">{PLATFORM_ICONS[pl] || '📱'}</span>
                  ))}
                </div>
                <p className="text-xs text-gray-400">{formatDateTime(preview.scheduled_at)}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${timeFromNow(preview.scheduled_at) === 'Overdue' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-600'}`}>
                  {timeFromNow(preview.scheduled_at)}
                </span>
                <button onClick={() => setPreview(null)} className="text-gray-400 hover:text-black text-xl leading-none">×</button>
              </div>
            </div>
            <div className="p-6">
              <div className="bg-gray-50 rounded-xl p-4 mb-4 max-h-60 overflow-y-auto">
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{preview.content}</p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {preview.platforms?.map(pl => (
                  <span key={pl} className="text-xs font-semibold bg-gray-100 px-2 py-0.5 rounded-full capitalize">{pl}</span>
                ))}
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex gap-2">
              <Link href={`/compose?edit=${preview.id}`} className="flex-1 py-2.5 text-sm font-semibold border border-gray-200 rounded-xl hover:border-gray-400 transition-all text-center">
                ✏️ Edit
              </Link>
              <button
                onClick={() => { setRescheduleId(preview.id); setPreview(null) }}
                className="flex-1 py-2.5 text-sm font-semibold bg-black text-white rounded-xl hover:opacity-80 transition-all"
              >
                📅 Reschedule
              </button>
              <button
                onClick={() => handleMoveToDraft(preview.id)}
                className="py-2.5 px-4 text-sm font-semibold border border-gray-200 rounded-xl hover:border-gray-400 transition-all"
              >
                📂
              </button>
              <button
                onClick={() => handleDelete(preview.id)}
                className="py-2.5 px-4 text-sm font-semibold text-red-400 border border-red-100 rounded-xl hover:border-red-300 transition-all"
              >
                🗑️
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