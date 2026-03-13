'use client'
import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'
import { useWorkspace, PLAN_CONFIG } from '@/contexts/WorkspaceContext'
import BlueskyConnectModal from '@/components/BlueskyConnectModal'
import TelegramConnectModal from '@/components/TelegramConnectModal'

function SkeletonBox({ className }: { className?: string }) {
  return <div className={`bg-gray-100 rounded-xl animate-pulse ${className}`} />
}

type Account = {
  id: string
  platform: string
  account_name: string
  profile_image_url: string
  created_at: string
  is_active: boolean
}

type PlatformStatus = 'available' | 'coming_soon' | 'planned'

const PLATFORM_META: Record<string, {
  icon: string
  color: string
  label: string
  status: PlatformStatus
  statusNote?: string
}> = {
  youtube:   { icon: '▶️', color: 'bg-red-50 border-red-200',       label: 'YouTube',     status: 'available' },
  reddit:    { icon: '🤖', color: 'bg-orange-50 border-orange-200', label: 'Reddit',      status: 'available' },
  discord:   { icon: '💬', color: 'bg-indigo-50 border-indigo-200', label: 'Discord',     status: 'available' },
  linkedin:  { icon: '💼', color: 'bg-blue-50 border-blue-200',     label: 'LinkedIn',    status: 'available' },
  pinterest: { icon: '📌', color: 'bg-red-50 border-red-200',       label: 'Pinterest',   status: 'available' },
  mastodon:  { icon: '🐘', color: 'bg-purple-50 border-purple-200', label: 'Mastodon',    status: 'available' },
  bluesky:   { icon: '🦋', color: 'bg-sky-50 border-sky-200',       label: 'Bluesky',     status: 'available' },
  telegram:  { icon: '✈️', color: 'bg-sky-50 border-sky-200',       label: 'Telegram',    status: 'available' },
  instagram: { icon: '📸', color: 'bg-pink-50 border-pink-200',     label: 'Instagram',   status: 'coming_soon', statusNote: 'Awaiting API approval' },
  facebook:  { icon: '📘', color: 'bg-blue-50 border-blue-200',     label: 'Facebook',    status: 'coming_soon', statusNote: 'Awaiting API approval' },
  tiktok:    { icon: '🎵', color: 'bg-gray-50 border-gray-200',     label: 'TikTok',      status: 'coming_soon', statusNote: 'Awaiting API approval' },
  threads:   { icon: '🧵', color: 'bg-gray-50 border-gray-200',     label: 'Threads',     status: 'coming_soon', statusNote: 'Awaiting API approval' },
  twitter:   { icon: '🐦', color: 'bg-sky-50 border-sky-200',       label: 'X / Twitter', status: 'planned',     statusNote: 'Planned integration' },
  snapchat:  { icon: '👻', color: 'bg-yellow-50 border-yellow-200', label: 'Snapchat',    status: 'planned',     statusNote: 'Planned integration' },
  lemon8:    { icon: '🍋', color: 'bg-yellow-50 border-yellow-200', label: 'Lemon8',      status: 'planned',     statusNote: 'Planned integration' },
  bereal:    { icon: '📷', color: 'bg-gray-50 border-gray-200',     label: 'BeReal',      status: 'planned',     statusNote: 'Planned integration' },
}

const ALL_PLATFORMS = Object.keys(PLATFORM_META)
const AVAILABLE_PLATFORMS = ALL_PLATFORMS.filter(p => PLATFORM_META[p].status === 'available')
const COMING_SOON_PLATFORMS = ALL_PLATFORMS.filter(p => PLATFORM_META[p].status === 'coming_soon')
const PLANNED_PLATFORMS = ALL_PLATFORMS.filter(p => PLATFORM_META[p].status === 'planned')

