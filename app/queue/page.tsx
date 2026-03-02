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
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (diff < 0) return 'Overdue'
  if (mins < 60) return `in ${mins}m`
  if (hours < 24) return `in ${hours}h`
  return `in ${days}d`
}

function formatDateTime(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function Queue() {
  const [user, setUser] = useState<any>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'overdue'>('all')
  const [platformFilter, setPlatformFilter] = useState('all')
  const [rescheduleId, setRescheduleId] = useState<string | null>(null)
  const [rescheduleTime, setRescheduleTime] = useState('')
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [bulkRescheduleTime, setBulkRescheduleTime] = useState('')
  const router = useRouter()

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

  const handleDelete = async (id: string) => {
    await supabase.from('posts').delete().eq('id', id)
    setPosts(prev => prev.filter(p => p.id !== id))
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
    if (!time) { showToast('Pick a time first', 'error'); return }
    const { error } = await supabase
      .from('posts')
      .update({ scheduled_at: new Date(time).toISOString() })
      .eq('id', id)
    if (error) { showToast('Failed to reschedule', 'error'); return }
    setPosts(prev => prev.map(p => p.id === id ? { ...p, scheduled_at: new Date(time).toISOString() } : p))
    setRescheduleId(null)
    setRescheduleTime('')
    showToast('Post rescheduled!', 'success')
  }

  const handleBulkReschedule = async () => {
    if (!bulkRescheduleTime) { showToast('Pick a time first', 'error'); return }
    const ids = Array.from(selected)
    const base = new Date(bulkRescheduleTime)
    for (let i = 0; i < ids.length; i++) {
      const t = new Date(base.getTime() + i * 3600000)
      await supabase.from('posts').update({ scheduled_at: t.toISOString() }).eq('id', ids[i])
    }
    const updatedPosts = await supabase
      .from('posts')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'scheduled')
      .order('scheduled_at', { ascending: true })
    setPosts(updatedPosts.data || [])
    setSelected(new Set())
    setBulkRescheduleTime('')
    showToast(`${ids.length} post${ids.length !== 1 ? 's' : ''} rescheduled!`, 'success')
  }

  const handleMoveToDraft = async (id: string) => {
    await supabase.from('posts').update({ status: 'draft', scheduled_at: null }).eq('id', id)
    setPosts(prev => prev.filter(p => p.id !== id))
    showToast('Moved to drafts', 'success')
  }

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const now = new Date()
  const allPlatforms = Array.from(new Set(posts.flatMap(p => p.platforms || [])))

  const filtered = posts.filter(p => {
    const isOverdue = new Date(p.scheduled_at) < now
    if (filter === 'upcoming' && isOverdue) return false
    if (filter === 'overdue' && !isOverdue) return false
    if (platformFilter !== 'all' && !p.platforms?.includes(platformFilter)) return false
    return true
  })

  const overdue = posts.filter(p => new Date(p.scheduled_at) < now)
  const upcoming = posts.filter(p => new Date(p.scheduled_at) >= now)

  const toggleSelectAll = () => {
    if (selected.size === filtered.length) setSelected(new Set())
    else setSelected(new Set(filtered.map(p => p.id)))
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />

      <div className="ml-56 flex-1 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">Queue</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {loading ? 'Loading...' : `${posts.length} post${posts.length !== 1 ? 's' : ''} scheduled`}
            </p>
          </div>
          <Link href="/compose" className="bg-black text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:opacity-80 transition-all">
            + New Post
          </Link>
        </div>

        {!loading && overdue.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xl">⚠️</span>
              <div>
                <p className="text-sm font-bold text-red-700">{overdue.length} overdue post{overdue.length !== 1 ? 's' : ''}</p>
                <p className="text-xs text-red-500">These missed their scheduled time — reschedule or delete them</p>
              </div>
            </div>
            <button
              onClick={() => setFilter('overdue')}
              className="text-xs font-semibold px-3 py-1.5 bg-red-500 text-white rounded-xl hover:opacity-80 transition-all">
              Show Overdue
            </button>
          </div>
        )}

        <div className="grid grid-cols-3 gap-4 mb-6">
          {loading ? [1,2,3].map(i => <SkeletonBox key={i} className="h-20 rounded-2xl" />) : (
            [
              { label: 'Total Queued', value: posts.length, icon: '⏳', color: 'text-gray-800' },
              { label: 'Upcoming', value: upcoming.length, icon: '📅', color: 'text-blue-600' },
              { label: 'Overdue', value: overdue.length, icon: '⚠️', color: 'text-red-500' },
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

        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <div className="flex items-center gap-1 bg-white border border-gray-100 rounded-xl p-1">
            {(['all', 'upcoming', 'overdue'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize ${filter === f ? 'bg-black text-white' : 'text-gray-500 hover:text-black'}`}>
                {f}
              </button>
            ))}
          </div>
          {allPlatforms.length > 0 && (
            <select value={platformFilter} onChange={e => setPlatformFilter(e.target.value)}
              className="text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-gray-400 bg-white">
              <option value="all">All Platforms</option>
              {allPlatforms.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          )}
        </div>

        {selected.size > 0 && (
          <div className="bg-black text-white rounded-2xl px-5 py-3 mb-4 flex items-center gap-4">
            <span className="text-sm font-semibold">{selected.size} selected</span>
            <div className="flex items-center gap-2 flex-1">
              <input type="datetime-local" value={bulkRescheduleTime} onChange={e => setBulkRescheduleTime(e.target.value)}
                className="text-xs px-3 py-1.5 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:border-white/50" />
              <button onClick={handleBulkReschedule} disabled={!bulkRescheduleTime}
                className="text-xs font-semibold px-3 py-1.5 bg-white text-black rounded-xl hover:opacity-80 transition-all disabled:opacity-40">
                📅 Reschedule All
              </button>
              <button onClick={handleBulkDelete}
                className="text-xs font-semibold px-3 py-1.5 bg-red-500 text-white rounded-xl hover:opacity-80 transition-all">
                🗑️ Delete All
              </button>
            </div>
            <button onClick={() => setSelected(new Set())} className="text-white/60 hover:text-white text-lg leading-none">×</button>
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            {[1,2,3,4,5].map(i => <SkeletonBox key={i} className="h-20 rounded-2xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-2xl p-16 text-center">
            <div className="text-5xl mb-4">⏳</div>
            <h2 className="text-lg font-bold tracking-tight mb-2">
              {filter === 'overdue' ? 'No overdue posts' : filter === 'upcoming' ? 'No upcoming posts' : 'Queue is empty'}
            </h2>
            <p className="text-gray-400 text-sm mb-6 max-w-sm mx-auto">
              {filter === 'all' ? 'Schedule some posts to see them here.' : 'Try changing the filter above.'}
            </p>
            {filter === 'all' && (
              <Link href="/compose" className="bg-black text-white text-sm font-semibold px-6 py-3 rounded-xl hover:opacity-80 transition-all">
                Schedule a Post →
              </Link>
            )}
          </div>
        ) : (
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-100">
              <input type="checkbox"
                checked={selected.size === filtered.length && filtered.length > 0}
                onChange={toggleSelectAll}
                className="w-4 h-4 rounded accent-black cursor-pointer" />
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide flex-1">Post</span>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide w-32">Platforms</span>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide w-36">Scheduled</span>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide w-20">Status</span>
              <span className="w-24"></span>
            </div>

            {filtered.map((post, i) => {
              const t = timeFromNow(post.scheduled_at)
              const isOverdue = t === 'Overdue'
              return (
                <div key={post.id}>
                  <div className={`flex items-center gap-3 px-5 py-4 hover:bg-gray-50 transition-all group ${i !== filtered.length - 1 ? 'border-b border-gray-50' : ''} ${isOverdue ? 'bg-red-50/30' : ''}`}>
                    <input type="checkbox" checked={selected.has(post.id)} onChange={() => toggleSelect(post.id)}
                      className="w-4 h-4 rounded accent-black cursor-pointer flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{post.content?.slice(0, 70)}{post.content?.length > 70 ? '...' : ''}</p>
                    </div>
                    <div className="flex items-center gap-0.5 w-32 flex-shrink-0">
                      {post.platforms?.slice(0, 5).map(pl => <span key={pl} className="text-sm">{PLATFORM_ICONS[pl] || '📱'}</span>)}
                      {post.platforms?.length > 5 && <span className="text-xs text-gray-400">+{post.platforms.length - 5}</span>}
                    </div>
                    <div className="w-36 flex-shrink-0">
                      {rescheduleId === post.id ? (
                        <div className="flex gap-1">
                          <input type="datetime-local" value={rescheduleTime} onChange={e => setRescheduleTime(e.target.value)}
                            className="text-xs px-2 py-1 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 w-full" />
                          <button onClick={() => handleReschedule(post.id, rescheduleTime)}
                            className="text-xs font-semibold px-2 py-1 bg-black text-white rounded-lg hover:opacity-80">✓</button>
                          <button onClick={() => { setRescheduleId(null); setRescheduleTime('') }}
                            className="text-xs px-2 py-1 border border-gray-200 rounded-lg hover:border-gray-400">×</button>
                        </div>
                      ) : (
                        <div>
                          <p className="text-xs font-semibold text-gray-700">{formatDateTime(post.scheduled_at)}</p>
                          <p className={`text-xs font-semibold mt-0.5 ${isOverdue ? 'text-red-500' : 'text-gray-400'}`}>{t}</p>
                        </div>
                      )}
                    </div>
                    <div className="w-20 flex-shrink-0">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${isOverdue ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-blue-50 text-blue-600 border border-blue-200'}`}>
                        {isOverdue ? 'Overdue' : 'Scheduled'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 w-24 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all">
                      <Link href={`/compose?edit=${post.id}`}
                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-black transition-all text-sm">✏️</Link>
                      <button onClick={() => { setRescheduleId(post.id); setRescheduleTime('') }}
                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-black transition-all text-sm">📅</button>
                      <button onClick={() => handleMoveToDraft(post.id)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-black transition-all text-sm">📂</button>
                      <button onClick={() => handleDelete(post.id)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-400 transition-all">×</button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl text-sm font-semibold shadow-lg ${toast.type === 'success' ? 'bg-black text-white' : 'bg-red-500 text-white'}`}>
          {toast.type === 'success' ? '✅' : '❌'} {toast.message}
        </div>
      )}
    </div>
  )
}