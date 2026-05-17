'use client'
import { useState, useEffect, Suspense } from 'react'
import { useWorkspace } from '@/contexts/WorkspaceContext'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import Toast from '@/components/Toast'
import { useI18n } from '@/contexts/I18nContext'

type Settings = {
  stripe_account_id:         string | null
  stripe_onboarding_complete: boolean
  page_handle:               string | null
  page_title:                string | null
  page_bio:                  string | null
  header_color:              string
  tip_enabled:               boolean
  tip_min:                   number
  tip_max:                   number
  subscription_enabled:      boolean
  subscription_price:        number
  subscription_name:         string
  subscription_description:  string
}

const HEADER_COLORS = [
  { hex: '#F59E0B', label: 'Amber'   },
  { hex: '#6366f1', label: 'Indigo'  },
  { hex: '#10b981', label: 'Emerald' },
  { hex: '#f43f5e', label: 'Rose'    },
  { hex: '#0ea5e9', label: 'Sky'     },
  { hex: '#a855f7', label: 'Purple'  },
  { hex: '#111827', label: 'Dark'    },
  { hex: '#ffffff', label: 'White'   },
]

type Earnings = {
  tips:               { amount: number; supporter_name: string; message: string | null; created_at: string }[]
  subscriptions:      { id: string; subscriber_name: string; status: string; created_at: string }[]
  total_tips_cents:   number
  active_subscribers: number
}

type PaywalledPost = {
  id:                 string
  title:              string
  preview:            string
  content:            string
  unlock_price_cents: number | null
  created_at:         string
}

const BLANK_POST = { title: '', preview: '', content: '', unlock_price: '' }

