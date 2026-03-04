'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'

function SkeletonBox({ className }: { className?: string }) {
  return <div className={`bg-gray-100 rounded-xl animate-pulse ${className}`} />
}

const ALL_PLATFORMS = [
  { id: 'instagram', icon: '📸', label: 'Instagram' },
  { id: 'twitter', icon: '🐦', label: 'X / Twitter' },
  { id: 'linkedin', icon: '💼', label: 'LinkedIn' },
  { id: 'tiktok', icon: '🎵', label: 'TikTok' },
  { id: 'facebook', icon: '📘', label: 'Facebook' },
  { id: 'threads', icon: '🧵', label: 'Threads' },
  { id: 'pinterest', icon: '📌', label: 'Pinterest' },
  { id: 'youtube', icon: '▶️', label: 'YouTube' },
  { id: 'snapchat', icon: '👻', label: 'Snapchat' },
  { id: 'bluesky', icon: '🦋', label: 'Bluesky' },
  { id: 'reddit', icon: '🤖', label: 'Reddit' },
  { id: 'discord', icon: '💬', label: 'Discord' },
  { id: 'telegram', icon: '✈️', label: 'Telegram' },
  { id: 'mastodon', icon: '🐘', label: 'Mastodon' },
  { id: 'lemon8', icon: '🍋', label: 'Lemon8' },
  { id: 'bereal', icon: '📷', label: 'BeReal' },
]

const TIMEZONES = [
  'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
  'America/Anchorage', 'Pacific/Honolulu', 'Europe/London', 'Europe/Paris',
  'Europe/Berlin', 'Asia/Tokyo', 'Asia/Shanghai', 'Asia/Kolkata',
  'Australia/Sydney', 'Pacific/Auckland',
]

const TABS = [
  { id: 'profile', label: 'Profile', icon: '👤' },
  { id: 'preferences', label: 'Preferences', icon: '⚙️' },
  { id: 'notifications', label: 'Notifications', icon: '🔔' },
  { id: 'danger', label: 'Danger Zone', icon: '⚠️' },
]

