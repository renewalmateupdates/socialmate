'use client'
import { useEffect, useState, useCallback, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import Link from 'next/link'
import { useWorkspace } from '@/contexts/WorkspaceContext'
import { useI18n } from '@/contexts/I18nContext'

const EDITABLE_PLATFORMS = [
  { id: 'discord',   name: 'Discord',   icon: '💬', limit: 2000  },
  { id: 'bluesky',   name: 'Bluesky',   icon: '🦋', limit: 300   },
  { id: 'telegram',  name: 'Telegram',  icon: '✈️', limit: 4096  },
  { id: 'mastodon',  name: 'Mastodon',  icon: '🐘', limit: 500   },
  { id: 'twitter',   name: 'X',         icon: '🐦', limit: 280   },
  { id: 'linkedin',  name: 'LinkedIn',  icon: '💼', limit: 3000  },
  { id: 'youtube',   name: 'YouTube',   icon: '▶️', limit: 5000  },
  { id: 'pinterest', name: 'Pinterest', icon: '📌', limit: 500   },
  { id: 'reddit',    name: 'Reddit',    icon: '🤖', limit: 40000 },
]

function toLocalDatetimeValue(isoString: string | null): string {
  if (!isoString) return ''
  const d = new Date(isoString)
  // Format as YYYY-MM-DDTHH:mm for datetime-local input
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

type EditState = {
  content: string
  platforms: string[]
  scheduled_at: string // local datetime-local value
  saving: boolean
}

function SkeletonBox({ className }: { className?: string }) {
  return <div className={`bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse ${className}`} />
}

function tagColorDrafts(tag: string): string {
  const COLORS = ['#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444', '#f97316', '#06b6d4', '#ec4899']
  let hash = 0
  for (let i = 0; i < tag.length; i++) hash = tag.charCodeAt(i) + ((hash << 5) - hash)
  return COLORS[Math.abs(hash) % COLORS.length]
}

const PLATFORM_ICONS: Record<string, string> = {
  instagram: '📸', twitter: '🐦', linkedin: '💼', tiktok: '🎵',
  facebook: '📘', pinterest: '📌', youtube: '▶️', threads: '🧵',
  bluesky: '🦋', reddit: '🤖', discord: '💬', telegram: '✈️',
  mastodon: '🐘', snapchat: '👻', lemon8: '🍋', bereal: '📷',
}

const PLATFORM_NAMES: Record<string, string> = {
  discord: 'Discord', bluesky: 'Bluesky', telegram: 'Telegram', mastodon: 'Mastodon',
  linkedin: 'LinkedIn', youtube: 'YouTube', pinterest: 'Pinterest', reddit: 'Reddit',
  instagram: 'Instagram', twitter: 'Twitter/X', tiktok: 'TikTok', facebook: 'Facebook',
  threads: 'Threads', snapchat: 'Snapchat', lemon8: 'Lemon8', bereal: 'BeReal',
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1)  return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)  return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7)  return `${days}d ago`
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

type FilterType = 'all' | 'draft' | 'scheduled' | 'published' | 'partial'