const DEFAULT: Settings = {
  stripe_account_id: null,
  stripe_onboarding_complete: false,
  page_handle: '',
  page_title: '',
  page_bio: '',
  header_color: '#F59E0B',
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
  const { t } = useI18n()

  const [settings,  setSettings]  = useState<Settings>(DEFAULT)
  const [earnings,  setEarnings]  = useState<Earnings | null>(null)
  const [loading,   setLoading]   = useState(true)
  const [saving,    setSaving]    = useState(false)
  const [toast,     setToast]     = useState('')
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info')
  const [error,     setError]     = useState('')

  // paywalled posts
  const [posts,       setPosts]       = useState<PaywalledPost[]>([])
  const [showNewPost, setShowNewPost] = useState(false)
  const [newPost,     setNewPost]     = useState(BLANK_POST)
  const [savingPost,  setSavingPost]  = useState(false)
  const [deletingId,  setDeletingId]  = useState<string | null>(null)

  useEffect(() => {
    if (!workspaceId) return
    Promise.all([
      fetch(`/api/monetize/settings?workspace_id=${workspaceId}`).then(r => r.ok ? r.json() : null),
      fetch(`/api/monetize/earnings?workspace_id=${workspaceId}`).then(r => r.ok ? r.json() : null),
      fetch(`/api/monetize/paywalled-posts?workspace_id=${workspaceId}`).then(r => r.ok ? r.json() : null),
    ]).then(([sd, ed, pd]) => {
      if (sd?.settings) setSettings(s => ({ ...s, ...sd.settings }))
      if (ed) setEarnings(ed)
      if (pd?.posts) setPosts(pd.posts)
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

  async function createPost() {
    if (!workspaceId || !newPost.title.trim() || !newPost.preview.trim() || !newPost.content.trim()) return
    setSavingPost(true)
    const res = await fetch('/api/monetize/paywalled-posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        workspace_id:       workspaceId,
        title:              newPost.title.trim(),
        preview:            newPost.preview.trim(),
        content:            newPost.content.trim(),
        unlock_price_cents: newPost.unlock_price ? Math.round(parseFloat(newPost.unlock_price) * 100) : null,
      }),
    })
    setSavingPost(false)
    if (res.ok) {
      const d = await res.json()
      setPosts(prev => [d.post, ...prev])
      setNewPost(BLANK_POST)
      setShowNewPost(false)
      showToast('Post created!', 'success')
    } else {
      const d = await res.json()
      showToast(d.error || 'Failed to create post.', 'error')
    }
  }

  async function deletePost(id: string) {
    setDeletingId(id)
    const res = await fetch(`/api/monetize/paywalled-posts?id=${id}`, { method: 'DELETE' })
    setDeletingId(null)
    if (res.ok) {
      setPosts(prev => prev.filter(p => p.id !== id))
      showToast('Post deleted.', 'info')
    }
  }

  const isPro = plan !== 'free'
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://socialmate.studio'

  if (!isPro) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center gap-4">
        <span className="text-5xl">💸</span>
        <h1 className="text-2xl font-black text-primary">{t('app_creator_hub.pro_gate_title')}</h1>
        <p className="text-secondary text-sm max-w-md">{t('app_creator_hub.pro_gate_desc')}</p>
        <Link href="/settings?tab=Plan" className="bg-amber-400 hover:bg-amber-300 text-black font-black px-6 py-3 rounded-xl text-sm">{t('app_creator_hub.upgrade_pro')}</Link>
        <Link href="/monetize" className="text-xs text-secondary hover:text-primary">{t('app_creator_hub.back_overview')}</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6 md:p-10 max-w-2xl mx-auto">
      <div className="mb-8">
        <Link href="/monetize" className="text-xs text-secondary hover:text-primary mb-4 inline-block">{t('app_creator_hub.back_short')}</Link>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">💸</span>
          <h1 className="text-2xl font-black text-primary">{t('app_creator_hub.title')}</h1>
          <span className="text-xs bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded-full">Pro+</span>
        </div>
        <p className="text-secondary text-sm">{t('app_creator_hub.subtitle')}</p>
      </div>

      {loading ? (
        <div className="text-secondary text-sm py-10 text-center">{t('app_creator_hub.loading')}</div>
      ) : (
        <div className="space-y-5">

          {/* Stripe Connect */}
          <div className={`rounded-2xl p-5 border ${settings.stripe_onboarding_complete ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-700' : 'bg-surface border-theme'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-primary">
                  {settings.stripe_onboarding_complete ? t('app_creator_hub.stripe_connected') : t('app_creator_hub.connect_stripe')}
                </p>
                <p className="text-xs text-secondary mt-0.5">
                  {settings.stripe_onboarding_complete
                    ? `Account: ${settings.stripe_account_id}`
                    : t('app_creator_hub.connect_stripe_desc')}
                </p>
              </div>
              {!settings.stripe_onboarding_complete && (
                <button
                  onClick={connectStripe}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-black px-4 py-2 rounded-xl text-sm"
                >
                  {t('app_creator_hub.connect_btn')}
                </button>
              )}
            </div>
          </div>

          {/* Share your page */}
          {settings.stripe_onboarding_complete && creatorUrl && (
            <div className="bg-surface border border-theme rounded-2xl p-5">
              <p className="text-xs font-bold uppercase tracking-wide text-secondary mb-3">{t('app_creator_hub.share_page')}</p>
              <div className="flex items-center gap-2 bg-background border border-theme rounded-xl px-3 py-2 mb-3">
                <span className="text-xs text-secondary truncate flex-1">{creatorUrl}</span>
                <button
                  onClick={() => copyToClipboard(creatorUrl, 'Creator page link')}
                  className="text-xs font-bold text-amber-500 hover:text-amber-400 shrink-0"
                >
                  {t('app_creator_hub.copy')}
                </button>
                <a href={creatorUrl} target="_blank" rel="noopener noreferrer"
                  className="text-xs font-bold text-secondary hover:text-primary shrink-0">
                  {t('app_creator_hub.open')}
                </a>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {settings.tip_enabled && (
                  <button
                    onClick={() => copyToClipboard(creatorUrl, 'Tip jar link')}
                    className="py-2 rounded-xl border border-theme bg-background text-xs font-bold text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all"
                  >
                    {t('app_creator_hub.copy_tip_link')}
                  </button>
                )}
                {settings.subscription_enabled && (
                  <button
                    onClick={() => copyToClipboard(creatorUrl, 'Subscribe link')}
                    className="py-2 rounded-xl border border-theme bg-background text-xs font-bold text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all"
                  >
                    {t('app_creator_hub.copy_sub_link')}
                  </button>
                )}
                <a
                  href={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(creatorUrl)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="py-2 rounded-xl border border-theme bg-background text-xs font-bold text-secondary hover:text-primary hover:border-amber-400/50 transition-all text-center"
                >
                  {t('app_creator_hub.qr_code')}
                </a>
              </div>
              <p className="text-xs text-secondary mt-2">
                {t('app_creator_hub.add_to_bio')} <a href="/link-in-bio" className="text-amber-500 hover:underline">{t('app_creator_hub.link_in_bio')}</a>
              </p>
            </div>
          )}

          {/* Earnings summary */}
          {settings.stripe_onboarding_complete && earnings && (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-surface border border-theme rounded-2xl p-4 text-center">
                <p className="text-2xl font-black text-amber-500">${(earnings.total_tips_cents / 100).toFixed(2)}</p>
                <p className="text-xs text-secondary mt-1">{t('app_creator_hub.total_tips')}</p>
              </div>
              <div className="bg-surface border border-theme rounded-2xl p-4 text-center">
                <p className="text-2xl font-black text-emerald-500">{earnings.active_subscribers}</p>
                <p className="text-xs text-secondary mt-1">{t('app_creator_hub.active_subscribers')}</p>
              </div>
            </div>
          )}

          {/* Creator page identity */}
          <div className="bg-surface border border-theme rounded-2xl p-5 space-y-3">
            <p className="text-xs font-bold uppercase tracking-wide text-secondary">{t('app_creator_hub.your_creator_page')}</p>
            <div>
              <label className="block text-xs text-secondary mb-1">{t('app_creator_hub.page_handle_label')}</label>
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
              <label className="block text-xs text-secondary mb-1">{t('app_creator_hub.display_name_label')}</label>
              <input
                value={settings.page_title ?? ''}
                onChange={e => setSettings(s => ({ ...s, page_title: e.target.value }))}
                placeholder="Your Name"
                className="w-full bg-background border border-theme rounded-xl px-4 py-2 text-sm text-primary focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-xs text-secondary mb-1">{t('app_creator_hub.bio_label')}</label>
              <textarea
                value={settings.page_bio ?? ''}
                onChange={e => setSettings(s => ({ ...s, page_bio: e.target.value }))}
                placeholder="Tell your audience who you are..."
                rows={2}
                className="w-full bg-background border border-theme rounded-xl px-4 py-2 text-sm text-primary focus:outline-none focus:border-amber-400 resize-none"
              />
            </div>
            <div>
              <label className="block text-xs text-secondary mb-2">{t('app_creator_hub.header_color_label')}</label>
              <div className="flex flex-wrap gap-2">
                {HEADER_COLORS.map(c => (
                  <button
                    key={c.hex}
                    title={c.label}
                    onClick={() => setSettings(s => ({ ...s, header_color: c.hex }))}
                    className="w-7 h-7 rounded-full border-2 transition-all"
                    style={{
                      background: c.hex,
                      borderColor: settings.header_color === c.hex ? '#F59E0B' : 'transparent',
                      outline: settings.header_color === c.hex ? '2px solid #F59E0B' : 'none',
                      outlineOffset: 2,
                    }}
                  />
                ))}
              </div>
            </div>

            {settings.page_handle && (
              <a
                href={`/creator/${settings.page_handle}`}
                target="_blank"
                className="text-xs text-amber-500 hover:underline"
              >
                {t('app_creator_hub.preview_page')}
              </a>
            )}
          </div>

          {/* Tip jar */}
          <div className="bg-surface border border-theme rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-primary">{t('app_creator_hub.tip_jar_title')}</p>
                <p className="text-xs text-secondary mt-0.5">{t('app_creator_hub.tip_jar_desc')}</p>
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
                  <label className="block text-xs text-secondary mb-1">{t('app_creator_hub.min_tip')}</label>
                  <input
                    type="number"
                    min={1} max={100}
                    value={settings.tip_min / 100}
                    onChange={e => setSettings(s => ({ ...s, tip_min: Math.max(1, parseInt(e.target.value) || 1) * 100 }))}
                    className="w-full bg-background border border-theme rounded-lg px-3 py-1.5 text-sm text-primary focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs text-secondary mb-1">{t('app_creator_hub.max_tip')}</label>
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
                <p className="font-bold text-primary">{t('app_creator_hub.fan_subs_title')}</p>
                <p className="text-xs text-secondary mt-0.5">{t('app_creator_hub.fan_subs_desc')}</p>
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
                  <label className="block text-xs text-secondary mb-1">{t('app_creator_hub.monthly_price')}</label>
                  <input
                    type="number"
                    min={1} max={999}
                    value={settings.subscription_price / 100}
                    onChange={e => setSettings(s => ({ ...s, subscription_price: Math.max(1, parseInt(e.target.value) || 1) * 100 }))}
                    className="w-full bg-background border border-theme rounded-xl px-4 py-2 text-sm text-primary focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs text-secondary mb-1">{t('app_creator_hub.tier_name')}</label>
                  <input
                    value={settings.subscription_name}
                    onChange={e => setSettings(s => ({ ...s, subscription_name: e.target.value }))}
                    placeholder="Supporter"
                    className="w-full bg-background border border-theme rounded-xl px-4 py-2 text-sm text-primary focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs text-secondary mb-1">{t('app_creator_hub.tier_desc_label')}</label>
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
            {saving ? t('app_creator_hub.saving') : t('app_creator_hub.save_settings')}
          </button>

          {/* Paywalled posts */}
          {settings.stripe_onboarding_complete && (
            <div className="bg-surface border border-theme rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-primary">{t('app_creator_hub.exclusive_posts')}</p>
                  <p className="text-xs text-secondary mt-0.5">{t('app_creator_hub.exclusive_posts_desc')}</p>
                </div>
                <button
                  onClick={() => setShowNewPost(v => !v)}
                  className="text-xs font-black text-amber-500 hover:text-amber-400 border border-amber-400/40 rounded-lg px-3 py-1.5"
                >
                  {showNewPost ? t('app_creator_hub.cancel') : t('app_creator_hub.new_post')}
                </button>
              </div>

              {showNewPost && (
                <div className="space-y-3 pt-3 border-t border-theme">
                  <div>
                    <label className="block text-xs text-secondary mb-1">{t('app_creator_hub.post_title_label')}</label>
                    <input
                      value={newPost.title}
                      onChange={e => setNewPost(p => ({ ...p, title: e.target.value }))}
                      placeholder="My exclusive update"
                      className="w-full bg-background border border-theme rounded-xl px-4 py-2 text-sm text-primary focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-secondary mb-1">{t('app_creator_hub.preview_label')}</label>
                    <textarea
                      value={newPost.preview}
                      onChange={e => setNewPost(p => ({ ...p, preview: e.target.value }))}
                      placeholder="A short teaser your audience can see before unlocking..."
                      rows={2}
                      className="w-full bg-background border border-theme rounded-xl px-4 py-2 text-sm text-primary focus:outline-none focus:border-amber-400 resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-secondary mb-1">{t('app_creator_hub.full_content_label')}</label>
                    <textarea
                      value={newPost.content}
                      onChange={e => setNewPost(p => ({ ...p, content: e.target.value }))}
                      placeholder="The full post your fans will see after unlocking..."
                      rows={5}
                      className="w-full bg-background border border-theme rounded-xl px-4 py-2 text-sm text-primary focus:outline-none focus:border-amber-400 resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-secondary mb-1">{t('app_creator_hub.unlock_price_label')}</label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-secondary">$</span>
                      <input
                        type="number"
                        min={1}
                        step={0.01}
                        value={newPost.unlock_price}
                        onChange={e => setNewPost(p => ({ ...p, unlock_price: e.target.value }))}
                        placeholder="e.g. 2.99"
                        className="flex-1 bg-background border border-theme rounded-xl px-4 py-2 text-sm text-primary focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <p className="text-xs text-secondary mt-1">{t('app_creator_hub.unlock_price_note')}</p>
                  </div>
                  <button
                    onClick={createPost}
                    disabled={savingPost || !newPost.title.trim() || !newPost.preview.trim() || !newPost.content.trim()}
                    className="w-full bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-black font-black py-2 rounded-xl text-sm transition-all"
                  >
                    {savingPost ? t('app_creator_hub.creating') : t('app_creator_hub.create_post')}
                  </button>
                </div>
              )}

              {posts.length > 0 ? (
                <div className="space-y-2 pt-2 border-t border-theme">
                  {posts.map(post => (
                    <div key={post.id} className="flex items-start justify-between gap-3 bg-background border border-theme rounded-xl p-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-primary truncate">{post.title}</p>
                        <p className="text-xs text-secondary truncate">{post.preview}</p>
                        <div className="flex gap-2 mt-1">
                          {post.unlock_price_cents && (
                            <span className="text-xs text-amber-600 font-bold">${post.unlock_price_cents / 100} one-time</span>
                          )}
                          <span className="text-xs text-emerald-600 font-bold">fans</span>
                        </div>
                      </div>
                      <button
                        onClick={() => deletePost(post.id)}
                        disabled={deletingId === post.id}
                        className="text-xs text-red-400 hover:text-red-300 shrink-0 disabled:opacity-50"
                      >
                        {deletingId === post.id ? '...' : 'Delete'}
                      </button>
                    </div>
                  ))}
                </div>
              ) : !showNewPost && (
                <p className="text-xs text-secondary text-center py-4">{t('app_creator_hub.no_exclusive_posts')}</p>
              )}
            </div>
          )}

          {/* Recent tips */}
          {earnings && earnings.tips.length > 0 && (
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-secondary mb-3">{t('app_creator_hub.recent_tips')}</p>
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
              <p className="text-xs font-bold uppercase tracking-wide text-secondary mb-3">{t('app_creator_hub.fan_subscribers')} ({earnings.active_subscribers} active)</p>
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
