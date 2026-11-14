'use client'
import { useEffect, useState, useRef, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import { setScheduledTime } from '@/lib/post-schedule'
import { countWorkspaceDrafts, deletePosts, loadWorkspacePosts, unschedulePosts } from '@/lib/workspace-posts'
import { useRouter, useSearchParams } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import Link from 'next/link'
import { useWorkspace } from '@/contexts/WorkspaceContext'
import { useI18n } from '@/contexts/I18nContext'
import {
  DndContext, closestCenter, PointerSensor, TouchSensor,
  useSensor, useSensors, DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext, verticalListSortingStrategy,
  useSortable, arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import PostImageExporter from '@/components/PostImageExporter'
import UnsplashCredit from '@/components/UnsplashCredit'
import PlatformIcon, { hasPlatformIcon } from '@/components/landing/PlatformIcon'
import VideoPeek from '@/components/VideoPeek'
import ScheduleTabs from '@/components/ScheduleTabs'
import { AlertTriangle, CalendarClock, CalendarRange, Camera, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, Globe, Heart, Layers, Lock, Megaphone, MessageCircle, Recycle, Repeat, XCircle, Zap } from 'lucide-react'

function PlatformGlyph({ id, size = 14, className = '' }: { id: string; size?: number; className?: string }) {
  if (!hasPlatformIcon(id)) return <Globe size={size} className={className} strokeWidth={1.75} />
  return <PlatformIcon name={id} size={size} className={className} />
}

function SkeletonBox({ className }: { className?: string }) {
  return <div className={`bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse ${className}`} />
}

function tagColorQueue(tag: string): string {
  const COLORS = ['#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444', '#f97316', '#06b6d4', '#ec4899']
  let hash = 0
  for (let i = 0; i < tag.length; i++) hash = tag.charCodeAt(i) + ((hash << 5) - hash)
  return COLORS[Math.abs(hash) % COLORS.length]
}

const PLATFORM_NAMES: Record<string, string> = {
  discord: 'Discord', bluesky: 'Bluesky', telegram: 'Telegram', mastodon: 'Mastodon',
  linkedin: 'LinkedIn', youtube: 'YouTube', pinterest: 'Pinterest', reddit: 'Reddit',
  instagram: 'Instagram', twitter: 'Twitter/X', tiktok: 'TikTok', facebook: 'Facebook',
  threads: 'Threads', snapchat: 'Snapchat', lemon8: 'Lemon8', bereal: 'BeReal',
}

/** Per-platform success/fail chips for partial posts */
function PartialBreakdown({ post }: { post: any }) {
  const postIds: Record<string, string> = post.platform_post_ids ?? {}
  const platforms: string[] = post.platforms ?? []
  if (platforms.length === 0) return null
  return (
    <div className="mt-2 flex flex-wrap gap-1.5" aria-label="Per-platform publish result">
      {platforms.map(p => {
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
            <PlatformGlyph id={p} size={11} />
            <span className="hidden sm:inline">{PLATFORM_NAMES[p] ?? p}</span>
            <span>{succeeded ? '✓' : '✗'}</span>
          </span>
        )
      })}
    </div>
  )
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

function startOfDay(d: Date): Date {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

function addDays(d: Date, n: number): Date {
  const x = new Date(d)
  x.setDate(x.getDate() + n)
  return x
}

// The Queue shows one window of time at a time, so a busy week no longer
// buries the posts after it. The choice is remembered in this browser.
const RANGE_OPTIONS = [
  { key: '7',   label: 'Week',    days: 7 },
  { key: '14',  label: '2 weeks', days: 14 },
  { key: '30',  label: 'Month',   days: 30 },
  { key: 'all', label: 'All',     days: 0 },
] as const
type RangeKey = typeof RANGE_OPTIONS[number]['key']
const RANGE_STORAGE_KEY    = 'sm_queue_range'
const SECTIONS_STORAGE_KEY = 'sm_queue_closed_sections'

function readStorage(key: string): string | null {
  try { return localStorage.getItem(key) } catch { return null }
}
function writeStorage(key: string, value: string) {
  try { localStorage.setItem(key, value) } catch { /* private mode: not remembered */ }
}

function shortDate(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function SortablePostCard({ post, isHighlighted, confirmCancel, setConfirmCancel, cancelling, handleCancel, onEvergreenToggle, isSelected, onToggleSelect, onDuplicate, duplicating }: {
  post: any
  isHighlighted: boolean
  confirmCancel: string | null
  setConfirmCancel: (id: string | null) => void
  cancelling: string | null
  handleCancel: (id: string) => void
  onEvergreenToggle: (id: string, current: boolean) => void
  isSelected: boolean
  onToggleSelect: (id: string) => void
  onDuplicate: (post: any) => void
  duplicating: string | null
}) {
  const { t } = useI18n()
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
        isSelected    ? 'border-amber-400/60 dark:border-amber-500/60 bg-amber-50/30 dark:bg-amber-950/10' :
        isHighlighted ? 'border-blue-100 hover:border-blue-300' :
        'border-theme hover:border-gray-300'
      }`}>
      <div className="flex items-start gap-3">

        {/* Checkbox */}
        <button
          onClick={() => onToggleSelect(post.id)}
          className="flex-shrink-0 mt-1 w-4 h-4 rounded border-2 flex items-center justify-center transition-all cursor-pointer select-none"
          style={{ borderColor: isSelected ? '#f59e0b' : '#9ca3af', backgroundColor: isSelected ? '#f59e0b' : 'transparent' }}
          aria-label={isSelected ? 'Deselect post' : 'Select post'}>
          {isSelected && <svg width="8" height="6" viewBox="0 0 8 6" fill="none"><path d="M1 3l2 2 4-4" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
        </button>

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
            <div className="mb-2 flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-300 px-2 py-0.5 rounded-full">
                {new Date(post.scheduled_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </span>
              {/* Still scheduled, but the last attempt failed and the publisher
                  will try again. Without this it looked like any other post. */}
              {post.platform_errors && Object.keys(post.platform_errors).length > 0 && (
                <span
                  title={Object.entries(post.platform_errors as Record<string, string>).map(([p, e]) => `${PLATFORM_NAMES[p] ?? p}: ${e}`).join('\n')}
                  className="text-xs font-bold text-red-700 bg-red-50 dark:bg-red-900/30 dark:text-red-300 px-2 py-0.5 rounded-full cursor-help">
                  Last try failed, retrying
                </span>
              )}
            </div>
          )}
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed line-clamp-2 mb-2">
            {post.content || <span className="text-gray-300 dark:text-gray-600 italic">No content</span>}
          </p>
          <UnsplashCredit mediaUrls={post.media_urls} size="sm" />
          <div className="flex items-center gap-1.5 flex-wrap mt-3">
            {(post.platforms || []).map((p: string) => (
              <span key={p} className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                <PlatformGlyph id={p} size={12} />
                <span className="hidden sm:inline">{PLATFORM_NAMES[p] || p}</span>
              </span>
            ))}
            {post.is_recurring && (
              <span
                title={`Repeats ${post.recurrence_rule ?? 'on a schedule'}${post.recurrence_end_date ? ` until ${new Date(post.recurrence_end_date).toLocaleDateString()}` : ' forever'}`}
                className="flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-full">
                <Repeat className="w-3 h-3" strokeWidth={2} /> <span className="hidden sm:inline capitalize">{post.recurrence_rule ?? 'Recurring'}</span>
              </span>
            )}
            {/* Campaign posts look like any other post here; say which ones
                they are and link to the campaign (its clicks live there). */}
            {post.metadata?.source === 'campaign' && typeof post.metadata?.campaign_id === 'string' && (
              <Link
                href={`/campaigns/${post.metadata.campaign_id}`}
                title="Made by a campaign. Open it to see all its posts and link clicks."
                className="flex items-center gap-1 text-xs font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-2 py-0.5 rounded-full hover:underline">
                <Megaphone className="w-3 h-3" strokeWidth={2} /> <span className="hidden sm:inline">Campaign</span>
              </Link>
            )}
            {(post.tags || []).map((tag: string) => (
              <span key={tag} className="text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{ background: tagColorQueue(tag) + '22', color: tagColorQueue(tag), border: `1px solid ${tagColorQueue(tag)}66` }}>
                {tag}
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
                <span className="inline-flex items-center gap-1"><Heart className="w-3 h-3" strokeWidth={2} /> {totals.likes}</span>
                <span className="inline-flex items-center gap-1"><MessageCircle className="w-3 h-3" strokeWidth={2} /> {totals.replies}</span>
                <span className="inline-flex items-center gap-1"><Repeat className="w-3 h-3" strokeWidth={2} /> {totals.reposts}</span>
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
                  : <Recycle className="w-3.5 h-3.5" strokeWidth={2} />}
                <span>Evergreen</span>
              </button>
            )}
            {post.mine === false && (
              <span title="Written by someone on your team" className="text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-lg bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                Team
              </span>
            )}
            {/* Compose opens the viewer's own posts, and a teammate's for the owner or an admin. */}
            {post.can_manage !== false && (
              <Link href={`/compose?draft=${post.id}`}
                className="text-xs font-bold px-3 py-1.5 border border-gray-200 dark:border-gray-600 rounded-xl hover:border-gray-400 transition-all">
                {t('app_common.edit')}
              </Link>
            )}
            <button
              onClick={() => onDuplicate(post)}
              disabled={duplicating === post.id}
              title="Duplicate to drafts"
              className="text-xs font-bold px-3 py-1.5 border border-gray-200 dark:border-gray-600 rounded-xl hover:border-blue-400 hover:text-blue-600 dark:hover:border-blue-500 dark:hover:text-blue-400 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
              {duplicating === post.id ? '...' : 'Copy'}
            </button>
            <PostImageExporter
              content={post.content ?? ''}
              platform={(post.platforms ?? [])[0]}
              buttonLabel={<Camera size={13} strokeWidth={2} />}
              buttonClassName="text-xs font-bold px-2.5 py-1.5 border border-gray-200 dark:border-gray-600 rounded-xl hover:border-amber-400 hover:text-amber-600 dark:hover:border-amber-500 dark:hover:text-amber-400 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            />
            {post.can_manage !== false && (
              <button onClick={() => setConfirmCancel(post.id)}
                className="text-xs font-bold px-3 py-1.5 border border-red-200 text-red-400 rounded-xl hover:border-red-400 transition-all">
                {t('app_queue.reschedule')}
              </button>
            )}
          </div>
        )}
      </div>

      {isConfirming && (
        <div className="mt-3 pt-3 border-t border-theme flex flex-col sm:flex-row sm:items-center gap-2">
          <p className="text-xs text-red-600 font-semibold flex-1">{t('app_queue.move_to_drafts')}?</p>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={() => handleCancel(post.id)} disabled={isCancelling}
              className="text-xs font-bold px-3 py-1.5 bg-red-500 text-white rounded-xl hover:opacity-80 transition-all disabled:opacity-50 flex items-center gap-1.5">
              {isCancelling
                ? <><div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />{t('app_common.saving')}</>
                : t('app_queue.reschedule')}
            </button>
            <button onClick={() => setConfirmCancel(null)}
              className="text-xs font-bold px-3 py-1.5 border border-gray-200 dark:border-gray-600 rounded-xl hover:border-gray-400 transition-all">
              {t('app_common.cancel')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// Days offset helpers for bulk reschedule
const RESCHEDULE_OPTIONS: { label: string; days: number }[] = [
  { label: '1 day',   days: 1  },
  { label: '2 days',  days: 2  },
  { label: '3 days',  days: 3  },
  { label: '1 week',  days: 7  },
  { label: '2 weeks', days: 14 },
]

const LIVE_PLATFORMS = ['bluesky', 'discord', 'telegram', 'mastodon', 'twitter', 'tiktok', 'linkedin'] as const
const PLATFORM_FILTER_LABELS: Record<string, string> = {
  bluesky:  'Bluesky',
  discord:  'Discord',
  telegram: 'Telegram',
  mastodon: 'Mastodon',
  twitter:  'X/Twitter',
  tiktok:   'TikTok',
  linkedin: 'LinkedIn',
}

function QueueInner() {
  const [posts, setPosts]               = useState<any[]>([])
  const [partialPosts, setPartialPosts] = useState<any[]>([])
  // TikTok posts live in their own tiktok_posts table, not posts, so a
  // scheduled one never showed up here at all — see lib/tiktok-post-sync.ts
  // for why they still aren't merged into `posts` itself (would collide with
  // the generic scheduled-post pipeline, which has no 'tiktok' case).
  const [tiktokScheduled, setTiktokScheduled] = useState<any[]>([])
  const [cancellingTiktok, setCancellingTiktok] = useState<string | null>(null)
  const [failedPosts, setFailedPosts]   = useState<any[]>([])
  // Range, window and collapsed sections (see RANGE_OPTIONS)
  const [range, setRange]               = useState<RangeKey>('14')
  const [windowStart, setWindowStart]   = useState<Date>(() => startOfDay(new Date()))
  const [windowMoved, setWindowMoved]   = useState(false)
  const [collapsed, setCollapsed]       = useState<Record<string, boolean>>({})
  const [openStat, setOpenStat]         = useState<null | 'scheduled' | 'days' | 'platforms'>(null)
  const [loading, setLoading]           = useState(true)
  const [cancelling, setCancelling]     = useState<string | null>(null)
  const [confirmCancel, setConfirmCancel] = useState<string | null>(null)
  const [toast, setToast]               = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [retrying, setRetrying]         = useState<string | null>(null)
  const [selectedIds, setSelectedIds]   = useState<Set<string>>(new Set())
  const [bulkWorking, setBulkWorking]   = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [duplicating, setDuplicating]   = useState<string | null>(null)
  const [tagFilter, setTagFilter]       = useState<string>('all')
  // Search + platform/status filters
  const [searchQuery, setSearchQuery]       = useState<string>('')
  const [platformFilter, setPlatformFilter] = useState<string>('all')
  // Bulk reschedule
  const [showRescheduleBar, setShowRescheduleBar] = useState(false)
  const [rescheduleOffset, setRescheduleOffset]   = useState<number>(1)
  const router      = useRouter()
  const searchParams = useSearchParams()
  const targetDate  = searchParams.get('date')
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const { activeWorkspace, plan } = useWorkspace()
  const { t } = useI18n()

  // Auto-schedule state
  const [draftCount, setDraftCount]               = useState<number | null>(null)
  const [autoScheduling, setAutoScheduling]       = useState(false)
  const [autoScheduleResult, setAutoScheduleResult] = useState<{ scheduled: number; days: number } | null>(null)
  const [showUpgradeCard, setShowUpgradeCard]     = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor,   { activationConstraint: { delay: 200, tolerance: 5 } }),
  )

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleRetry = async (postId: string) => {
    setRetrying(postId)
    try {
      const res = await fetch(`/api/posts/${postId}/retry`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) {
        showToast(data.error || 'Retry failed', 'error')
      } else {
        showToast(data.status === 'published' ? 'All platforms published!' : 'Partially retried — check results', 'success')
        // A retried post can move between the Failed and Partial lists, or leave both.
        const [updated] = data.status === 'published'
          ? [null]
          : await loadWorkspacePosts('one', activeWorkspace?.id, postId).catch(() => [])
        const place = (list: any[], status: string) => {
          if (updated && updated.status === status) {
            return list.some(p => p.id === postId) ? list.map(p => p.id === postId ? updated : p) : [updated, ...list]
          }
          return list.filter(p => p.id !== postId)
        }
        setFailedPosts(prev => place(prev, 'failed'))
        setPartialPosts(prev => place(prev, 'partial'))
      }
    } catch {
      showToast('Network error — try again', 'error')
    } finally {
      setRetrying(null)
    }
  }

  const handleDuplicate = async (post: any) => {
    setDuplicating(post.id)
    try {
      const res = await fetch('/api/posts/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content:     post.content,
          platforms:   post.platforms,
          workspaceId: post.workspace_id,
          tags:        post.tags?.length > 0 ? post.tags : undefined,
        }),
      })
      if (res.ok) {
        showToast('Duplicated to drafts ✓', 'success')
      } else {
        const d = await res.json()
        showToast(d.error || 'Duplicate failed', 'error')
      }
    } catch {
      showToast('Network error', 'error')
    } finally {
      setDuplicating(null)
    }
  }

  const handleCancelTiktok = async (id: string) => {
    setCancellingTiktok(id)
    try {
      const res = await fetch(`/api/tiktok/scheduled/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        showToast(d.error || 'Could not cancel that post', 'error')
      } else {
        setTiktokScheduled(prev => prev.filter(p => p.id !== id))
        setConfirmCancel(null)
        showToast('Scheduled TikTok post cancelled', 'success')
      }
    } catch {
      showToast('Network error — try again', 'error')
    } finally {
      setCancellingTiktok(null)
    }
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

    // Persist through the API so each moved post gets a wake-up for its new
    // time. Written straight to the table, a post moved earlier waited for the
    // backstop sweep, which GitHub runs every few hours (lib/post-schedule.ts).
    await Promise.all(updates.map(u => setScheduledTime(u.id, u.scheduled_at)))
  }

  // Reload posts when active workspace changes
  useEffect(() => {
    if (!activeWorkspace) return
    setLoading(true)

    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      // Through the API, so an owner sees what their team scheduled too
      // (lib/workspace-posts.ts). RLS hides other authors' rows from the browser.
      try {
        const [queued, partial, failed] = await Promise.all([
          loadWorkspacePosts('queue', activeWorkspace.id),
          loadWorkspacePosts('partial', activeWorkspace.id),
          loadWorkspacePosts('failed', activeWorkspace.id).catch(err => {
            console.warn('[queue] failed-posts load failed:', err)
            return []
          }),
        ])
        setPosts(queued)
        setPartialPosts(partial)
        setFailedPosts(failed)
      } catch (err) {
        console.warn('[queue] load failed:', err)
        showToast('Could not load your queue. Refresh to try again.', 'error')
      }

      // TikTok posts scheduled via TikTok Studio — separate table, separate
      // query, not merged into `posts` (see tiktokScheduled comment above).
      let tiktokQuery = supabase
        .from('tiktok_posts')
        .select('id, post_caption, scheduled_at, video_url')
        .eq('user_id', user.id)
        .eq('status', 'scheduled')
        .order('scheduled_at', { ascending: true })
      if (!activeWorkspace.is_personal) {
        tiktokQuery = tiktokQuery.eq('workspace_id', activeWorkspace.id)
      }
      const { data: tiktokData, error: tiktokError } = await tiktokQuery
      if (tiktokError) console.warn('[queue] tiktok_posts load failed:', tiktokError.message)
      setTiktokScheduled(tiktokData || [])

      // Fetch draft count for auto-schedule button
      setDraftCount(await countWorkspaceDrafts(activeWorkspace.id).catch(() => 0))

      setLoading(false)
    }
    load()
  }, [router, activeWorkspace?.id])

  // The remembered range and closed sections. Read after mount, not in the
  // useState initializers, so the server render and the first client render match.
  useEffect(() => {
    const saved = readStorage(RANGE_STORAGE_KEY)
    if (saved && RANGE_OPTIONS.some(r => r.key === saved)) setRange(saved as RangeKey)
    try {
      const closed = JSON.parse(readStorage(SECTIONS_STORAGE_KEY) || '[]')
      if (Array.isArray(closed)) setCollapsed(Object.fromEntries(closed.map((k: string) => [k, true])))
    } catch { /* ignore a malformed value */ }
  }, [])

  // Open on the window that holds the next posts: today's, or, when that one
  // is empty, the one starting on the day of the next scheduled post. A date
  // from the Calendar (?date=) wins. Stops once the viewer moves the window.
  useEffect(() => {
    if (loading || windowMoved) return
    const today  = startOfDay(new Date())
    const target = targetDate ? new Date(targetDate + 'T12:00:00') : null
    if (target && !isNaN(target.getTime())) { setWindowStart(startOfDay(target)); return }
    const days = RANGE_OPTIONS.find(r => r.key === range)?.days ?? 0
    if (!days) { setWindowStart(today); return }
    const end   = addDays(today, days).getTime()
    const times = [...posts, ...tiktokScheduled]
      .map(p => p.scheduled_at ? new Date(p.scheduled_at).getTime() : NaN)
      .filter(t => !isNaN(t) && t >= today.getTime())
    if (times.length === 0 || times.some(t => t < end)) { setWindowStart(today); return }
    setWindowStart(startOfDay(new Date(Math.min(...times))))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, range, windowMoved, targetDate, posts.length, tiktokScheduled.length])

  const chooseRange = (key: RangeKey) => {
    setRange(key)
    setWindowMoved(false)
    writeStorage(RANGE_STORAGE_KEY, key)
  }

  // Days collapse for this visit; the Failed and Partial sections stay how
  // the viewer left them.
  const toggleCollapsed = (key: string, remember = false) => {
    setCollapsed(prev => {
      const next = { ...prev, [key]: !prev[key] }
      if (remember) {
        writeStorage(SECTIONS_STORAGE_KEY, JSON.stringify(
          ['failed', 'partial'].filter(k => next[k])
        ))
      }
      return next
    })
  }

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
    try {
      await unschedulePosts([id])
    } catch (err) {
      showToast((err as Error).message || 'Failed to unschedule', 'error'); setCancelling(null); return
    }
    setPosts(prev => prev.filter(p => p.id !== id))
    setConfirmCancel(null)
    showToast('Moved back to drafts', 'success')
    setCancelling(null)
  }

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  // What's on screen: the range and filters decide, not the whole queue.
  const selectAll = () => setSelectedIds(new Set(filteredPosts.map(p => p.id)))
  const clearSelection = () => setSelectedIds(new Set())

  const selectDay = (dateKey: string) => {
    const dayIds = (grouped[dateKey] ?? []).map((p: any) => p.id)
    const allSelected = dayIds.every((id: string) => selectedIds.has(id))
    setSelectedIds(prev => {
      const next = new Set(prev)
      dayIds.forEach((id: string) => allSelected ? next.delete(id) : next.add(id))
      return next
    })
  }

  const handleBulkUnschedule = async () => {
    if (!selectedIds.size) return
    setBulkWorking(true)
    const ids = Array.from(selectedIds)
    try {
      const { updated, skipped } = await unschedulePosts(ids)
      const done = new Set(updated)
      setPosts(prev => prev.filter(p => !done.has(p.id)))
      setSelectedIds(new Set())
      showToast(`${updated.length} post${updated.length !== 1 ? 's' : ''} moved to drafts${skipped ? ` (${skipped} you can't change)` : ''}`, 'success')
    } catch (err) {
      showToast((err as Error).message || 'Failed to unschedule some posts', 'error')
    }
    setBulkWorking(false)
  }

  const handleBulkDelete = () => {
    if (!selectedIds.size) return
    setShowDeleteConfirm(true)
  }

  const handleBulkReschedule = async () => {
    if (!selectedIds.size) return
    setBulkWorking(true)
    const { data: { session } } = await supabase.auth.getSession()
    const token = session?.access_token
    const ids = Array.from(selectedIds)
    // Build updated scheduled_at for each post: shift by rescheduleOffset days
    const postsToReschedule = posts.filter(p => selectedIds.has(p.id))
    const results = await Promise.all(
      postsToReschedule.map(async post => {
        const base = post.scheduled_at ? new Date(post.scheduled_at) : new Date()
        base.setDate(base.getDate() + rescheduleOffset)
        const newScheduledAt = base.toISOString()
        const res = await fetch(`/api/posts/${post.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ scheduled_at: newScheduledAt }),
        })
        return { id: post.id, ok: res.ok, scheduled_at: newScheduledAt }
      })
    )
    const succeeded = results.filter(r => r.ok)
    if (succeeded.length > 0) {
      const map = Object.fromEntries(succeeded.map(r => [r.id, r.scheduled_at]))
      setPosts(prev =>
        prev
          .map(p => map[p.id] ? { ...p, scheduled_at: map[p.id] } : p)
          .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())
      )
      setSelectedIds(new Set())
      setShowRescheduleBar(false)
      const label = RESCHEDULE_OPTIONS.find(o => o.days === rescheduleOffset)?.label ?? `${rescheduleOffset} days`
      showToast(`${succeeded.length} post${succeeded.length !== 1 ? 's' : ''} moved forward ${label}`, 'success')
    }
    if (succeeded.length < ids.length) {
      showToast('Some posts could not be rescheduled', 'error')
    }
    setBulkWorking(false)
  }

  const confirmBulkDelete = async () => {
    setShowDeleteConfirm(false)
    setBulkWorking(true)
    const ids = Array.from(selectedIds)
    try {
      const { deleted, skipped } = await deletePosts(ids)
      const done = new Set(deleted)
      setPosts(prev => prev.filter(p => !done.has(p.id)))
      setSelectedIds(new Set())
      showToast(`${deleted.length} post${deleted.length !== 1 ? 's' : ''} deleted${skipped ? ` (${skipped} you can't change)` : ''}`, 'success')
    } catch (err) {
      showToast((err as Error).message || 'Failed to delete some posts', 'error')
    }
    setBulkWorking(false)
  }

  const handleAutoSchedule = async () => {
    if (plan === 'free') { setShowUpgradeCard(true); return }
    setAutoScheduling(true)
    setAutoScheduleResult(null)
    try {
      const res  = await fetch('/api/posts/auto-schedule', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) })
      const data = await res.json()
      if (!res.ok) {
        if (data.error === 'upgrade_required') { setShowUpgradeCard(true); return }
        showToast(data.error || 'Auto-schedule failed', 'error')
        return
      }
      if (data.scheduled === 0) {
        showToast('No drafts to schedule', 'error')
        return
      }
      // Compute how many distinct days were scheduled
      const days = new Set(
        (data.posts as Array<{ id: string; scheduled_at: string }>)
          .map(p => new Date(p.scheduled_at).toDateString())
      ).size
      setAutoScheduleResult({ scheduled: data.scheduled, days })
      setDraftCount(0)
      // Reload queue to show newly scheduled posts
      const refreshed = await loadWorkspacePosts('queue', activeWorkspace?.id).catch(() => null)
      if (refreshed) setPosts(refreshed)
    } catch {
      showToast('Network error — try again', 'error')
    } finally {
      setAutoScheduling(false)
    }
  }

  // Collect all unique tags across all posts
  const allTags = Array.from(new Set(posts.flatMap(p => p.tags || []))) as string[]

  // Determine if any filter is active
  const hasActiveFilter = searchQuery.trim() !== '' || platformFilter !== 'all' || tagFilter !== 'all'
  const hasAnything     = posts.length + tiktokScheduled.length > 0

  // The window on screen (RANGE_OPTIONS). "All" has no end.
  const rangeDays = RANGE_OPTIONS.find(r => r.key === range)?.days ?? 0
  const windowEnd = rangeDays ? addDays(windowStart, rangeDays) : null
  const inWindow  = (iso: string | null | undefined) => {
    if (!iso || !windowEnd) return true
    const t = new Date(iso).getTime()
    return t >= windowStart.getTime() && t < windowEnd.getTime()
  }
  const shiftWindow = (dir: 1 | -1) => {
    if (!rangeDays) return
    setWindowMoved(true)
    setWindowStart(prev => {
      const next  = addDays(prev, dir * rangeDays)
      const today = startOfDay(new Date())
      return next < today ? today : next
    })
  }
  const atFirstWindow = windowStart.getTime() <= startOfDay(new Date()).getTime()

  // Filter posts by window, search, platform and tag before grouping
  const query = searchQuery.trim().toLowerCase()
  const filteredPosts = posts.filter(p => {
    if (!inWindow(p.scheduled_at)) return false
    if (tagFilter !== 'all' && !(p.tags || []).includes(tagFilter)) return false
    if (platformFilter !== 'all' && !(p.platforms || []).includes(platformFilter)) return false
    if (query && !(p.content || '').toLowerCase().includes(query)) return false
    return true
  })

  // TikTok Studio posts join their day in the list, read-only (they live in
  // tiktok_posts, and drag and bulk actions here write to `posts`).
  const filteredTiktok = tiktokScheduled.filter(tp => {
    if (!inWindow(tp.scheduled_at)) return false
    if (tagFilter !== 'all') return false
    if (platformFilter !== 'all' && platformFilter !== 'tiktok') return false
    if (query && !(tp.post_caption || '').toLowerCase().includes(query)) return false
    return true
  })
  const tiktokByDay = groupByDate(filteredTiktok)

  const grouped  = groupByDate(filteredPosts)
  const dateKeys = Array.from(new Set([...Object.keys(grouped), ...Object.keys(tiktokByDay)])).sort((a, b) => {
    if (a === 'Unscheduled') return 1
    if (b === 'Unscheduled') return -1
    return new Date(a).getTime() - new Date(b).getTime()
  })

  const daysWithPosts     = dateKeys.filter(k => k !== 'Unscheduled').length
  const visibleCount      = filteredPosts.length + filteredTiktok.length
  const targetDateString  = targetDate ? dateParamToDateString(targetDate) : null

  // Everything queued, for the header line (not just this window).
  const allDayCount = new Set(
    [...posts, ...tiktokScheduled].filter(p => p.scheduled_at).map(p => new Date(p.scheduled_at).toDateString())
  ).size

  // Summary card details
  const platformCounts: Record<string, number> = {}
  filteredPosts.forEach(p => (p.platforms || []).forEach((pl: string) => { platformCounts[pl] = (platformCounts[pl] ?? 0) + 1 }))
  if (filteredTiktok.length) platformCounts.tiktok = (platformCounts.tiktok ?? 0) + filteredTiktok.length
  const nextUp = [
    ...filteredPosts.map(p => ({ id: p.id, at: p.scheduled_at as string, text: p.content as string, platforms: (p.platforms || []) as string[] })),
    ...filteredTiktok.map(tp => ({ id: tp.id, at: tp.scheduled_at as string, text: tp.post_caption as string, platforms: ['tiktok'] })),
  ].filter(x => x.at).sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime()).slice(0, 6)

  const openDay = (dateKey: string) => {
    setCollapsed(prev => ({ ...prev, [dateKey]: false }))
    setTimeout(() => sectionRefs.current[dateKey]?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
  }
  const allDaysClosed = dateKeys.length > 0 && dateKeys.every(k => collapsed[k])
  const setAllDays = (closed: boolean) =>
    setCollapsed(prev => ({ ...prev, ...Object.fromEntries(dateKeys.map(k => [k, closed])) }))

  return (
    <div className="min-h-dvh bg-theme flex">
      <Sidebar />
      <div className="md:ml-56 flex-1 p-4 md:p-8">
        <div className="max-w-3xl mx-auto">
          <ScheduleTabs active="list" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">{t('app_queue.title')}</h1>
              <div className="flex items-center gap-3 mt-0.5">
                <p className="text-sm text-gray-400">
                  {loading ? 'Loading...' : (() => {
                    // Both tables: `posts` and TikTok Studio's tiktok_posts.
                    const total = posts.length + tiktokScheduled.length
                    return `${total} post${total !== 1 ? 's' : ''} scheduled${allDayCount > 0 ? ` across ${allDayCount} day${allDayCount !== 1 ? 's' : ''}` : ''}`
                  })()}
                  {activeWorkspace && !activeWorkspace.is_personal && (
                    <span className="ml-2 text-purple-500 font-semibold">· {activeWorkspace.client_name || activeWorkspace.name}</span>
                  )}
                </p>
                {!loading && posts.length > 0 && (
                  selectedIds.size > 0 ? (
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-amber-500">{selectedIds.size} selected</span>
                      <span className="text-gray-300 dark:text-gray-600">·</span>
                      <button
                        onClick={handleBulkUnschedule}
                        disabled={bulkWorking}
                        className="text-xs font-semibold text-gray-500 hover:text-blue-500 transition-colors disabled:opacity-40">
                        {bulkWorking ? t('app_common.saving') : t('app_queue.move_to_drafts')}
                      </button>
                      <span className="text-gray-300 dark:text-gray-600">·</span>
                      <button
                        onClick={handleBulkDelete}
                        disabled={bulkWorking}
                        className="text-xs font-semibold text-red-400 hover:text-red-600 transition-colors disabled:opacity-40">
                        {t('app_common.delete')}
                      </button>
                      <span className="text-gray-300 dark:text-gray-600">·</span>
                      <button
                        onClick={() => setShowRescheduleBar(v => !v)}
                        disabled={bulkWorking}
                        className="text-xs font-semibold text-indigo-500 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors disabled:opacity-40">
                        Reschedule →
                      </button>
                      <span className="text-gray-300 dark:text-gray-600">·</span>
                      <button
                        onClick={clearSelection}
                        className="text-xs font-semibold text-gray-400 hover:text-gray-600 transition-colors">
                        Clear
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={selectAll}
                      className="text-xs font-semibold text-gray-400 hover:text-amber-500 transition-colors">
                      {t('app_queue.select_all')}
                    </button>
                  )
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
              {targetDate && (
                <Link href="/queue"
                  className="text-xs font-bold px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl hover:border-gray-400 transition-all">
                  ← All days
                </Link>
              )}
              {/* Auto-schedule button — Pro/Agency only */}
              {plan === 'free' ? (
                <button
                  onClick={() => setShowUpgradeCard(v => !v)}
                  className="flex items-center gap-1.5 text-xs font-bold px-3 py-2.5 border border-[#1f1f1f] text-[#9ca3af] rounded-xl hover:border-[#F59E0B] hover:text-[#F59E0B] transition-all">
                  <Lock className="w-3.5 h-3.5" strokeWidth={2} /> Auto-schedule Drafts
                </button>
              ) : (
                <button
                  onClick={handleAutoSchedule}
                  disabled={autoScheduling || draftCount === 0}
                  title={draftCount === 0 ? 'No drafts to schedule' : `Auto-schedule ${draftCount} draft${draftCount !== 1 ? 's' : ''}`}
                  className="flex items-center gap-1.5 text-xs font-bold px-3 py-2.5 rounded-xl border border-[#F59E0B] text-[#F59E0B] bg-[#F59E0B]/10 hover:bg-[#F59E0B]/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                  {autoScheduling
                    ? <><div className="w-3 h-3 border-2 border-[#F59E0B]/40 border-t-[#F59E0B] rounded-full animate-spin" />Scheduling...</>
                    : <><Zap className="w-3.5 h-3.5" strokeWidth={2} />Auto-schedule Drafts{draftCount !== null && draftCount > 0 ? ` (${draftCount})` : ''}</>}
                </button>
              )}
              <Link href="/compose"
                className="bg-black text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:opacity-80 transition-all">
                + Schedule Post
              </Link>
            </div>
          </div>

          {/* Range: which stretch of time the list shows */}
          {!loading && hasAnything && (
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1" role="group" aria-label="Date range">
                {RANGE_OPTIONS.map(r => (
                  <button
                    key={r.key}
                    onClick={() => chooseRange(r.key)}
                    aria-pressed={range === r.key}
                    className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${range === r.key ? 'bg-white dark:bg-gray-950 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'}`}>
                    {r.label}
                  </button>
                ))}
              </div>
              {windowEnd && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => shiftWindow(-1)}
                    disabled={atFirstWindow}
                    aria-label="Earlier"
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-theme text-gray-500 hover:border-gray-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                    <ChevronLeft className="w-4 h-4" strokeWidth={2} />
                  </button>
                  <span className="text-xs font-bold text-gray-600 dark:text-gray-300 px-1 tabular-nums">
                    {shortDate(windowStart)} - {shortDate(addDays(windowEnd, -1))}
                  </span>
                  <button
                    onClick={() => shiftWindow(1)}
                    aria-label="Later"
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-theme text-gray-500 hover:border-gray-400 transition-all">
                    <ChevronRight className="w-4 h-4" strokeWidth={2} />
                  </button>
                </div>
              )}
              {dateKeys.length > 1 && (
                <button
                  onClick={() => setAllDays(!allDaysClosed)}
                  className="ml-auto text-xs font-semibold text-gray-400 hover:text-amber-500 transition-colors">
                  {allDaysClosed ? 'Expand all days' : 'Collapse all days'}
                </button>
              )}
            </div>
          )}

          {/* Search input */}
          {!loading && hasAnything && (
            <div className="mb-3">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 w-3.5 h-3.5 pointer-events-none" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search posts..."
                  className="w-full pl-9 pr-8 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors text-base leading-none font-bold">
                    ×
                  </button>
                )}
              </div>
              {searchQuery.trim() && (
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 pl-1">
                  {visibleCount} result{visibleCount !== 1 ? 's' : ''} for &ldquo;{searchQuery.trim()}&rdquo;
                </p>
              )}
            </div>
          )}

          {/* Platform filter */}
          {!loading && hasAnything && (
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={() => setPlatformFilter('all')}
                  className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all ${platformFilter === 'all' ? 'bg-black text-white border-black dark:bg-white dark:text-black' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-400'}`}>
                  All Platforms
                </button>
                {LIVE_PLATFORMS.map(p => {
                  const hasThisPlatform = posts.some(post => (post.platforms || []).includes(p))
                    || (p === 'tiktok' && tiktokScheduled.length > 0)
                  if (!hasThisPlatform) return null
                  return (
                    <button
                      key={p}
                      onClick={() => setPlatformFilter(platformFilter === p ? 'all' : p)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all ${platformFilter === p ? 'bg-black text-white border-black dark:bg-white dark:text-black' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-400'}`}>
                      <span className="inline-flex items-center gap-1"><PlatformGlyph id={p} size={12} /> {PLATFORM_FILTER_LABELS[p]}</span>
                    </button>
                  )
                })}
              </div>
              {/* The status filter that sat here only ever matched "scheduled":
                  this list holds scheduled posts, and failed ones have their own
                  red section below. */}
              {hasActiveFilter && (
                <button
                  onClick={() => { setPlatformFilter('all'); setTagFilter('all'); setSearchQuery('') }}
                  className="text-xs font-semibold text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors ml-1">
                  Clear filters
                </button>
              )}
            </div>
          )}

          {/* Tag filter */}
          {allTags.length > 0 && (
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <span className="text-xs font-bold text-gray-400 dark:text-gray-500">Filter by tag:</span>
              <button
                onClick={() => setTagFilter('all')}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all ${tagFilter === 'all' ? 'bg-black text-white border-black dark:bg-white dark:text-black' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-400'}`}>
                All
              </button>
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => setTagFilter(tagFilter === tag ? 'all' : tag)}
                  className="text-xs font-bold px-3 py-1.5 rounded-xl border transition-all"
                  style={tagFilter === tag
                    ? { background: tagColorQueue(tag), color: '#fff', borderColor: tagColorQueue(tag) }
                    : { background: tagColorQueue(tag) + '22', color: tagColorQueue(tag), borderColor: tagColorQueue(tag) + '66' }}>
                  {tag}
                </button>
              ))}
            </div>
          )}

          {/* Bulk reschedule bar */}
          {showRescheduleBar && selectedIds.size > 0 && (
            <div className="mb-4 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 rounded-2xl px-5 py-3 flex flex-col sm:flex-row sm:items-center gap-3">
              <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 flex-shrink-0">
                Move {selectedIds.size} post{selectedIds.size !== 1 ? 's' : ''} forward by:
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                {RESCHEDULE_OPTIONS.map(opt => (
                  <button
                    key={opt.days}
                    onClick={() => setRescheduleOffset(opt.days)}
                    className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all ${
                      rescheduleOffset === opt.days
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'border-indigo-300 dark:border-indigo-700 text-indigo-600 dark:text-indigo-300 hover:border-indigo-500'
                    }`}>
                    {opt.label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 sm:ml-auto flex-shrink-0">
                <button
                  onClick={handleBulkReschedule}
                  disabled={bulkWorking}
                  className="text-xs font-bold px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all disabled:opacity-50 flex items-center gap-1.5">
                  {bulkWorking
                    ? <><div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />Moving...</>
                    : 'Confirm →'}
                </button>
                <button
                  onClick={() => setShowRescheduleBar(false)}
                  className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 font-semibold transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Auto-schedule success banner */}
          {autoScheduleResult && (
            <div className="mb-4 bg-[#111111] border border-[#F59E0B]/40 rounded-2xl px-5 py-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Zap className="w-[18px] h-[18px] text-[#F59E0B] flex-shrink-0" strokeWidth={2} />
                <p className="text-xs font-semibold text-[#F59E0B]">
                  <span className="font-extrabold">Scheduled {autoScheduleResult.scheduled} post{autoScheduleResult.scheduled !== 1 ? 's' : ''}</span>
                  {' '}across the next {autoScheduleResult.days} day{autoScheduleResult.days !== 1 ? 's' : ''} at optimal times
                </p>
              </div>
              <button
                onClick={() => setAutoScheduleResult(null)}
                className="text-[#9ca3af] hover:text-white transition-colors text-sm font-bold w-6 h-6 flex items-center justify-center flex-shrink-0">
                ×
              </button>
            </div>
          )}

          {/* Free plan upgrade card for auto-schedule */}
          {showUpgradeCard && (
            <div className="mb-4 bg-[#111111] border border-[#1f1f1f] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-[#F59E0B] flex-shrink-0 mt-0.5" strokeWidth={2} />
                <div>
                  <p className="text-sm font-extrabold text-white mb-0.5">Auto-scheduling is a Pro feature</p>
                  <p className="text-xs text-[#9ca3af]">Let SocialMate fill your queue automatically — Pro fills 14 days, Agency fills 30 days at peak engagement times. Upgrade for $8/mo.</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 self-start sm:self-auto">
                <Link href="/pricing"
                  className="text-xs font-bold px-4 py-2.5 bg-[#F59E0B] text-black rounded-xl hover:opacity-90 transition-all whitespace-nowrap">
                  Upgrade to Pro →
                </Link>
                <button
                  onClick={() => setShowUpgradeCard(false)}
                  className="text-[#9ca3af] hover:text-white transition-colors text-sm font-bold w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5">
                  ×
                </button>
              </div>
            </div>
          )}

          {targetDate && targetDateString && (
            <div className="mb-6 bg-blue-50 border border-blue-100 rounded-2xl px-5 py-3 flex items-center gap-3">
              <CalendarClock className="w-4 h-4 text-blue-500 flex-shrink-0" strokeWidth={1.75} />
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

          {/* Failed posts: the last 30 days, in red, with Retry */}
          {!loading && failedPosts.length > 0 && (
            <div className="mb-6 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-2xl p-4">
              <button
                onClick={() => toggleCollapsed('failed', true)}
                aria-expanded={!collapsed.failed}
                className={`w-full flex items-center gap-2 text-left ${collapsed.failed ? '' : 'mb-3'}`}>
                <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" strokeWidth={2} />
                <span className="text-xs font-extrabold text-red-800 dark:text-red-300 uppercase tracking-widest">
                  Failed ({failedPosts.length})
                </span>
                <span className="flex-1 h-px bg-red-200 dark:bg-red-900" />
                <ChevronDown className={`w-4 h-4 text-red-400 transition-transform ${collapsed.failed ? '-rotate-90' : ''}`} strokeWidth={2} />
              </button>
              {!collapsed.failed && (
                <div className="space-y-3">
                  {failedPosts.map(post => {
                    const firstError = Object.values((post.platform_errors ?? {}) as Record<string, string>)[0]
                    return (
                      <div key={post.id} className="bg-white dark:bg-gray-900/60 border border-red-200 dark:border-red-900 rounded-xl p-3">
                        <p className="text-xs text-gray-700 dark:text-gray-300 line-clamp-2 mb-2">
                          {post.content || <span className="italic text-gray-300 dark:text-gray-600">No content</span>}
                        </p>
                        <PartialBreakdown post={post} />
                        {firstError && (
                          <p className="text-[11px] text-red-600 dark:text-red-400 mt-2 line-clamp-2" title={firstError}>
                            {firstError}
                          </p>
                        )}
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-[10px] text-gray-400 dark:text-gray-500">
                            {post.scheduled_at || post.created_at
                              ? new Date(post.scheduled_at || post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                              : ''}
                          </span>
                          <div className="flex items-center gap-3">
                            {post.can_manage !== false && (
                              <button
                                onClick={() => handleRetry(post.id)}
                                disabled={retrying === post.id}
                                className="text-[10px] font-bold text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 transition-colors flex items-center gap-1 disabled:opacity-50 min-h-[32px]">
                                {retrying === post.id
                                  ? <><div className="w-2.5 h-2.5 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />Retrying...</>
                                  : 'Retry →'}
                              </button>
                            )}
                            <Link href="/drafts"
                              className="text-[10px] font-bold text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                              View →
                            </Link>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Partial posts — recent posts that partially failed */}
          {!loading && partialPosts.length > 0 && (
            <div className="mb-6 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4">
              <div className={`flex items-center gap-2 ${collapsed.partial ? '' : 'mb-3'}`}>
                <button
                  onClick={() => toggleCollapsed('partial', true)}
                  aria-expanded={!collapsed.partial}
                  className="flex-1 flex items-center gap-2 text-left">
                  <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" strokeWidth={2} />
                  <span className="text-xs font-extrabold text-amber-800 dark:text-amber-300 uppercase tracking-widest">
                    Partial publishes ({partialPosts.length})
                  </span>
                  <span className="flex-1 h-px bg-amber-200 dark:bg-amber-800" />
                  <ChevronDown className={`w-4 h-4 text-amber-400 transition-transform ${collapsed.partial ? '-rotate-90' : ''}`} strokeWidth={2} />
                </button>
                <Link href="/drafts?filter=partial"
                  className="text-[10px] font-bold text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-200 transition-colors">
                  View all →
                </Link>
              </div>
              {!collapsed.partial && (
              <div className="space-y-3">
                {partialPosts.map(post => (
                  <div key={post.id} className="bg-white dark:bg-gray-900/60 border border-amber-100 dark:border-amber-900 rounded-xl p-3">
                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                      {post.content || <span className="italic text-gray-300 dark:text-gray-600">No content</span>}
                    </p>
                    <PartialBreakdown post={post} />
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[10px] text-gray-400 dark:text-gray-500">
                        {post.published_at
                          ? new Date(post.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                          : post.scheduled_at
                            ? new Date(post.scheduled_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                            : ''}
                      </span>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleRetry(post.id)}
                          disabled={retrying === post.id}
                          className="text-[10px] font-bold text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-200 transition-colors flex items-center gap-1 disabled:opacity-50 min-h-[32px]">
                          {retrying === post.id
                            ? <><div className="w-2.5 h-2.5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />Retrying...</>
                            : 'Retry failed →'}
                        </button>
                        <Link href="/drafts"
                          className="text-[10px] font-bold text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                          View →
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              )}
            </div>
          )}

          {/* Summary cards: they count this window, TikTok included, and each
              opens its details. */}
          {!loading && hasAnything && (
            <div className="mb-6">
              <div className="grid grid-cols-3 gap-3">
                {([
                  { key: 'scheduled', label: 'Scheduled',  value: visibleCount,  icon: CalendarClock },
                  { key: 'days',      label: 'Days',       value: daysWithPosts, icon: CalendarRange },
                  { key: 'platforms', label: 'Platforms',  value: Object.keys(platformCounts).length, icon: Layers },
                ] as const).map(stat => (
                  <button
                    key={stat.key}
                    onClick={() => setOpenStat(openStat === stat.key ? null : stat.key)}
                    aria-expanded={openStat === stat.key}
                    className={`bg-surface border rounded-2xl p-4 text-center transition-all hover:border-gray-400 ${openStat === stat.key ? 'border-amber-400 dark:border-amber-500' : 'border-theme'}`}>
                    <stat.icon className="w-5 h-5 mx-auto mb-1 text-gray-400" strokeWidth={1.75} />
                    <p className="text-xl font-extrabold">{stat.value}</p>
                    <p className="text-xs text-gray-400 font-semibold mt-0.5 inline-flex items-center gap-1">
                      {stat.label}
                      <ChevronDown className={`w-3 h-3 transition-transform ${openStat === stat.key ? 'rotate-180' : ''}`} strokeWidth={2} />
                    </p>
                  </button>
                ))}
              </div>

              {openStat && (
                <div className="mt-3 bg-surface border border-theme rounded-2xl p-4">
                  {openStat === 'scheduled' && (
                    nextUp.length === 0
                      ? <p className="text-xs text-gray-400">Nothing scheduled in this range.</p>
                      : <ul className="space-y-1">
                          <li className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Next up</li>
                          {nextUp.map(item => (
                            <li key={item.id}>
                              <button
                                onClick={() => openDay(new Date(item.at).toDateString())}
                                className="w-full flex items-center gap-2 text-left text-xs py-1.5 px-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/60">
                                <span className="font-bold text-gray-500 dark:text-gray-400 w-28 flex-shrink-0 tabular-nums">
                                  {new Date(item.at).toLocaleString('en-US', { weekday: 'short', hour: 'numeric', minute: '2-digit' })}
                                </span>
                                <span className="flex items-center gap-0.5 flex-shrink-0">
                                  {item.platforms.map(p => <PlatformGlyph key={p} id={p} size={12} />)}
                                </span>
                                <span className="truncate text-gray-700 dark:text-gray-300">{item.text || 'No caption'}</span>
                              </button>
                            </li>
                          ))}
                        </ul>
                  )}
                  {openStat === 'days' && (
                    dateKeys.length === 0
                      ? <p className="text-xs text-gray-400">No days with posts in this range.</p>
                      : <div className="flex flex-wrap gap-2">
                          {dateKeys.map(k => (
                            <button key={k} onClick={() => openDay(k)}
                              className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-theme hover:border-amber-400 transition-all">
                              {formatDateLabel(k)} <span className="text-gray-400">· {(grouped[k]?.length ?? 0) + (tiktokByDay[k]?.length ?? 0)}</span>
                            </button>
                          ))}
                        </div>
                  )}
                  {openStat === 'platforms' && (
                    Object.keys(platformCounts).length === 0
                      ? <p className="text-xs text-gray-400">No platforms in this range.</p>
                      : <div className="flex flex-wrap gap-2">
                          {Object.entries(platformCounts).sort((a, b) => b[1] - a[1]).map(([p, n]) => (
                            <button key={p}
                              onClick={() => setPlatformFilter(platformFilter === p ? 'all' : p)}
                              className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all inline-flex items-center gap-1.5 ${platformFilter === p ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/20' : 'border-theme hover:border-amber-400'}`}>
                              <PlatformGlyph id={p} size={12} /> {PLATFORM_NAMES[p] ?? p} <span className="text-gray-400">· {n}</span>
                            </button>
                          ))}
                        </div>
                  )}
                </div>
              )}
            </div>
          )}

          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <SkeletonBox key={i} className="h-24" />)}
            </div>
          ) : hasAnything && dateKeys.length === 0 ? (
            <div className="bg-surface border border-theme rounded-2xl p-10 text-center">
              <CalendarClock className="w-8 h-8 mx-auto mb-3 text-gray-300 dark:text-gray-600" strokeWidth={1.5} />
              <p className="text-sm font-bold mb-1">{hasActiveFilter ? 'Nothing matches these filters here' : 'Nothing scheduled in this range'}</p>
              <p className="text-xs text-gray-400 mb-5">Your other posts are outside it.</p>
              <button
                onClick={() => { chooseRange('all'); setPlatformFilter('all'); setTagFilter('all'); setSearchQuery('') }}
                className="inline-block bg-black dark:bg-white text-white dark:text-black text-xs font-bold px-5 py-2.5 rounded-xl hover:opacity-80 transition-all">
                Show everything
              </button>
            </div>
          ) : !hasAnything ? (
            <div className="bg-surface border border-theme rounded-2xl p-12 text-center">
              <CalendarClock className="w-10 h-10 mx-auto mb-3 text-gray-300 dark:text-gray-600" strokeWidth={1.5} />
              <p className="text-sm font-bold mb-1">{t('app_queue.empty')}</p>
              <p className="text-xs text-gray-400 mb-5">{t('app_queue.empty_sub')}</p>
              <Link href="/compose"
                className="inline-block bg-black text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:opacity-80 transition-all">
                {t('app_queue.compose_first')}
              </Link>
            </div>
          ) : (
            <div className="space-y-8">
              {dateKeys.map(dateKey => {
                const isHighlighted = targetDateString === dateKey
                const dayPosts      = grouped[dateKey] ?? []
                const dayTiktok     = tiktokByDay[dateKey] ?? []
                const dayCount      = dayPosts.length + dayTiktok.length
                const daySelected   = dayPosts.length > 0 && dayPosts.every((p: any) => selectedIds.has(p.id))
                const isClosed      = !!collapsed[dateKey]
                return (
                  <div
                    key={dateKey}
                    ref={el => { sectionRefs.current[dateKey] = el }}
                    className={`scroll-mt-8 rounded-2xl transition-all ${isHighlighted ? 'ring-2 ring-blue-300 ring-offset-2' : ''}`}>
                    <div className={`flex items-center gap-3 px-1 ${isClosed ? '' : 'mb-3'}`}>
                      {dayPosts.length > 0 ? (
                        <button
                          onClick={() => selectDay(dateKey)}
                          className="flex-shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center transition-all"
                          style={{
                            borderColor: daySelected ? '#f59e0b' : '#9ca3af',
                            backgroundColor: daySelected ? '#f59e0b' : 'transparent',
                          }}
                          aria-label={daySelected ? 'Deselect day' : 'Select day'}
                          title={daySelected ? 'Deselect day' : 'Select day'}>
                          {daySelected && (
                            <svg width="8" height="6" viewBox="0 0 8 6" fill="none"><path d="M1 3l2 2 4-4" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          )}
                        </button>
                      ) : (
                        <span className="flex-shrink-0 w-4" aria-hidden />
                      )}
                      <button
                        onClick={() => toggleCollapsed(dateKey)}
                        aria-expanded={!isClosed}
                        className="flex-1 min-w-0 flex items-center gap-3 text-left">
                        <ChevronDown className={`w-4 h-4 flex-shrink-0 text-gray-400 transition-transform ${isClosed ? '-rotate-90' : ''}`} strokeWidth={2} />
                        <span className={`text-xs font-extrabold uppercase tracking-widest ${isHighlighted ? 'text-blue-600' : 'text-gray-900 dark:text-gray-100'}`}>
                          {formatDateLabel(dateKey)}
                          {isHighlighted && <span className="ml-2 text-blue-400 normal-case tracking-normal font-semibold">← from calendar</span>}
                        </span>
                        <span className="flex-1 h-px bg-gray-100 dark:bg-gray-800" />
                      </button>
                      {dayPosts.length > 0 && !isClosed && (
                        <button
                          onClick={() => selectDay(dateKey)}
                          className="text-[11px] font-semibold text-gray-400 hover:text-amber-500 transition-colors hidden sm:inline">
                          {daySelected ? 'Deselect day' : 'Select day'}
                        </button>
                      )}
                      <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">
                        {dayCount} post{dayCount !== 1 ? 's' : ''}
                      </span>
                    </div>
                    {!isClosed && (
                    <>
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={e => handleDragEnd(e, dateKey)}>
                      <SortableContext
                        items={dayPosts.map(p => p.id)}
                        strategy={verticalListSortingStrategy}>
                        <div className="space-y-3">
                          {dayPosts.map(post => (
                            <SortablePostCard
                              key={post.id}
                              post={post}
                              isHighlighted={isHighlighted}
                              confirmCancel={confirmCancel}
                              setConfirmCancel={setConfirmCancel}
                              cancelling={cancelling}
                              handleCancel={handleCancel}
                              onEvergreenToggle={handleEvergreenToggle}
                              isSelected={selectedIds.has(post.id)}
                              onToggleSelect={toggleSelect}
                              onDuplicate={handleDuplicate}
                              duplicating={duplicating}
                            />
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>
                    {dayTiktok.length > 0 && (
                      <div className={`space-y-3 ${dayPosts.length > 0 ? 'mt-3' : ''}`}>
                        {[...dayTiktok]
                          .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())
                          .map(tp => {
                            const confirming = confirmCancel === `tt:${tp.id}`
                            return (
                              <div key={tp.id} className="bg-surface border border-theme rounded-2xl p-4 md:p-5">
                                <div className="flex items-start gap-3">
                                  <PlatformGlyph id="tiktok" size={16} className="mt-1 flex-shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <div className="mb-2 flex items-center gap-2 flex-wrap">
                                      <span className="text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-300 px-2 py-0.5 rounded-full">
                                        {new Date(tp.scheduled_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                      </span>
                                      <span className="text-[10px] font-bold uppercase tracking-wide text-gray-400">TikTok Studio</span>
                                    </div>
                                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed line-clamp-2">
                                      {tp.post_caption || <span className="italic text-gray-400">No caption</span>}
                                    </p>
                                    {tp.video_url && <VideoPeek src={tp.video_url} />}
                                  </div>
                                  {!confirming && (
                                    <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 flex-shrink-0">
                                      <Link href="/tiktok/studio"
                                        className="text-xs font-bold px-3 py-1.5 border border-gray-200 dark:border-gray-600 rounded-xl hover:border-gray-400 transition-all">
                                        Studio
                                      </Link>
                                      <button
                                        onClick={() => setConfirmCancel(`tt:${tp.id}`)}
                                        className="text-xs font-bold px-3 py-1.5 border border-red-200 text-red-400 rounded-xl hover:border-red-400 transition-all">
                                        Cancel
                                      </button>
                                    </div>
                                  )}
                                </div>
                                {confirming && (
                                  <div className="mt-3 pt-3 border-t border-theme flex flex-col sm:flex-row sm:items-center gap-2">
                                    <p className="text-xs text-red-600 font-semibold flex-1">Cancel this TikTok post? It won&apos;t go out.</p>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                      <button
                                        onClick={() => handleCancelTiktok(tp.id)}
                                        disabled={cancellingTiktok === tp.id}
                                        className="text-xs font-bold px-3 py-1.5 bg-red-500 text-white rounded-xl hover:opacity-80 transition-all disabled:opacity-50">
                                        {cancellingTiktok === tp.id ? 'Cancelling...' : 'Yes, cancel it'}
                                      </button>
                                      <button
                                        onClick={() => setConfirmCancel(null)}
                                        className="text-xs font-bold px-3 py-1.5 border border-gray-200 dark:border-gray-600 rounded-xl hover:border-gray-400 transition-all">
                                        Keep it
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )
                          })}
                      </div>
                    )}
                    </>
                    )}
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

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-base font-extrabold text-gray-900 dark:text-white mb-2">
              Delete {selectedIds.size} post{selectedIds.size !== 1 ? 's' : ''}?
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              This can't be undone. Scheduled posts will be permanently removed.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 text-sm font-bold py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-gray-400 transition-all">
                {t('app_common.cancel')}
              </button>
              <button
                onClick={confirmBulkDelete}
                className="flex-1 text-sm font-bold py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white transition-all">
                {t('app_common.delete')}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className={`fixed right-6 z-50 px-5 py-3 rounded-2xl text-sm font-semibold shadow-lg ${
          toast.type === 'success' ? 'bg-black text-white' : 'bg-red-500 text-white'
        }`} style={{ bottom: 'max(1.5rem, env(safe-area-inset-bottom, 1.5rem))' }}>
          <span className="inline-flex items-center gap-2">
            {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" strokeWidth={2} /> : <XCircle className="w-4 h-4" strokeWidth={2} />}
            {toast.message}
          </span>
        </div>
      )}
    </div>
  )
}

export default function Queue() {
  return (
    <Suspense fallback={
      <div className="min-h-dvh bg-theme flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black dark:border-amber-500" />
      </div>
    }>
      <QueueInner />
    </Suspense>
  )
}