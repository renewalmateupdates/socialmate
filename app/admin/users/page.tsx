'use client'
import { useEffect, useState, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

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
  affiliate_status: string | null
  is_stax: boolean
}

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
  const [selected, setSelected] = useState<AdminUser | null>(null)

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
    } catch {
      console.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }, [search, planFilter])

  useEffect(() => { load() }, [load])

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
              {loading ? 'Loading…' : `${users.length} users`}
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

        {/* Table */}
        {loading ? (
          <div className="text-center py-20 text-gray-400 text-sm">Loading users…</div>
        ) : users.length === 0 ? (
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
                  {users.map((u, i) => (
                    <tr key={u.user_id}
                      onClick={() => setSelected(u)}
                      className={`cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors ${
                        i < users.length - 1 ? 'border-b border-theme' : ''
                      }`}>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-900 dark:text-gray-100 font-medium truncate max-w-[220px]">{u.email}</span>
                          {u.is_admin && <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-1.5 py-0.5 rounded-full font-semibold">admin</span>}
                        </div>
                        {u.display_name && <div className="text-xs text-gray-400 mt-0.5">{u.display_name}</div>}
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
                      <td className="px-5 py-3 text-gray-600 dark:text-gray-400">{u.posts_count}</td>
                      <td className="px-5 py-3">
                        <div className="flex flex-wrap gap-1">
                          {u.connected_platforms.length === 0
                            ? <span className="text-gray-400 text-xs">none</span>
                            : u.connected_platforms.map(p => (
                                <span key={p} className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-1.5 py-0.5 rounded-md">{p}</span>
                              ))
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
                <Row label="Posts published">{selected.posts_count}</Row>
                <Row label="Connected platforms">
                  {selected.connected_platforms.length === 0
                    ? <span className="text-gray-400">none</span>
                    : selected.connected_platforms.join(', ')}
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
