'use client'
import { useState, useEffect, Suspense } from 'react'
import { useWorkspace } from '@/contexts/WorkspaceContext'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import Toast from '@/components/Toast'

type Settings = {
  stripe_account_id:         string | null
  stripe_onboarding_complete: boolean
  page_handle:               string | null
  page_title:                string | null
  page_bio:                  string | null
  tip_enabled:               boolean
  tip_min:                   number
  tip_max:                   number
  subscription_enabled:      boolean
  subscription_price:        number
  subscription_name:         string
  subscription_description:  string
}

type Earnings = {
  tips:               { amount: number; supporter_name: string; message: string | null; created_at: string }[]
  subscriptions:      { id: string; subscriber_name: string; status: string; created_at: string }[]
  total_tips_cents:   number
  active_subscribers: number
}

const DEFAULT: Settings = {
  stripe_account_id: null,
  stripe_onboarding_complete: false,
  page_handle: '',
  page_title: '',
  page_bio: '',
  tip_enabled: false,
  tip_min: 100,
  tip_max: 10000,
  subscription_enabled: false,
  subscription_price: 500,
  subscription_name: 'Supporter',
  subscription_description: 'Support my work and get access to exclusive content.',
}

function MonetizeHubInner() {
  const { activeWorkspaceId: workspaceId, plan } = useWorkspace()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [settings,  setSettings]  = useState<Settings>(DEFAULT)
  const [earnings,  setEarnings]  = useState<Earnings | null>(null)
  const [loading,   setLoading]   = useState(true)
  const [saving,    setSaving]    = useState(false)
  const [toast,     setToast]     = useState('')
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info')
  const [error,     setError]     = useState('')

  useEffect(() => {
    if (!workspaceId) return
    Promise.all([
      fetch(`/api/monetize/settings?workspace_id=${workspaceId}`).then(r => r.ok ? r.json() : null),
      fetch(`/api/monetize/earnings?workspace_id=${workspaceId}`).then(r => r.ok ? r.json() : null),
    ]).then(([sd, ed]) => {
      if (sd?.settings) setSettings(s => ({ ...s, ...sd.settings }))
      if (ed) setEarnings(ed)
    }).finally(() => setLoading(false))
  }, [workspaceId])

  // Handle connect callback params
  useEffect(() => {
    const connect = searchParams.get('connect')
    if (!connect) return
    if (connect === 'success') { showToast('Stripe account connected! You\'re ready to earn.', 'success') }
    else if (connect === 'pending') { showToast('Stripe onboarding in progress — check back soon.', 'info') }
    else if (connect === 'refresh') { showToast('Session expired — please reconnect your Stripe account.', 'error') }
    else if (connect === 'error') { showToast('Stripe connection failed. Please try again.', 'error') }
  }, [searchParams])

  function showToast(msg: string, type: 'success' | 'error' | 'info' = 'info') {
    setToast(msg)
    setToastType(type)
    setTimeout(() => setToast(''), 4000)
  }

  function copyToClipboard(text: string, label: string) {
    navigator.clipboard.writeText(text).then(() => showToast(`${label} copied!`, 'success'))
  }

  const creatorUrl = settings.page_handle
    ? `https://socialmate.studio/creator/${settings.page_handle}`
    : null

  async function save() {
    if (!workspaceId) return
    setSaving(true)
    setError('')
    const res = await fetch('/api/monetize/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workspace_id: workspaceId, ...settings }),
    })
    setSaving(false)
    if (res.ok) { showToast('Settings saved!', 'success') }
    else {
      const d = await res.json()
      setError(d.error || 'Failed to save.')
    }
  }

  function connectStripe() {
    if (!workspaceId) return
    router.push(`/api/monetize/connect?workspace_id=${workspaceId}`)
  }

  const isPro = plan !== 'free'
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://socialmate.studio'

  if (!isPro) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center gap-4">
        <span className="text-5xl">💸</span>
        <h1 className="text-2xl font-black text-primary">Creator Monetization Hub</h1>
        <p className="text-secondary text-sm max-w-md">Tip jars, fan subscriptions, and paywalled content — powered by Stripe. 0% platform cut. Available on Pro and Agency plans.</p>
        <Link href="/settings?tab=Plan" className="bg-amber-400 hover:bg-amber-300 text-black font-black px-6 py-3 rounded-xl text-sm">Upgrade to Pro →</Link>
        <Link href="/monetize" className="text-xs text-secondary hover:text-primary">← Back to overview</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6 md:p-10 max-w-2xl mx-auto">
      <div className="mb-8">
        <Link href="/monetize" className="text-xs text-secondary hover:text-primary mb-4 inline-block">← Overview</Link>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">💸</span>
          <h1 className="text-2xl font-black text-primary">Creator Hub</h1>
          <span className="text-xs bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded-full">Pro+</span>
        </div>
        <p className="text-secondary text-sm">Monetize your audience with tip jars and fan subscriptions. Stripe handles payments — you keep everything (minus Stripe's ~2.9% + 30¢).</p>
      </div>

      {loading ? (
        <div className="text-secondary text-sm py-10 text-center">Loading…</div>
      ) : (
        <div className="space-y-5">

          {/* Stripe Connect */}
          <div className={`rounded-2xl p-5 border ${settings.stripe_onboarding_complete ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-700' : 'bg-surface border-theme'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-primary">
                  {settings.stripe_onboarding_complete ? '✅ Stripe Connected' : 'Connect Stripe'}
                </p>
                <p className="text-xs text-secondary mt-0.5">
                  {settings.stripe_onboarding_complete
                    ? `Account: ${settings.stripe_account_id}`
                    : 'Required to receive payments. Takes ~2 minutes.'}
                </p>
              </div>
              {!settings.stripe_onboarding_complete && (
                <button
                  onClick={connectStripe}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-black px-4 py-2 rounded-xl text-sm"
                >
                  Connect →
                </button>
              )}
            </div>
          </div>

          {/* Share your page */}
          {settings.stripe_onboarding_complete && creatorUrl && (
            <div className="bg-surface border border-theme rounded-2xl p-5">
              <p className="text-xs font-bold uppercase tracking-wide text-secondary mb-3">Share Your Page</p>
              <div className="flex items-center gap-2 bg-background border border-theme rounded-xl px-3 py-2 mb-3">
                <span className="text-xs text-secondary truncate flex-1">{creatorUrl}</span>
                <button
                  onClick={() => copyToClipboard(creatorUrl, 'Creator page link')}
                  className="text-xs font-bold text-amber-500 hover:text-amber-400 shrink-0"
                >
                  Copy
                </button>
                <a href={creatorUrl} target="_blank" rel="noopener noreferrer"
                  className="text-xs font-bold text-secondary hover:text-primary shrink-0">
                  Open →
                </a>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {settings.tip_enabled && (
                  <button
                    onClick={() => copyToClipboard(creatorUrl, 'Tip jar link')}
                    className="py-2 rounded-xl border border-theme bg-background text-xs font-bold text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all"
                  >
                    💸 Copy Tip Link
                  </button>
                )}
                {settings.subscription_enabled && (
                  <button
                    onClick={() => copyToClipboard(creatorUrl, 'Subscribe link')}
                    className="py-2 rounded-xl border border-theme bg-background text-xs font-bold text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all"
                  >
                    🔁 Copy Sub Link
                  </button>
                )}
                <a
                  href={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(creatorUrl)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="py-2 rounded-xl border border-theme bg-background text-xs font-bold text-secondary hover:text-primary hover:border-amber-400/50 transition-all text-center"
                >
                  📱 QR Code
                </a>
              </div>
              <p className="text-xs text-secondary mt-2">
                Add to your <a href="/link-in-bio" className="text-amber-500 hover:underline">Link in Bio →</a>
              </p>
            </div>
          )}

          {/* Earnings summary */}
          {settings.stripe_onboarding_complete && earnings && (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-surface border border-theme rounded-2xl p-4 text-center">
                <p className="text-2xl font-black text-amber-500">${(earnings.total_tips_cents / 100).toFixed(2)}</p>
                <p className="text-xs text-secondary mt-1">Total tips received</p>
              </div>
              <div className="bg-surface border border-theme rounded-2xl p-4 text-center">
                <p className="text-2xl font-black text-emerald-500">{earnings.active_subscribers}</p>
                <p className="text-xs text-secondary mt-1">Active subscribers</p>
              </div>
            </div>
          )}

          {/* Creator page identity */}
          <div className="bg-surface border border-theme rounded-2xl p-5 space-y-3">
            <p className="text-xs font-bold uppercase tracking-wide text-secondary">Your Creator Page</p>
            <div>
              <label className="block text-xs text-secondary mb-1">Page handle</label>
              <div className="flex items-center gap-1">
                <span className="text-sm text-secondary">socialmate.studio/creator/</span>
                <input
                  value={settings.page_handle ?? ''}
                  onChange={e => setSettings(s => ({ ...s, page_handle: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g,'') }))}
                  placeholder="yourhandle"
                  className="flex-1 bg-background border border-theme rounded-lg px-3 py-1.5 text-sm text-primary focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-secondary mb-1">Display name</label>
              <input
                value={settings.page_title ?? ''}
                onChange={e => setSettings(s => ({ ...s, page_title: e.target.value }))}
                placeholder="Your Name"
                className="w-full bg-background border border-theme rounded-xl px-4 py-2 text-sm text-primary focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-xs text-secondary mb-1">Bio</label>
              <textarea
                value={settings.page_bio ?? ''}
                onChange={e => setSettings(s => ({ ...s, page_bio: e.target.value }))}
                placeholder="Tell your audience who you are..."
                rows={2}
                className="w-full bg-background border border-theme rounded-xl px-4 py-2 text-sm text-primary focus:outline-none focus:border-amber-400 resize-none"
              />
            </div>
            {settings.page_handle && (
              <a
                href={`/creator/${settings.page_handle}`}
                target="_blank"
                className="text-xs text-amber-500 hover:underline"
              >
                Preview page →
              </a>
            )}
          </div>

          {/* Tip jar */}
          <div className="bg-surface border border-theme rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-primary">💸 Tip Jar</p>
                <p className="text-xs text-secondary mt-0.5">One-time payments from fans who love your work</p>
              </div>
              <button
                onClick={() => setSettings(s => ({ ...s, tip_enabled: !s.tip_enabled }))}
                className={`w-12 h-6 rounded-full transition-all relative ${settings.tip_enabled ? 'bg-amber-400' : 'bg-gray-300'}`}
              >
                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${settings.tip_enabled ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
            {settings.tip_enabled && (
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-theme">
                <div>
                  <label className="block text-xs text-secondary mb-1">Min tip ($)</label>
                  <input
                    type="number"
                    min={1} max={100}
                    value={settings.tip_min / 100}
                    onChange={e => setSettings(s => ({ ...s, tip_min: Math.max(1, parseInt(e.target.value) || 1) * 100 }))}
                    className="w-full bg-background border border-theme rounded-lg px-3 py-1.5 text-sm text-primary focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs text-secondary mb-1">Max tip ($)</label>
                  <input
                    type="number"
                    min={1} max={500}
                    value={settings.tip_max / 100}
                    onChange={e => setSettings(s => ({ ...s, tip_max: Math.max(1, parseInt(e.target.value) || 1) * 100 }))}
                    className="w-full bg-background border border-theme rounded-lg px-3 py-1.5 text-sm text-primary focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Fan subscriptions */}
          <div className="bg-surface border border-theme rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-primary">🔁 Fan Subscriptions</p>
                <p className="text-xs text-secondary mt-0.5">Monthly recurring support from your community</p>
              </div>
              <button
                onClick={() => setSettings(s => ({ ...s, subscription_enabled: !s.subscription_enabled }))}
                className={`w-12 h-6 rounded-full transition-all relative ${settings.subscription_enabled ? 'bg-amber-400' : 'bg-gray-300'}`}
              >
                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${settings.subscription_enabled ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
            {settings.subscription_enabled && (
              <div className="space-y-3 pt-2 border-t border-theme">
                <div>
                  <label className="block text-xs text-secondary mb-1">Monthly price ($)</label>
                  <input
                    type="number"
                    min={1} max={999}
                    value={settings.subscription_price / 100}
                    onChange={e => setSettings(s => ({ ...s, subscription_price: Math.max(1, parseInt(e.target.value) || 1) * 100 }))}
                    className="w-full bg-background border border-theme rounded-xl px-4 py-2 text-sm text-primary focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs text-secondary mb-1">Tier name</label>
                  <input
                    value={settings.subscription_name}
                    onChange={e => setSettings(s => ({ ...s, subscription_name: e.target.value }))}
                    placeholder="Supporter"
                    className="w-full bg-background border border-theme rounded-xl px-4 py-2 text-sm text-primary focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs text-secondary mb-1">Tier description</label>
                  <textarea
                    value={settings.subscription_description}
                    onChange={e => setSettings(s => ({ ...s, subscription_description: e.target.value }))}
                    placeholder="What do subscribers get?"
                    rows={2}
                    className="w-full bg-background border border-theme rounded-xl px-4 py-2 text-sm text-primary focus:outline-none focus:border-amber-400 resize-none"
                  />
                </div>
              </div>
            )}
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <button
            onClick={save}
            disabled={saving}
            className="w-full bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-black font-black py-3 rounded-xl text-sm transition-all"
          >
            {saving ? 'Saving…' : 'Save Settings'}
          </button>

          {/* Recent tips */}
          {earnings && earnings.tips.length > 0 && (
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-secondary mb-3">Recent Tips</p>
              <div className="space-y-2">
                {earnings.tips.slice(0, 5).map((tip, i) => (
                  <div key={i} className="bg-surface border border-theme rounded-xl p-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-primary">{tip.supporter_name || 'Anonymous'}</p>
                      {tip.message && <p className="text-xs text-secondary italic">"{tip.message}"</p>}
                    </div>
                    <p className="text-sm font-black text-amber-500">${(tip.amount / 100).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Fan list */}
          {earnings && earnings.subscriptions.length > 0 && (
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-secondary mb-3">Fan Subscribers ({earnings.active_subscribers} active)</p>
              <div className="space-y-2">
                {earnings.subscriptions.slice(0, 5).map(sub => (
                  <div key={sub.id} className="bg-surface border border-theme rounded-xl p-3 flex items-center justify-between">
                    <p className="text-sm text-primary">{sub.subscriber_name || 'Fan'}</p>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${sub.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                      {sub.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <Toast message={toast} type={toastType} />
    </div>
  )
}

export default function MonetizeHubPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><p className="text-secondary text-sm">Loading…</p></div>}>
      <MonetizeHubInner />
    </Suspense>
  )
}
