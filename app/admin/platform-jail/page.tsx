'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface JailedAccount {
  id: string
  platform: string
  platform_account_id: string
  status: string
  disconnected_at: string | null
  cooling_until: string | null
  created_at: string
}

const PLATFORM_EMOJI: Record<string, string> = {
  twitter:   '🐦',
  x:         '🐦',
  bluesky:   '🦋',
  mastodon:  '🐘',
  discord:   '🎮',
  telegram:  '✈️',
  linkedin:  '💼',
  youtube:   '▶️',
  instagram: '📸',
  pinterest: '📌',
}

function daysRemaining(coolingUntil: string | null): number {
  if (!coolingUntil) return 0
  const diff = new Date(coolingUntil).getTime() - Date.now()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function AdminPlatformJailPage() {
  const router = useRouter()
  const [accounts, setAccounts] = useState<JailedAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [forbidden, setForbidden] = useState(false)
  const [releasing, setReleasing] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/platform-jail')
      if (res.status === 401 || res.status === 403) { setForbidden(true); return }
      const json = await res.json()
      if (json.error) { setError(json.error); return }
      setAccounts(json.jailed ?? [])
    } catch {
      setError('Failed to load jailed accounts.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  async function handleRelease(account: JailedAccount) {
    const confirmed = window.confirm(
      `Release @${account.platform_account_id} from jail early?`
    )
    if (!confirmed) return

    const key = `${account.platform}:${account.platform_account_id}`
    setReleasing(key)
    try {
      const res = await fetch('/api/admin/platform-jail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform_account_id: account.platform_account_id,
          platform: account.platform,
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        alert(`Release failed: ${json.error ?? 'Unknown error'}`)
        return
      }
      // Remove the released account from the list
      setAccounts(prev => prev.filter(
        a => !(a.platform === account.platform && a.platform_account_id === account.platform_account_id)
      ))
    } catch {
      alert('Network error — release failed.')
    } finally {
      setReleasing(null)
    }
  }

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
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Platform Account Jail</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
              Accounts in 45-day reconnection cooldown. Release early only for verified legitimate cases.
            </p>
          </div>
          <button onClick={() => router.push('/admin')}
            className="text-sm text-gray-400 hover:text-black dark:hover:text-white transition-colors">
            ← Admin Hub
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400 text-sm">Loading jailed accounts…</div>
        ) : error ? (
          <div className="text-center py-20 text-red-500 text-sm">{error}</div>
        ) : accounts.length === 0 ? (
          <div className="bg-surface border border-theme rounded-2xl p-12 text-center">
            <div className="text-4xl mb-3">🔓</div>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">No accounts in cooling period</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">All platform accounts are clear.</p>
          </div>
        ) : (
          <>
            {/* Summary badge */}
            <div className="mb-4 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                <span className="inline-block w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                {accounts.length} account{accounts.length !== 1 ? 's' : ''} jailed
              </span>
            </div>

            {/* Table — desktop */}
            <div className="hidden md:block bg-surface border border-theme rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-theme bg-gray-50 dark:bg-gray-800/50">
                      <th className="text-left px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-widest">Platform</th>
                      <th className="text-left px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-widest">Account ID</th>
                      <th className="text-left px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-widest">Cooling Until</th>
                      <th className="text-left px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-widest">Days Remaining</th>
                      <th className="px-5 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {accounts.map((account, i) => {
                      const key = `${account.platform}:${account.platform_account_id}`
                      const days = daysRemaining(account.cooling_until)
                      const isReleasing = releasing === key
                      return (
                        <tr key={account.id}
                          className={`transition-colors ${i < accounts.length - 1 ? 'border-b border-theme' : ''} hover:bg-gray-50 dark:hover:bg-gray-800/40`}>
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-2">
                              <span className="text-base">{PLATFORM_EMOJI[account.platform.toLowerCase()] ?? '📡'}</span>
                              <span className="font-semibold text-gray-900 dark:text-gray-100 capitalize">{account.platform}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3">
                            <code className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-lg font-mono">
                              {account.platform_account_id}
                            </code>
                          </td>
                          <td className="px-5 py-3 text-gray-600 dark:text-gray-400 text-xs whitespace-nowrap">
                            {formatDate(account.cooling_until)}
                          </td>
                          <td className="px-5 py-3">
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                              days > 30
                                ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                                : days > 10
                                ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'
                                : 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400'
                            }`}>
                              {days}d
                            </span>
                          </td>
                          <td className="px-5 py-3 text-right">
                            <button
                              onClick={() => handleRelease(account)}
                              disabled={isReleasing}
                              className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-red-300 hover:text-red-600 dark:hover:border-red-700 dark:hover:text-red-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                              {isReleasing ? 'Releasing…' : 'Release'}
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Cards — mobile */}
            <div className="md:hidden space-y-3">
              {accounts.map(account => {
                const key = `${account.platform}:${account.platform_account_id}`
                const days = daysRemaining(account.cooling_until)
                const isReleasing = releasing === key
                return (
                  <div key={account.id} className="bg-surface border border-theme rounded-2xl p-4">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{PLATFORM_EMOJI[account.platform.toLowerCase()] ?? '📡'}</span>
                        <span className="font-semibold text-gray-900 dark:text-gray-100 capitalize">{account.platform}</span>
                      </div>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                        days > 30
                          ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                          : days > 10
                          ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'
                          : 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400'
                      }`}>
                        {days}d remaining
                      </span>
                    </div>
                    <div className="space-y-1.5 mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 w-28 shrink-0">Account ID</span>
                        <code className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-1.5 py-0.5 rounded font-mono truncate">
                          {account.platform_account_id}
                        </code>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 w-28 shrink-0">Cooling Until</span>
                        <span className="text-xs text-gray-600 dark:text-gray-400">{formatDate(account.cooling_until)}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRelease(account)}
                      disabled={isReleasing}
                      className="w-full text-sm font-semibold py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-red-300 hover:text-red-600 dark:hover:border-red-700 dark:hover:text-red-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all min-h-[44px]">
                      {isReleasing ? 'Releasing…' : 'Release Early'}
                    </button>
                  </div>
                )
              })}
            </div>
          </>
        )}

      </div>
    </div>
  )
}
