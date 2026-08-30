'use client'
import { useEffect, useState, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

interface PostStats { published: number; failed: number; partial: number; scheduled: number }
interface PlatformStat { published: number; failed: number }

interface AdminUser {
  user_id: string
  email: string
  plan: string | null
  created_at: string
  last_active: string | null
  display_name: string | null
  is_admin: boolean | null
  connected_platforms: string[]
  posts_count: number
  post_stats: PostStats
  platform_stats: Record<string, PlatformStat>
  affiliate_status: string | null
  is_stax: boolean
  plan_disagrees?: boolean
  is_internal?: boolean
  login_count?: number
  onboarding_completed?: boolean
}

type Meta = { postsTruncated: boolean; authTruncated: boolean; settingsTruncated: boolean }

// Sorting newest-first hid the only users worth looking at. 82 of 104 accounts
// have never connected anything, so the newest 15 rows are reliably all zeros
// and the table reads as though nobody uses the product at all.
type SortKey = 'joined' | 'published' | 'active' | 'logins'
const SORTS: { key: SortKey; label: string }[] = [
  { key: 'joined',    label: 'Newest' },
  { key: 'published', label: 'Most published' },
  { key: 'active',    label: 'Last active' },
  { key: 'logins',    label: 'Most logins' },
]

type Segment = 'all' | 'external' | 'connected' | 'published' | 'never_connected'
const SEGMENTS: { key: Segment; label: string }[] = [
  { key: 'all',             label: 'Everyone' },
  { key: 'external',        label: 'External only' },
  { key: 'connected',       label: 'Connected a platform' },
  { key: 'published',       label: 'Ever published' },
  { key: 'never_connected', label: 'Never connected' },
]

const PLAN_BADGE: Record<string, string> = {
  free:   'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
  pro:    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  agency: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
}

export default function AdminUsersPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-gray-950 flex items-center justify-center text-gray-400 text-sm">Loading…</div>}>
      <AdminUsersInner />
    </Suspense>
  )
}

function AdminUsersInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [forbidden, setForbidden] = useState(false)
  const [search, setSearch] = useState('')
  const [planFilter, setPlanFilter] = useState(searchParams.get('plan') || '')
  // Cap initial render — a 2,000-row table in one commit tanks INP. More
  // rows load on demand; search/plan filters reset the window.
  const [rowLimit, setRowLimit] = useState(150)
  const [selected, setSelected] = useState<AdminUser | null>(null)
  const [sortKey, setSortKey] = useState<SortKey>('joined')
  const [segment, setSegment] = useState<Segment>('all')
  const [meta, setMeta] = useState<Meta | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search)     params.set('search', search)
      if (planFilter) params.set('plan',   planFilter)
      const res = await fetch(`/api/admin/users?${params.toString()}`)
      if (res.status === 403) { setForbidden(true); return }
      const json = await res.json()
      setUsers(json.users || [])
      setMeta(json.meta ?? null)
    } catch {
      console.error('Failed to load users')
    } finally {
      setLoading(false)
    }
    setRowLimit(150)
  }, [search, planFilter])

  useEffect(() => { load() }, [load])

  // Segment then sort, client-side. The route already returns every user, and
  // at ~100 accounts this is free; it also keeps the counts on the segment
  // chips honest because they are computed from the same array being rendered.
  const segmentCounts: Record<Segment, number> = {
    all:             users.length,
    external:        users.filter(u => !u.is_internal).length,
    connected:       users.filter(u => u.connected_platforms.length > 0).length,
    published:       users.filter(u => (u.post_stats?.published ?? 0) > 0).length,
    never_connected: users.filter(u => u.connected_platforms.length === 0).length,
  }

  const visible = users
    .filter(u => {
      if (segment === 'external')        return !u.is_internal
      if (segment === 'connected')       return u.connected_platforms.length > 0
      if (segment === 'published')       return (u.post_stats?.published ?? 0) > 0
      if (segment === 'never_connected') return u.connected_platforms.length === 0
      return true
    })
    .slice()
    .sort((a, b) => {
      if (sortKey === 'published') return (b.post_stats?.published ?? 0) - (a.post_stats?.published ?? 0)
      if (sortKey === 'logins')    return (b.login_count ?? 0) - (a.login_count ?? 0)
      if (sortKey === 'active') {
        return new Date(b.last_active ?? 0).getTime() - new Date(a.last_active ?? 0).getTime()
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

  if (forbidden) return (
    <div className="min-h-dvh bg-theme flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-3">🔒</div>
        <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Access denied</p>
        <p className="text-xs text-gray-400 mt-1 mb-4">Admin access required</p>
        <button onClick={() => router.push('/dashboard')}
          className="text-sm text-gray-400 hover:text-black dark:hover:text-white transition-colors">
          ← Dashboard
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-dvh bg-theme p-6 md:p-8">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Users</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
              {loading ? 'Loading…' : `${visible.length} of ${users.length} users`}
            </p>
          </div>
          <button onClick={() => router.push('/admin')}
            className="text-sm text-gray-400 hover:text-black dark:hover:text-white transition-colors">
            ← Admin Hub
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-5 flex-wrap">
          <input
            type="text"
            placeholder="Search by email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border border-gray-200 dark:border-gray-700 bg-surface dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm rounded-xl px-3 py-2 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-gray-400 w-64"
          />
          <div className="flex gap-1">
            {(['', 'free', 'pro', 'agency'] as const).map(p => (
              <button key={p} onClick={() => setPlanFilter(p)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  planFilter === p
                    ? 'bg-black dark:bg-white text-white dark:text-black'
                    : 'bg-surface text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-gray-400'
                }`}>
                {p === '' ? 'All plans' : p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Segments and sort. Without these the table is 104 rows ordered by
            signup date, where the newest 15 are all zeros and the handful of
            people who actually used the product are somewhere in the middle. */}
        <div className="flex gap-3 mb-3 flex-wrap items-center">
          <div className="flex gap-1 flex-wrap">
            {SEGMENTS.map(s => (
              <button key={s.key} onClick={() => { setSegment(s.key); setRowLimit(150) }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  segment === s.key
                    ? 'bg-black dark:bg-white text-white dark:text-black'
                    : 'bg-surface text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-gray-400'
                }`}>
                {s.label} <span className="opacity-60">{segmentCounts[s.key]}</span>
              </button>
            ))}
          </div>
          <div className="flex gap-1 flex-wrap ml-auto">
            <span className="text-xs text-gray-400 self-center mr-1">Sort</span>
            {SORTS.map(s => (
              <button key={s.key} onClick={() => setSortKey(s.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  sortKey === s.key
                    ? 'bg-black dark:bg-white text-white dark:text-black'
                    : 'bg-surface text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-gray-400'
                }`}>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* A hit ceiling understates every number on this page, so it says so. */}
        {meta && (meta.postsTruncated || meta.authTruncated || meta.settingsTruncated) && (
          <div className="mb-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-800">
            <p className="text-xs font-bold text-amber-800 dark:text-amber-300">
              Row limit reached{' '}
              {[meta.authTruncated && 'users', meta.postsTruncated && 'posts', meta.settingsTruncated && 'settings']
                .filter(Boolean).join(', ')}
              . Counts below are understated.
            </p>
          </div>
        )}

        {/* Table */}
        {loading ? (
          <div className="text-center py-20 text-gray-400 text-sm">Loading users…</div>
        ) : visible.length === 0 ? (
          <div className="text-center py-20 text-gray-400 text-sm">No users found.</div>
        ) : (
          <div className="bg-surface border border-theme rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-theme bg-gray-50 dark:bg-gray-800/50">
                    <th className="text-left px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-widest">Email</th>
                    <th className="text-left px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-widest">Plan</th>
                    <th className="text-left px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-widest">Roles</th>
                    <th className="text-left px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-widest">Posts</th>
                    <th className="text-left px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-widest">Platforms</th>
                    <th className="text-left px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-widest">Joined</th>
                    <th className="text-left px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-widest">Last active</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.slice(0, rowLimit).map((u, i) => (
                    <tr key={u.user_id}
                      onClick={() => setSelected(u)}
                      className={`cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors ${
                        i < visible.length - 1 ? 'border-b border-theme' : ''
                      }`}>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-900 dark:text-gray-100 font-medium truncate max-w-[220px]">{u.email}</span>
                          {u.is_admin && <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-1.5 py-0.5 rounded-full font-semibold">admin</span>}
                          {u.is_internal && (
                            <span title="One of our own accounts, not a customer"
                              className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-1.5 py-0.5 rounded-full font-semibold whitespace-nowrap">
                              internal
                            </span>
                          )}
                          {u.plan_disagrees && (
                            <span title="user_settings.plan and workspaces.plan disagree"
                              className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded-full font-semibold whitespace-nowrap">
                              plan split
                            </span>
                          )}
                        </div>
                        {u.display_name && <div className="text-xs text-gray-400 mt-0.5">{u.display_name}</div>}
                        {/* stopPropagation so the row's quick-peek drawer does
                            not also fire on the way to the full page. */}
                        <Link href={`/admin/users/${u.user_id}`}
                          onClick={e => e.stopPropagation()}
                          className="text-xs text-blue-500 hover:underline mt-0.5 inline-block">
                          Full detail →
                        </Link>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${PLAN_BADGE[u.plan ?? 'free'] || PLAN_BADGE.free}`}>
                          {u.plan || 'free'}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex flex-wrap gap-1">
                          {u.affiliate_status && (
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${
                              u.affiliate_status === 'active'    ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                              u.affiliate_status === 'suspended' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
                                                                   'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                            }`}>
                              {u.affiliate_status === 'active' ? '💰 Partner' : u.affiliate_status === 'pending' ? '⏳ Partner' : '⛔ Partner'}
                            </span>
                          )}
                          {u.is_stax && (
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 whitespace-nowrap">
                              🏪 Stax
                            </span>
                          )}
                          {!u.affiliate_status && !u.is_stax && (
                            <span className="text-xs text-gray-400">—</span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-gray-700 dark:text-gray-300 font-medium">
                            {u.post_stats?.published ?? u.posts_count} pub
                          </span>
                          {(u.post_stats?.failed ?? 0) + (u.post_stats?.partial ?? 0) > 0 && (
                            <span className="text-red-500 font-medium">
                              · {(u.post_stats.failed) + (u.post_stats.partial)} ✗
                            </span>
                          )}
                          {(u.post_stats?.scheduled ?? 0) > 0 && (
                            <span className="text-amber-500">
                              · {u.post_stats.scheduled} ⏳
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex flex-wrap gap-1">
                          {u.connected_platforms.length === 0
                            ? <span className="text-gray-400 text-xs">none</span>
                            : u.connected_platforms.map(p => {
                                const ps = u.platform_stats?.[p]
                                return (
                                  <span key={p} className={`text-xs px-1.5 py-0.5 rounded-md flex items-center gap-1 ${
                                    ps?.failed
                                      ? 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                                  }`}>
                                    {p}
                                    {ps && <span className="opacity-70">({ps.published}{ps.failed ? ` · ${ps.failed}✗` : ''})</span>}
                                  </span>
                                )
                              })
                          }
                        </div>
                      </td>
                      <td className="px-5 py-3 text-gray-500 dark:text-gray-400 text-xs whitespace-nowrap">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3 text-gray-500 dark:text-gray-400 text-xs whitespace-nowrap">
                        {u.last_active ? new Date(u.last_active).toLocaleDateString() : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {visible.length > rowLimit && (
                <div className="p-4 text-center border-t border-theme">
                  <button
                    onClick={() => setRowLimit(l => l + 300)}
                    className="text-sm font-semibold text-amber-600 dark:text-amber-400 hover:text-amber-500 transition-colors"
                  >
                    Show more ({visible.length - rowLimit} remaining)
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* User detail modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-2xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 break-all">{selected.email}</h2>
                  {selected.display_name && <p className="text-sm text-gray-400 mt-0.5">{selected.display_name}</p>}
                </div>
                <button onClick={() => setSelected(null)}
                  className="text-gray-400 hover:text-black dark:hover:text-white text-2xl leading-none ml-4">×</button>
              </div>
              <div className="space-y-3 text-sm">
                <Row label="Plan">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${PLAN_BADGE[selected.plan ?? 'free'] || PLAN_BADGE.free}`}>
                    {selected.plan || 'free'}
                  </span>
                </Row>
                <Row label="User ID"><code className="text-xs bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">{selected.user_id}</code></Row>
                <Row label="Roles">
                  <div className="flex flex-wrap gap-1">
                    {selected.affiliate_status && (
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        selected.affiliate_status === 'active'    ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                        selected.affiliate_status === 'suspended' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
                                                                    'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                      }`}>
                        💰 Partner ({selected.affiliate_status})
                      </span>
                    )}
                    {selected.is_stax && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                        🏪 Studio Stax
                      </span>
                    )}
                    {!selected.affiliate_status && !selected.is_stax && <span className="text-gray-400">none</span>}
                  </div>
                </Row>
                <Row label="Posts">
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="text-gray-700 dark:text-gray-300">{selected.post_stats?.published ?? selected.posts_count} published</span>
                    {(selected.post_stats?.failed ?? 0) > 0 && <span className="text-red-500">{selected.post_stats.failed} failed</span>}
                    {(selected.post_stats?.partial ?? 0) > 0 && <span className="text-orange-500">{selected.post_stats.partial} partial</span>}
                    {(selected.post_stats?.scheduled ?? 0) > 0 && <span className="text-amber-500">{selected.post_stats.scheduled} scheduled</span>}
                  </div>
                </Row>
                <Row label="Platforms">
                  {selected.connected_platforms.length === 0
                    ? <span className="text-gray-400">none</span>
                    : (
                      <div className="flex flex-col gap-1.5 w-full">
                        {selected.connected_platforms.map(p => {
                          const ps = selected.platform_stats?.[p]
                          return (
                            <div key={p} className="flex items-center gap-2 text-xs">
                              <span className="w-20 text-gray-500 dark:text-gray-400 capitalize">{p}</span>
                              <span className="text-gray-700 dark:text-gray-300">{ps?.published ?? 0} pub</span>
                              {(ps?.failed ?? 0) > 0 && <span className="text-red-500">{ps!.failed} ✗</span>}
                            </div>
                          )
                        })}
                        {Object.entries(selected.platform_stats ?? {})
                          .filter(([p]) => !selected.connected_platforms.includes(p))
                          .map(([p, ps]) => (
                            <div key={p} className="flex items-center gap-2 text-xs opacity-50">
                              <span className="w-20 text-gray-500 dark:text-gray-400 capitalize">{p}</span>
                              <span className="text-gray-700 dark:text-gray-300">{ps.published} pub</span>
                              {ps.failed > 0 && <span className="text-red-500">{ps.failed} ✗</span>}
                              <span className="text-gray-400">(disconnected)</span>
                            </div>
                          ))
                        }
                      </div>
                    )
                  }
                </Row>
                <Row label="Joined">{new Date(selected.created_at).toLocaleString()}</Row>
                <Row label="Last active">{selected.last_active ? new Date(selected.last_active).toLocaleString() : '—'}</Row>
                {selected.is_admin && <Row label="Role"><span className="text-red-600 dark:text-red-400 font-semibold">Admin</span></Row>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest w-36 shrink-0 pt-0.5">{label}</span>
      <span className="text-gray-700 dark:text-gray-300">{children}</span>
    </div>
  )
}
