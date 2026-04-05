'use client'
import { useEffect, useState, useRef, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import Link from 'next/link'
import { useWorkspace } from '@/contexts/WorkspaceContext'
import {
  DndContext, closestCenter, PointerSensor, TouchSensor,
  useSensor, useSensors, DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext, verticalListSortingStrategy,
  useSortable, arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

function SkeletonBox({ className }: { className?: string }) {
  return <div className={`bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse ${className}`} />
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

function groupByDate(posts: any[]) {
  const groups: Record<string, any[]> = {}
  posts.forEach(post => {
    const date = post.scheduled_at ? new Date(post.scheduled_at).toDateString() : 'Unscheduled'
    if (!groups[date]) groups[date] = []
    groups[date].push(post)
  })
  return groups
}

function formatDateLabel(dateStr: string) {
  if (dateStr === 'Unscheduled') return 'Unscheduled'
  const date     = new Date(dateStr)
  const today    = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)
  if (date.toDateString() === today.toDateString())    return 'Today'
  if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow'
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}

function dateParamToDateString(param: string): string | null {
  if (!param) return null
  const d = new Date(param + 'T12:00:00')
  if (isNaN(d.getTime())) return null
  return d.toDateString()
}

function SortablePostCard({ post, isHighlighted, confirmCancel, setConfirmCancel, cancelling, handleCancel, onEvergreenToggle }: {
  post: any
  isHighlighted: boolean
  confirmCancel: string | null
  setConfirmCancel: (id: string | null) => void
  cancelling: string | null
  handleCancel: (id: string) => void
  onEvergreenToggle: (id: string, current: boolean) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: post.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex:  isDragging ? 50 : undefined,
  }

  const isConfirming = confirmCancel === post.id
  const isCancelling = cancelling   === post.id
  const [evergreenLoading, setEvergreenLoading] = useState(false)

  return (
    <div ref={setNodeRef} style={style}
      className={`bg-surface border rounded-2xl p-4 md:p-5 transition-all ${
        isDragging    ? 'shadow-xl border-gray-300'  :
        isHighlighted ? 'border-blue-100 hover:border-blue-300' :
        'border-theme hover:border-gray-300'
      }`}>
      <div className="flex items-start gap-3">

        {/* Drag handle */}
        <button
          {...attributes} {...listeners}
          className="flex-shrink-0 mt-1 text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400 cursor-grab active:cursor-grabbing touch-none px-0.5 py-1 rounded select-none"
          aria-label="Drag to reorder">
          <svg width="10" height="16" viewBox="0 0 10 16" fill="currentColor">
            <circle cx="2" cy="2"  r="1.5" /><circle cx="8" cy="2"  r="1.5" />
            <circle cx="2" cy="8"  r="1.5" /><circle cx="8" cy="8"  r="1.5" />
            <circle cx="2" cy="14" r="1.5" /><circle cx="8" cy="14" r="1.5" />
          </svg>
        </button>

        <div className="flex-1 min-w-0">
          {post.scheduled_at && (
            <div className="mb-2">
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                {new Date(post.scheduled_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          )}
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed line-clamp-2 mb-3">
            {post.content || <span className="text-gray-300 dark:text-gray-600 italic">No content</span>}
          </p>
          <div className="flex items-center gap-1.5 flex-wrap">
            {(post.platforms || []).map((p: string) => (
              <span key={p} className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                <span>{PLATFORM_ICONS[p] || '📱'}</span>
                <span className="hidden sm:inline">{PLATFORM_NAMES[p] || p}</span>
              </span>
            ))}
          </div>

          {post.analytics && (() => {
            const allPlatforms = ['bluesky', 'mastodon'].filter(p => post.analytics[p])
            if (allPlatforms.length === 0) return null
            const totals = allPlatforms.reduce((acc: { likes: number; replies: number; reposts: number }, p: string) => ({
              likes:   acc.likes   + (post.analytics[p]?.likes   ?? 0),
              replies: acc.replies + (post.analytics[p]?.replies ?? 0),
              reposts: acc.reposts + (post.analytics[p]?.reposts ?? 0),
            }), { likes: 0, replies: 0, reposts: 0 })
            if (totals.likes === 0 && totals.replies === 0 && totals.reposts === 0) return null
            return (
              <div className="text-xs text-gray-400 dark:text-gray-500 flex gap-3 mt-2">
                <span>❤️ {totals.likes}</span>
                <span>💬 {totals.replies}</span>
                <span>🔄 {totals.reposts}</span>
              </div>
            )
          })()}
        </div>

        {!isConfirming && (
          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 flex-shrink-0">
            {post.status === 'published' && (
              <button
                onClick={async () => {
                  setEvergreenLoading(true)
                  await onEvergreenToggle(post.id, !!post.is_evergreen)
                  setEvergreenLoading(false)
                }}
                disabled={evergreenLoading}
                title={post.is_evergreen ? 'Disable evergreen recycling' : 'Enable evergreen recycling'}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all disabled:opacity-50 flex items-center gap-1 ${
                  post.is_evergreen
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700 text-green-700 dark:text-green-400 hover:border-green-500'
                    : 'border-gray-200 dark:border-gray-600 text-gray-400 hover:border-gray-400 hover:text-gray-600'
                }`}>
                {evergreenLoading
                  ? <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  : '♻️'}
                <span>Evergreen</span>
              </button>
            )}
            <Link href={`/compose?draft=${post.id}`}
              className="text-xs font-bold px-3 py-1.5 border border-gray-200 dark:border-gray-600 rounded-xl hover:border-gray-400 transition-all">
              Edit
            </Link>
            <button onClick={() => setConfirmCancel(post.id)}
              className="text-xs font-bold px-3 py-1.5 border border-red-200 text-red-400 rounded-xl hover:border-red-400 transition-all">
              Unschedule
            </button>
          </div>
        )}
      </div>

      {isConfirming && (
        <div className="mt-3 pt-3 border-t border-theme flex flex-col sm:flex-row sm:items-center gap-2">
          <p className="text-xs text-red-600 font-semibold flex-1">Move this post back to drafts?</p>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={() => handleCancel(post.id)} disabled={isCancelling}
              className="text-xs font-bold px-3 py-1.5 bg-red-500 text-white rounded-xl hover:opacity-80 transition-all disabled:opacity-50 flex items-center gap-1.5">
              {isCancelling
                ? <><div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />Moving...</>
                : 'Yes, unschedule'}
            </button>
            <button onClick={() => setConfirmCancel(null)}
              className="text-xs font-bold px-3 py-1.5 border border-gray-200 dark:border-gray-600 rounded-xl hover:border-gray-400 transition-all">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function QueueInner() {
  const [posts, setPosts]               = useState<any[]>([])
  const [loading, setLoading]           = useState(true)
  const [cancelling, setCancelling]     = useState<string | null>(null)
  const [confirmCancel, setConfirmCancel] = useState<string | null>(null)
  const [toast, setToast]               = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const router      = useRouter()
  const searchParams = useSearchParams()
  const targetDate  = searchParams.get('date')
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const { activeWorkspace } = useWorkspace()

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor,   { activationConstraint: { delay: 200, tolerance: 5 } }),
  )

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleDragEnd = async (event: DragEndEvent, dateKey: string) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const dayPosts = [...(grouped[dateKey] || [])].sort(
      (a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
    )
    const oldIdx = dayPosts.findIndex(p => p.id === active.id)
    const newIdx = dayPosts.findIndex(p => p.id === over.id)
    if (oldIdx === -1 || newIdx === -1) return

    // The sorted times stay fixed; only the assignment changes
    const sortedTimes = dayPosts.map(p => p.scheduled_at)
    const reordered   = arrayMove(dayPosts, oldIdx, newIdx)

    // Build DB updates for posts whose time actually changed
    const updates: Array<{ id: string; scheduled_at: string }> = []
    reordered.forEach((post, i) => {
      if (post.scheduled_at !== sortedTimes[i]) {
        updates.push({ id: post.id, scheduled_at: sortedTimes[i] })
      }
    })
    if (updates.length === 0) return

    // Optimistic local update
    setPosts(prev => {
      const map = Object.fromEntries(updates.map(u => [u.id, u.scheduled_at]))
      return prev
        .map(p => map[p.id] ? { ...p, scheduled_at: map[p.id] } : p)
        .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())
    })

    // Persist to DB
    await Promise.all(
      updates.map(u =>
        supabase.from('posts').update({ scheduled_at: u.scheduled_at }).eq('id', u.id)
      )
    )
  }

  // Reload posts when active workspace changes
  useEffect(() => {
    if (!activeWorkspace) return
    setLoading(true)

    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      let queueQuery = supabase
        .from('posts')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'scheduled')
        .gte('scheduled_at', new Date().toISOString())
        .order('scheduled_at', { ascending: true })

      // Only filter by workspace for client workspaces; personal shows all
      if (!activeWorkspace.is_personal) {
        queueQuery = queueQuery.eq('workspace_id', activeWorkspace.id)
      }

      const { data } = await queueQuery

      setPosts(data || [])
      setLoading(false)
    }
    load()
  }, [router, activeWorkspace?.id])

  // Auto-scroll to target date after posts load
  useEffect(() => {
    if (loading || !targetDate) return
    const targetDateString = dateParamToDateString(targetDate)
    if (!targetDateString) return
    const timeout = setTimeout(() => {
      const el = sectionRefs.current[targetDateString]
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
    return () => clearTimeout(timeout)
  }, [loading, targetDate])

  const handleEvergreenToggle = async (id: string, current: boolean) => {
    const { data: { session } } = await supabase.auth.getSession()
    const token = session?.access_token
    const res = await fetch(`/api/posts/${id}/evergreen`, {
      method: 'PATCH',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    if (res.ok) {
      const updated = await res.json()
      setPosts(prev => prev.map(p => p.id === id ? { ...p, is_evergreen: updated.is_evergreen } : p))
      showToast(updated.is_evergreen ? 'Marked as evergreen' : 'Evergreen disabled', 'success')
    } else {
      showToast('Failed to update evergreen status', 'error')
    }
  }

  const handleCancel = async (id: string) => {
    setCancelling(id)
    const { error } = await supabase
      .from('posts')
      .update({ status: 'draft', scheduled_at: null })
      .eq('id', id)
    if (error) { showToast('Failed to unschedule', 'error'); setCancelling(null); return }
    setPosts(prev => prev.filter(p => p.id !== id))
    setConfirmCancel(null)
    showToast('Moved back to drafts', 'success')
    setCancelling(null)
  }

  const grouped  = groupByDate(posts)
  const dateKeys = Object.keys(grouped).sort((a, b) => {
    if (a === 'Unscheduled') return 1
    if (b === 'Unscheduled') return -1
    return new Date(a).getTime() - new Date(b).getTime()
  })

  const daysWithPosts     = dateKeys.filter(k => k !== 'Unscheduled').length
  const targetDateString  = targetDate ? dateParamToDateString(targetDate) : null

  return (
    <div className="min-h-dvh bg-theme flex">
      <Sidebar />
      <div className="md:ml-56 flex-1 p-4 md:p-8">
        <div className="max-w-3xl mx-auto">

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">Upcoming Queue</h1>
              <p className="text-sm text-gray-400 mt-0.5">
                {loading ? 'Loading...' : `${posts.length} post${posts.length !== 1 ? 's' : ''} scheduled${daysWithPosts > 0 ? ` across ${daysWithPosts} day${daysWithPosts !== 1 ? 's' : ''}` : ''}`}
                {activeWorkspace && !activeWorkspace.is_personal && (
                  <span className="ml-2 text-purple-500 font-semibold">· {activeWorkspace.client_name || activeWorkspace.name}</span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              {targetDate && (
                <Link href="/queue"
                  className="text-xs font-bold px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl hover:border-gray-400 transition-all">
                  ← All days
                </Link>
              )}
              <Link href="/compose"
                className="bg-black text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:opacity-80 transition-all">
                + Schedule Post
              </Link>
            </div>
          </div>

          {/* X / Twitter callout banner */}
          <Link href="/compose?platform=twitter"
            className="flex items-center justify-between gap-3 mb-4 bg-sky-50 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-900 rounded-2xl px-5 py-3 hover:border-sky-300 dark:hover:border-sky-700 transition-all group">
            <div className="flex items-center gap-2.5">
              <span className="text-lg">🐦</span>
              <p className="text-xs font-semibold text-sky-700 dark:text-sky-400">
                <span className="font-extrabold">New: Post to X</span> — schedule tweets alongside your other platforms
              </p>
            </div>
            <span className="text-xs font-bold text-sky-500 dark:text-sky-400 group-hover:text-sky-700 dark:group-hover:text-sky-300 flex-shrink-0 hidden sm:block">
              Schedule a tweet →
            </span>
          </Link>

          {targetDate && targetDateString && (
            <div className="mb-6 bg-blue-50 border border-blue-100 rounded-2xl px-5 py-3 flex items-center gap-3">
              <span className="text-blue-500">📅</span>
              <p className="text-xs font-semibold text-blue-700">
                Showing schedule for{' '}
                <span className="font-extrabold">
                  {new Date(targetDate + 'T12:00:00').toLocaleDateString('en-US', {
                    weekday: 'long', month: 'long', day: 'numeric',
                  })}
                </span>
              </p>
            </div>
          )}

          {!loading && posts.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { label: 'Scheduled',  value: posts.length,  icon: '📅' },
                { label: 'Days Ahead', value: daysWithPosts, icon: '🗓️' },
                { label: 'Platforms',  value: new Set(posts.flatMap(p => p.platforms || [])).size, icon: '📱' },
              ].map(stat => (
                <div key={stat.label} className="bg-surface border border-theme rounded-2xl p-4 text-center">
                  <div className="text-xl mb-1">{stat.icon}</div>
                  <p className="text-xl font-extrabold">{stat.value}</p>
                  <p className="text-xs text-gray-400 font-semibold mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          )}

          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <SkeletonBox key={i} className="h-24" />)}
            </div>
          ) : posts.length === 0 ? (
            <div className="bg-surface border border-theme rounded-2xl p-12 text-center">
              <div className="text-4xl mb-3">📅</div>
              <p className="text-sm font-bold mb-1">Your queue is empty</p>
              <p className="text-xs text-gray-400 mb-5">Schedule posts and they'll line up here, grouped by day.</p>
              <Link href="/compose"
                className="inline-block bg-black text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:opacity-80 transition-all">
                Schedule your first post →
              </Link>
            </div>
          ) : (
            <div className="space-y-8">
              {dateKeys.map(dateKey => {
                const isHighlighted = targetDateString === dateKey
                return (
                  <div
                    key={dateKey}
                    ref={el => { sectionRefs.current[dateKey] = el }}
                    className={`scroll-mt-8 rounded-2xl transition-all ${isHighlighted ? 'ring-2 ring-blue-300 ring-offset-2' : ''}`}>
                    <div className="flex items-center gap-3 mb-3 px-1">
                      <p className={`text-xs font-extrabold uppercase tracking-widest ${isHighlighted ? 'text-blue-600' : 'text-gray-900 dark:text-gray-100'}`}>
                        {formatDateLabel(dateKey)}
                        {isHighlighted && <span className="ml-2 text-blue-400 normal-case tracking-normal font-semibold">← from calendar</span>}
                      </p>
                      <div className="flex-1 h-px bg-gray-100 dark:bg-gray-800" />
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {grouped[dateKey].length} post{grouped[dateKey].length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={e => handleDragEnd(e, dateKey)}>
                      <SortableContext
                        items={grouped[dateKey].map(p => p.id)}
                        strategy={verticalListSortingStrategy}>
                        <div className="space-y-3">
                          {grouped[dateKey].map(post => (
                            <SortablePostCard
                              key={post.id}
                              post={post}
                              isHighlighted={isHighlighted}
                              confirmCancel={confirmCancel}
                              setConfirmCancel={setConfirmCancel}
                              cancelling={cancelling}
                              handleCancel={handleCancel}
                              onEvergreenToggle={handleEvergreenToggle}
                            />
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>
                  </div>
                )
              })}
            </div>
          )}

          {!loading && posts.length > 0 && (
            <div className="mt-8 bg-black rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-white">
              <div>
                <p className="text-sm font-extrabold mb-0.5">Schedule more content at once</p>
                <p className="text-xs text-gray-400">Use the Bulk Scheduler to plan a full week in one session.</p>
              </div>
              <Link href="/bulk-scheduler"
                className="flex-shrink-0 bg-white text-black text-xs font-bold px-4 py-2.5 rounded-xl hover:opacity-80 transition-all self-start sm:self-auto">
                Open Bulk Scheduler →
              </Link>
            </div>
          )}

        </div>
      </div>

      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl text-sm font-semibold shadow-lg ${
          toast.type === 'success' ? 'bg-black text-white' : 'bg-red-500 text-white'
        }`}>
          {toast.type === 'success' ? '✅' : '❌'} {toast.message}
        </div>
      )}
    </div>
  )
}

export default function Queue() {
  return (
    <Suspense fallback={
      <div className="min-h-dvh bg-theme flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black" />
      </div>
    }>
      <QueueInner />
    </Suspense>
  )
}