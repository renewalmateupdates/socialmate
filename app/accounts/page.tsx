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
import MastodonConnectModal from '@/components/MastodonConnectModal'

function SkeletonBox({ className }: { className?: string }) {
  return <div className={`bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse ${className}`} />
}

type Account = {
  id: string
  platform: string
  account_name: string
  profile_image_url: string
  created_at: string
  is_active: boolean
}

type PlatformStatus = 'live' | 'coming_soon' | 'planned'

const PLATFORM_META: Record<string, {
  icon: string
  color: string
  label: string
  status: PlatformStatus
  statusNote?: string
}> = {
  discord:   { icon: '💬', color: 'bg-indigo-50 border-indigo-200', label: 'Discord',     status: 'live'        },
  bluesky:   { icon: '🦋', color: 'bg-sky-50 border-sky-200',       label: 'Bluesky',     status: 'live'        },
  telegram:  { icon: '✈️', color: 'bg-sky-50 border-sky-200',       label: 'Telegram',    status: 'live'        },
  mastodon:  { icon: '🐘', color: 'bg-purple-50 border-purple-200', label: 'Mastodon',    status: 'live'        },
  linkedin:  { icon: '💼', color: 'bg-blue-50 border-blue-200',     label: 'LinkedIn',    status: 'coming_soon', statusNote: 'Code complete — awaiting approval' },
  youtube:   { icon: '▶️', color: 'bg-red-50 border-red-200',       label: 'YouTube',     status: 'coming_soon', statusNote: 'Code complete — awaiting approval' },
  pinterest: { icon: '📌', color: 'bg-red-50 border-red-200',       label: 'Pinterest',   status: 'coming_soon', statusNote: 'Code complete — awaiting approval' },
  reddit:    { icon: '🤖', color: 'bg-orange-50 border-orange-200', label: 'Reddit',      status: 'coming_soon', statusNote: 'Code complete — awaiting approval' },
  instagram: { icon: '📸', color: 'bg-pink-50 border-pink-200',     label: 'Instagram',   status: 'coming_soon', statusNote: 'Awaiting API approval'             },
  facebook:  { icon: '📘', color: 'bg-blue-50 border-blue-200',     label: 'Facebook',    status: 'coming_soon', statusNote: 'Awaiting API approval'             },
  tiktok:    { icon: '🎵', color: 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700',     label: 'TikTok',      status: 'coming_soon', statusNote: 'Awaiting API approval'             },
  threads:   { icon: '🧵', color: 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700',     label: 'Threads',     status: 'coming_soon', statusNote: 'Awaiting API approval'             },
  twitter:   { icon: '🐦', color: 'bg-sky-50 border-sky-200',       label: 'X / Twitter', status: 'live'                                       },
  snapchat:  { icon: '👻', color: 'bg-yellow-50 border-yellow-200', label: 'Snapchat',    status: 'planned',     statusNote: 'Planned integration'              },
  lemon8:    { icon: '🍋', color: 'bg-yellow-50 border-yellow-200', label: 'Lemon8',      status: 'planned',     statusNote: 'Planned integration'              },
  bereal:    { icon: '📷', color: 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700',     label: 'BeReal',      status: 'planned',     statusNote: 'Planned integration'              },
}

const ALL_PLATFORMS         = Object.keys(PLATFORM_META)
const LIVE_PLATFORMS        = ALL_PLATFORMS.filter(p => PLATFORM_META[p].status === 'live')
const COMING_SOON_PLATFORMS = ALL_PLATFORMS.filter(p => PLATFORM_META[p].status === 'coming_soon')
const PLANNED_PLATFORMS     = ALL_PLATFORMS.filter(p => PLATFORM_META[p].status === 'planned')

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
      <div className="flex items-center gap-3 p-4 bg-surface border border-theme rounded-2xl opacity-60">
        <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-xl flex-shrink-0">
          {meta.icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">{meta.label}</p>
          <p className="text-xs text-gray-400 truncate">{meta.statusNote}</p>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${
          meta.status === 'coming_soon' ? 'bg-blue-50 text-blue-500' : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500'
        }`}>
          {meta.status === 'coming_soon' ? 'Soon' : 'Planned'}
        </span>
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-3 p-4 bg-surface border rounded-2xl transition-all ${
      atLimit ? 'border-theme opacity-60' : 'border-theme hover:border-gray-300'
    }`}>
      <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-xl flex-shrink-0">
        {meta.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
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
          className="text-xs font-semibold px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-xl hover:bg-gray-200 transition-all flex-shrink-0">
          Upgrade
        </Link>
      ) : (
        <button
          onClick={() => onConnect(platform)}
          disabled={isConnecting}
          className="text-xs font-semibold px-3 py-2.5 min-h-[44px] bg-black text-white rounded-xl hover:opacity-80 transition-all disabled:opacity-50 flex-shrink-0">
          {isConnecting ? 'Connecting...' : isConnected ? '+ Add' : 'Connect'}
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
  const [disconnecting, setDisconnecting] = useState<string | null>(null)
  const [showDiscordModal, setShowDiscordModal] = useState(false)
  const [showBlueskyModal, setShowBlueskyModal] = useState(false)
  const [showTelegramModal, setShowTelegramModal] = useState(false)
  const [showMastodonModal, setShowMastodonModal] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { plan, activeWorkspace } = useWorkspace()

  const planConfig = PLAN_CONFIG[plan as keyof typeof PLAN_CONFIG]
  const accountsPerPlatform = planConfig.accountsPerPlatform

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const refreshAccounts = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    let q = supabase
      .from('connected_accounts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    if (activeWorkspace && !activeWorkspace.is_personal) {
      q = q.eq('workspace_id', activeWorkspace.id) as typeof q
    } else {
      q = q.is('workspace_id', null) as typeof q
    }
    const { data } = await q
    setAccounts(data || [])
  }

  useEffect(() => {
    const success = searchParams.get('success')
    const error = searchParams.get('error')
    if (success === 'discord_connected')   showToast('Discord connected successfully!', 'success')
    if (success === 'mastodon_connected')  showToast('Mastodon connected successfully!', 'success')
    if (success === 'pinterest_connected') showToast('Pinterest connected successfully!', 'success')
    if (success === 'linkedin_connected')  showToast('LinkedIn connected successfully!', 'success')
    if (success === 'twitter_connected')   showToast('X (Twitter) connected successfully!', 'success')
    if (success === 'youtube_connected')   showToast('YouTube connected successfully!', 'success')
    if (error === 'discord_denied')                showToast('Discord connection cancelled', 'error')
    if (error === 'mastodon_denied')               showToast('Mastodon connection cancelled', 'error')
    if (error === 'mastodon_no_instance')          showToast('No instance provided', 'error')
    if (error === 'mastodon_instance_unreachable') showToast('Could not reach that Mastodon instance', 'error')
    if (error === 'mastodon_register_failed')      showToast('Failed to register with that instance', 'error')
    if (error === 'mastodon_invalid_state')        showToast('Security check failed — please try again', 'error')
    if (error === 'mastodon_token_failed')         showToast('Failed to connect Mastodon — please try again', 'error')
    if (error === 'mastodon_db_error')             showToast('Something went wrong saving your account', 'error')
    if (error === 'pinterest_denied')              showToast('Pinterest connection cancelled', 'error')
    if (error === 'pinterest_invalid_state')       showToast('Security check failed — please try again', 'error')
    if (error === 'pinterest_token_failed')        showToast('Failed to connect Pinterest — please try again', 'error')
    if (error === 'pinterest_db_error')            showToast('Something went wrong saving your account', 'error')
    if (error === 'linkedin_denied')               showToast('LinkedIn connection cancelled', 'error')
    if (error === 'twitter_denied')                showToast('X connection cancelled', 'error')
    if (error === 'twitter_token_failed')          showToast('Failed to connect X — please try again', 'error')
    if (error === 'twitter_user_failed')           showToast('Failed to fetch X profile — please try again', 'error')
    if (error === 'twitter_db_error')              showToast('X connected but failed to save — please try again', 'error')
    if (error === 'linkedin_invalid_state')        showToast('Security check failed — please try again', 'error')
    if (error === 'linkedin_token_failed')         showToast('Failed to connect LinkedIn — please try again', 'error')
    if (error === 'linkedin_db_error')             showToast('Something went wrong saving your account', 'error')
    if (error === 'youtube_denied')                showToast('YouTube connection cancelled', 'error')
    if (error === 'youtube_invalid_state')         showToast('Security check failed — please try again', 'error')
    if (error === 'youtube_token_failed')          showToast('Failed to connect YouTube — please try again', 'error')
    if (error === 'youtube_no_channel')            showToast('No YouTube channel found on this account', 'error')
    if (error === 'youtube_db_error')              showToast('Something went wrong saving your account', 'error')
    if (error === 'invalid_state')                 showToast('Security check failed — please try again', 'error')
    if (error === 'token_failed')                  showToast('Failed to connect — please try again', 'error')
    if (error === 'db_error')                      showToast('Something went wrong saving your account', 'error')
  }, [searchParams])

  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      let q = supabase
        .from('connected_accounts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      if (activeWorkspace && !activeWorkspace.is_personal) {
        q = q.eq('workspace_id', activeWorkspace.id) as typeof q
      } else {
        q = q.is('workspace_id', null) as typeof q
      }
      const { data } = await q
      setAccounts(data || [])
      setLoading(false)
    }
    getData()
  }, [router, activeWorkspace])

  const handleDisconnect = async (id: string, platform: string) => {
    setDisconnecting(id)
    await supabase.from('connected_accounts').delete().eq('id', id)
    setAccounts(prev => prev.filter(a => a.id !== id))
    setConfirmDisconnect(null)
    setDisconnecting(null)
    showToast(`${PLATFORM_META[platform]?.label || platform} disconnected`, 'success')
  }

  const handleConnect = (platform: string) => {
    const platformAccounts = accounts.filter(a => a.platform === platform)
    if (platformAccounts.length >= accountsPerPlatform) {
      showToast(`Your ${planConfig.label} plan allows ${accountsPerPlatform} account${accountsPerPlatform !== 1 ? 's' : ''} per platform`, 'error')
      return
    }
    if (platform === 'discord')   { setShowDiscordModal(true);  return }
    if (platform === 'bluesky')   { setShowBlueskyModal(true);  return }
    if (platform === 'telegram')  { setShowTelegramModal(true); return }
    if (platform === 'mastodon')  { setShowMastodonModal(true); return }
    if (platform === 'pinterest') { window.open('/api/accounts/pinterest/connect', '_blank'); return }
    if (platform === 'linkedin')  { window.open('/api/accounts/linkedin/connect', '_blank');  return }
    if (platform === 'youtube')   { window.open('/api/accounts/youtube/connect', '_blank');   return }
    if (platform === 'twitter')   { window.open('/api/accounts/twitter/connect', '_blank');   return }
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
    <div className="min-h-dvh bg-theme flex">
      <Sidebar />
      <div className="md:ml-56 flex-1 p-4 md:p-8">
        <div className="max-w-5xl mx-auto">

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">Accounts</h1>
              <p className="text-sm text-gray-400 mt-0.5">Connect and manage your social media accounts</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                {activeWorkspace && !activeWorkspace.is_personal
                  ? `Showing accounts for workspace: ${activeWorkspace.name}. Switch to Personal workspace to manage personal accounts.`
                  : 'Showing your personal workspace accounts. Switch to a client workspace to manage that workspace\'s accounts.'}
              </p>
            </div>
            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 bg-surface border border-theme rounded-xl px-4 py-2.5 self-start sm:self-auto">
              {accounts.length} connected · {accountsPerPlatform} per platform on {planConfig.label}
            </div>
          </div>

          <div className={`mb-6 rounded-2xl px-5 py-4 border flex flex-col sm:flex-row sm:items-center gap-3 ${
            plan === 'free'   ? 'bg-theme border-theme-md'   :
            plan === 'pro'    ? 'bg-blue-50 border-blue-100'   :
            'bg-purple-50 border-purple-100'
          }`}>
            <div className="flex-1">
              <p className={`text-xs font-bold ${
                plan === 'agency' ? 'text-purple-700' :
                plan === 'pro'    ? 'text-blue-700'   : 'text-gray-700 dark:text-gray-300'
              }`}>
                {plan === 'free'   && '🔓 Free plan — 1 account per platform across 4 live integrations'}
                {plan === 'pro'    && '⚡ Pro plan — up to 5 accounts per platform'}
                {plan === 'agency' && '🏢 Agency plan — up to 10 accounts per platform, client workspaces included'}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {plan === 'free'   ? 'LinkedIn, YouTube, Pinterest & Reddit are coming very soon. Upgrade to Pro for more accounts per platform.' :
                 plan === 'pro'    ? 'Upgrade to Agency for 10 accounts per platform and client workspaces.' :
                 "You're on the highest tier — full access across all platforms as they go live."}
              </p>
            </div>
            {plan !== 'agency' && (
              <Link href="/settings?tab=Plan"
                className="bg-black text-white text-xs font-bold px-4 py-2 rounded-xl hover:opacity-80 transition-all self-start sm:self-auto flex-shrink-0">
                Upgrade →
              </Link>
            )}
          </div>

          {/* FIRST-TIME EMPTY STATE */}
          {!loading && accounts.length === 0 && (
            <div className="mb-8 bg-gradient-to-r from-black to-gray-800 rounded-2xl p-6 text-white">
              <div className="flex items-start gap-4">
                <span className="text-3xl flex-shrink-0">🔌</span>
                <div className="flex-1">
                  <p className="font-extrabold text-lg tracking-tight mb-1">Connect your first social account</p>
                  <p className="text-gray-300 text-sm leading-relaxed mb-4">
                    Pick one of the four live platforms below to get started. You can connect as many as you want — all free.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {LIVE_PLATFORMS.map(platform => {
                      const meta = PLATFORM_META[platform]
                      return (
                        <div key={platform} className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-sm font-semibold">
                          <span>{meta.icon}</span> {meta.label}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STAT CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {loading ? [1,2,3].map(i => <SkeletonBox key={i} className="h-20 rounded-2xl" />) : (
              [
                { label: 'Connected',            value: accounts.length,                                               icon: '✅', color: 'text-green-600' },
                { label: 'Platforms Used',        value: `${connectedPlatforms.size} / ${LIVE_PLATFORMS.length} live`, icon: '📱', color: 'text-gray-700' },
                { label: 'Accounts Per Platform', value: `${accountsPerPlatform} max`,                                 icon: '🔓', color: 'text-blue-600' },
              ].map(stat => (
                <div key={stat.label} className="bg-surface border border-theme rounded-2xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">{stat.label}</span>
                    <span>{stat.icon}</span>
                  </div>
                  <div className={`text-2xl font-extrabold tracking-tight dark:text-gray-100 ${stat.color}`}>{stat.value}</div>
                </div>
              ))
            )}
          </div>

          {/* CONNECTED ACCOUNTS */}
          {!loading && accounts.length > 0 && (
            <div className="mb-8">
              <h2 className="text-sm font-bold tracking-tight mb-4">Connected Accounts</h2>
              <div className="space-y-3">
                {accounts.map(account => {
                  const meta = PLATFORM_META[account.platform] || { icon: '📱', color: 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700', label: account.platform }
                  const platformCount = accountsByPlatform[account.platform]?.length || 0
                  const isConfirming = confirmDisconnect === account.id
                  const isDisconnecting = disconnecting === account.id
                  return (
                    <div key={account.id} className={`p-4 bg-surface border rounded-2xl ${meta.color} transition-all`}>
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white dark:bg-gray-700 flex items-center justify-center text-xl flex-shrink-0 shadow-sm">
                          {meta.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-bold">{meta.label}</p>
                            <span className="text-xs font-semibold px-2 py-0.5 bg-green-100 text-green-700 rounded-full">Connected</span>
                            {platformCount > 1 && (
                              <span className="text-xs text-gray-400 dark:text-gray-500">{platformCount}/{accountsPerPlatform} accounts</span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            @{account.account_name} · Connected {new Date(account.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        </div>
                        {!isConfirming && (
                          <button onClick={() => setConfirmDisconnect(account.id)}
                            className="text-xs font-semibold px-3 py-1.5 border border-red-200 text-red-400 rounded-xl hover:border-red-400 hover:text-red-600 transition-all flex-shrink-0">
                            Disconnect
                          </button>
                        )}
                      </div>

                      {isConfirming && (
                        <div className="mt-3 pt-3 border-t border-white/60 flex flex-col sm:flex-row items-start sm:items-center gap-2">
                          <p className="text-xs text-red-600 font-semibold flex-1">
                            Disconnect @{account.account_name} from {meta.label}? This cannot be undone.
                          </p>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <button onClick={() => handleDisconnect(account.id, account.platform)}
                              disabled={isDisconnecting}
                              className="text-xs font-bold px-3 py-1.5 bg-red-500 text-white rounded-xl hover:opacity-80 transition-all disabled:opacity-50 flex items-center gap-1.5">
                              {isDisconnecting ? (
                                <><div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />Disconnecting...</>
                              ) : 'Yes, disconnect'}
                            </button>
                            <button onClick={() => setConfirmDisconnect(null)}
                              className="text-xs font-bold px-3 py-1.5 border border-gray-200 dark:border-gray-600 rounded-xl hover:border-gray-400 transition-all">
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* LIVE INTEGRATIONS */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-sm font-bold tracking-tight">Live Integrations</h2>
              <span className="text-xs font-semibold px-2 py-0.5 bg-green-100 text-green-700 rounded-full">{LIVE_PLATFORMS.length} available now</span>
            </div>
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[1,2,3,4].map(i => <SkeletonBox key={i} className="h-16 rounded-2xl" />)}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {LIVE_PLATFORMS.map(platform => (
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

          {/* COMING SOON */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-sm font-bold tracking-tight">Coming Very Soon</h2>
              <span className="text-xs font-semibold px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full">Awaiting approval</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

          {/* PLANNED */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-sm font-bold tracking-tight">Planned</h2>
              <span className="text-xs font-semibold px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-full">On the roadmap</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

          <div className="bg-theme border border-theme rounded-2xl p-5">
            <div className="flex items-start gap-4">
              <span className="text-2xl flex-shrink-0">🚀</span>
              <div>
                <p className="text-sm font-bold mb-1">More platforms are on the way</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                  LinkedIn, YouTube, Pinterest, and Reddit are code-complete and awaiting platform approval — launching very soon.
                  Instagram, TikTok, Facebook, and Threads are in developer review.
                  We'll notify you on your dashboard the moment each one goes live.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* DISCORD MODAL */}
      {showDiscordModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <p className="text-lg font-bold mb-2">💬 Connect Discord</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
              Make sure you're logged into the Discord account you want to connect before continuing.
              To add a different account, log into that account in your browser first.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowDiscordModal(false)}
                className="flex-1 text-sm font-semibold px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl hover:border-gray-400 transition-all">
                Cancel
              </button>
              <button onClick={() => {
                // Save workspace context before OAuth redirect
                if (activeWorkspace && !activeWorkspace.is_personal) {
                  document.cookie = `pending_workspace_id=${activeWorkspace.id}; path=/; max-age=300`
                } else {
                  document.cookie = `pending_workspace_id=; path=/; max-age=0`
                }
                setShowDiscordModal(false)
                window.open('/api/accounts/discord/connect', '_blank')
              }}
                className="flex-1 text-sm font-semibold px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:opacity-80 transition-all">
                Continue to Discord →
              </button>
            </div>
          </div>
        </div>
      )}

      {showBlueskyModal && (
        <BlueskyConnectModal
          onSuccess={handleBlueskySuccess}
          onClose={() => setShowBlueskyModal(false)}
          workspaceId={activeWorkspace && !activeWorkspace.is_personal ? activeWorkspace.id : null}
        />
      )}
      {showTelegramModal && (
        <TelegramConnectModal
          onSuccess={handleTelegramSuccess}
          onClose={() => setShowTelegramModal(false)}
          workspaceId={activeWorkspace && !activeWorkspace.is_personal ? activeWorkspace.id : null}
        />
      )}
      {showMastodonModal && (
        <MastodonConnectModal
          onClose={() => setShowMastodonModal(false)}
          workspaceId={activeWorkspace && !activeWorkspace.is_personal ? activeWorkspace.id : null}
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
      <div className="min-h-dvh bg-theme flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black" />
      </div>
    }>
      <AccountsInner />
    </Suspense>
  )
}