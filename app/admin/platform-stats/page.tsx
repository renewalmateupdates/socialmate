'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface PlatformStat {
  total: number
  failed: number
}

interface TopUser {
  user_id: string
  email: string
  post_count: number
}

interface StatsData {
  platform_stats: Record<string, PlatformStat>
  posts_today: number
  posts_week: number
  posts_month: number
  top_users: TopUser[]
  total_published: number
  total_failed: number
}

const PLATFORM_EMOJI: Record<string, string> = {
  discord:   '🎮',
  bluesky:   '🦋',
  mastodon:  '🐘',
  telegram:  '✈️',
  twitter:   '🐦',
  x:         '🐦',
  linkedin:  '💼',
  youtube:   '▶️',
  pinterest: '📌',
  instagram: '📸',
}

const PLATFORM_COLOR: Record<string, string> = {
  discord:   'bg-indigo-500',
  bluesky:   'bg-sky-500',
  mastodon:  'bg-violet-500',
  telegram:  'bg-blue-500',
  twitter:   'bg-sky-400',
  x:         'bg-gray-800',
  linkedin:  'bg-blue-700',
  youtube:   'bg-red-500',
  pinterest: 'bg-red-400',
  instagram: 'bg-pink-500',
}

export default function AdminPlatformStatsPage() {
  const router = useRouter()
  const [data, setData] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [forbidden, setForbidden] = useState(false)

  useEffect(() => {
    fetch('/api/admin/platform-stats')
      .then(r => {
        if (r.status === 403) { setForbidden(true); return null }
        return r.json()
      })
      .then(j => { if (j) setData(j) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (forbidden) return (
    <div className="min-h-dvh bg-theme flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-3">🔒</div>
        <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Access denied</p>
        <button onClick={() => router.push('/dashboard')} className="text-sm text-gray-400 hover:text-black dark:hover:text-white mt-4 transition-colors">← Dashboard</button>
      </div>
    </div>
  )

  const platforms = data ? Object.entries(data.platform_stats).sort((a, b) => b[1].total - a[1].total) : []
  const maxTotal = platforms[0]?.[1]?.total || 1

  return (
    <div className="min-h-dvh bg-theme p-6 md:p-8">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Platform Stats</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">Posts published per platform and trends</p>
          </div>
          <button onClick={() => router.push('/admin')}
            className="text-sm text-gray-400 hover:text-black dark:hover:text-white transition-colors">
            ← Admin Hub
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400 text-sm">Loading stats…</div>
        ) : !data ? (
          <div className="text-center py-20 text-gray-400 text-sm">Failed to load stats.</div>
        ) : (
          <>
            {/* Time range summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Today',          value: data.posts_today,      color: 'text-green-600 dark:text-green-400'   },
                { label: 'Last 7 days',    value: data.posts_week,       color: 'text-blue-600 dark:text-blue-400'     },
                { label: 'This month',     value: data.posts_month,      color: 'text-purple-600 dark:text-purple-400' },
                { label: 'Total published',value: data.total_published,  color: 'text-gray-900 dark:text-gray-100'     },
              ].map((c, i) => (
                <div key={i} className="bg-surface border border-theme rounded-2xl p-5">
                  <div className={`text-3xl font-black mb-1 ${c.color}`}>{c.value.toLocaleString()}</div>
                  <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">{c.label}</div>
                  {i === 3 && data.total_failed > 0 && (
                    <div className="text-xs text-red-500 mt-0.5">{data.total_failed} failed</div>
                  )}
                </div>
              ))}
            </div>

            {/* Platform breakdown */}
            <div className="mb-8">
              <h2 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">By platform</h2>
              {platforms.length === 0 ? (
                <div className="text-center py-12 text-gray-400 text-sm">No posts yet.</div>
              ) : (
                <div className="space-y-3">
                  {platforms.map(([platform, stat]) => {
                    const successRate = stat.total > 0 ? Math.round(((stat.total - stat.failed) / stat.total) * 100) : 100
                    const barWidth   = Math.round((stat.total / maxTotal) * 100)
                    const color      = PLATFORM_COLOR[platform.toLowerCase()] || 'bg-gray-400'
                    const emoji      = PLATFORM_EMOJI[platform.toLowerCase()] || '📡'
                    return (
                      <div key={platform} className="bg-surface border border-theme rounded-2xl p-5">
                        <div className="flex items-center justify-between mb-3 gap-4">
                          <div className="flex items-center gap-3">
                            <span className="text-xl">{emoji}</span>
                            <div>
                              <div className="font-semibold text-gray-900 dark:text-gray-100 capitalize">{platform}</div>
                              <div className="text-xs text-gray-400 mt-0.5">
                                {stat.total.toLocaleString()} posts · {successRate}% success
                                {stat.failed > 0 && <span className="text-red-500 ml-1.5">· {stat.failed} failed</span>}
                              </div>
                            </div>
                          </div>
                          <div className="text-2xl font-black text-gray-900 dark:text-gray-100">{stat.total.toLocaleString()}</div>
                        </div>
                        {/* Bar chart */}
                        <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2.5 overflow-hidden">
                          <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${barWidth}%` }} />
                        </div>
                        {stat.failed > 0 && (
                          <div className="mt-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5 overflow-hidden">
                            <div className="h-full rounded-full bg-red-400 transition-all"
                              style={{ width: `${Math.round((stat.failed / stat.total) * 100)}%` }} />
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Top posting users */}
            {data.top_users.length > 0 && (
              <div>
                <h2 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">Top posting users</h2>
                <div className="bg-surface border border-theme rounded-2xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-theme bg-gray-50 dark:bg-gray-800/50">
                        <th className="text-left px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-widest">#</th>
                        <th className="text-left px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-widest">User</th>
                        <th className="text-right px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-widest">Posts</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.top_users.map((u, i) => (
                        <tr key={u.user_id}
                          className={`hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors ${i < data.top_users.length - 1 ? 'border-b border-theme' : ''}`}>
                          <td className="px-5 py-3 text-gray-400 text-xs font-bold">{i + 1}</td>
                          <td className="px-5 py-3 text-gray-700 dark:text-gray-300 truncate max-w-[300px]">{u.email}</td>
                          <td className="px-5 py-3 text-right font-bold text-gray-900 dark:text-gray-100">{u.post_count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  )
}
