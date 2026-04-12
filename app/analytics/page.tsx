'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'

// ── Types ────────────────────────────────────────────────────────────────────

type AnalyticsStats = {
  total_published: number
  total_scheduled: number
  total_failed: number
  total_drafts: number
  published_this_month: number
  published_last_month: number
  by_platform: { platform: string; count: number }[]
  by_day_of_week: { day: number; label: string; count: number }[]
  by_hour: { hour: number; count: number }[]
  recent_posts: {
    id: string
    content_preview: string
    platforms: string[]
    published_at: string
    status: string
  }[]
  current_streak: number
  longest_streak: number
  avg_posts_per_week: number
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const PLATFORM_COLORS: Record<string, string> = {
  bluesky:  'bg-sky-500',
  discord:  'bg-indigo-500',
  telegram: 'bg-blue-400',
  mastodon: 'bg-purple-600',
  twitter:  'bg-slate-800',
  instagram:'bg-pink-500',
  linkedin: 'bg-blue-700',
  youtube:  'bg-red-600',
  reddit:   'bg-orange-500',
  tiktok:   'bg-black',
  facebook: 'bg-blue-600',
  threads:  'bg-gray-800',
  pinterest:'bg-red-500',
}

const PLATFORM_ICONS: Record<string, string> = {
  bluesky:  '🦋',
  discord:  '💬',
  telegram: '✈️',
  mastodon: '🐘',
  twitter:  '🐦',
  instagram:'📸',
  linkedin: '💼',
  youtube:  '▶️',
  reddit:   '🤖',
  tiktok:   '🎵',
  facebook: '📘',
  threads:  '🧵',
  pinterest:'📌',
}

function formatHour(h: number): string {
  if (h === 0)  return '12am'
  if (h === 12) return '12pm'
  return h < 12 ? `${h}am` : `${h - 12}pm`
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

// ── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse ${className}`} />
  )
}

// ── Platform badge ────────────────────────────────────────────────────────────

