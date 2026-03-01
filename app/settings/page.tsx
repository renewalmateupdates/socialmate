'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

function SkeletonBox({ className }: { className?: string }) {
  return <div className={`bg-gray-100 rounded-xl animate-pulse ${className}`} />
}

const TIMEZONES = [
  'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
  'America/Anchorage', 'Pacific/Honolulu', 'Europe/London', 'Europe/Paris',
  'Europe/Berlin', 'Europe/Moscow', 'Asia/Dubai', 'Asia/Kolkata',
  'Asia/Singapore', 'Asia/Tokyo', 'Australia/Sydney', 'Pacific/Auckland',
]

const PLATFORMS = [
  { id: 'instagram', label: 'Instagram', icon: '📸' },
  { id: 'twitter', label: 'X / Twitter', icon: '🐦' },
  { id: 'linkedin', label: 'LinkedIn', icon: '💼' },
  { id: 'tiktok', label: 'TikTok', icon: '🎵' },
  { id: 'facebook', label: 'Facebook', icon: '📘' },
  { id: 'pinterest', label: 'Pinterest', icon: '📌' },
  { id: 'youtube', label: 'YouTube', icon: '▶️' },
  { id: 'threads', label: 'Threads', icon: '🧵' },
  { id: 'snapchat', label: 'Snapchat', icon: '👻' },
  { id: 'bluesky', label: 'Bluesky', icon: '🦋' },
  { id: 'reddit', label: 'Reddit', icon: '🤖' },
  { id: 'discord', label: 'Discord', icon: '💬' },
  { id: 'telegram', label: 'Telegram', icon: '✈️' },
  { id: 'mastodon', label: 'Mastodon', icon: '🐘' },
  { id: 'lemon8', label: 'Lemon8', icon: '🍋' },
  { id: 'bereal', label: 'BeReal', icon: '📷' },
]

type Settings = {
  display_name: string
  avatar_url: string
  timezone: string
  default_platforms: string[]
  default_hashtags: string
  email_notifications: boolean
  post_reminders: boolean
  weekly_digest: boolean
  marketing_emails: boolean
  auto_save_drafts: boolean
  show_char_count: boolean
  compact_sidebar: boolean
}

const DEFAULT_SETTINGS: Settings = {
  display_name: '',
  avatar_url: '',
  timezone: 'America/New_York',
  default_platforms: ['instagram'],
  default_hashtags: '',
  email_notifications: true,
  post_reminders: true,
  weekly_digest: false,
  marketing_emails: false,
  auto_save_drafts: true,
  show_char_count: true,
  compact_sidebar: false,
}