function PlatformCard({
  platform, connectable, accountsPerPlatform, accountsByPlatform, connectingPlatform, onConnect,
}: {
  platform: string
  connectable: boolean
  accountsPerPlatform: number
  accountsByPlatform: Record<string, Account[]>
  connectingPlatform: string | null
  onConnect: (platform: string) => void
}) {
  const meta = PLATFORM_META[platform]
  const isConnecting = connectingPlatform === platform
  const platformCount = accountsByPlatform[platform]?.length || 0
  const atLimit = platformCount >= accountsPerPlatform
  const isConnected = platformCount > 0

  if (!connectable) {
    return (
      <div className="flex items-center gap-3 p-4 bg-white border border-gray-100 rounded-2xl opacity-50">
        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-xl flex-shrink-0">
          {meta.icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-600">{meta.label}</p>
          <p className="text-xs text-gray-400">{meta.statusNote}</p>
        </div>
        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
          meta.status === 'coming_soon' ? 'bg-blue-50 text-blue-500' : 'bg-gray-100 text-gray-400'
        }`}>
          {meta.status === 'coming_soon' ? 'Coming Soon' : 'Planned'}
        </span>
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-3 p-4 bg-white border rounded-2xl transition-all group ${
      atLimit ? 'border-gray-100 opacity-60' : 'border-gray-100 hover:border-gray-300'
    }`}>
      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-xl flex-shrink-0">
        {meta.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold">{meta.label}</p>
          {isConnected && (
            <span className="text-xs font-semibold px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
              Connected
            </span>
          )}
        </div>
        <p className="text-xs text-gray-400">
          {platformCount > 0 ? `${platformCount}/${accountsPerPlatform} connected` : 'Not connected'}
        </p>
      </div>
      {atLimit ? (
        <Link href="/pricing"
          className="text-xs font-semibold px-3 py-1.5 bg-gray-100 text-gray-500 rounded-xl hover:bg-gray-200 transition-all opacity-0 group-hover:opacity-100">
          Upgrade
        </Link>
      ) : (
        <button
          onClick={() => onConnect(platform)}
          disabled={isConnecting}
          className="text-xs font-semibold px-3 py-1.5 bg-black text-white rounded-xl hover:opacity-80 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50">
          {isConnecting ? 'Connecting...' : platformCount > 0 ? 'Add account' : 'Connect'}
        </button>
      )}
    </div>
  )
}

function AccountsInner() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [connectingPlatform, setConnectingPlatform] = useState<string | null>(null)
  const [confirmDisconnect, setConfirmDisconnect] = useState<string | null>(null)
  const [showDiscordModal, setShowDiscordModal] = useState(false)
  const [showBlueskyModal, setShowBlueskyModal] = useState(false)
  const [showTelegramModal, setShowTelegramModal] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { plan } = useWorkspace()

  const planConfig = PLAN_CONFIG[plan]
  const accountsPerPlatform = planConfig.accountsPerPlatform

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const refreshAccounts = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('connected_accounts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setAccounts(data || [])
  }

  useEffect(() => {
    const success = searchParams.get('success')
    const error = searchParams.get('error')
    if (success === 'discord_connected') showToast('Discord connected successfully!', 'success')
    if (error === 'discord_denied') showToast('Discord connection cancelled', 'error')
    if (error === 'invalid_state') showToast('Security check failed, please try again', 'error')
    if (error === 'token_failed') showToast('Failed to connect Discord, please try again', 'error')
    if (error === 'db_error') showToast('Something went wrong saving your account', 'error')
  }, [searchParams])

  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data } = await supabase
        .from('connected_accounts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      setAccounts(data || [])
      setLoading(false)
    }
    getData()
  }, [router])

  const handleDisconnect = async (id: string, platform: string) => {
    await supabase.from('connected_accounts').delete().eq('id', id)
    setAccounts(prev => prev.filter(a => a.id !== id))
    setConfirmDisconnect(null)
    showToast(`${PLATFORM_META[platform]?.label || platform} disconnected`, 'success')
  }

  const handleConnect = (platform: string) => {
    const platformAccounts = accounts.filter(a => a.platform === platform)
    if (platformAccounts.length >= accountsPerPlatform) {
      showToast(`Your ${planConfig.label} plan allows ${accountsPerPlatform} account${accountsPerPlatform !== 1 ? 's' : ''} per platform`, 'error')
      return
    }
    if (platform === 'discord') { setShowDiscordModal(true); return }
    if (platform === 'bluesky') { setShowBlueskyModal(true); return }
    if (platform === 'telegram') { setShowTelegramModal(true); return }

    setConnectingPlatform(platform)
    showToast(`${PLATFORM_META[platform]?.label || platform} integration coming soon!`, 'success')
    setTimeout(() => setConnectingPlatform(null), 2000)
  }

  const handleBlueskySuccess = async () => {
    setShowBlueskyModal(false)
    showToast('Bluesky connected successfully!', 'success')
    await refreshAccounts()
  }

  const handleTelegramSuccess = async () => {
    setShowTelegramModal(false)
    showToast('Telegram bot connected successfully!', 'success')
    await refreshAccounts()
  }

  const accountsByPlatform = accounts.reduce((acc, account) => {
    if (!acc[account.platform]) acc[account.platform] = []
    acc[account.platform].push(account)
    return acc
  }, {} as Record<string, Account[]>)

  const connectedPlatforms = new Set(accounts.map(a => a.platform))

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="ml-56 flex-1 p-8">
        <div className="max-w-7xl mx-auto">

          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">Accounts</h1>
              <p className="text-sm text-gray-400 mt-0.5">Connect and manage your social media accounts</p>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 bg-white border border-gray-100 rounded-xl px-4 py-2.5">
              {accounts.length} connected · {accountsPerPlatform} per platform on {planConfig.label}
            </div>
          </div>

          <div className={`mb-6 rounded-2xl px-5 py-3 border flex items-center justify-between ${
            plan === 'free' ? 'bg-gray-50 border-gray-200' :
            plan === 'pro' ? 'bg-blue-50 border-blue-100' :
            'bg-purple-50 border-purple-100'
          }`}>
            <div>
              <p className={`text-xs font-bold ${
                plan === 'agency' ? 'text-purple-700' :
                plan === 'pro' ? 'text-blue-700' : 'text-gray-700'
              }`}>
                {plan === 'free' && '🔓 Free plan — 1 account per platform across 8 live integrations'}
                {plan === 'pro' && '⚡ Pro plan — up to 5 accounts per platform across all integrations'}
                {plan === 'agency' && '🏢 Agency plan — up to 10 accounts per platform, client workspaces included'}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {plan === 'free' ? 'More platforms are in review. Upgrade to Pro to unlock priority access as they launch.' :
                 plan === 'pro' ? 'Upgrade to Agency for 10 accounts per platform and client workspaces.' :
                 "You're on the highest tier — full access across all platforms as they go live."}
              </p>
            </div>
            {plan !== 'agency' && (
              <Link href="/pricing"
                className="bg-black text-white text-xs font-bold px-4 py-2 rounded-xl hover:opacity-80 transition-all flex-shrink-0 ml-4">
                Upgrade →
              </Link>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4 mb-8">
            {loading ? [1,2,3].map(i => <SkeletonBox key={i} className="h-20 rounded-2xl" />) : (
              [
                { label: 'Connected',            value: accounts.length,                                                    icon: '✅', color: 'text-green-600' },
                { label: 'Platforms Used',        value: `${connectedPlatforms.size} / ${AVAILABLE_PLATFORMS.length} live`, icon: '📱', color: 'text-gray-700' },
                { label: 'Accounts Per Platform', value: `${accountsPerPlatform} max`,                                      icon: '🔓', color: 'text-blue-600' },
              ].map(stat => (
                <div key={stat.label} className="bg-white border border-gray-100 rounded-2xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{stat.label}</span>
                    <span>{stat.icon}</span>
                  </div>
                  <div className={`text-2xl font-extrabold tracking-tight ${stat.color}`}>{stat.value}</div>
                </div>
              ))
            )}
          </div>

          {!loading && accounts.length > 0 && (
            <div className="mb-8">
              <h2 className="text-sm font-bold tracking-tight mb-4">Connected Accounts</h2>
              <div className="grid grid-cols-1 gap-3">
                {accounts.map(account => {
                  const meta = PLATFORM_META[account.platform] || { icon: '📱', color: 'bg-gray-50 border-gray-200', label: account.platform }
                  const platformCount = accountsByPlatform[account.platform]?.length || 0
                  const isConfirming = confirmDisconnect === account.id
                  return (
                    <div key={account.id} className={`flex items-center gap-4 p-4 bg-white border rounded-2xl ${meta.color} transition-all`}>
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-xl flex-shrink-0 shadow-sm">
                        {meta.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold">{meta.label}</p>
                          <span className="text-xs font-semibold px-2 py-0.5 bg-green-100 text-green-700 rounded-full">Connected</span>
                          {platformCount > 1 && (
                            <span className="text-xs text-gray-400">{platformCount}/{accountsPerPlatform} accounts</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">@{account.account_name}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-gray-400">
                          Connected {new Date(account.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                        {isConfirming ? (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-red-500 font-semibold">Disconnect?</span>
                            <button onClick={() => handleDisconnect(account.id, account.platform)}
                              className="text-xs font-bold px-3 py-1.5 bg-red-500 text-white rounded-xl hover:opacity-80 transition-all">
                              Yes
                            </button>
                            <button onClick={() => setConfirmDisconnect(null)}
                              className="text-xs font-bold px-3 py-1.5 border border-gray-200 rounded-xl hover:border-gray-400 transition-all">
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => setConfirmDisconnect(account.id)}
                            className="text-xs font-semibold px-3 py-1.5 border border-red-200 text-red-400 rounded-xl hover:border-red-400 hover:text-red-600 transition-all">
                            Disconnect
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-sm font-bold tracking-tight">Live Integrations</h2>
              <span className="text-xs font-semibold px-2 py-0.5 bg-green-100 text-green-700 rounded-full">{AVAILABLE_PLATFORMS.length} available</span>
            </div>
            {loading ? (
              <div className="grid grid-cols-2 gap-3">
                {[1,2,3,4].map(i => <SkeletonBox key={i} className="h-16 rounded-2xl" />)}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {AVAILABLE_PLATFORMS.map(platform => (
                  <PlatformCard
                    key={platform}
                    platform={platform}
                    connectable={true}
                    accountsPerPlatform={accountsPerPlatform}
                    accountsByPlatform={accountsByPlatform}
                    connectingPlatform={connectingPlatform}
                    onConnect={handleConnect}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-sm font-bold tracking-tight">Coming Soon</h2>
              <span className="text-xs font-semibold px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full">Awaiting approval</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {COMING_SOON_PLATFORMS.map(platform => (
                <PlatformCard
                  key={platform}
                  platform={platform}
                  connectable={false}
                  accountsPerPlatform={accountsPerPlatform}
                  accountsByPlatform={accountsByPlatform}
                  connectingPlatform={connectingPlatform}
                  onConnect={handleConnect}
                />
              ))}
            </div>
          </div>

          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-sm font-bold tracking-tight">Planned</h2>
              <span className="text-xs font-semibold px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">On the roadmap</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {PLANNED_PLATFORMS.map(platform => (
                <PlatformCard
                  key={platform}
                  platform={platform}
                  connectable={false}
                  accountsPerPlatform={accountsPerPlatform}
                  accountsByPlatform={accountsByPlatform}
                  connectingPlatform={connectingPlatform}
                  onConnect={handleConnect}
                />
              ))}
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5">
            <div className="flex items-start gap-4">
              <span className="text-2xl">🚀</span>
              <div>
                <p className="text-sm font-bold mb-1">More platforms are on the way</p>
                <p className="text-xs text-gray-500 leading-relaxed">
                  SocialMate is actively expanding integrations. Instagram, TikTok, Facebook, and Threads are in developer review. We'll notify you on your dashboard the moment a new platform goes live.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* DISCORD MODAL */}
      {showDiscordModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl">
            <p className="text-lg font-bold mb-2">💬 Adding a Discord Account</p>
            <p className="text-sm text-gray-500 mb-4">
              Make sure you're logged into the Discord account you want to connect before continuing.
              To add a different account, log into that Discord account in your browser first.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDiscordModal(false)}
                className="flex-1 text-sm font-semibold px-4 py-2.5 border border-gray-200 rounded-xl hover:border-gray-400 transition-all">
                Cancel
              </button>
              <button
                onClick={() => { setShowDiscordModal(false); window.location.href = '/api/accounts/discord/connect' }}
                className="flex-1 text-sm font-semibold px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:opacity-80 transition-all">
                Continue to Discord
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BLUESKY MODAL */}
      {showBlueskyModal && (
        <BlueskyConnectModal
          onSuccess={handleBlueskySuccess}
          onClose={() => setShowBlueskyModal(false)}
        />
      )}

      {/* TELEGRAM MODAL */}
      {showTelegramModal && (
        <TelegramConnectModal
          onSuccess={handleTelegramSuccess}
          onClose={() => setShowTelegramModal(false)}
        />
      )}

      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl text-sm font-semibold shadow-lg ${
          toast.type === 'success' ? 'bg-black text-white' : 'bg-red-500 text-white'
        }`}>
          {toast.type === 'success' ? '✅' : '❌'} {toast.message}
        </div>
      )}
    </div>
  )
}

export default function Accounts() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-sm text-gray-400">Loading...</div>
      </div>
    }>
      <AccountsInner />
    </Suspense>
  )
}