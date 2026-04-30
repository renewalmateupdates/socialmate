'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface FeatureFlag {
  flag: string
  enabled: boolean
  description?: string | null
  updated_at?: string | null
  updated_by?: string | null
}

export default function FeatureFlagsPage() {
  const router = useRouter()
  const [flags, setFlags] = useState<FeatureFlag[]>([])
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    loadFlags()
  }, [])

  async function loadFlags() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/feature-flags')
      if (res.status === 403) {
        setError('forbidden')
        return
      }
      const json = await res.json()
      setFlags(json.flags || [])
    } catch {
      setError('Failed to load feature flags')
    } finally {
      setLoading(false)
    }
  }

  async function handleToggle(flag: string, currentEnabled: boolean) {
    setToggling(flag)
    try {
      const res = await fetch('/api/admin/feature-flags', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flag, enabled: !currentEnabled }),
      })
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        showToast(json.error || 'Failed to update flag', 'error')
        return
      }
      const json = await res.json()
      setFlags(prev =>
        prev.map(f => f.flag === flag ? { ...f, ...json.flag } : f)
      )
      showToast(`${flag} ${!currentEnabled ? 'enabled' : 'disabled'}`, 'success')
    } catch {
      showToast('Failed to update flag', 'error')
    } finally {
      setToggling(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-dvh bg-theme flex items-center justify-center">
        <div className="text-gray-400 text-sm">Loading feature flags...</div>
      </div>
    )
  }

  if (error === 'forbidden') {
    return (
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
  }

  if (error) {
    return (
      <div className="min-h-dvh bg-theme flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-red-500 font-semibold mb-3">{error}</p>
          <button onClick={loadFlags} className="text-sm text-gray-400 hover:text-black dark:hover:text-white transition-colors">
            Retry
          </button>
        </div>
      </div>
    )
  }

  const enabledCount = flags.filter(f => f.enabled).length

  return (
    <div className="min-h-dvh bg-theme p-6 md:p-8">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Feature Flags</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
              {flags.length} flag{flags.length !== 1 ? 's' : ''} · {enabledCount} enabled
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/admin')}
              className="text-sm text-gray-400 hover:text-black dark:hover:text-white transition-colors">
              ← Admin Hub
            </button>
          </div>
        </div>

        {/* Flags list */}
        {flags.length === 0 ? (
          <div className="bg-surface border border-theme rounded-2xl p-12 text-center">
            <div className="text-4xl mb-3">🚩</div>
            <p className="text-sm font-bold mb-1">No feature flags found</p>
            <p className="text-xs text-gray-400">Add rows to the feature_flags table to manage them here.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {flags.map(f => {
              const isToggling = toggling === f.flag
              return (
                <div
                  key={f.flag}
                  className="bg-surface border border-theme rounded-2xl px-5 py-4 flex items-center gap-4 hover:border-gray-300 dark:hover:border-gray-600 transition-all">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-sm font-semibold text-gray-900 dark:text-gray-100">{f.flag}</span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        f.enabled
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                      }`}>
                        {f.enabled ? 'enabled' : 'disabled'}
                      </span>
                    </div>
                    {f.description && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{f.description}</p>
                    )}
                    {f.updated_by && (
                      <p className="text-xs text-gray-300 dark:text-gray-600 mt-0.5">
                        Last updated by {f.updated_by}
                        {f.updated_at ? ` · ${new Date(f.updated_at).toLocaleDateString()}` : ''}
                      </p>
                    )}
                  </div>

                  {/* Toggle switch */}
                  <button
                    onClick={() => handleToggle(f.flag, f.enabled)}
                    disabled={isToggling}
                    aria-label={`${f.enabled ? 'Disable' : 'Enable'} ${f.flag}`}
                    className={`relative flex-shrink-0 w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none disabled:opacity-60 ${
                      f.enabled ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'
                    }`}>
                    {isToggling ? (
                      <span className="absolute inset-0 flex items-center justify-center">
                        <span className="w-3.5 h-3.5 border-2 border-white/60 border-t-white rounded-full animate-spin" />
                      </span>
                    ) : (
                      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                        f.enabled ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    )}
                  </button>
                </div>
              )
            })}
          </div>
        )}

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