function PlatformBadge({ platform }: { platform: string }) {
  const icon  = PLATFORM_ICONS[platform] ?? '📡'
  const color = PLATFORM_COLORS[platform] ?? 'bg-gray-500'
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs text-white font-medium ${color}`}>
      {icon} {platform}
    </span>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function Analytics() {
  const [stats, setStats]     = useState<AnalyticsStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/analytics/stats')
        if (res.status === 401) { router.push('/login'); return }
        if (!res.ok) throw new Error('Failed to load analytics')
        const data = await res.json()
        setStats(data)
      } catch (e: any) {
        setError(e?.message ?? 'Something went wrong')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [router])

  // ── Derived values ──────────────────────────────────────────────────────────

  const monthDelta =
    stats ? stats.published_this_month - stats.published_last_month : 0

  const maxPlatform = stats?.by_platform[0]?.count ?? 1

  const topDays = stats
    ? Array.from(stats.by_day_of_week)
        .sort((a, b) => b.count - a.count)
        .slice(0, 3)
    : []
  const maxDayCount = topDays[0]?.count ?? 1

  // Group hours into 3-hour blocks for readability
  const hourBlocks = stats
    ? Array.from({ length: 8 }, (_, i) => {
        const start = i * 3
        const count = stats.by_hour
          .slice(start, start + 3)
          .reduce((s, h) => s + h.count, 0)
        return { label: `${formatHour(start)}–${formatHour(start + 3)}`, count }
      }).sort((a, b) => b.count - a.count).slice(0, 5)
    : []
  const maxHourBlock = hourBlocks[0]?.count ?? 1

  // ── Empty state ─────────────────────────────────────────────────────────────

  const isEmpty = stats && stats.total_published === 0

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="flex min-h-screen bg-theme">
      <Sidebar />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto space-y-8">

          {/* Header */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
              Analytics
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Your posting activity — based on published posts.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-xl border border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-700 px-4 py-3 text-sm text-red-700 dark:text-red-300">
              {error}
            </div>
          )}

          {/* ── Row 1 — Stat cards ───────────────────────────────────────────── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

            {/* Total Published */}
            {loading ? (
              Array.from({ length: 4 }, (_, i) => (
                <Skeleton key={i} className="h-28" />
              ))
            ) : (
              <>
                {/* Total Published */}
                <div className="bg-surface border border-theme rounded-xl p-4 flex flex-col gap-1">
                  <span className="text-xs font-semibold uppercase tracking-widest text-green-600 dark:text-green-400">
                    Total Published
                  </span>
                  <span className="text-3xl font-extrabold text-gray-900 dark:text-gray-100">
                    {stats?.total_published ?? 0}
                  </span>
                  <span className="text-xs text-gray-400">
                    {stats?.total_failed ?? 0} failed · {stats?.total_drafts ?? 0} drafts
                  </span>
                </div>

                {/* This Month */}
                <div className="bg-surface border border-theme rounded-xl p-4 flex flex-col gap-1">
                  <span className="text-xs font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400">
                    This Month
                  </span>
                  <span className="text-3xl font-extrabold text-gray-900 dark:text-gray-100">
                    {stats?.published_this_month ?? 0}
                  </span>
                  <span className={`text-xs font-medium ${monthDelta >= 0 ? 'text-green-500' : 'text-red-400'}`}>
                    {monthDelta >= 0 ? '+' : ''}{monthDelta} vs last month
                  </span>
                </div>

                {/* Current Streak */}
                <div className="bg-surface border border-theme rounded-xl p-4 flex flex-col gap-1">
                  <span className="text-xs font-semibold uppercase tracking-widest text-amber-600 dark:text-amber-400">
                    Streak
                  </span>
                  <span className="text-3xl font-extrabold text-gray-900 dark:text-gray-100">
                    {stats?.current_streak ?? 0}
                    <span className="text-xl ml-1">🔥</span>
                  </span>
                  <span className="text-xs text-gray-400">
                    Longest: {stats?.longest_streak ?? 0} days
                  </span>
                </div>

                {/* Avg/Week */}
                <div className="bg-surface border border-theme rounded-xl p-4 flex flex-col gap-1">
                  <span className="text-xs font-semibold uppercase tracking-widest text-purple-600 dark:text-purple-400">
                    Avg / Week
                  </span>
                  <span className="text-3xl font-extrabold text-gray-900 dark:text-gray-100">
                    {stats?.avg_posts_per_week ?? 0}
                  </span>
                  <span className="text-xs text-gray-400">
                    posts (last 8 weeks)
                  </span>
                </div>
              </>
            )}
          </div>

          {/* ── Row 2 — Platform breakdown ───────────────────────────────────── */}
          <div className="bg-surface border border-theme rounded-xl p-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4">
              Posts by Platform
            </h2>

            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }, (_, i) => (
                  <Skeleton key={i} className="h-7" />
                ))}
              </div>
            ) : isEmpty || !stats?.by_platform.length ? (
              <p className="text-sm text-gray-400">No published posts yet.</p>
            ) : (
              <div className="space-y-3">
                {stats.by_platform.map(({ platform, count }) => {
                  const pct   = Math.round((count / (stats.total_published || 1)) * 100)
                  const width = Math.max((count / maxPlatform) * 100, 2)
                  const color = PLATFORM_COLORS[platform] ?? 'bg-gray-500'
                  const icon  = PLATFORM_ICONS[platform] ?? '📡'
                  return (
                    <div key={platform} className="flex items-center gap-3">
                      <span className="w-24 text-sm capitalize text-gray-700 dark:text-gray-300 flex items-center gap-1 shrink-0">
                        <span>{icon}</span>
                        <span className="truncate">{platform}</span>
                      </span>
                      <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-4 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${color}`}
                          style={{ width: `${width}%` }}
                        />
                      </div>
                      <span className="w-16 text-right text-sm text-gray-600 dark:text-gray-400 shrink-0">
                        {count} <span className="text-gray-400 text-xs">({pct}%)</span>
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* ── Row 3 — Best times ───────────────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Best days */}
            <div className="bg-surface border border-theme rounded-xl p-5">
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4">
                Best Days to Post
                <span className="ml-1 text-xs font-normal normal-case text-gray-400">(last 90 days)</span>
              </h2>

              {loading ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }, (_, i) => <Skeleton key={i} className="h-6" />)}
                </div>
              ) : isEmpty || !stats ? (
                <p className="text-sm text-gray-400">No data yet.</p>
              ) : (
                <div className="space-y-2">
                  {Array.from(stats.by_day_of_week)
                    .sort((a, b) => b.count - a.count)
                    .map((d, idx) => {
                      const width = Math.max((d.count / (maxDayCount || 1)) * 100, d.count > 0 ? 4 : 0)
                      const isTop = idx === 0 && d.count > 0
                      return (
                        <div key={d.day} className="flex items-center gap-2">
                          <span className={`w-8 text-xs font-medium shrink-0 ${isTop ? 'text-amber-500' : 'text-gray-500 dark:text-gray-400'}`}>
                            {d.label}
                          </span>
                          <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-3 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${isTop ? 'bg-amber-400' : 'bg-blue-400 dark:bg-blue-600'}`}
                              style={{ width: `${width}%` }}
                            />
                          </div>
                          <span className="w-6 text-right text-xs text-gray-500 dark:text-gray-400 shrink-0">
                            {d.count}
                          </span>
                        </div>
                      )
                    })}
                </div>
              )}
            </div>

            {/* Best hours */}
            <div className="bg-surface border border-theme rounded-xl p-5">
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4">
                Best Times to Post
                <span className="ml-1 text-xs font-normal normal-case text-gray-400">(last 90 days)</span>
              </h2>

              {loading ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }, (_, i) => <Skeleton key={i} className="h-6" />)}
                </div>
              ) : isEmpty || !hourBlocks.length ? (
                <p className="text-sm text-gray-400">No data yet.</p>
              ) : (
                <div className="space-y-2">
                  {hourBlocks.map((block, idx) => {
                    const width = Math.max((block.count / (maxHourBlock || 1)) * 100, block.count > 0 ? 4 : 0)
                    const isTop = idx === 0 && block.count > 0
                    return (
                      <div key={block.label} className="flex items-center gap-2">
                        <span className={`w-24 text-xs font-medium shrink-0 ${isTop ? 'text-amber-500' : 'text-gray-500 dark:text-gray-400'}`}>
                          {block.label}
                        </span>
                        <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-3 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${isTop ? 'bg-amber-400' : 'bg-purple-400 dark:bg-purple-600'}`}
                            style={{ width: `${width}%` }}
                          />
                        </div>
                        <span className="w-6 text-right text-xs text-gray-500 dark:text-gray-400 shrink-0">
                          {block.count}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ── Row 4 — Recent posts table ───────────────────────────────────── */}
          <div className="bg-surface border border-theme rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-theme">
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Recent Published Posts
              </h2>
            </div>

            {loading ? (
              <div className="p-5 space-y-3">
                {Array.from({ length: 5 }, (_, i) => <Skeleton key={i} className="h-12" />)}
              </div>
            ) : isEmpty || !stats?.recent_posts.length ? (
              <div className="px-5 py-12 text-center">
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">
                  No posts published yet — schedule your first post!
                </p>
                <Link
                  href="/compose"
                  className="inline-block px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors"
                >
                  Create a post
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-theme">
                {stats.recent_posts.map(post => (
                  <div key={post.id} className="px-5 py-3 flex flex-col sm:flex-row sm:items-center gap-2">
                    {/* Content preview */}
                    <p className="flex-1 text-sm text-gray-700 dark:text-gray-300 truncate">
                      {post.content_preview || <span className="italic text-gray-400">No text content</span>}
                    </p>

                    {/* Platforms */}
                    <div className="flex flex-wrap gap-1 shrink-0">
                      {post.platforms.map(p => (
                        <PlatformBadge key={p} platform={p} />
                      ))}
                    </div>

                    {/* Status badge */}
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold shrink-0 ${
                      post.status === 'published'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {post.status}
                    </span>

                    {/* Date */}
                    <span className="text-xs text-gray-400 shrink-0 whitespace-nowrap">
                      {formatDate(post.published_at)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Empty state CTA */}
          {!loading && isEmpty && (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400 text-base mb-4">
                No posts published yet — schedule your first post and come back to see your stats!
              </p>
              <Link
                href="/compose"
                className="inline-block px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors"
              >
                Compose your first post
              </Link>
            </div>
          )}

        </div>
      </main>
    </div>
  )
}
