'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface PostFailure {
  id: string
  status: 'partial' | 'failed'
  scheduled_at: string
  platforms: string[]
  succeeded: string
  failed: string
  errors: Record<string, string>
  preview: string
}

interface DiagnosticsResponse {
  since: string
  count: number
  error_summary: Record<string, Record<string, number>>
  posts: PostFailure[]
}

const PLATFORM_EMOJI: Record<string, string> = {
  bluesky:  '🦋',
  twitter:  '𝕏',
  tiktok:   '🎵',
  discord:  '💬',
  telegram: '✈️',
  mastodon: '🐘',
  linkedin: '💼',
}

const STATUS_STYLE: Record<string, string> = {
  partial: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  failed:  'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  const hrs  = Math.floor(mins / 60)
  const days = Math.floor(hrs / 24)
  if (days > 0) return `${days}d ago`
  if (hrs  > 0) return `${hrs}h ago`
  return `${mins}m ago`
}

export default function FailureLogPage() {
  const router = useRouter()
  const [data, setData]           = useState<DiagnosticsResponse | null>(null)
  const [loading, setLoading]     = useState(true)
  const [forbidden, setForbidden] = useState(false)
  const [days, setDays]           = useState(7)
  const [selected, setSelected]   = useState<PostFailure | null>(null)
  const [platformFilter, setPlatformFilter] = useState<string>('all')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/post-diagnostics?days=${days}`)
      if (res.status === 401 || res.status === 403) { setForbidden(true); return }
      const json = await res.json()
      setData(json)
    } catch {
      console.error('Failed to load failure log')
    } finally {
      setLoading(false)
    }
  }, [days])

  useEffect(() => { load() }, [load])

  if (forbidden) return (
    <div className="min-h-dvh bg-theme flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-3">🔒</div>
        <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Access denied</p>
        <button onClick={() => router.push('/dashboard')} className="text-sm text-gray-400 hover:text-black dark:hover:text-white mt-4 transition-colors">← Dashboard</button>
      </div>
    </div>
  )

  // Collect all platforms that have failures for filter pills
  const failingPlatforms = data
    ? Array.from(new Set(data.posts.flatMap(p => Object.keys(p.errors))))
    : []

  const filtered = !data ? [] : data.posts.filter(p =>
    platformFilter === 'all' || Object.keys(p.errors).includes(platformFilter)
  )

  return (
    <div className="min-h-dvh bg-theme p-6 md:p-8">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Failure Log</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
              Post failures with per-platform error details
            </p>
          </div>
          <button onClick={() => router.push('/admin')}
            className="text-sm text-gray-400 hover:text-black dark:hover:text-white transition-colors">
            ← Admin Hub
          </button>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 flex-wrap mb-6">
          {/* Days filter */}
          <div className="flex gap-1">
            {[1, 7, 14, 30].map(d => (
              <button key={d} onClick={() => setDays(d)}
                className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                  days === d ? 'bg-black dark:bg-white text-white dark:text-black' : 'bg-surface text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-gray-400'
                }`}>
                {d === 1 ? 'Today' : `${d}d`}
              </button>
            ))}
          </div>

          <button onClick={load} disabled={loading}
            className="px-3 py-2 text-sm font-semibold rounded-xl border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-400 transition-all disabled:opacity-50">
            {loading ? 'Loading…' : '↻ Refresh'}
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400 text-sm">Loading failures…</div>
        ) : !data || data.count === 0 ? (
          <div className="text-center py-24 bg-surface border border-theme rounded-2xl">
            <div className="text-5xl mb-4">✅</div>
            <p className="text-base font-bold text-gray-700 dark:text-gray-300 mb-2">No failures in the last {days} day{days !== 1 ? 's' : ''}</p>
            <p className="text-sm text-gray-400">All posts published successfully.</p>
          </div>
        ) : (
          <>
            {/* Error summary by platform */}
            {Object.keys(data.error_summary).length > 0 && (
              <div className="mb-6 bg-surface border border-theme rounded-2xl p-5">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Error Summary — Last {days} Days</p>
                <div className="space-y-4">
                  {Object.entries(data.error_summary).map(([platform, errors]) => (
                    <div key={platform}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-base">{PLATFORM_EMOJI[platform] ?? '📡'}</span>
                        <span className="text-sm font-bold text-gray-700 dark:text-gray-300 capitalize">{platform}</span>
                        <span className="text-xs text-gray-400">({Object.values(errors).reduce((s, n) => s + n, 0)} failures)</span>
                      </div>
                      <div className="space-y-1 pl-6">
                        {Object.entries(errors).map(([msg, count]) => (
                          <div key={msg} className="flex items-start gap-2 text-xs">
                            <span className="shrink-0 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 font-bold px-1.5 py-0.5 rounded-full">×{count}</span>
                            <span className="text-gray-600 dark:text-gray-400 leading-relaxed">{msg}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Platform filter pills */}
            {failingPlatforms.length > 1 && (
              <div className="flex gap-2 mb-4 flex-wrap">
                <button onClick={() => setPlatformFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    platformFilter === 'all' ? 'bg-black dark:bg-white text-white dark:text-black' : 'bg-surface text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700'
                  }`}>
                  All platforms
                </button>
                {failingPlatforms.map(p => (
                  <button key={p} onClick={() => setPlatformFilter(p)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all capitalize ${
                      platformFilter === p ? 'bg-black dark:bg-white text-white dark:text-black' : 'bg-surface text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700'
                    }`}>
                    {PLATFORM_EMOJI[p] ?? '📡'} {p}
                  </button>
                ))}
              </div>
            )}

            {/* Post list */}
            <div className="text-xs text-gray-400 mb-3">
              {filtered.length} failure{filtered.length !== 1 ? 's' : ''} (partial + full) — newest first
            </div>
            <div className="space-y-2">
              {filtered.map(post => (
                <div key={post.id}
                  onClick={() => setSelected(prev => prev?.id === post.id ? null : post)}
                  className="bg-surface border border-theme rounded-2xl p-4 cursor-pointer hover:border-gray-300 dark:hover:border-gray-600 transition-all">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLE[post.status]}`}>
                          {post.status}
                        </span>
                        {Object.keys(post.errors).map(pl => (
                          <span key={pl} className="text-xs bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 px-2 py-0.5 rounded-full font-semibold">
                            {PLATFORM_EMOJI[pl] ?? '📡'} {pl} failed
                          </span>
                        ))}
                        {post.succeeded !== 'none' && (
                          <span className="text-xs bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800 px-2 py-0.5 rounded-full font-semibold">
                            ✓ {post.succeeded}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-1 font-medium">
                        {post.preview || '(no content preview)'}
                      </p>
                    </div>
                    <div className="text-xs text-gray-400 dark:text-gray-500 text-right shrink-0">
                      <div>{relativeTime(post.scheduled_at)}</div>
                      <div>{new Date(post.scheduled_at).toLocaleDateString()}</div>
                    </div>
                  </div>

                  {/* Expanded error details */}
                  {selected?.id === post.id && (
                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 space-y-3">
                      {Object.entries(post.errors).map(([platform, msg]) => (
                        <div key={platform}>
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-sm">{PLATFORM_EMOJI[platform] ?? '📡'}</span>
                            <span className="text-xs font-bold text-gray-600 dark:text-gray-400 capitalize">{platform}</span>
                          </div>
                          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-3 py-2 text-xs text-red-700 dark:text-red-300 font-mono leading-relaxed break-all">
                            {msg}
                          </div>
                        </div>
                      ))}
                      <div className="text-xs text-gray-400 mt-2">
                        Post ID: <span className="font-mono">{post.id}</span>
                        {' · '}
                        Scheduled: {new Date(post.scheduled_at).toLocaleString()}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