export default function Settings() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'notifications' | 'danger'>('profile')

  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [website, setWebsite] = useState('')
  const [timezone, setTimezone] = useState('America/New_York')

  const [emailDigest, setEmailDigest] = useState(true)
  const [postReminders, setPostReminders] = useState(true)
  const [weeklyReport, setWeeklyReport] = useState(false)

  const [defaultPlatforms, setDefaultPlatforms] = useState<string[]>(['instagram'])
  const [defaultStatus, setDefaultStatus] = useState<'draft' | 'scheduled'>('draft')
  const [theme, setTheme] = useState<'light' | 'system'>('light')

  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const router = useRouter()

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
        setDisplayName(data.display_name || '')
        setBio(data.bio || '')
        setWebsite(data.website || '')
        setTimezone(data.timezone || 'America/New_York')
        setEmailDigest(data.email_digest ?? true)
        setPostReminders(data.post_reminders ?? true)
        setWeeklyReport(data.weekly_report ?? false)
        setDefaultPlatforms(data.default_platforms || ['instagram'])
        setDefaultStatus(data.default_status || 'draft')
        setTheme(data.theme || 'light')
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
    setSaving(true)
    const { error } = await supabase
      .from('user_settings')
      .upsert({
        user_id: user.id,
        display_name: displayName,
        bio,
        website,
        timezone,
        email_digest: emailDigest,
        post_reminders: postReminders,
        weekly_report: weeklyReport,
        default_platforms: defaultPlatforms,
        default_status: defaultStatus,
        theme,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' })
    if (error) { showToast('Failed to save settings', 'error'); setSaving(false); return }
    showToast('Settings saved!', 'success')
    setSaving(false)
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== user?.email) { showToast('Email does not match', 'error'); return }
    await supabase.auth.signOut()
    router.push('/')
  }

  const togglePlatform = (id: string) => {
    setDefaultPlatforms(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="ml-56 flex-1 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-extrabold tracking-tight">Settings</h1>
            <p className="text-sm text-gray-400 mt-0.5">Manage your account and preferences</p>
          </div>

          <div className="flex items-center gap-1 bg-white border border-gray-100 rounded-2xl p-1 mb-6">
            {TABS.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${activeTab === tab.id ? 'bg-black text-white' : 'text-gray-500 hover:text-black'}`}>
                <span>{tab.icon}</span>{tab.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1,2,3].map(i => <SkeletonBox key={i} className="h-16 rounded-2xl" />)}
            </div>
          ) : (
            <>
              {/* PROFILE */}
              {activeTab === 'profile' && (
                <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-5">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Email</p>
                    <p className="text-sm font-medium text-gray-700 px-3 py-2.5 bg-gray-50 rounded-xl">{user?.email}</p>
                    <p className="text-xs text-gray-400 mt-1">Email cannot be changed here</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Display Name</label>
                    <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)}
                      placeholder="Your name or brand name"
                      className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Bio</label>
                    <textarea value={bio} onChange={e => setBio(e.target.value)}
                      placeholder="A short description of you or your brand"
                      rows={3}
                      className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 resize-none" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Website</label>
                    <input type="url" value={website} onChange={e => setWebsite(e.target.value)}
                      placeholder="https://yourwebsite.com"
                      className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Timezone</label>
                    <select value={timezone} onChange={e => setTimezone(e.target.value)}
                      className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 bg-white">
                      {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
                    </select>
                  </div>
                </div>
              )}

              {/* PREFERENCES */}
              {activeTab === 'preferences' && (
                <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-6">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Default Platforms</p>
                    <p className="text-xs text-gray-400 mb-3">Pre-select these platforms when composing new posts</p>
                    <div className="flex flex-wrap gap-2">
                      {ALL_PLATFORMS.map(p => (
                        <button key={p.id} onClick={() => togglePlatform(p.id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${defaultPlatforms.includes(p.id) ? 'bg-black text-white border-black' : 'border-gray-200 text-gray-500 hover:border-gray-400'}`}>
                          <span>{p.icon}</span>{p.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Default Save Action</p>
                    <div className="flex gap-3">
                      {(['draft', 'scheduled'] as const).map(s => (
                        <button key={s} onClick={() => setDefaultStatus(s)}
                          className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all ${defaultStatus === s ? 'bg-black text-white border-black' : 'border-gray-200 text-gray-500 hover:border-gray-400'}`}>
                          {s === 'draft' ? '📂 Save as Draft' : '📅 Schedule'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Theme</p>
                    <div className="flex gap-3">
                      {([['light', '☀️ Light'], ['system', '💻 System']] as const).map(([val, label]) => (
                        <button key={val} onClick={() => setTheme(val)}
                          className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all ${theme === val ? 'bg-black text-white border-black' : 'border-gray-200 text-gray-500 hover:border-gray-400'}`}>
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* NOTIFICATIONS */}
              {activeTab === 'notifications' && (
                <div className="space-y-4">
                  <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-5">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email Notifications</p>
                    {[
                      { label: 'Email Digest', sub: 'Daily summary of your scheduled posts', value: emailDigest, setter: setEmailDigest },
                      { label: 'Post Reminders', sub: 'Get reminded when a post is due to go out', value: postReminders, setter: setPostReminders },
                      { label: 'Weekly Report', sub: 'Weekly analytics summary sent to your inbox', value: weeklyReport, setter: setWeeklyReport },
                    ].map(item => (
                      <div key={item.label} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold">{item.label}</p>
                          <p className="text-xs text-gray-400">{item.sub}</p>
                        </div>
                        <button onClick={() => item.setter(!item.value)}
                          className={`w-11 h-6 rounded-full transition-all relative flex-shrink-0 ${item.value ? 'bg-black' : 'bg-gray-200'}`}>
                          <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${item.value ? 'left-6' : 'left-1'}`} />
                        </button>
                      </div>
                    ))}
                    <div className="pt-2 border-t border-gray-100">
                      <p className="text-xs text-gray-400">Emails sent to <span className="font-semibold text-gray-700">{user?.email}</span></p>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Push Notifications</p>
                        <p className="text-xs text-gray-400 mt-1">Browser and mobile push alerts</p>
                      </div>
                      <span className="text-xs font-bold bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full">Coming soon</span>
                    </div>
                    {[
                      { label: 'Post Published', sub: 'Alert when a scheduled post goes live' },
                      { label: 'Post Failed', sub: 'Alert if a scheduled post fails to publish' },
                      { label: 'Team Activity', sub: 'Notify when a team member makes changes' },
                      { label: 'Credit Low', sub: 'Warn when AI credits are running low' },
                    ].map(item => (
                      <div key={item.label} className="flex items-center justify-between opacity-50">
                        <div>
                          <p className="text-sm font-semibold">{item.label}</p>
                          <p className="text-xs text-gray-400">{item.sub}</p>
                        </div>
                        <div className="w-11 h-6 rounded-full bg-gray-200 relative flex-shrink-0">
                          <div className="w-4 h-4 bg-white rounded-full absolute top-1 left-1" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* DANGER */}
              {activeTab === 'danger' && (
                <div className="space-y-4">
                  <div className="bg-white border border-gray-100 rounded-2xl p-6">
                    <h3 className="text-sm font-bold mb-1">Export Data</h3>
                    <p className="text-xs text-gray-400 mb-4">Download a copy of all your posts and account data</p>
                    <button className="text-sm font-semibold px-4 py-2.5 border border-gray-200 rounded-xl hover:border-gray-400 transition-all">
                      📦 Export All Data
                    </button>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                    <h3 className="text-sm font-bold text-red-700 mb-1">Delete Account</h3>
                    <p className="text-xs text-red-500 mb-4">Permanently deletes your account and all data. This cannot be undone.</p>
                    {!showDeleteConfirm ? (
                      <button onClick={() => setShowDeleteConfirm(true)}
                        className="text-sm font-semibold px-4 py-2.5 bg-red-500 text-white rounded-xl hover:opacity-80 transition-all">
                        Delete My Account
                      </button>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-xs text-red-600 font-semibold">Type your email to confirm: <span className="font-bold">{user?.email}</span></p>
                        <input type="email" value={deleteConfirm} onChange={e => setDeleteConfirm(e.target.value)}
                          placeholder={user?.email}
                          className="w-full px-3 py-2.5 text-sm border border-red-200 rounded-xl focus:outline-none focus:border-red-400 bg-white" />
                        <div className="flex gap-2">
                          <button onClick={handleDeleteAccount} disabled={deleteConfirm !== user?.email}
                            className="text-sm font-semibold px-4 py-2.5 bg-red-500 text-white rounded-xl hover:opacity-80 transition-all disabled:opacity-40">
                            Confirm Delete
                          </button>
                          <button onClick={() => { setShowDeleteConfirm(false); setDeleteConfirm('') }}
                            className="text-sm font-semibold px-4 py-2.5 border border-gray-200 rounded-xl hover:border-gray-400 transition-all">
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab !== 'danger' && (
                <div className="mt-4 flex justify-end">
                  <button onClick={handleSave} disabled={saving}
                    className="bg-black text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:opacity-80 transition-all disabled:opacity-40">
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl text-sm font-semibold shadow-lg ${toast.type === 'success' ? 'bg-black text-white' : 'bg-red-500 text-white'}`}>
          {toast.type === 'success' ? '✅' : '❌'} {toast.message}
        </div>
      )}
    </div>
  )
}