function DraftsInner() {
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const initialFilter = (searchParams.get('filter') as FilterType | null) ?? 'all'
  const [filter, setFilter] = useState<FilterType>(initialFilter)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  // Inline edit state: maps post.id -> EditState
  const [editMap, setEditMap] = useState<Record<string, EditState>>({})
  const router = useRouter()
  const { activeWorkspace } = useWorkspace()
  const { t } = useI18n()

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const loadPosts = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    let query = supabase
      .from('posts')
      .select('*')
      .eq('user_id', user.id)
      .in('status', ['draft', 'scheduled', 'published', 'partial', 'failed'])
      .order('created_at', { ascending: false })
    // Only filter by workspace_id for client (non-personal) workspaces
    // Personal workspace shows ALL user posts regardless of workspace_id
    if (activeWorkspace && !activeWorkspace.is_personal) {
      query = query.eq('workspace_id', activeWorkspace.id)
    }
    const { data } = await query
    setPosts(data || [])
    setLoading(false)
  }

  // Reload when active workspace changes
  useEffect(() => {
    if (activeWorkspace) {
      setLoading(true)
      loadPosts()
    }
  }, [activeWorkspace?.id])

  useEffect(() => {
    loadPosts()

    // Realtime subscription — auto-update when post status changes
    const channel = supabase
      .channel('posts-status')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'posts' },
        (payload) => {
          setPosts(prev =>
            prev.map(p => p.id === payload.new.id ? { ...p, ...payload.new } : p)
          )
        }
      )
      .subscribe((status, err) => {
      if (err) console.error('Realtime posts-status error:', err)
    })

    // Auto-refresh every 30s when there are past-due scheduled posts
    const interval = setInterval(async () => {
      const now = new Date().toISOString()
      setPosts(prev => {
        const hasPastDueScheduled = prev.some(
          p => p.status === 'scheduled' && p.scheduled_at && p.scheduled_at <= now
        )
        if (hasPastDueScheduled) loadPosts()
        return prev
      })
    }, 30_000)

    return () => {
      supabase.removeChannel(channel)
      clearInterval(interval)
    }
  }, [router])

  const handleRefresh = () => {
    setLoading(true)
    loadPosts()
  }

  const openEdit = useCallback((post: any) => {
    setEditMap(prev => ({
      ...prev,
      [post.id]: {
        content: post.content || '',
        platforms: Array.from(post.platforms || []),
        scheduled_at: toLocalDatetimeValue(post.scheduled_at),
        saving: false,
      },
    }))
    setConfirmDelete(null)
  }, [])

  const closeEdit = useCallback((id: string) => {
    setEditMap(prev => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }, [])

  const updateEditField = useCallback((id: string, field: keyof Omit<EditState, 'saving'>, value: any) => {
    setEditMap(prev => {
      if (!prev[id]) return prev
      return { ...prev, [id]: { ...prev[id], [field]: value } }
    })
  }, [])

  const toggleEditPlatform = useCallback((id: string, platformId: string) => {
    setEditMap(prev => {
      if (!prev[id]) return prev
      const current = prev[id].platforms
      const next = current.includes(platformId)
        ? current.filter(p => p !== platformId)
        : [...current, platformId]
      return { ...prev, [id]: { ...prev[id], platforms: next } }
    })
  }, [])

  const saveEdit = useCallback(async (postId: string) => {
    const es = editMap[postId]
    if (!es) return
    setEditMap(prev => ({ ...prev, [postId]: { ...prev[postId], saving: true } }))

    // Convert local datetime-local value back to ISO
    let scheduledAtIso: string | null = null
    if (es.scheduled_at) {
      scheduledAtIso = new Date(es.scheduled_at).toISOString()
    }

    const { error } = await supabase
      .from('posts')
      .update({
        content: es.content,
        platforms: es.platforms,
        scheduled_at: scheduledAtIso,
        updated_at: new Date().toISOString(),
      })
      .eq('id', postId)

    if (error) {
      showToast('Failed to save changes', 'error')
      setEditMap(prev => ({ ...prev, [postId]: { ...prev[postId], saving: false } }))
      return
    }

    setPosts(prev => prev.map(p => p.id === postId
      ? { ...p, content: es.content, platforms: es.platforms, scheduled_at: scheduledAtIso }
      : p
    ))
    showToast('Post updated', 'success')
    closeEdit(postId)
  }, [editMap, closeEdit])

  const handleDelete = async (id: string) => {
    setDeleting(id)
    const { error } = await supabase.from('posts').delete().eq('id', id)
    if (error) { showToast('Failed to delete', 'error'); setDeleting(null); return }
    setPosts(prev => prev.filter(d => d.id !== id))
    setConfirmDelete(null)
    showToast('Deleted successfully', 'success')
    setDeleting(null)
  }

  // A "failed" post that has platform_post_ids is actually published — treat as published
  const effectiveStatus = (p: any) =>
    p.status === 'failed' && p.platform_post_ids && Object.keys(p.platform_post_ids).length > 0
      ? 'published'
      : p.status

  const draftCount     = posts.filter(d => effectiveStatus(d) === 'draft').length
  const scheduledCount = posts.filter(d => effectiveStatus(d) === 'scheduled').length
  const publishedCount = posts.filter(d => ['published', 'partial'].includes(effectiveStatus(d))).length
  const failedCount    = posts.filter(d => effectiveStatus(d) === 'failed').length

  const filtered = filter === 'all'       ? posts :
                   filter === 'published' ? posts.filter(d => ['published', 'partial'].includes(effectiveStatus(d))) :
                   filter === 'partial'   ? posts.filter(d => effectiveStatus(d) === 'partial') :
                   posts.filter(d => effectiveStatus(d) === filter)

  const statusConfig: Record<string, { label: string; bg: string; text: string; icon: string }> = {
    draft:     { label: t('app_common.status_draft'),      bg: 'bg-gray-100 dark:bg-gray-800',   text: 'text-gray-500 dark:text-gray-400',   icon: '📂' },
    scheduled: { label: t('app_common.status_scheduled'),  bg: 'bg-blue-100',   text: 'text-blue-600',   icon: '📅' },
    published: { label: t('app_common.status_published'),  bg: 'bg-green-100',  text: 'text-green-700',  icon: '✅' },
    partial:   { label: t('app_common.status_partial'),    bg: 'bg-yellow-100', text: 'text-yellow-700', icon: '⚠️' },
    failed:    { label: t('app_common.status_failed'),     bg: 'bg-red-100',    text: 'text-red-600',    icon: '❌' },
  }

  return (
    <div className="min-h-dvh bg-theme flex">
      <Sidebar />
      <div className="md:ml-56 flex-1 p-4 md:p-8">
        <div className="max-w-3xl mx-auto">

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">
                Posts
                {activeWorkspace && !activeWorkspace.is_personal && (
                  <span className="ml-2 text-sm font-semibold text-purple-500">— {activeWorkspace.client_name || activeWorkspace.name}</span>
                )}
              </h1>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">
                {loading ? 'Loading...' : `${draftCount} draft${draftCount !== 1 ? 's' : ''} · ${scheduledCount} scheduled · ${publishedCount} published`}
              </p>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="text-xs font-bold px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl hover:border-gray-400 transition-all disabled:opacity-40">
                ↻ Refresh
              </button>
              <Link href="/compose"
                className="bg-black text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:opacity-80 transition-all">
                + New Post
              </Link>
            </div>
          </div>

          {/* STATS */}
          {!loading && posts.length > 0 && (
            <div className="grid grid-cols-4 gap-3 mb-6">
              {[
                { label: 'Drafts',    value: draftCount,     icon: '📂', color: 'text-gray-700'  },
                { label: 'Scheduled', value: scheduledCount, icon: '📅', color: 'text-blue-600'  },
                { label: 'Published', value: publishedCount, icon: '✅', color: 'text-green-600' },
                { label: 'Failed',    value: failedCount,    icon: '❌', color: 'text-red-500'   },
              ].map(stat => (
                <div key={stat.label} className="bg-surface border border-theme rounded-2xl p-4 text-center">
                  <div className="text-xl mb-1">{stat.icon}</div>
                  <p className={`text-xl font-extrabold ${stat.color}`}>{stat.value}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 font-semibold mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          )}

          {/* FILTER TABS */}
          <div className="flex items-center gap-1 bg-surface border border-theme rounded-2xl p-1 mb-6 w-fit flex-wrap">
            {[
              { id: 'all',       label: `All (${posts.length})`                                                },
              { id: 'draft',     label: `Drafts (${draftCount})`                                               },
              { id: 'scheduled', label: `Scheduled (${scheduledCount})`                                        },
              { id: 'published', label: `Published (${publishedCount})`                                        },
              ...(posts.some(d => effectiveStatus(d) === 'partial')
                ? [{ id: 'partial', label: `Partial (${posts.filter(d => effectiveStatus(d) === 'partial').length})` }]
                : []
              ),
            ].map(tab => (
              <button key={tab.id} onClick={() => setFilter(tab.id as FilterType)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                  filter === tab.id
                    ? tab.id === 'partial' ? 'bg-amber-500 text-white' : 'bg-black text-white'
                    : 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white'
                }`}>
                {tab.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <SkeletonBox key={i} className="h-24" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-surface border border-theme rounded-2xl p-12 text-center">
              <div className="text-4xl mb-3">📝</div>
              <p className="text-sm font-bold mb-1">No {filter === 'all' ? '' : filter + ' '}posts yet</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-5">
                {filter === 'scheduled' ? 'Schedule a post and it will appear here.' :
                 filter === 'published' ? 'Posts you publish will appear here.' :
                 'Start writing and save as a draft to come back to it later.'}
              </p>
              <Link href="/compose"
                className="inline-block bg-black text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:opacity-80 transition-all">
                Compose a post →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map(post => {
                const isConfirming   = confirmDelete === post.id
                const isDeleting     = deleting === post.id
                const resolvedStatus = effectiveStatus(post)
                const status         = statusConfig[resolvedStatus] || statusConfig.draft
                const isEditable     = ['draft', 'scheduled'].includes(resolvedStatus)
                const isPublished    = ['published', 'partial'].includes(resolvedStatus)
                const editState      = editMap[post.id]
                const isEditing      = !!editState

                return (
                  <div key={post.id}
                    className="bg-surface border border-theme rounded-2xl p-4 md:p-5 hover:border-gray-300 dark:hover:border-gray-600 transition-all">

                    {/* ── Normal card view ── */}
                    {!isEditing && (
                      <div className="flex items-start gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-2">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${status.bg} ${status.text}`}>
                              {status.icon} {status.label}
                            </span>
                            {post.scheduled_at && post.status === 'scheduled' && (
                              <span className="text-xs text-gray-400 dark:text-gray-500">
                                {new Date(post.scheduled_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                {' '}at{' '}
                                {new Date(post.scheduled_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            )}
                            {post.published_at && isPublished && (
                              <span className="text-xs text-gray-400 dark:text-gray-500">
                                {new Date(post.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                {' '}at{' '}
                                {new Date(post.published_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            )}
                            <span className="text-xs text-gray-300 dark:text-gray-600 ml-auto">{timeAgo(post.created_at)}</span>
                          </div>

                          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed line-clamp-2 mb-3">
                            {post.content || <span className="text-gray-300 dark:text-gray-600 italic">No content</span>}
                          </p>

                          <div className="flex items-center gap-1.5 flex-wrap">
                            {(post.platforms || []).slice(0, 6).map((p: string) => (
                              <span key={p} className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                                <span>{PLATFORM_ICONS[p] || '📱'}</span>
                                <span className="hidden sm:inline">{PLATFORM_NAMES[p] || p}</span>
                              </span>
                            ))}
                            {(post.platforms || []).length > 6 && (
                              <span className="text-xs text-gray-400 dark:text-gray-500">+{post.platforms.length - 6} more</span>
                            )}
                            {(!post.platforms || post.platforms.length === 0) && (
                              <span className="text-xs text-gray-300 dark:text-gray-600">No platforms selected</span>
                            )}
                          </div>

                          {/* Per-platform breakdown for partial posts */}
                          {resolvedStatus === 'partial' && (post.platforms || []).length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1.5" aria-label="Per-platform publish result">
                              {(post.platforms as string[]).map((p: string) => {
                                const postIds: Record<string, string> = post.platform_post_ids ?? {}
                                const succeeded = !!postIds[p]
                                return (
                                  <span
                                    key={p}
                                    title={succeeded ? `${PLATFORM_NAMES[p] ?? p} published` : `${PLATFORM_NAMES[p] ?? p} failed`}
                                    className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                      succeeded
                                        ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                        : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                    }`}>
                                    <span>{PLATFORM_ICONS[p] ?? '📱'}</span>
                                    <span className="hidden sm:inline">{PLATFORM_NAMES[p] ?? p}</span>
                                    <span>{succeeded ? '✓' : '✗'}</span>
                                  </span>
                                )
                              })}
                            </div>
                          )}

                          {/* Engagement metrics for published posts */}
                          {isPublished && post.analytics && (() => {
                            const allPlatforms = ['bluesky', 'mastodon'].filter(p => post.analytics[p])
                            if (allPlatforms.length === 0) return null
                            const totals = allPlatforms.reduce((acc: { likes: number; replies: number; reposts: number }, p: string) => ({
                              likes:   acc.likes   + (post.analytics[p]?.likes   ?? 0),
                              replies: acc.replies + (post.analytics[p]?.replies ?? 0),
                              reposts: acc.reposts + (post.analytics[p]?.reposts ?? 0),
                            }), { likes: 0, replies: 0, reposts: 0 })
                            if (totals.likes === 0 && totals.replies === 0 && totals.reposts === 0) return null
                            return (
                              <div
                                title="Stats fetched 1h and 24h after publish"
                                className="text-xs text-gray-400 dark:text-gray-500 flex gap-3 mt-2">
                                <span>❤️ {totals.likes}</span>
                                <span>💬 {totals.replies}</span>
                                <span>🔄 {totals.reposts}</span>
                              </div>
                            )
                          })()}
                        </div>

                        {!isConfirming && (
                          <div className="flex flex-col items-end gap-2 flex-shrink-0">
                            {isEditable && (
                              <button
                                onClick={() => openEdit(post)}
                                className="text-xs font-bold px-3 py-1.5 bg-black text-white rounded-xl hover:opacity-80 transition-all">
                                {t('app_common.edit')}
                              </button>
                            )}
                            <button onClick={() => setConfirmDelete(post.id)}
                              className="text-xs font-bold px-3 py-1.5 border border-red-200 text-red-400 rounded-xl hover:border-red-400 transition-all">
                              {t('app_common.delete')}
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* ── Inline edit form ── */}
                    {isEditing && editState && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">Editing post</span>
                          <button
                            onClick={() => closeEdit(post.id)}
                            className="text-xs font-bold text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                            ✕ Cancel
                          </button>
                        </div>

                        {/* Content textarea */}
                        <div>
                          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 block">Content</label>
                          <textarea
                            value={editState.content}
                            onChange={e => updateEditField(post.id, 'content', e.target.value)}
                            rows={5}
                            className="w-full text-sm rounded-xl px-3 py-2.5 resize-none outline-none transition-all"
                            style={{
                              background: 'var(--bg)',
                              border: '1px solid var(--border-mid)',
                              color: 'var(--text)',
                            }}
                            placeholder="What do you want to say?"
                          />
                          {/* Per-platform character counters */}
                          {editState.platforms.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-1.5">
                              {editState.platforms.map(pid => {
                                const platform = EDITABLE_PLATFORMS.find(p => p.id === pid)
                                if (!platform) return null
                                const len  = editState.content.length
                                const over = len > platform.limit
                                return (
                                  <span
                                    key={pid}
                                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                      over
                                        ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                                        : len > platform.limit * 0.9
                                        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                        : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                                    }`}>
                                    {platform.icon} {len}/{platform.limit}
                                  </span>
                                )
                              })}
                            </div>
                          )}
                        </div>

                        {/* Platform selection */}
                        <div>
                          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 block">Platforms</label>
                          <div className="flex flex-wrap gap-2">
                            {EDITABLE_PLATFORMS.map(platform => {
                              const selected = editState.platforms.includes(platform.id)
                              return (
                                <button
                                  key={platform.id}
                                  type="button"
                                  onClick={() => toggleEditPlatform(post.id, platform.id)}
                                  className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-xl transition-all ${
                                    selected
                                      ? 'bg-black text-white dark:bg-white dark:text-black'
                                      : 'border text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500'
                                  }`}
                                  style={!selected ? { borderColor: 'var(--border-mid)', background: 'var(--bg)' } : {}}>
                                  <span>{platform.icon}</span>
                                  <span>{platform.name}</span>
                                </button>
                              )
                            })}
                          </div>
                        </div>

                        {/* Scheduled time (only for scheduled posts or drafts) */}
                        <div>
                          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 block">
                            Scheduled time <span className="font-normal">(leave blank for draft)</span>
                          </label>
                          <input
                            type="datetime-local"
                            value={editState.scheduled_at}
                            onChange={e => updateEditField(post.id, 'scheduled_at', e.target.value)}
                            className="text-sm rounded-xl px-3 py-2.5 outline-none transition-all"
                            style={{
                              background: 'var(--bg)',
                              border: '1px solid var(--border-mid)',
                              color: 'var(--text)',
                            }}
                          />
                        </div>

                        {/* Save / Cancel */}
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            onClick={() => saveEdit(post.id)}
                            disabled={editState.saving}
                            className="text-xs font-bold px-4 py-2 bg-black text-white rounded-xl hover:opacity-80 transition-all disabled:opacity-50 flex items-center gap-1.5">
                            {editState.saving
                              ? <><div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />{t('app_common.saving')}</>
                              : t('app_common.save')}
                          </button>
                          <button
                            onClick={() => closeEdit(post.id)}
                            className="text-xs font-bold px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl hover:border-gray-400 transition-all"
                            style={{ color: 'var(--text-muted)' }}>
                            {t('app_common.cancel')}
                          </button>
                        </div>
                      </div>
                    )}

                    {isConfirming && !isEditing && (
                      <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center gap-2">
                        <p className="text-xs text-red-600 font-semibold flex-1">
                          Permanently delete this {resolvedStatus === 'scheduled' ? 'scheduled post' : resolvedStatus === 'published' ? 'published post record' : 'draft'}? This cannot be undone.
                        </p>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button onClick={() => handleDelete(post.id)} disabled={isDeleting}
                            className="text-xs font-bold px-3 py-1.5 bg-red-500 text-white rounded-xl hover:opacity-80 transition-all disabled:opacity-50 flex items-center gap-1.5">
                            {isDeleting
                              ? <><div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />{t('app_common.deleting')}</>
                              : t('app_common.confirm')}
                          </button>
                          <button onClick={() => setConfirmDelete(null)}
                            className="text-xs font-bold px-3 py-1.5 border border-gray-200 dark:border-gray-600 rounded-xl hover:border-gray-400 transition-all">
                            {t('app_common.cancel')}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

        </div>
      </div>

      {toast && (
        <div style={{ bottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))' }} className={`fixed right-6 z-50 px-5 py-3 rounded-2xl text-sm font-semibold shadow-lg ${
          toast.type === 'success' ? 'bg-black text-white' : 'bg-red-500 text-white'
        }`}>
          {toast.type === 'success' ? '✅' : '❌'} {toast.message}
        </div>
      )}
    </div>
  )
}

export default function Drafts() {
  return (
    <Suspense fallback={
      <div className="min-h-dvh bg-theme flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black" />
      </div>
    }>
      <DraftsInner />
    </Suspense>
  )
}