export default function Settings() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  const [activeTab, setActiveTab] = useState<'profile' | 'defaults' | 'notifications' | 'preferences' | 'danger'>('profile')
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteInput, setDeleteInput] = useState('')
  const router = useRouter()

  const AI_CREDITS_LEFT = 15
  const AI_CREDITS_TOTAL = 15
  const ACCOUNTS_USED = 0
  const ACCOUNTS_TOTAL = 16

  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUser(user)

      const { data } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (data) {
        setSettings({ ...DEFAULT_SETTINGS, ...data.settings })
      } else {
        setSettings({ ...DEFAULT_SETTINGS, display_name: user.email?.split('@')[0] || '' })
      }
      setLoading(false)
    }
    getData()
  }, [])

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleSave = async () => {
    if (!user) return
    setSaving(true)

    const { data: existing } = await supabase
      .from('user_settings')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (existing) {
      const { error } = await supabase
        .from('user_settings')
        .update({ settings, updated_at: new Date().toISOString() })
        .eq('user_id', user.id)
      if (error) { showToast('Failed to save settings', 'error'); setSaving(false); return }
    } else {
      const { error } = await supabase
        .from('user_settings')
        .insert({ user_id: user.id, settings })
      if (error) { showToast('Failed to save settings', 'error'); setSaving(false); return }
    }

    showToast('Settings saved!', 'success')
    setSaving(false)
  }

  const togglePlatform = (id: string) => {
    setSettings(prev => ({
      ...prev,
      default_platforms: prev.default_platforms.includes(id)
        ? prev.default_platforms.filter(p => p !== id)
        : [...prev.default_platforms, id]
    }))
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleDeleteAllPosts = async () => {
    await supabase.from('posts').delete().eq('user_id', user.id)
    showToast('All posts deleted', 'success')
    setShowDeleteConfirm(false)
    setDeleteInput('')
  }

  const set = (key: keyof Settings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const TABS = [
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'defaults', label: 'Defaults', icon: '⚙️' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'preferences', label: 'Preferences', icon: '🎨' },
    { id: 'danger', label: 'Danger Zone', icon: '⚠️' },
  ] as const

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* SIDEBAR */}
      <div className="w-56 bg-white border-r border-gray-100 flex flex-col fixed h-full">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-black rounded-lg flex items-center justify-center text-white text-sm font-bold">S</div>
            <span className="font-bold text-base tracking-tight">SocialMate</span>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-3 py-2">Content</div>
          {[
            { icon: "🏠", label: "Dashboard", href: "/dashboard" },
            { icon: "📅", label: "Calendar", href: "/calendar" },
            { icon: "✏️", label: "Compose", href: "/compose" },
            { icon: "📂", label: "Drafts", href: "/drafts" },
            { icon: "⏳", label: "Queue", href: "/queue" },
            { icon: "#️⃣", label: "Hashtags", href: "/hashtags" },
            { icon: "🖼️", label: "Media Library", href: "/media" },
            { icon: "📝", label: "Templates", href: "/templates" },
            { icon: "🔗", label: "Link in Bio", href: "/link-in-bio" },
            { icon: "📆", label: "Bulk Scheduler", href: "/bulk-scheduler" },
          ].map(item => (
            <Link key={item.label} href={item.href} className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-black transition-all">
              <span>{item.icon}</span>{item.label}
            </Link>
          ))}
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-3 py-2 mt-3">Insights</div>
          {[
            { icon: "📊", label: "Analytics", href: "/analytics" },
            { icon: "🔍", label: "Best Times", href: "/best-times" },
          ].map(item => (
            <Link key={item.label} href={item.href} className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-black transition-all">
              <span>{item.icon}</span>{item.label}
            </Link>
          ))}
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-3 py-2 mt-3">Settings</div>
          {[
            { icon: "🔗", label: "Accounts", href: "/accounts" },
            { icon: "👥", label: "Team", href: "/team" },
            { icon: "⚙️", label: "Settings", href: "/settings", active: true },
            { icon: "🎁", label: "Referrals", href: "/referral" },
            { icon: "🔔", label: "Notifications", href: "/notifications" },
            { icon: "🔎", label: "Search", href: "/search" },
          ].map(item => (
            <Link key={item.label} href={item.href} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${'active' in item && item.active ? 'bg-gray-100 text-black' : 'text-gray-500 hover:bg-gray-50 hover:text-black'}`}>
              <span>{item.icon}</span>{item.label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-100 space-y-3">
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-gray-500">AI Credits</span>
              <span className="text-xs font-bold text-gray-700">{AI_CREDITS_LEFT}/{AI_CREDITS_TOTAL}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div className="bg-black h-1.5 rounded-full" style={{ width: `${(AI_CREDITS_LEFT / AI_CREDITS_TOTAL) * 100}%` }} />
            </div>
            <p className="text-xs text-gray-400 mt-1.5">{AI_CREDITS_LEFT} credits remaining</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-gray-500">Accounts</span>
              <span className="text-xs font-bold text-gray-700">{ACCOUNTS_USED}/{ACCOUNTS_TOTAL}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div className="bg-black h-1.5 rounded-full" style={{ width: `${(ACCOUNTS_USED / ACCOUNTS_TOTAL) * 100}%` }} />
            </div>
            <p className="text-xs text-gray-400 mt-1.5">{ACCOUNTS_TOTAL - ACCOUNTS_USED} slots remaining</p>
          </div>
          <Link href="/pricing" className="w-full block text-center bg-black text-white text-xs font-semibold px-4 py-2 rounded-xl hover:opacity-80 transition-all">
            ⚡ Upgrade to Pro
          </Link>
          <div className="px-1">
            <div className="text-xs text-gray-400 truncate mb-1">{user?.email}</div>
            <button onClick={handleSignOut} className="w-full text-left px-0 py-1 text-xs text-gray-400 hover:text-black transition-all">Sign out</button>
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div className="ml-56 flex-1 p-8">
        <div className="max-w-2xl mx-auto">

          {/* HEADER */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">Settings</h1>
              <p className="text-sm text-gray-400 mt-0.5">Manage your account and preferences</p>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-black text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:opacity-80 transition-all disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

          {/* TABS */}
          <div className="flex gap-1 bg-white border border-gray-100 rounded-xl p-1 mb-6 flex-wrap">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === tab.id ? 'bg-black text-white' : 'text-gray-500 hover:text-black'} ${tab.id === 'danger' && activeTab !== 'danger' ? 'text-red-400 hover:text-red-500' : ''}`}
              >
                <span>{tab.icon}</span>{tab.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1,2,3].map(i => <SkeletonBox key={i} className="h-24 rounded-2xl" />)}
            </div>
          ) : (
            <div className="space-y-4">

              {/* PROFILE TAB */}
              {activeTab === 'profile' && (
                <>
                  <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-4">
                    <h2 className="text-sm font-bold tracking-tight">Profile Information</h2>

                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center text-2xl font-bold overflow-hidden flex-shrink-0">
                        {settings.avatar_url ? (
                          <img src={settings.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                        ) : (
                          <span>{settings.display_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?'}</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Avatar URL</label>
                        <input
                          type="text"
                          placeholder="Paste an image URL..."
                          value={settings.avatar_url}
                          onChange={e => set('avatar_url', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Display Name</label>
                      <input
                        type="text"
                        placeholder="Your name or brand..."
                        value={settings.display_name}
                        onChange={e => set('display_name', e.target.value)}
                        className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Email</label>
                      <input
                        type="text"
                        value={user?.email || ''}
                        disabled
                        className="w-full px-3 py-2.5 text-sm border border-gray-100 rounded-xl bg-gray-50 text-gray-400 cursor-not-allowed"
                      />
                      <p className="text-xs text-gray-400 mt-1">Email cannot be changed here</p>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Timezone</label>
                      <select
                        value={settings.timezone}
                        onChange={e => set('timezone', e.target.value)}
                        className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 bg-white"
                      >
                        {TIMEZONES.map(tz => (
                          <option key={tz} value={tz}>{tz.replace('_', ' ')}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-100 rounded-2xl p-6">
                    <h2 className="text-sm font-bold tracking-tight mb-4">Account</h2>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div>
                        <p className="text-sm font-semibold">Free Plan</p>
                        <p className="text-xs text-gray-400">16 platforms · unlimited scheduling · 15 AI credits/mo</p>
                      </div>
                      <Link href="/pricing" className="text-xs font-semibold bg-black text-white px-3 py-1.5 rounded-xl hover:opacity-80 transition-all">
                        Upgrade →
                      </Link>
                    </div>
                  </div>
                </>
              )}

              {/* DEFAULTS TAB */}
              {activeTab === 'defaults' && (
                <>
                  <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-4">
                    <div>
                      <h2 className="text-sm font-bold tracking-tight">Default Platforms</h2>
                      <p className="text-xs text-gray-400 mt-0.5">Pre-select these platforms when composing new posts</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {PLATFORMS.map(p => (
                        <button
                          key={p.id}
                          onClick={() => togglePlatform(p.id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                            settings.default_platforms.includes(p.id)
                              ? 'bg-black text-white border-black'
                              : 'border-gray-200 text-gray-500 hover:border-gray-400'
                          }`}
                        >
                          <span>{p.icon}</span>{p.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-4">
                    <div>
                      <h2 className="text-sm font-bold tracking-tight">Default Hashtags</h2>
                      <p className="text-xs text-gray-400 mt-0.5">These hashtags will be suggested on every new post</p>
                    </div>
                    <textarea
                      placeholder="#yourbrand #niche #evergreen"
                      value={settings.default_hashtags}
                      onChange={e => set('default_hashtags', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 resize-none"
                    />
                    <p className="text-xs text-gray-400">{settings.default_hashtags.split(' ').filter(h => h.startsWith('#')).length} hashtags</p>
                  </div>
                </>
              )}

              {/* NOTIFICATIONS TAB */}
              {activeTab === 'notifications' && (
                <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-1">
                  <h2 className="text-sm font-bold tracking-tight mb-4">Notification Preferences</h2>
                  {[
                    { key: 'email_notifications', label: 'Email Notifications', sub: 'Receive important account emails' },
                    { key: 'post_reminders', label: 'Post Reminders', sub: 'Get notified before scheduled posts go live' },
                    { key: 'weekly_digest', label: 'Weekly Digest', sub: 'A summary of your posting activity each week' },
                    { key: 'marketing_emails', label: 'Product Updates', sub: 'News about new features and improvements' },
                  ].map(item => (
                    <div key={item.key} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                      <div>
                        <p className="text-sm font-semibold">{item.label}</p>
                        <p className="text-xs text-gray-400">{item.sub}</p>
                      </div>
                      <button
                        onClick={() => set(item.key as keyof Settings, !(settings as any)[item.key])}
                        className={`w-10 h-5 rounded-full transition-all relative flex-shrink-0 ${(settings as any)[item.key] ? 'bg-black' : 'bg-gray-200'}`}
                      >
                        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${(settings as any)[item.key] ? 'left-5' : 'left-0.5'}`} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* PREFERENCES TAB */}
              {activeTab === 'preferences' && (
                <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-1">
                  <h2 className="text-sm font-bold tracking-tight mb-4">App Preferences</h2>
                  {[
                    { key: 'auto_save_drafts', label: 'Auto-save Drafts', sub: 'Automatically save posts as drafts while composing' },
                    { key: 'show_char_count', label: 'Show Character Count', sub: 'Display character limits per platform in the composer' },
                    { key: 'compact_sidebar', label: 'Compact Sidebar', sub: 'Use a smaller sidebar to give more space to content' },
                  ].map(item => (
                    <div key={item.key} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                      <div>
                        <p className="text-sm font-semibold">{item.label}</p>
                        <p className="text-xs text-gray-400">{item.sub}</p>
                      </div>
                      <button
                        onClick={() => set(item.key as keyof Settings, !(settings as any)[item.key])}
                        className={`w-10 h-5 rounded-full transition-all relative flex-shrink-0 ${(settings as any)[item.key] ? 'bg-black' : 'bg-gray-200'}`}
                      >
                        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${(settings as any)[item.key] ? 'left-5' : 'left-0.5'}`} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* DANGER ZONE TAB */}
              {activeTab === 'danger' && (
                <div className="space-y-4">
                  <div className="bg-white border border-red-100 rounded-2xl p-6 space-y-4">
                    <h2 className="text-sm font-bold text-red-500 tracking-tight">⚠️ Danger Zone</h2>
                    <p className="text-xs text-gray-400">These actions are irreversible. Please be certain before proceeding.</p>

                    <div className="flex items-center justify-between p-4 border border-red-100 rounded-xl bg-red-50/50">
                      <div>
                        <p className="text-sm font-semibold">Delete All Posts</p>
                        <p className="text-xs text-gray-400">Permanently delete all your scheduled posts and drafts</p>
                      </div>
                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="text-xs font-semibold px-3 py-1.5 bg-red-500 text-white rounded-xl hover:opacity-80 transition-all"
                      >
                        Delete All
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-red-100 rounded-xl bg-red-50/50">
                      <div>
                        <p className="text-sm font-semibold">Sign Out</p>
                        <p className="text-xs text-gray-400">Sign out of your SocialMate account</p>
                      </div>
                      <button
                        onClick={handleSignOut}
                        className="text-xs font-semibold px-3 py-1.5 border border-red-200 text-red-500 rounded-xl hover:border-red-400 transition-all"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* DELETE CONFIRM MODAL */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6" onClick={() => setShowDeleteConfirm(false)}>
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="text-3xl mb-3">⚠️</div>
              <h2 className="font-bold text-base tracking-tight mb-2">Delete all posts?</h2>
              <p className="text-sm text-gray-400 mb-4">This will permanently delete all your scheduled posts and drafts. This cannot be undone.</p>
              <p className="text-xs font-semibold text-gray-500 mb-2">Type <span className="font-bold text-black">DELETE</span> to confirm</p>
              <input
                type="text"
                value={deleteInput}
                onChange={e => setDeleteInput(e.target.value)}
                placeholder="DELETE"
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-red-400 mb-4"
              />
              <div className="flex gap-2">
                <button onClick={() => { setShowDeleteConfirm(false); setDeleteInput('') }} className="flex-1 py-2.5 text-sm font-semibold border border-gray-200 rounded-xl hover:border-gray-400 transition-all">
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAllPosts}
                  disabled={deleteInput !== 'DELETE'}
                  className="flex-1 py-2.5 text-sm font-semibold bg-red-500 text-white rounded-xl hover:opacity-80 transition-all disabled:opacity-40"
                >
                  Delete All
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl text-sm font-semibold shadow-lg ${toast.type === 'success' ? 'bg-black text-white' : 'bg-red-500 text-white'}`}>
          {toast.type === 'success' ? '✅' : '❌'} {toast.message}
        </div>
      )}
    </div>
  )
}