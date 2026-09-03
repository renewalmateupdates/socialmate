'use client'
import { Suspense, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { markActivated } from '@/lib/activation'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'
import { useWorkspace, PLAN_CONFIG } from '@/contexts/WorkspaceContext'
import { useI18n } from '@/contexts/I18nContext'
import BlueskyConnectModal from '@/components/BlueskyConnectModal'
import TelegramConnectModal from '@/components/TelegramConnectModal'
import MastodonConnectModal from '@/components/MastodonConnectModal'
import { track, trackOnce } from '@/lib/analytics'

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
  linkedin:  { icon: '💼', color: 'bg-blue-50 border-blue-200',     label: 'LinkedIn',    status: 'live' },
  youtube:   { icon: '▶️', color: 'bg-red-50 border-red-200',       label: 'YouTube',     status: 'coming_soon', statusNote: 'Code complete — awaiting approval' },
  pinterest: { icon: '📌', color: 'bg-red-50 border-red-200',       label: 'Pinterest',   status: 'coming_soon', statusNote: 'Code complete — awaiting approval' },
  reddit:    { icon: '🤖', color: 'bg-orange-50 border-orange-200', label: 'Reddit',      status: 'coming_soon', statusNote: 'Code complete — awaiting approval' },
  instagram: { icon: '📸', color: 'bg-pink-50 border-pink-200',     label: 'Instagram',   status: 'coming_soon', statusNote: 'Awaiting API approval'             },
  facebook:  { icon: '📘', color: 'bg-blue-50 border-blue-200',     label: 'Facebook',    status: 'coming_soon', statusNote: 'Awaiting API approval'             },
  tiktok:    { icon: '🎵', color: 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700',     label: 'TikTok',      status: 'live'                                                          },
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
// Connecting these two is only half the job — they also need a channel or chat
// to post into, stored in `post_destinations`. Kept in sync with the list of
// the same name in app/compose/page.tsx.
const DESTINATION_PLATFORMS = ['discord', 'telegram']

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
  const { t } = useI18n()
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
    <div className={`flex flex-col gap-2 p-4 bg-surface border rounded-2xl transition-all ${
      atLimit ? 'border-theme opacity-60' : 'border-theme hover:border-gray-300'
    }`}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-xl flex-shrink-0">
          {meta.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold">{meta.label}</p>
            {isConnected && (
              <span className="text-xs font-semibold px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                {t('app_accounts.connected')}
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
            {isConnecting ? t('app_common.loading') : isConnected ? '+ Add' : t('app_accounts.connect')}
          </button>
        )}
      </div>
      {platform === 'twitter' && !atLimit && (
        <p className="text-xs text-gray-400 leading-relaxed pl-1">
          Connecting your X account registers it globally. Disconnecting starts a 45-day reconnection pause. This protects against abuse.
        </p>
      )}
    </div>
  )
}

function AccountsInner() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  // The platform they just finished connecting, if they arrived from a callback.
  // Held in state rather than shown as a toast, because the toast cleared itself
  // after three seconds and left the page with no next step at all. Sixteen
  // external accounts connected a platform; none of them ever created a post.
  const [justConnected, setJustConnected] = useState<string | null>(null)
  // Discord and Telegram need a second step after the account connects: a
  // channel to post into. Measured 2026-09-01: six external accounts had
  // connected Discord and `post_destinations` held three rows in total, so
  // none of them could have posted anywhere. This page never linked to
  // destinations at all, so there was no way to find out.
  const [destinationPlatforms, setDestinationPlatforms] = useState<Set<string>>(new Set())

  // The Discord channel picker. Choosing where posts go used to mean leaving
  // for /accounts/destinations and hand-building a webhook inside Discord —
  // Settings, Integrations, Webhooks, New Webhook, copy, come back, paste. Of
  // the seven external accounts that connected Discord, none ever finished it.
  // With the bot in the server we can just list the channels and let them pick.
  const [dcChannels, setDcChannels] = useState<{ id: string; name: string }[] | null>(null)
  const [dcChannelsError, setDcChannelsError] = useState<string | null>(null)
  const [dcPicked, setDcPicked] = useState('')
  const [dcSaving, setDcSaving] = useState(false)
  const [connectingPlatform, setConnectingPlatform] = useState<string | null>(null)
  const [confirmDisconnect, setConfirmDisconnect] = useState<string | null>(null)
  const [disconnecting, setDisconnecting] = useState<string | null>(null)
  const [showDiscordModal, setShowDiscordModal] = useState(false)
  const [showBlueskyModal, setShowBlueskyModal] = useState(false)
  const [showTelegramModal, setShowTelegramModal] = useState(false)
  const [showMastodonModal, setShowMastodonModal] = useState(false)
  const [twitterQuota, setTwitterQuota] = useState<{ used: number; limit: number; plan: string } | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { plan, activeWorkspace } = useWorkspace()
  const { t } = useI18n()

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
    // Every OAuth callback redirects back here as `<platform>_connected` or
    // `<platform>_<reason>`, so both outcomes can be recorded in one place
    // instead of editing eight server routes.
    if (success?.endsWith('_connected')) {
      const platform = success.replace(/_connected$/, '')
      track('connect_succeeded', { platform })
      // This is where every OAuth connect actually ends up — in a new tab, on
      // this page. If the account is not marked activated here it never is,
      // because the onboarding tab that would have done it is behind this one
      // and nobody goes back to it.
      void markActivated()
      setJustConnected(platform)
    } else if (error) {
      const [platform, ...rest] = error.split('_')
      track('connect_failed', { platform, reason: rest.join('_') || error })
    }
    // The cap is now enforced server-side in every connect callback, so a user
    // can arrive back here having been refused. One handler covers all
    // platforms: the callbacks all redirect as `<platform>_plan_limit`.
    if (error?.endsWith('_plan_limit')) {
      const platform = error.replace(/_plan_limit$/, '')
      const limit    = Number(searchParams.get('limit') || 0)
      const planName = searchParams.get('plan') || 'current'
      const label    = PLATFORM_META[platform]?.label ?? platform
      showToast(
        `Your ${planName} plan allows ${limit} ${label} account${limit === 1 ? '' : 's'}. ` +
        `Disconnect one first, or upgrade for more.`,
        'error'
      )
    }
    if (success === 'discord_connected')   showToast('Discord connected successfully!', 'success')
    if (success === 'mastodon_connected')  showToast('Mastodon connected successfully!', 'success')
    if (success === 'pinterest_connected') showToast('Pinterest connected successfully!', 'success')
    if (success === 'tiktok_connected')    showToast('TikTok connected successfully!', 'success')
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
    if (error === 'twitter_already_connected')     showToast('This X account is already connected to another SocialMate account', 'error')
    if (error === 'twitter_in_cooldown') {
      const until = searchParams.get('until')
      const date  = until ? new Date(until).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'a future date'
      showToast(`This X account is in a 45-day reconnection pause until ${date}`, 'error')
    }
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

  // Record the view exactly once per mount.
  //
  // This used to live inside the data effect below, which depends on
  // `activeWorkspace`. That resolves from null to a value on first load, so the
  // effect re-ran and every single visit was recorded as two views (three on a
  // first-ever visit, counting the once-only variant). The distinct-user counts
  // on /admin/funnel were unaffected — they dedupe by user_id — but the raw
  // fire counts, which exist to answer "how often do they come back", were
  // roughly double. A ref rather than an empty dep array, because the router
  // guard below still needs the real deps.
  // Loaded lazily, and only when it can actually be acted on: a connected
  // Discord with no channel chosen yet.
  const needsDiscordChannel =
    accounts.some(a => a.platform === 'discord') && !destinationPlatforms.has('discord')

  useEffect(() => {
    if (!needsDiscordChannel || dcChannels || dcChannelsError) return
    fetch('/api/accounts/discord/channels')
      .then(async r => {
        const j = await r.json().catch(() => ({}))
        if (!r.ok) throw new Error(j.message || j.error || 'Could not load your channels.')
        return j
      })
      .then((j: { channels: { id: string; name: string }[] }) => {
        setDcChannels(j.channels ?? [])
        if ((j.channels ?? []).length === 1) setDcPicked(j.channels[0].id)
      })
      .catch((e: Error) => setDcChannelsError(e.message))
  }, [needsDiscordChannel, dcChannels, dcChannelsError])

  const saveDiscordChannel = async (channelId: string) => {
    const chan = dcChannels?.find(c => c.id === channelId)
    if (!chan) return
    setDcSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setDcSaving(false); router.push('/login'); return }

    const { error } = await supabase.from('post_destinations').insert({
      user_id: user.id,
      platform: 'discord',
      label: '#' + chan.name,
      // A channel id, not a webhook URL. The publisher tells them apart by
      // shape and keeps posting through existing webhooks unchanged.
      destination_id: chan.id,
      webhook_url: null,
      workspace_id: activeWorkspace && !activeWorkspace.is_personal ? activeWorkspace.id : null,
    })
    setDcSaving(false)

    if (error) {
      console.warn('[accounts] saving discord channel failed', error)
      showToast('Could not save that channel — please try again', 'error')
      return
    }
    setDestinationPlatforms(prev => new Set(prev).add('discord'))
    showToast('Posting to #' + chan.name, 'success')
  }

  const viewTracked = useRef(false)
  useEffect(() => {
    if (viewTracked.current) return
    viewTracked.current = true
    // Repeatable, plus a once-ever variant: "how many accounts ever reached
    // this screen" and "how often do they come back" are different questions
    // and both matter here.
    track('connect_screen_viewed')
    trackOnce('connect_screen_viewed')
  }, [])

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

      let dq = supabase
        .from('post_destinations')
        .select('platform')
        .eq('user_id', user.id)
      dq = (activeWorkspace && !activeWorkspace.is_personal
        ? dq.eq('workspace_id', activeWorkspace.id)
        : dq.is('workspace_id', null)) as typeof dq
      const { data: destRows, error: destErr } = await dq
      if (destErr) console.warn('[accounts] destinations lookup failed', destErr)
      setDestinationPlatforms(new Set((destRows || []).map((d: { platform: string }) => d.platform)))

      // Fetch Twitter quota if Twitter is connected
      const twitterConnected = (data || []).some((a: Account) => a.platform === 'twitter')
      if (twitterConnected) {
        fetch('/api/accounts/twitter/quota')
          .then(r => r.json())
          .then(d => { if (!d.error) setTwitterQuota(d) })
          .catch(() => {})
      }
    }
    getData()
  }, [router, activeWorkspace])

  const handleDisconnect = async (id: string, platform: string) => {
    setDisconnecting(id)

    if (platform === 'twitter') {
      // Use the API route so the jail registry is updated
      const res = await fetch('/api/accounts/twitter/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId: id }),
      })
      if (!res.ok) {
        showToast('Failed to disconnect X account — please try again', 'error')
        setDisconnecting(null)
        return
      }
    } else {
      await supabase.from('connected_accounts').delete().eq('id', id)
    }

    setAccounts(prev => prev.filter(a => a.id !== id))
    setConfirmDisconnect(null)
    setDisconnecting(null)
    showToast(`${PLATFORM_META[platform]?.label || platform} disconnected`, 'success')
  }

  const handleConnect = (platform: string) => {
    track('connect_clicked', { platform })
    const platformAccounts = accounts.filter(a => a.platform === platform)
    if (platformAccounts.length >= accountsPerPlatform) {
      // Hitting the per-platform cap is a real drop reason and looks identical
      // to abandoning unless it is recorded separately.
      track('connect_failed', { platform, reason: 'plan_limit' })
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
    if (platform === 'tiktok')   { window.location.href = '/api/tiktok/auth';                 return }
    setConnectingPlatform(platform)
    showToast(`${PLATFORM_META[platform]?.label || platform} integration coming soon!`, 'success')
    setTimeout(() => setConnectingPlatform(null), 2000)
  }

  const handleBlueskySuccess = async () => {
    track('connect_succeeded', { platform: 'bluesky' })
    void markActivated()
    setShowBlueskyModal(false)
    showToast('Bluesky connected successfully!', 'success')
    await refreshAccounts()
  }

  const handleTelegramSuccess = async () => {
    track('connect_succeeded', { platform: 'telegram' })
    void markActivated()
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
              <h1 className="text-2xl font-extrabold tracking-tight">{t('app_accounts.title')}</h1>
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

          {/* The step after connecting. This is the cliff: every external account
              that connected a platform stopped here, because the only
              acknowledgement was a toast that removed itself after three
              seconds. TikTok goes to its Studio because it takes video; every
              other live platform composes normally. */}
          {justConnected && (
            <div className="mb-6 rounded-2xl px-5 py-4 border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 flex flex-col sm:flex-row sm:items-center gap-4">
              {(() => {
                const needsChannel =
                  DESTINATION_PLATFORMS.includes(justConnected) &&
                  !destinationPlatforms.has(justConnected)
                // X is connectable on every plan but only *postable* on Pro+,
                // because X bills us per tweet. Compose renders it as an upgrade
                // link rather than a selectable platform for free users, so a
                // free account whose only connection is X cannot publish at all.
                // Two external accounts were sitting in exactly that state.
                const xNeedsPro = justConnected === 'twitter' && plan === 'free'
                const next =
                  xNeedsPro ? { href: '/pricing', cta: 'See Pro →',
                    sub: 'X charges per tweet, so posting to X needs Pro or an X Booster pack. Connecting a free platform like Bluesky, Mastodon or Discord gets you posting right now at no cost.' }
                  : justConnected === 'tiktok' ? { href: '/tiktok/studio', cta: 'Open TikTok Studio →',
                    sub: 'TikTok takes video — upload your first one in TikTok Studio.' }
                  : needsChannel ? {
                      // Discord picks its channel inline on the card below now.
                      // Telegram still needs a username typed in, so it keeps
                      // the trip to the destinations page.
                      href: justConnected === 'discord' ? '#needs-channel-discord' : '/accounts/destinations',
                      cta: justConnected === 'discord' ? 'Pick your channel ↓' : 'Choose a channel →',
                      sub: `Now pick the ${PLATFORM_META[justConnected]?.label || justConnected} channel to post into. Until you do, posts have nowhere to go.` }
                  : { href: '/compose', cta: 'Write your first post →',
                    sub: 'Write your first post and send it out. It takes about a minute.' }
                return (
                  <>
                    <div className="flex-1">
                      <p className="text-sm font-extrabold text-emerald-800 dark:text-emerald-300">
                        {PLATFORM_META[justConnected]?.label || justConnected} is connected.
                      </p>
                      <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1">{next.sub}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Link
                        href={next.href}
                        className="inline-flex items-center px-4 py-2.5 min-h-[44px] rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors"
                      >
                        {next.cta}
                      </Link>
                      <button
                        onClick={() => setJustConnected(null)}
                        aria-label="Dismiss"
                        className="px-3 py-2.5 min-h-[44px] rounded-xl text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors"
                      >
                        Later
                      </button>
                    </div>
                  </>
                )
              })()}
            </div>
          )}

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
                {plan === 'free'   && '🔓 Free plan — 1 account per platform across all live integrations'}
                {plan === 'pro'    && '⚡ Pro plan — up to 5 accounts per platform'}
                {plan === 'agency' && '🏢 Agency plan — up to 10 accounts per platform, client workspaces included'}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {plan === 'free'   ? 'YouTube, Pinterest & Reddit are coming very soon. Upgrade to Pro for more accounts per platform.' :
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
          {accounts.length === 0 && (
            <div className="mb-8 bg-gradient-to-r from-black to-gray-800 rounded-2xl p-6 text-white">
              <div className="flex items-start gap-4">
                <span className="text-3xl flex-shrink-0">🔌</span>
                <div className="flex-1">
                  <p className="font-extrabold text-lg tracking-tight mb-1">Connect your first social account</p>
                  <p className="text-gray-300 text-sm leading-relaxed mb-4">
                    Pick one of the live platforms below to get started. You can connect as many as you want — all free.
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
              <h2 className="text-sm font-bold tracking-tight mb-4">{t('app_accounts.manage_accounts')}</h2>
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
                            <span className="text-xs font-semibold px-2 py-0.5 bg-green-100 text-green-700 rounded-full">{t('app_accounts.connected')}</span>
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
                            {t('app_accounts.disconnect')}
                          </button>
                        )}
                      </div>

                      {/* A connected Discord or Telegram with no destination cannot
                          publish anything, and nothing on this page used to say so.
                          Surfaced on the card itself, not just at connect time, so
                          it is still findable on a later visit. */}
                      {DESTINATION_PLATFORMS.includes(account.platform)
                        && !destinationPlatforms.has(account.platform)
                        && !isConfirming && (
                        <div id={'needs-channel-' + account.platform} className="mt-3 pt-3 border-t border-amber-200 dark:border-amber-800/50">
                          <p className="text-xs font-bold text-amber-700 dark:text-amber-400 mb-2">
                            No channel picked yet — posts to {meta.label} have nowhere to go.
                          </p>
                          {account.platform === 'discord' ? (
                            dcChannelsError ? (
                              <>
                                <p className="text-xs text-amber-700 dark:text-amber-400 mb-2">{dcChannelsError}</p>
                                <Link
                                  href="/accounts/destinations"
                                  className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-2 min-h-[36px] bg-amber-500 hover:bg-amber-400 text-white rounded-xl transition-colors"
                                >
                                  Add a webhook instead &rarr;
                                </Link>
                              </>
                            ) : dcChannels === null ? (
                              <p className="text-xs text-amber-700 dark:text-amber-400">Loading your channels&hellip;</p>
                            ) : dcChannels.length === 0 ? (
                              <>
                                <p className="text-xs text-amber-700 dark:text-amber-400 mb-2">
                                  No channels we can post to in that server.
                                </p>
                                <Link
                                  href="/accounts/destinations"
                                  className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-2 min-h-[36px] bg-amber-500 hover:bg-amber-400 text-white rounded-xl transition-colors"
                                >
                                  Add a webhook instead &rarr;
                                </Link>
                              </>
                            ) : (
                              <div className="flex flex-col sm:flex-row gap-2">
                                <select
                                  value={dcPicked}
                                  onChange={e => setDcPicked(e.target.value)}
                                  aria-label="Discord channel to post into"
                                  className="flex-1 min-h-[44px] text-xs font-semibold px-3 py-2 rounded-xl bg-surface border border-amber-300 dark:border-amber-800 text-theme"
                                >
                                  <option value="">Pick a channel&hellip;</option>
                                  {dcChannels.map(c => (
                                    <option key={c.id} value={c.id}>#{c.name}</option>
                                  ))}
                                </select>
                                <button
                                  onClick={() => saveDiscordChannel(dcPicked)}
                                  disabled={!dcPicked || dcSaving}
                                  className="inline-flex items-center justify-center gap-1.5 text-xs font-bold px-4 py-2 min-h-[44px] bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-white rounded-xl transition-colors"
                                >
                                  {dcSaving ? 'Saving…' : 'Post here'}
                                </button>
                              </div>
                            )
                          ) : (
                            <Link
                              href="/accounts/destinations"
                              className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-2 min-h-[36px] bg-amber-500 hover:bg-amber-400 text-white rounded-xl transition-colors"
                            >
                              Choose a channel &rarr;
                            </Link>
                          )}
                        </div>
                      )}

                      {account.platform === 'discord' && !isConfirming && (
                        <div className="mt-3 pt-3 border-t border-indigo-100 dark:border-indigo-900/30">
                          <Link
                            href="/discord"
                            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-indigo-600 text-white rounded-xl hover:opacity-80 transition-all"
                          >
                            🎮 Manage Server →
                          </Link>
                        </div>
                      )}

                      {account.platform === 'twitter' && plan === 'free' && !isConfirming && (
                        <div className="mt-3 pt-3 border-t border-amber-200 dark:border-amber-800/50">
                          <p className="text-xs font-bold text-amber-700 dark:text-amber-400 mb-2">
                            X posting needs Pro — X bills per tweet, so it is not on the free plan.
                          </p>
                          <Link
                            href="/pricing"
                            className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-2 min-h-[36px] bg-amber-500 hover:bg-amber-400 text-white rounded-xl transition-colors"
                          >
                            See Pro →
                          </Link>
                        </div>
                      )}

                      {account.platform === 'twitter' && twitterQuota && !isConfirming && (
                        <div className="mt-3 pt-3 border-t border-sky-100">
                          {(() => {
                            const pct = twitterQuota.limit > 0 ? Math.min((twitterQuota.used / twitterQuota.limit) * 100, 100) : 0
                            const barColor = pct >= 80 ? 'bg-red-400' : pct >= 50 ? 'bg-yellow-400' : 'bg-green-400'
                            return (
                              <>
                                <div className="flex items-center justify-between mb-1.5">
                                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">X tweets this month</span>
                                  <span className={`text-xs font-bold ${pct >= 80 ? 'text-red-500' : pct >= 50 ? 'text-yellow-600' : 'text-green-600'}`}>
                                    {twitterQuota.used} / {twitterQuota.limit}
                                  </span>
                                </div>
                                <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                  <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${pct}%` }} />
                                </div>
                              </>
                            )
                          })()}
                        </div>
                      )}

                      {isConfirming && (
                        <div className="mt-3 pt-3 border-t border-white/60 flex flex-col sm:flex-row items-start sm:items-center gap-2">
                          <p className="text-xs text-red-600 font-semibold flex-1">
                            {account.platform === 'twitter'
                              ? `Disconnecting @${account.account_name} will lock this X account from reconnecting for 45 days. Are you sure?`
                              : `Disconnect @${account.account_name} from ${meta.label}? This cannot be undone.`}
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
                              {t('app_common.cancel')}
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
              <h2 className="text-sm font-bold tracking-tight">{t('app_accounts.add_account')}</h2>
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
                  YouTube, Pinterest, and Reddit are code-complete and launching very soon.
                  Instagram, Facebook, and Threads are in developer review.
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
              You&apos;ll pick the server to add SocialMate to, then choose a channel here.
              Make sure you&apos;re logged into the right Discord account first, and that you can
              add apps to that server.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowDiscordModal(false)}
                className="flex-1 text-sm font-semibold px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl hover:border-gray-400 transition-all">
                {t('app_common.cancel')}
              </button>
              <button onClick={() => {
                // Save workspace context before OAuth redirect
                if (activeWorkspace && !activeWorkspace.is_personal) {
                  document.cookie = `pending_workspace_id=${activeWorkspace.id}; path=/; max-age=300`
                } else {
                  document.cookie = `pending_workspace_id=; path=/; max-age=0`
                }
                setShowDiscordModal(false)
                window.open('/api/accounts/discord/bot-connect', '_blank')
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
        <div style={{ bottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))' }} className={`fixed right-6 z-50 px-5 py-3 rounded-2xl text-sm font-semibold shadow-lg ${
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black dark:border-amber-500" />
      </div>
    }>
      <AccountsInner />
    </Suspense>
  )
}