'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'

function SkeletonBox({ className }: { className?: string }) {
  return <div className={`bg-gray-100 rounded-xl animate-pulse ${className}`} />
}

type Draft = {
  id: string
  content: string
  platforms: string[]
  scheduled_at: string | null
  status: string
  created_at: string
  updated_at: string
}

const PLATFORM_ICONS: Record<string, string> = {
  instagram: '📸', twitter: '🐦', linkedin: '💼', tiktok: '🎵',
  facebook: '📘', pinterest: '📌', youtube: '▶️', threads: '🧵',
  snapchat: '👻', bluesky: '🦋', reddit: '🤖', discord: '💬',
  telegram: '✈️', mastodon: '🐘', lemon8: '🍋', bereal: '📷', whatsapp: '💚',
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function Drafts() {
  const [user, setUser] = useState<any>(null)
  const [drafts, setDrafts] = useState<Draft[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [sort, setSort] = useState<'newest' | 'oldest' | 'longest' | 'shortest'>('newest')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [preview, setPreview] = useState<Draft | null>(null)
  const [scheduleId, setScheduleId] = useState<string | null>(null)
  const [scheduleTime, setScheduleTime] = useState('')
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [platformFilter, setPlatformFilter] = useState('all')
  const router = useRouter()

  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUser(user)
      const { data } = await supabase
        .from('posts').select('*')
        .eq('user_id', user.id).eq('status', 'draft')
        .order('created_at', { ascending: false })
      setDrafts(data || [])
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
    setDrafts(prev => prev.filter(d => d.id !== id))
    setPreview(null)
    showToast('Draft deleted', 'success')
  }

  const handleBulkDelete = async () => {
    const ids = Array.from(selected)
    await supabase.from('posts').delete().in('id', ids)
    setDrafts(prev => prev.filter(d => !selected.has(d.id)))
    setSelected(new Set())
    showToast(`${ids.length} draft${ids.length !== 1 ? 's' : ''} deleted`, 'success')
  }

  const handleSchedule = async (id: string, time: string) => {
    if (!time) { showToast('Pick a time first', 'error'); return }
    const { error } = await supabase.from('posts')
      .update({ status: 'scheduled', scheduled_at: new Date(time).toISOString() }).eq('id', id)
    if (error) { showToast('Failed to schedule', 'error'); return }
    setDrafts(prev => prev.filter(d => d.id !== id))
    setScheduleId(null); setScheduleTime(''); setPreview(null)
    showToast('Post scheduled!', 'success')
  }

  const handleBulkSchedule = async () => {
    if (!scheduleTime) { showToast('Pick a time first', 'error'); return }
    const ids = Array.from(selected)
    const base = new Date(scheduleTime)
    for (let i = 0; i < ids.length; i++) {
      const t = new Date(base.getTime() + i * 3600000)
      await supabase.from('posts').update({ status: 'scheduled', scheduled_at: t.toISOString() }).eq('id', ids[i])
    }
    setDrafts(prev => prev.filter(d => !selected.has(d.id)))
    setSelected(new Set()); setScheduleTime('')
    showToast(`${ids.length} post${ids.length !== 1 ? 's' : ''} scheduled!`, 'success')
  }

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const allPlatforms = Array.from(new Set(drafts.flatMap(d => d.platforms || [])))

  const sorted = [...drafts].sort((a, b) => {
    if (sort === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    if (sort === 'oldest') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    if (sort === 'longest') return (b.content?.length || 0) - (a.content?.length || 0)
    if (sort === 'shortest') return (a.content?.length || 0) - (b.content?.length || 0)
    return 0
  })

  const filtered = sorted.filter(d => {
    const matchSearch = d.content?.toLowerCase().includes(search.toLowerCase())
    const matchPlatform = platformFilter === 'all' || d.platforms?.includes(platformFilter)
    return matchSearch && matchPlatform
  })

  const toggleSelectAll = () => {
    if (selected.size === filtered.length) setSelected(new Set())
    else setSelected(new Set(filtered.map(d => d.id)))
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />

      <div className="ml-56 flex-1 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">Drafts</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {loading ? 'Loading...' : `${drafts.length} draft${drafts.length !== 1 ? 's' : ''} saved`}
            </p>
          </div>
          <Link href="/compose" className="bg-black text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:opacity-80 transition-all">
            + New Draft
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          {loading ? [1,2,3].map(i => <SkeletonBox key={i} className="h-20 rounded-2xl" />) : (
            [
              { label: 'Total Drafts', value: drafts.length, icon: '📂' },
              { label: 'This Week', value: drafts.filter(d => Date.now() - new Date(d.created_at).getTime() < 7 * 86400000).length, icon: '📅' },
              { label: 'Avg Length', value: drafts.length > 0 ? Math.round(drafts.reduce((s, d) => s + (d.content?.length || 0), 0) / drafts.length) + ' chars' : '—', icon: '✍️' },
            ].map(stat => (
              <div key={stat.label} className="bg-white border border-gray-100 rounded-2xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{stat.label}</span>
                  <span>{stat.icon}</span>
                </div>
                <div className="text-2xl font-extrabold tracking-tight">{stat.value}</div>
              </div>
            ))
          )}
        </div>

        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <div className="relative flex-1 max-w-xs">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
            <input type="text" placeholder="Search drafts..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 bg-white" />
          </div>
          <select value={sort} onChange={e => setSort(e.target.value as any)}
            className="text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-gray-400 bg-white">
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="longest">Longest First</option>
            <option value="shortest">Shortest First</option>
          </select>
          {allPlatforms.length > 0 && (
            <select value={platformFilter} onChange={e => setPlatformFilter(e.target.value)}
              className="text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-gray-400 bg-white">
              <option value="all">All Platforms</option>
              {allPlatforms.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          )}
          <div className="flex items-center gap-1 bg-white border border-gray-100 rounded-xl p-1 ml-auto">
            <button onClick={() => setView('grid')} className={`px-3 py-1.5 rounded-lg text-sm transition-all ${view === 'grid' ? 'bg-black text-white' : 'text-gray-400 hover:text-black'}`}>⊞</button>
            <button onClick={() => setView('list')} className={`px-3 py-1.5 rounded-lg text-sm transition-all ${view === 'list' ? 'bg-black text-white' : 'text-gray-400 hover:text-black'}`}>☰</button>
          </div>
        </div>

        {selected.size > 0 && (
          <div className="bg-black text-white rounded-2xl px-5 py-3 mb-4 flex items-center gap-4">
            <span className="text-sm font-semibold">{selected.size} selected</span>
            <div className="flex items-center gap-2 flex-1">
              <input type="datetime-local" value={scheduleTime} onChange={e => setScheduleTime(e.target.value)}
                className="text-xs px-3 py-1.5 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:border-white/50" />
              <button onClick={handleBulkSchedule} disabled={!scheduleTime}
                className="text-xs font-semibold px-3 py-1.5 bg-white text-black rounded-xl hover:opacity-80 transition-all disabled:opacity-40">📅 Schedule All</button>
              <button onClick={handleBulkDelete}
                className="text-xs font-semibold px-3 py-1.5 bg-red-500 text-white rounded-xl hover:opacity-80 transition-all">🗑️ Delete All</button>
            </div>
            <button onClick={() => setSelected(new Set())} className="text-white/60 hover:text-white text-lg leading-none">×</button>
          </div>
        )}

        {loading ? (
          <div className={view === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
            {[1,2,3,4,5,6].map(i => <SkeletonBox key={i} className="h-40 rounded-2xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-2xl p-16 text-center">
            <div className="text-5xl mb-4">{search ? '🔍' : '📂'}</div>
            <h2 className="text-lg font-bold tracking-tight mb-2">{search ? 'No drafts match your search' : 'No drafts yet'}</h2>
            <p className="text-gray-400 text-sm mb-6 max-w-sm mx-auto">
              {search ? 'Try a different search term.' : 'Start writing and save posts as drafts to work on them later.'}
            </p>
            {!search && (
              <Link href="/compose" className="bg-black text-white text-sm font-semibold px-6 py-3 rounded-xl hover:opacity-80 transition-all">
                Create Your First Draft →
              </Link>
            )}
          </div>
        ) : view === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(draft => (
              <div key={draft.id}
                className={`bg-white border rounded-2xl p-5 flex flex-col gap-3 transition-all group cursor-pointer ${selected.has(draft.id) ? 'border-black ring-2 ring-black ring-offset-1' : 'border-gray-100 hover:border-gray-300'}`}
                onClick={() => setPreview(draft)}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-1 flex-wrap flex-1">
                    {draft.platforms?.slice(0, 4).map(pl => <span key={pl} className="text-sm">{PLATFORM_ICONS[pl] || '📱'}</span>)}
                    {draft.platforms?.length > 4 && <span className="text-xs text-gray-400">+{draft.platforms.length - 4}</span>}
                  </div>
                  <input type="checkbox" checked={selected.has(draft.id)} onChange={() => toggleSelect(draft.id)}
                    onClick={e => e.stopPropagation()}
                    className="w-4 h-4 rounded accent-black cursor-pointer opacity-0 group-hover:opacity-100 transition-all" />
                </div>
                <p className="text-sm text-gray-700 line-clamp-4 flex-1 whitespace-pre-line">{draft.content}</p>
                <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                  <span className="text-xs text-gray-400">{timeAgo(draft.created_at)}</span>
                  <span className="text-xs text-gray-400">{draft.content?.length} chars</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-3 px-4 py-2">
              <input type="checkbox" checked={selected.size === filtered.length && filtered.length > 0}
                onChange={toggleSelectAll} className="w-4 h-4 rounded accent-black cursor-pointer" />
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide flex-1">Content</span>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide w-24">Platforms</span>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide w-20">Length</span>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide w-20">Created</span>
              <span className="w-16"></span>
            </div>
            {filtered.map(draft => (
              <div key={draft.id}
                className={`flex items-center gap-3 px-4 py-3 bg-white rounded-2xl border transition-all group cursor-pointer ${selected.has(draft.id) ? 'border-black ring-1 ring-black' : 'border-gray-100 hover:border-gray-300'}`}
                onClick={() => setPreview(draft)}>
                <input type="checkbox" checked={selected.has(draft.id)} onChange={() => toggleSelect(draft.id)}
                  onClick={e => e.stopPropagation()} className="w-4 h-4 rounded accent-black cursor-pointer flex-shrink-0" />
                <p className="text-sm text-gray-700 flex-1 truncate">{draft.content}</p>
                <div className="flex items-center gap-0.5 w-24 flex-shrink-0">
                  {draft.platforms?.slice(0, 4).map(pl => <span key={pl} className="text-xs">{PLATFORM_ICONS[pl] || '📱'}</span>)}
                  {draft.platforms?.length > 4 && <span className="text-xs text-gray-400">+{draft.platforms.length - 4}</span>}
                </div>
                <span className="text-xs text-gray-400 w-20 flex-shrink-0">{draft.content?.length} chars</span>
                <span className="text-xs text-gray-400 w-20 flex-shrink-0">{timeAgo(draft.created_at)}</span>
                <div className="flex items-center gap-1 w-16 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all">
                  <Link href={`/compose?edit=${draft.id}`} onClick={e => e.stopPropagation()}
                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-black transition-all text-sm">✏️</Link>
                  <button onClick={e => { e.stopPropagation(); handleDelete(draft.id) }}
                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-400 transition-all">×</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {preview && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6" onClick={() => setPreview(null)}>
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div>
                <div className="flex items-center gap-1 flex-wrap mb-1">
                  {preview.platforms?.map(pl => <span key={pl} className="text-base">{PLATFORM_ICONS[pl] || '📱'}</span>)}
                </div>
                <p className="text-xs text-gray-400">{preview.content?.length} chars · {timeAgo(preview.created_at)}</p>
              </div>
              <button onClick={() => setPreview(null)} className="text-gray-400 hover:text-black text-xl leading-none">×</button>
            </div>
            <div className="p-6">
              <div className="bg-gray-50 rounded-xl p-4 mb-4 max-h-60 overflow-y-auto">
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{preview.content}</p>
              </div>
              {scheduleId === preview.id && (
                <div className="flex gap-2">
                  <input type="datetime-local" value={scheduleTime} onChange={e => setScheduleTime(e.target.value)}
                    className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400" />
                  <button onClick={() => handleSchedule(preview.id, scheduleTime)}
                    className="px-4 py-2 bg-black text-white text-sm font-semibold rounded-xl hover:opacity-80 transition-all">Confirm</button>
                  <button onClick={() => { setScheduleId(null); setScheduleTime('') }}
                    className="px-3 py-2 border border-gray-200 rounded-xl text-sm hover:border-gray-400 transition-all">Cancel</button>
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex gap-2">
              <Link href={`/compose?edit=${preview.id}`}
                className="flex-1 py-2.5 text-sm font-semibold border border-gray-200 rounded-xl hover:border-gray-400 transition-all text-center">✏️ Edit</Link>
              <button onClick={() => { setScheduleId(preview.id); setScheduleTime('') }}
                className="flex-1 py-2.5 text-sm font-semibold bg-black text-white rounded-xl hover:opacity-80 transition-all">📅 Schedule</button>
              <button onClick={() => handleDelete(preview.id)}
                className="py-2.5 px-4 text-sm font-semibold text-red-400 border border-red-100 rounded-xl hover:border-red-300 transition-all">🗑️</button>
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