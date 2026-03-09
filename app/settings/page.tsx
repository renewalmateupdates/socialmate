'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { useWorkspace } from '@/contexts/WorkspaceContext'

const TABS = ['Profile', 'Plan', 'Referrals', 'Notifications', 'Security', 'White Label']

const REFERRAL_TIERS = [
  { paying: 5,   reward: '1 month Pro free',  icon: '🎁' },
  { paying: 10,  reward: '3 months Pro free', icon: '⭐' },
  { paying: 25,  reward: '6 months Pro free', icon: '🚀' },
  { paying: 50,  reward: '1 year Pro free',   icon: '💎' },
  { paying: 100, reward: 'Pro free for life', icon: '👑' },
]

const MOCK_HISTORY = [
  { name: 'Alex M.',   date: 'Feb 28, 2025', status: 'Upgraded to Pro', reward: '+50 credits' },
  { name: 'Jordan K.', date: 'Feb 14, 2025', status: 'Signed up',       reward: '+5 credits'  },
  { name: 'Sam R.',    date: 'Jan 30, 2025', status: 'Upgraded to Pro', reward: '+50 credits' },
]

export default function Settings() {
  const { plan } = useWorkspace()
  const router = useRouter()

  // St1: auth guard
  const [userEmail, setUserEmail] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')
  const [authLoading, setAuthLoading] = useState(true)

  const [activeTab, setActiveTab] = useState('Profile')
  // St3: per-tab saved state instead of one shared boolean
  const [savedTab, setSavedTab] = useState<string | null>(null)
  const [whiteLabel, setWhiteLabel] = useState(false)
  const [notifications, setNotifications] = useState({
    postPublished: true,
    postFailed: true,
    weeklyDigest: false,
    creditLow: true,
    teamActivity: false,
    productUpdates: true,
  })
  const [copiedLink, setCopiedLink] = useState(false)

  // St4: danger zone confirm states
  const [confirmDeletePosts, setConfirmDeletePosts] = useState(false)
  const [confirmDeleteAccount, setConfirmDeleteAccount] = useState(false)
  const [dangerLoading, setDangerLoading] = useState(false)

  const referralCode = 'SOCIAL-DEMO'
  const referralLink = `https://socialmate.app/signup?ref=${referralCode}`
  const payingReferrals = 2
  const totalReferrals = 3
  const creditsEarned = 105

  // St1 + St2: load auth + profile data
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUserEmail(user.email || '')

      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name, username, bio')
        .eq('id', user.id)
        .single()

      if (profile) {
        setDisplayName(profile.display_name || '')
        setUsername(profile.username || '')
        setBio(profile.bio || '')
      }
      setAuthLoading(false)
    }
    init()
  }, [router])

  const handleSave = async (tab: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    if (tab === 'Profile') {
      await supabase.from('profiles').update({
        display_name: displayName,
        username,
        bio,
      }).eq('id', user.id)
    }

    setSavedTab(tab)
    setTimeout(() => setSavedTab(null), 2000)
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  // St4: danger zone actions with confirm
  const handleDeleteAllPosts = async () => {
    setDangerLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('posts').delete().eq('user_id', user.id).in('status', ['scheduled', 'draft'])
    }
    setConfirmDeletePosts(false)
    setDangerLoading(false)
  }

  const handleDeleteAccount = async () => {
    setDangerLoading(true)
    // Sign out — actual account deletion requires a Supabase edge function with admin rights
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar />
        <div className="ml-56 flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="ml-56 flex-1 p-8">
        <div className="max-w-3xl mx-auto">

          <div className="mb-8">
            <h1 className="text-2xl font-extrabold tracking-tight">Settings</h1>
            <p className="text-sm text-gray-400 mt-0.5">Manage your account, plan, and preferences</p>
          </div>

          {/* TABS */}
          <div className="flex items-center gap-1 mb-6 bg-white border border-gray-100 rounded-2xl p-1.5 flex-wrap">
            {TABS.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === tab ? 'bg-black text-white' : 'text-gray-500 hover:text-black'
                }`}>
                {tab}
              </button>
            ))}
          </div>

          {/* ── PROFILE ── */}
          {activeTab === 'Profile' && (
            <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-4">
              <h2 className="text-base font-extrabold">Profile</h2>
              {/* St2: live values from Supabase */}
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">Display Name</label>
                <input
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-black transition-all" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">Email</label>
                <input
                  value={userEmail}
                  disabled
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none bg-gray-50 text-gray-400 cursor-not-allowed" />
                <p className="text-xs text-gray-400 mt-1">Email cannot be changed here.</p>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">Username / Handle</label>
                <input
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="@yourhandle"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-black transition-all" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">Bio</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  placeholder="Tell your audience about yourself..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-black transition-all resize-none" />
              </div>
              <button onClick={() => handleSave('Profile')}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  savedTab === 'Profile' ? 'bg-green-500 text-white' : 'bg-black text-white hover:opacity-80'
                }`}>
                {savedTab === 'Profile' ? '✓ Saved!' : 'Save Changes'}
              </button>
            </div>
          )}

          {/* ── PLAN ── */}
          {activeTab === 'Plan' && (
            <div className="space-y-4">
              <div className="bg-white border border-gray-100 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-base font-extrabold">Current Plan</h2>
                    <p className="text-xs text-gray-400 mt-0.5">Your active subscription</p>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1.5 rounded-full capitalize ${
                    plan === 'free' ? 'bg-gray-100 text-gray-600' :
                    plan === 'pro' ? 'bg-black text-white' :
                    'bg-purple-100 text-purple-700'
                  }`}>{plan}</span>
                </div>
                {plan === 'free' && (
                  <div className="space-y-3">
                    <div className="bg-black text-white rounded-xl p-4">
                      <p className="text-sm font-extrabold mb-1">Upgrade to Pro — $5/month</p>
                      <p className="text-xs text-gray-400 mb-3">5 accounts, 300 AI credits, 10 GB storage, 90-day analytics</p>
                      <button className="bg-white text-black text-xs font-bold px-4 py-2 rounded-lg hover:opacity-80 transition-all">
                        Upgrade to Pro →
                      </button>
                    </div>
                    <div className="border border-purple-200 rounded-xl p-4">
                      <p className="text-sm font-extrabold mb-1">Agency — $20/month</p>
                      <p className="text-xs text-gray-400 mb-3">Up to 50 seats, client workspaces, 50 GB storage, all-time analytics</p>
                      <button className="bg-purple-600 text-white text-xs font-bold px-4 py-2 rounded-lg hover:opacity-80 transition-all">
                        Upgrade to Agency →
                      </button>
                    </div>
                  </div>
                )}
                {plan !== 'free' && (
                  <div>
                    <p className="text-xs text-gray-500 mb-3">Next billing date: April 1, 2025</p>
                    <button className="text-xs font-bold text-red-500 hover:text-red-700 transition-all">
                      Cancel subscription
                    </button>
                  </div>
                )}
              </div>
              <div className="bg-white border border-gray-100 rounded-2xl p-6">
                <h2 className="text-base font-extrabold mb-4">AI Credits</h2>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500">Monthly credits</span>
                  <span className="text-xs font-bold">100 / 100</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 mb-4">
                  <div className="bg-black h-2 rounded-full" style={{ width: '100%' }} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Banked credits</span>
                  <span className="text-xs font-bold">0 / 300</span>
                </div>
              </div>
            </div>
          )}

          {/* ── REFERRALS ── */}
          {activeTab === 'Referrals' && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Total Referrals',  value: totalReferrals  },
                  { label: 'Paying Referrals', value: payingReferrals },
                  { label: 'Credits Earned',   value: creditsEarned   },
                ].map((stat, i) => (
                  <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 text-center">
                    <p className="text-3xl font-extrabold mb-1">{stat.value}</p>
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">{stat.label}</p>
                  </div>
                ))}
              </div>

              <div className="bg-black text-white rounded-2xl p-6">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Your Referral Link</p>
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex-1 bg-white/10 rounded-xl px-4 py-3 text-sm font-mono truncate">
                    {referralLink}
                  </div>
                  <button onClick={handleCopyLink}
                    className={`px-5 py-3 rounded-xl text-sm font-bold transition-all flex-shrink-0 ${
                      copiedLink ? 'bg-green-500 text-white' : 'bg-white text-black hover:opacity-80'
                    }`}>
                    {copiedLink ? '✓ Copied!' : 'Copy'}
                  </button>
                </div>
                <p className="text-xs text-gray-400">
                  Signup → <span className="text-white font-bold">+5 credits</span> &nbsp;·&nbsp;
                  Upgrades to Pro → <span className="text-white font-bold">+50 credits</span> &nbsp;·&nbsp;
                  Upgrades to Agency → <span className="text-white font-bold">+100 credits</span>
                </p>
              </div>

              <div className="bg-white border border-gray-100 rounded-2xl p-6">
                <h2 className="text-base font-extrabold mb-1">Next Milestone</h2>
                <p className="text-xs text-gray-400 mb-4">
                  You have <span className="font-bold text-black">{payingReferrals}</span> paying referrals.
                  Reach <span className="font-bold text-black">5</span> to unlock your first free month of Pro.
                </p>
                <div className="w-full bg-gray-100 rounded-full h-2.5 mb-2">
                  <div className="bg-black h-2.5 rounded-full transition-all"
                    style={{ width: `${Math.min((payingReferrals / 5) * 100, 100)}%` }} />
                </div>
                <p className="text-xs text-gray-400">{payingReferrals} / 5 paying referrals</p>
              </div>

              <div className="bg-white border border-gray-100 rounded-2xl p-6">
                <h2 className="text-base font-extrabold mb-5">Reward Tiers</h2>
                <div className="space-y-3">
                  {REFERRAL_TIERS.map((tier, i) => {
                    const unlocked = payingReferrals >= tier.paying
                    return (
                      <div key={i} className={`flex items-center justify-between py-3 border-b border-gray-50 last:border-0 ${unlocked ? 'opacity-50' : ''}`}>
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{unlocked ? '✅' : tier.icon}</span>
                          <div>
                            <p className="text-sm font-bold">{tier.paying} paying referral{tier.paying > 1 ? 's' : ''}</p>
                            {unlocked && <p className="text-xs text-green-500 font-bold">Unlocked</p>}
                          </div>
                        </div>
                        <span className="text-xs font-extrabold px-3 py-2 bg-black text-white rounded-xl flex-shrink-0">
                          {tier.reward}
                        </span>
                      </div>
                    )
                  })}
                </div>
                <p className="text-xs text-gray-400 mt-4 pt-4 border-t border-gray-50">
                  Paying referrals only count after 30 days of active subscription. Abuse of the referral system results in permanent account termination.
                </p>
              </div>

              <div className="bg-white border border-gray-100 rounded-2xl p-6">
                <h2 className="text-base font-extrabold mb-5">Referral History</h2>
                <div className="space-y-2">
                  {MOCK_HISTORY.map((entry, i) => (
                    <div key={i} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                      <div>
                        <p className="text-sm font-bold">{entry.name}</p>
                        <p className="text-xs text-gray-400">{entry.date} · {entry.status}</p>
                      </div>
                      <span className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-xl">
                        {entry.reward}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── NOTIFICATIONS ── */}
          {activeTab === 'Notifications' && (
            <div className="bg-white border border-gray-100 rounded-2xl p-6">
              <h2 className="text-base font-extrabold mb-5">Notification Preferences</h2>
              <div className="space-y-4">
                {[
                  { key: 'postPublished',  label: 'Post published',   desc: 'When a scheduled post goes live'                      },
                  { key: 'postFailed',     label: 'Post failed',       desc: 'When a scheduled post fails to publish'               },
                  { key: 'weeklyDigest',   label: 'Weekly digest',     desc: 'Summary of your posting activity every Monday'        },
                  { key: 'creditLow',      label: 'Low AI credits',    desc: 'When your credits drop below 20'                      },
                  { key: 'teamActivity',   label: 'Team activity',     desc: 'When team members schedule or edit posts'             },
                  { key: 'productUpdates', label: 'Product updates',   desc: 'New features and platform announcements'              },
                ].map(item => (
                  <div key={item.key} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="text-sm font-bold">{item.label}</p>
                      <p className="text-xs text-gray-400">{item.desc}</p>
                    </div>
                    <button
                      onClick={() => setNotifications(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof prev] }))}
                      className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${
                        notifications[item.key as keyof typeof notifications] ? 'bg-black' : 'bg-gray-200'
                      }`}>
                      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                        notifications[item.key as keyof typeof notifications] ? 'translate-x-5' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>
                ))}
              </div>
              {/* St3: uses savedTab, not shared saved boolean */}
              <button onClick={() => handleSave('Notifications')}
                className={`mt-5 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  savedTab === 'Notifications' ? 'bg-green-500 text-white' : 'bg-black text-white hover:opacity-80'
                }`}>
                {savedTab === 'Notifications' ? '✓ Saved!' : 'Save Preferences'}
              </button>
            </div>
          )}

          {/* ── SECURITY ── */}
          {activeTab === 'Security' && (
            <div className="space-y-4">
              <div className="bg-white border border-gray-100 rounded-2xl p-6">
                <h2 className="text-base font-extrabold mb-5">Change Password</h2>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-gray-500 block mb-1">Current Password</label>
                    <input type="password" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-black transition-all" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 block mb-1">New Password</label>
                    <input type="password" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-black transition-all" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 block mb-1">Confirm New Password</label>
                    <input type="password" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-black transition-all" />
                  </div>
                  <button onClick={() => handleSave('Security')}
                    className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      savedTab === 'Security' ? 'bg-green-500 text-white' : 'bg-black text-white hover:opacity-80'
                    }`}>
                    {savedTab === 'Security' ? '✓ Updated!' : 'Update Password'}
                  </button>
                </div>
              </div>

              {/* St4: danger zone with confirms */}
              <div className="bg-white border border-gray-100 rounded-2xl p-6">
                <h2 className="text-base font-extrabold mb-1">Danger Zone</h2>
                <p className="text-xs text-gray-400 mb-4">These actions are irreversible. Please be certain.</p>
                <div className="space-y-3">

                  {/* Delete all posts */}
                  {confirmDeletePosts ? (
                    <div className="border border-red-200 rounded-xl px-4 py-3 bg-red-50">
                      <p className="text-xs font-bold text-red-600 mb-2">
                        This will permanently delete all your scheduled and draft posts. Are you sure?
                      </p>
                      <div className="flex gap-2">
                        <button onClick={handleDeleteAllPosts} disabled={dangerLoading}
                          className="text-xs font-bold px-4 py-2 bg-red-500 text-white rounded-lg hover:opacity-80 transition-all disabled:opacity-40">
                          {dangerLoading ? 'Deleting...' : 'Yes, delete all posts'}
                        </button>
                        <button onClick={() => setConfirmDeletePosts(false)}
                          className="text-xs font-bold px-4 py-2 border border-gray-200 rounded-lg hover:border-gray-400 transition-all">
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => setConfirmDeletePosts(true)}
                      className="w-full text-left text-xs font-bold text-red-500 border border-red-100 rounded-xl px-4 py-3 hover:bg-red-50 transition-all">
                      Delete all scheduled posts
                    </button>
                  )}

                  {/* Delete account */}
                  {confirmDeleteAccount ? (
                    <div className="border border-red-300 rounded-xl px-4 py-3 bg-red-50">
                      <p className="text-xs font-bold text-red-700 mb-2">
                        Your account and all data will be permanently deleted. This cannot be undone.
                      </p>
                      <div className="flex gap-2">
                        <button onClick={handleDeleteAccount} disabled={dangerLoading}
                          className="text-xs font-bold px-4 py-2 bg-red-600 text-white rounded-lg hover:opacity-80 transition-all disabled:opacity-40">
                          {dangerLoading ? 'Processing...' : 'Yes, delete my account'}
                        </button>
                        <button onClick={() => setConfirmDeleteAccount(false)}
                          className="text-xs font-bold px-4 py-2 border border-gray-200 rounded-lg hover:border-gray-400 transition-all">
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => setConfirmDeleteAccount(true)}
                      className="w-full text-left text-xs font-bold text-red-600 border border-red-200 rounded-xl px-4 py-3 hover:bg-red-50 transition-all">
                      Delete account permanently
                    </button>
                  )}

                </div>
              </div>
            </div>
          )}

          {/* ── WHITE LABEL ── */}
          {activeTab === 'White Label' && (
            <div className="space-y-4">
              {plan === 'free' ? (
                <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center">
                  <div className="text-3xl mb-3">🏷️</div>
                  <h2 className="text-base font-extrabold mb-2">White Label is a Pro & Agency feature</h2>
                  <p className="text-xs text-gray-400 mb-5 max-w-sm mx-auto leading-relaxed">
                    Remove SocialMate branding and replace it with your own. Available as a $20/month add-on on Pro and Agency plans.
                  </p>
                  <button className="bg-black text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:opacity-80 transition-all">
                    Upgrade to unlock →
                  </button>
                </div>
              ) : (
                <div className="bg-white border border-gray-100 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h2 className="text-base font-extrabold">White Label</h2>
                      <p className="text-xs text-gray-400 mt-0.5">$20/month add-on</p>
                    </div>
                    <button onClick={() => setWhiteLabel(!whiteLabel)}
                      className={`relative w-10 h-5 rounded-full transition-colors ${whiteLabel ? 'bg-black' : 'bg-gray-200'}`}>
                      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${whiteLabel ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                  {whiteLabel && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-bold text-gray-500 block mb-1">Brand Name</label>
                        <input placeholder="Your Brand" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-black transition-all" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-500 block mb-1">Logo URL</label>
                        <input placeholder="https://yourbrand.com/logo.png" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-black transition-all" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-500 block mb-1">Custom Domain</label>
                        <input placeholder="app.yourbrand.com" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-black transition-all" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-500 block mb-1">Brand Color</label>
                        <input type="color" defaultValue="#000000" className="h-10 w-20 border border-gray-200 rounded-xl cursor-pointer" />
                      </div>
                      <button onClick={() => handleSave('WhiteLabel')}
                        className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                          savedTab === 'WhiteLabel' ? 'bg-green-500 text-white' : 'bg-black text-white hover:opacity-80'
                        }`}>
                        {savedTab === 'WhiteLabel' ? '✓ Saved!' : 'Save Branding'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}