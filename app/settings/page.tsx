'use client'
import { useEffect, useState, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { useWorkspace } from '@/contexts/WorkspaceContext'
import { usePushNotifications } from '@/hooks/usePushNotifications'
import UpgradeNudge from '@/components/UpgradeNudge'
import { useI18n } from '@/contexts/I18nContext'
import { SUPPORTED_LOCALES } from '@/lib/i18n'

const STRIPE_PRO_PRICE_ID    = 'price_1T9S2v7OMwDowUuULHznqUD5'
const STRIPE_AGENCY_PRICE_ID = 'price_1TFMHp7OMwDowUuUgeLAeJNY'

const ALL_TABS    = ['Profile', 'Plan', 'Referrals', 'Notifications', 'Scheduling', 'Language', 'Security', 'White Label', 'Appearance', 'Brand Voice', 'Integrations']
const FREE_TABS   = ['Profile', 'Plan', 'Notifications', 'Scheduling', 'Language', 'Security', 'Appearance', 'Integrations']

// Every 5 paying referrals = +100 bonus credits (stacking, no cap)
const REFERRAL_TIERS = [
  { paying: 5,   reward: '+100 bonus credits',  icon: '🎁' },
  { paying: 10,  reward: '+200 bonus credits',  icon: '⭐' },
  { paying: 15,  reward: '+300 bonus credits',  icon: '🚀' },
  { paying: 20,  reward: '+400 bonus credits',  icon: '💎' },
  { paying: 25,  reward: '+500 bonus credits',  icon: '👑' },
]

const CREDIT_PACKS = [
  { label: 'Starter',  credits: 100,  price: '$1.99',  priceId: 'price_1TFMI47OMwDowUuUhTrbe3oq', popular: false },
  { label: 'Popular',  credits: 300,  price: '$4.99',  priceId: 'price_1TFMI77OMwDowUuU0wDZWcCL', popular: true  },
  { label: 'Pro Pack', credits: 750,  price: '$9.99',  priceId: 'price_1TFMIA7OMwDowUuUwI3SEGCR', popular: false },
  { label: 'Max Pack', credits: 2000, price: '$19.99', priceId: 'price_1TFMID7OMwDowUuU2sQgbIx9', popular: false },
]

const X_BOOSTER_PACKS = [
  { tier: 'spark', label: 'Spark',  posts: 50,  price: '$1.99',  popular: false },
  { tier: 'boost', label: 'Boost',  posts: 120, price: '$4.99',  popular: true  },
  { tier: 'surge', label: 'Surge',  posts: 250, price: '$9.99',  popular: false },
  { tier: 'storm', label: 'Storm',  posts: 500, price: '$19.99', popular: false },
]

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://socialmate.studio'

function SettingsInner() {
  const { plan } = useWorkspace()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t: tSettings } = useI18n()

  // Push notification support
  const { isSupported: pushSupported, permission: pushPermission, isSubscribed: pushSubscribed, isLoading: pushLoading, subscribe: pushSubscribe, unsubscribe: pushUnsubscribe } = usePushNotifications()

  // Tabs depend on plan — computed inside component
  const TABS = plan === 'free' ? FREE_TABS : ALL_TABS

  const TAB_LABELS: Record<string, string> = {
    'Profile':     tSettings('app_settings_tabs.profile'),
    'Plan':        tSettings('app_settings_tabs.plan'),
    'Referrals':   tSettings('app_settings_tabs.referrals'),
    'Notifications': tSettings('app_settings_tabs.notifications'),
    'Language':    tSettings('app_settings_tabs.language'),
    'Security':    tSettings('app_settings_tabs.security'),
    'White Label': tSettings('app_settings_tabs.white_label'),
    'Appearance':  tSettings('app_settings_tabs.appearance'),
    'Brand Voice':  tSettings('app_settings_tabs.brand_voice'),
    'Scheduling':   tSettings('app_settings_tabs.scheduling'),
    'Integrations': tSettings('app_settings_tabs.integrations'),
  }

  const [userEmail, setUserEmail]       = useState('')
  const [userId, setUserId]             = useState<string | null>(null)
  const [displayName, setDisplayName]   = useState('')
  const [username, setUsername]         = useState('')
  const [bio, setBio]                   = useState('')
  const [authLoading, setAuthLoading]   = useState(true)

  const tabFromUrl  = searchParams.get('tab')
  const [activeTab, setActiveTab] = useState(
    tabFromUrl && [...ALL_TABS, ...FREE_TABS].includes(tabFromUrl) ? tabFromUrl : 'Profile'
  )

  const [savedTab, setSavedTab]                   = useState<string | null>(null)
  const [checkoutLoading, setCheckoutLoading]     = useState(false)
  const [couponInput, setCouponInput]     = useState('')
  const [couponValidating, setCouponValidating] = useState(false)
  const [couponApplied, setCouponApplied] = useState<{ id: string; code: string; discount_type: string; discount_value: number } | null>(null)
  const [couponError, setCouponError]     = useState<string | null>(null)
  const [creditPackLoading, setCreditPackLoading] = useState<string | null>(null)
  const [notifications, setNotifications] = useState({
    post_published:    true,
    post_failed:       true,
    credits_low:       true,
    team_joined:       true,
    weekly_digest:     true,
    performance_alerts: true,
  })
  const [notifSaving, setNotifSaving]     = useState<string | null>(null)
  const [notifSaved, setNotifSaved]       = useState<string | null>(null)
  const [copiedLink, setCopiedLink]                   = useState(false)
  const [confirmDeletePosts, setConfirmDeletePosts]   = useState(false)
  const [confirmDeleteAccount, setConfirmDeleteAccount] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText]     = useState('')
  const [dangerLoading, setDangerLoading]             = useState(false)

  // Change password state
  const [currentPassword, setCurrentPassword]     = useState('')
  const [newPassword, setNewPassword]             = useState('')
  const [confirmPassword, setConfirmPassword]     = useState('')
  const [passwordError, setPasswordError]         = useState('')
  const [passwordLoading, setPasswordLoading]     = useState(false)
  const [passwordSuccess, setPasswordSuccess]     = useState(false)

  // Active sessions state
  const [sessionsLoading, setSessionsLoading]     = useState(false)
  const [sessionSignedOut, setSessionSignedOut]   = useState(false)

  const [referralCode, setReferralCode]       = useState('')
  const [referralStats, setReferralStats]     = useState({ totalReferrals: 0, payingReferrals: 0, creditsEarned: 0 })
  const [referralHistory, setReferralHistory] = useState<any[]>([])
  const [referralLoading, setReferralLoading] = useState(false)

  const mfaCheckedRef = useRef(false)
  const [mfaEnabled, setMfaEnabled]     = useState(false)
  const [mfaFactorId, setMfaFactorId]   = useState<string | null>(null)
  const [mfaStep, setMfaStep]           = useState<'idle' | 'enroll' | 'disable_confirm'>('idle')
  const [mfaQR, setMfaQR]               = useState('')
  const [mfaSecret, setMfaSecret]       = useState('')
  const [mfaEnrollId, setMfaEnrollId]   = useState('')
  const [mfaCode, setMfaCode]           = useState('')
  const [mfaLoading, setMfaLoading]     = useState(false)
  const [mfaError, setMfaError]         = useState('')

  // White label state
  const [whiteLabelActive, setWhiteLabelActive] = useState(false)
  const [whiteLabelTier, setWhiteLabelTier]     = useState<string | null>(null)
  const [whiteLabelStatus, setWhiteLabelStatus] = useState<string | null>(null)
  const [wlBrandName, setWlBrandName]           = useState('')
  const [wlLogoUrl, setWlLogoUrl]               = useState('')
  const [wlDomain, setWlDomain]                 = useState('')
  const [wlColor, setWlColor]                   = useState('#f59e0b')
  const [wlRemoveBranding, setWlRemoveBranding] = useState(false)
  const [wlSaving, setWlSaving]                 = useState(false)
  const [wlLogoUploading, setWlLogoUploading]   = useState(false)
  const [wlLogoError, setWlLogoError]           = useState<string | null>(null)
  const [wlCheckoutLoading, setWlCheckoutLoading] = useState(false)
  const [wlActivated, setWlActivated]           = useState(false)

  const [creditPref, setCreditPref] = useState<'monthly_first' | 'bank_first'>('monthly_first')
  const [irisOptIn, setIrisOptIn]   = useState(true)
  const [irisSaving, setIrisSaving] = useState(false)

  // X Booster state
  const [boosterBalance, setBoosterBalance]       = useState<number | null>(null)
  const [boosterLoading, setBoosterLoading]       = useState<string | null>(null)

  // Brand Voice state
  const [bvLoading, setBvLoading]             = useState(false)
  const [bvSaved, setBvSaved]                 = useState(false)
  const [voiceName, setVoiceName]             = useState('')
  const [bvTone, setBvTone]                   = useState('Professional')
  const [bvWritingStyle, setBvWritingStyle]   = useState('Short & punchy')
  const [bvVocabulary, setBvVocabulary]       = useState('')
  const [bvAlwaysInclude, setBvAlwaysInclude] = useState('')
  const [bvNeverInclude, setBvNeverInclude]   = useState('')
  const [bvExamplePost, setBvExamplePost]     = useState('')

  // Appearance — default platforms & sidebar stats visibility
  const [defaultPlatforms, setDefaultPlatforms] = useState<string[]>([])
  const [defaultPlatformsSaving, setDefaultPlatformsSaving] = useState(false)
  const [defaultPlatformsSaved, setDefaultPlatformsSaved] = useState(false)
  const [sidebarStatsVisible, setSidebarStatsVisible] = useState(true)

  // Scheduling window + DND
  const [schedStart, setSchedStart]         = useState('09:00')
  const [schedEnd, setSchedEnd]             = useState('21:00')
  const [dndEnabled, setDndEnabled]         = useState(false)
  const [dndStart, setDndStart]             = useState('22:00')
  const [dndEnd, setDndEnd]                 = useState('08:00')
  const [schedSaving, setSchedSaving]       = useState(false)
  const [schedSaved, setSchedSaved]         = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem('sidebar_stats_visible')
      if (stored !== null) setSidebarStatsVisible(stored !== 'false')
    } catch {}
  }, [])

  // Credit purchase success toast
  useEffect(() => {
    if (searchParams.get('credits') === 'purchased') {
      setSavedTab('credits_purchased')
      setTimeout(() => setSavedTab(null), 4000)
    }
  }, [searchParams])

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUserEmail(user.email || '')
      setUserId(user.id)
      if (searchParams.get('white_label') === 'activated') setWlActivated(true)
      // Show page immediately — settings fill in as data arrives
      setAuthLoading(false)

      // Fetch user_settings + profile in parallel (was 3 sequential round-trips)
      const [{ data: settings }, { data: profile }] = await Promise.all([
        supabase
          .from('user_settings')
          .select('referral_code, white_label_active, white_label_tier, white_label_status, white_label_brand_name, white_label_logo_url, white_label_custom_domain, white_label_brand_color, white_label_remove_branding, notification_prefs, credit_source_preference, iris_opt_in, default_platforms, scheduling_window_start, scheduling_window_end, dnd_enabled, dnd_start, dnd_end')
          .eq('user_id', user.id)
          .single(),
        supabase
          .from('profiles')
          .select('display_name, username, bio')
          .eq('id', user.id)
          .single(),
      ])

      if (settings) {
        if (settings.referral_code) setReferralCode(settings.referral_code)
        if (settings.iris_opt_in !== undefined && settings.iris_opt_in !== null) setIrisOptIn(settings.iris_opt_in)
        if (Array.isArray(settings.default_platforms)) setDefaultPlatforms(settings.default_platforms)
        setWhiteLabelActive(settings.white_label_active || false)
        setWhiteLabelTier(settings.white_label_tier || null)
        setWhiteLabelStatus(settings.white_label_status || null)
        setWlBrandName(settings.white_label_brand_name || '')
        setWlLogoUrl(settings.white_label_logo_url || '')
        setWlDomain(settings.white_label_custom_domain || '')
        setWlColor(settings.white_label_brand_color || '#f59e0b')
        setWlRemoveBranding(settings.white_label_remove_branding || false)
        if (settings.credit_source_preference) {
          setCreditPref(settings.credit_source_preference as 'monthly_first' | 'bank_first')
        }
        if (settings.scheduling_window_start) setSchedStart(settings.scheduling_window_start)
        if (settings.scheduling_window_end)   setSchedEnd(settings.scheduling_window_end)
        if (settings.dnd_enabled !== null && settings.dnd_enabled !== undefined) setDndEnabled(settings.dnd_enabled)
        if (settings.dnd_start) setDndStart(settings.dnd_start)
        if (settings.dnd_end)   setDndEnd(settings.dnd_end)
        if (settings.notification_prefs) {
          setNotifications(prev => ({
            post_published:    settings.notification_prefs.post_published    ?? prev.post_published,
            post_failed:       settings.notification_prefs.post_failed       ?? prev.post_failed,
            credits_low:       settings.notification_prefs.credits_low       ?? prev.credits_low,
            team_joined:       settings.notification_prefs.team_joined       ?? prev.team_joined,
            weekly_digest:     settings.notification_prefs.weekly_digest     ?? prev.weekly_digest,
            performance_alerts: settings.notification_prefs.performance_alerts ?? prev.performance_alerts,
          }))
        }
      }

      if (profile) {
        setDisplayName(profile.display_name || '')
        setUsername(profile.username || '')
        setBio(profile.bio || '')
      }
    }
    init()
  }, [router, searchParams])

  // Lazy-load MFA only when Security tab is first opened
  useEffect(() => {
    if (activeTab !== 'Security' || !userId || mfaCheckedRef.current) return
    mfaCheckedRef.current = true
    supabase.auth.mfa.listFactors().then(({ data: factors }) => {
      const totpFactor = factors?.totp?.find((f: any) => f.status === 'verified')
      if (totpFactor) { setMfaEnabled(true); setMfaFactorId(totpFactor.id) }
    })
  }, [activeTab, userId])

  useEffect(() => {
    if (activeTab !== 'Referrals' || !userId) return
    const loadReferrals = async () => {
      setReferralLoading(true)
      const { data, error } = await supabase
        .from('referral_conversions')
        .select('*')
        .eq('affiliate_user_id', userId)
        .order('converted_at', { ascending: false })
      if (!error && data) {
        const paying      = data.filter((r: any) => r.status === 'eligible' || r.status === 'paid')
        const totalCredits = data.reduce((sum: number, r: any) => sum + (r.total_earned ?? 0), 0)
        setReferralStats({ totalReferrals: data.length, payingReferrals: paying.length, creditsEarned: totalCredits })
        setReferralHistory(data.slice(0, 10))
      }
      setReferralLoading(false)
    }
    loadReferrals()
  }, [activeTab, userId])

  // Fetch X Booster balance when Plan tab is active
  useEffect(() => {
    if (activeTab !== 'Plan') return
    fetch('/api/accounts/twitter/quota')
      .then(r => r.json())
      .then(d => setBoosterBalance(d.boosterBalance ?? 0))
      .catch(() => setBoosterBalance(0))
  }, [activeTab])

  // X Booster purchase success toast
  useEffect(() => {
    if (searchParams.get('booster') === 'purchased') {
      setSavedTab('booster_purchased')
      setTimeout(() => setSavedTab(null), 4000)
    }
  }, [searchParams])

  // Load Brand Voice when tab becomes active
  useEffect(() => {
    if (activeTab !== 'Brand Voice') return
    fetch('/api/user/brand-voice')
      .then(r => r.json())
      .then(d => {
        const bv = d.brand_voice
        if (!bv) return
        if (bv.voiceName)      setVoiceName(bv.voiceName)
        if (bv.tone)           setBvTone(bv.tone)
        if (bv.writingStyle)   setBvWritingStyle(bv.writingStyle)
        if (bv.vocabulary)     setBvVocabulary(bv.vocabulary)
        if (bv.alwaysInclude)  setBvAlwaysInclude(bv.alwaysInclude)
        if (bv.neverInclude)   setBvNeverInclude(bv.neverInclude)
        if (bv.examplePost)    setBvExamplePost(bv.examplePost)
      })
      .catch(() => {})
  }, [activeTab])

  const handleBoosterPurchase = async (tier: string) => {
    setBoosterLoading(tier)
    try {
      const res  = await fetch('/api/accounts/twitter/booster', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tier }) })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      if (data.error === 'Unauthorized') router.push('/login?redirect=/settings?tab=Plan')
    } catch { console.error('Booster checkout failed') }
    finally { setBoosterLoading(null) }
  }

  const handleSaveScheduling = async () => {
    setSchedSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('user_settings').update({
        scheduling_window_start: schedStart,
        scheduling_window_end:   schedEnd,
        dnd_enabled:             dndEnabled,
        dnd_start:               dndStart,
        dnd_end:                 dndEnd,
      }).eq('user_id', user.id)
    }
    setSchedSaving(false)
    setSchedSaved(true)
    setTimeout(() => setSchedSaved(false), 2500)
  }

  const referralLink = referralCode ? `${appUrl}/?ref=${referralCode}` : ''
  const nextTier     = REFERRAL_TIERS.find(t => referralStats.payingReferrals < t.paying)

  const handleIrisToggle = async () => {
    const newVal = !irisOptIn
    setIrisOptIn(newVal)
    setIrisSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('user_settings').update({ iris_opt_in: newVal }).eq('user_id', user.id)
    }
    setIrisSaving(false)
  }

  const handleNotifToggle = async (key: keyof typeof notifications) => {
    const newVal  = !notifications[key]
    const updated = { ...notifications, [key]: newVal }
    setNotifications(updated)
    setNotifSaving(key)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('user_settings').update({ notification_prefs: updated }).eq('user_id', user.id)
    }
    setNotifSaving(null)
    setNotifSaved(key)
    setTimeout(() => setNotifSaved(null), 2000)
  }

  const handleSave = async (tab: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    if (tab === 'Profile') {
      await supabase.from('profiles').update({ display_name: displayName, username, bio }).eq('id', user.id)
    }
    if (tab === 'Notifications') {
      await supabase.from('user_settings').update({ notification_prefs: notifications }).eq('user_id', user.id)
    }
    if (tab === 'WhiteLabel') {
      await supabase.from('user_settings').update({
        white_label_brand_name:    wlBrandName,
        white_label_logo_url:      wlLogoUrl,
        white_label_custom_domain: wlDomain,
        white_label_brand_color:   wlColor,
      }).eq('user_id', user.id)
    }
    setSavedTab(tab)
    setTimeout(() => setSavedTab(null), 2000)
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  async function applyCoupon() {
    if (!couponInput.trim()) return
    setCouponValidating(true); setCouponError(null); setCouponApplied(null)
    try {
      const res = await fetch('/api/coupons/validate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: couponInput.trim() }) })
      const json = await res.json()
      if (json.valid) { setCouponApplied(json.coupon) } else { setCouponError(json.error || 'Invalid code') }
    } catch { setCouponError('Could not validate code') }
    finally { setCouponValidating(false) }
  }

  const handleCheckout = async (priceId: string) => {
    setCheckoutLoading(true)
    try {
      const res  = await fetch('/api/stripe/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ priceId, ...(couponApplied ? { coupon_code: couponApplied.code } : {}) }) })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      if (data.error === 'Unauthorized') router.push('/login')
    } catch { console.error('Checkout failed') }
    finally { setCheckoutLoading(false) }
  }

  const handleWhiteLabelCheckout = async (tier: 'basic' | 'pro') => {
    setWlCheckoutLoading(true)
    try {
      const res  = await fetch('/api/stripe/whitelabel', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tier }) })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      if (data.error) alert(data.error)
    } catch { console.error('White label checkout failed') }
    finally { setWlCheckoutLoading(false) }
  }

  const handleCreditPack = async (priceId: string) => {
    setCreditPackLoading(priceId)
    try {
      const res  = await fetch('/api/stripe/credits', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ priceId }) })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      if (data.error === 'Unauthorized') router.push('/login')
    } catch { console.error('Credit pack checkout failed') }
    finally { setCreditPackLoading(null) }
  }

  const saveDefaultPlatforms = async (platforms: string[]) => {
    if (!userId) return
    setDefaultPlatformsSaving(true)
    await supabase
      .from('user_settings')
      .update({ default_platforms: platforms })
      .eq('user_id', userId)
    setDefaultPlatformsSaving(false)
    setDefaultPlatformsSaved(true)
    setTimeout(() => setDefaultPlatformsSaved(false), 2000)
  }

  const saveCreditPreference = async (pref: 'monthly_first' | 'bank_first') => {
    setCreditPref(pref)
    if (!userId) return
    await supabase
      .from('user_settings')
      .update({ credit_source_preference: pref })
      .eq('user_id', userId)
  }

  const handlePortal = async () => {
    setCheckoutLoading(true)
    try {
      const res  = await fetch('/api/stripe/portal', { method: 'POST' })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch { console.error('Portal failed') }
    finally { setCheckoutLoading(false) }
  }

  const handleDeleteAllPosts = async () => {
    setDangerLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) await supabase.from('posts').delete().eq('user_id', user.id).in('status', ['scheduled', 'draft'])
    setConfirmDeletePosts(false)
    setDangerLoading(false)
  }

  const handleChangePassword = async () => {
    setPasswordError('')
    setPasswordSuccess(false)
    if (!newPassword || newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.')
      return
    }
    setPasswordLoading(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    setPasswordLoading(false)
    if (error) {
      setPasswordError(error.message)
    } else {
      setPasswordSuccess(true)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => setPasswordSuccess(false), 4000)
    }
  }

  const handleSignOutOtherSessions = async () => {
    setSessionsLoading(true)
    await supabase.auth.signOut({ scope: 'others' })
    setSessionsLoading(false)
    setSessionSignedOut(true)
    setTimeout(() => setSessionSignedOut(false), 3000)
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') return
    setDangerLoading(true)
    try {
      const res = await fetch('/api/user/delete', { method: 'POST' })
      if (res.ok) {
        await supabase.auth.signOut()
        router.push('/')
      } else {
        const json = await res.json().catch(() => ({}))
        console.error('Delete account failed:', json.error)
        setDangerLoading(false)
      }
    } catch {
      setDangerLoading(false)
    }
  }

  const handleEnroll2FA = async () => {
    setMfaLoading(true); setMfaError('')
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' })
    if (error || !data) { setMfaError(error?.message || 'Failed to start 2FA setup'); setMfaLoading(false); return }
    setMfaEnrollId(data.id); setMfaQR(data.totp.qr_code); setMfaSecret(data.totp.secret); setMfaStep('enroll'); setMfaLoading(false)
  }

  const handleVerify2FA = async () => {
    if (mfaCode.length !== 6) { setMfaError('Enter the 6-digit code'); return }
    setMfaLoading(true); setMfaError('')
    const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId: mfaEnrollId })
    if (challengeError || !challenge) { setMfaError(challengeError?.message || 'Challenge failed'); setMfaLoading(false); return }
    const { error } = await supabase.auth.mfa.verify({ factorId: mfaEnrollId, challengeId: challenge.id, code: mfaCode })
    if (error) { setMfaError('Incorrect code — try again'); setMfaLoading(false); return }
    setMfaEnabled(true); setMfaFactorId(mfaEnrollId); setMfaStep('idle'); setMfaCode(''); setMfaQR(''); setMfaSecret(''); setMfaLoading(false)
  }

  const handleDisable2FA = async () => {
    if (!mfaFactorId) return
    setMfaLoading(true); setMfaError('')
    const { error } = await supabase.auth.mfa.unenroll({ factorId: mfaFactorId })
    if (error) { setMfaError(error.message); setMfaLoading(false); return }
    setMfaEnabled(false); setMfaFactorId(null); setMfaStep('idle'); setMfaLoading(false)
  }

  if (authLoading) {
    return (
      <div className="min-h-dvh bg-theme flex">
        <Sidebar />
        <div className="md:ml-56 flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-black dark:border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-theme flex">
      <Sidebar />
      <div className="md:ml-56 flex-1 p-4 md:p-8">
        <div className="max-w-3xl mx-auto">

          <div className="mb-8">
            <h1 className="text-2xl font-extrabold tracking-tight">{tSettings('app_settings.title')}</h1>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">{tSettings('app_settings.subtitle')}</p>
          </div>

          {/* Mobile: dropdown selector */}
          <div className="mb-6 sm:hidden">
            <select
              value={activeTab}
              onChange={e => setActiveTab(e.target.value)}
              className="w-full border border-theme rounded-2xl px-4 py-3 text-sm font-bold bg-surface text-gray-700 dark:text-gray-200 outline-none focus:border-gray-400 transition-all">
              {TABS.map(tab => (
                <option key={tab} value={tab}>{TAB_LABELS[tab] ?? tab}</option>
              ))}
            </select>
          </div>

          {/* Desktop: pill tabs — scrollable so Brand Voice never overflows */}
          <div className="hidden sm:flex items-center gap-1 mb-6 bg-surface border border-theme rounded-2xl p-1.5 overflow-x-auto scrollbar-none">
            {TABS.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex-shrink-0 ${activeTab === tab ? 'bg-black text-white dark:bg-white dark:text-black' : 'text-gray-500 hover:text-black dark:hover:text-white'}`}>
                {TAB_LABELS[tab] ?? tab}
              </button>
            ))}
          </div>

          {/* ── PROFILE ── */}
          {activeTab === 'Profile' && (
            <div className="bg-surface border border-theme rounded-2xl p-6 space-y-4">
              <h2 className="text-base font-extrabold">{tSettings('app_settings.profile_tab.title')}</h2>
              <div>
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1">{tSettings('app_settings.profile_tab.display_name')}</label>
                <input value={displayName} onChange={e => setDisplayName(e.target.value)}
                  className="w-full border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-black dark:focus:border-gray-400 transition-all" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1">{tSettings('app_settings.profile_tab.email')}</label>
                <input value={userEmail} disabled
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed" />
                <p className="text-xs text-gray-400 mt-1">{tSettings('app_settings.profile_tab.email_note')}</p>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1">{tSettings('app_settings.profile_tab.username')}</label>
                <input value={username} onChange={e => setUsername(e.target.value)} placeholder="@yourhandle"
                  className="w-full border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-black dark:focus:border-gray-400 transition-all" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1">{tSettings('app_settings.profile_tab.bio')}</label>
                <textarea rows={3} value={bio} onChange={e => setBio(e.target.value)}
                  placeholder={tSettings('app_settings.profile_tab.bio_placeholder')}
                  className="w-full border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-black dark:focus:border-gray-400 transition-all resize-none" />
              </div>
              <button onClick={() => handleSave('Profile')}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${savedTab === 'Profile' ? 'bg-green-500 text-white' : 'bg-black text-white hover:opacity-80'}`}>
                {savedTab === 'Profile' ? tSettings('app_settings.profile_tab.saved') : tSettings('app_settings.profile_tab.save_profile')}
              </button>

              {/* Built with SocialMate badge */}
              <div className="border-t border-theme pt-5 mt-2">
                <p className="text-sm font-bold mb-1">🏷️ Built with SocialMate Badge</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">Drop this on your website, link-in-bio, or portfolio to show your creator stack.</p>
                <div className="flex items-center gap-3 mb-3">
                  <img src="/badge.svg" alt="Built with SocialMate" className="h-8" />
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-3 mb-2 font-mono text-xs text-gray-600 dark:text-gray-400 select-all break-all">
                  {`<a href="https://socialmate.studio" target="_blank"><img src="https://socialmate.studio/badge.svg" alt="Built with SocialMate" height="30" /></a>`}
                </div>
                <button
                  onClick={() => {
                    try { navigator.clipboard.writeText(`<a href="https://socialmate.studio" target="_blank"><img src="https://socialmate.studio/badge.svg" alt="Built with SocialMate" height="30" /></a>`) } catch {}
                    setSavedTab('badge_copied')
                    setTimeout(() => setSavedTab(null), 2000)
                  }}
                  className={`text-xs font-bold px-4 py-2 rounded-xl transition-all ${savedTab === 'badge_copied' ? 'bg-green-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                  {savedTab === 'badge_copied' ? '✓ Copied!' : 'Copy embed code'}
                </button>
              </div>
            </div>
          )}

          {/* ── PLAN ── */}
          {activeTab === 'Plan' && (
            <div className="space-y-4">

              {/* Free-plan nudge — always visible, not dismissible */}
              {plan === 'free' && (
                <UpgradeNudge
                  variant="banner"
                  title="You're on the Free plan"
                  description="50 credits · 28 tweets · 2 seats. Pro unlocks 500 credits, 150 tweets, and 5 seats."
                  cta="Upgrade to Pro — $5/mo"
                  href="/pricing"
                />
              )}

              <div className="bg-surface border border-theme rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-base font-extrabold">{tSettings('app_settings.plan_tab.title')}</h2>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{tSettings('app_settings.plan_tab.subtitle')}</p>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1.5 rounded-full capitalize ${
                    plan === 'free' ? 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400' :
                    plan === 'pro'  ? 'bg-black text-white' :
                    'bg-purple-100 text-purple-700'
                  }`}>{plan}</span>
                </div>

                {/* Coupon input */}
                {(plan === 'free' || plan === 'pro') && (
                  <div className="flex flex-col gap-1.5 mb-3">
                    {couponApplied ? (
                      <div className="flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-xl text-xs">
                        <span className="text-green-700 dark:text-green-400 font-bold flex-1">
                          {couponApplied.code} — {couponApplied.discount_type === 'percent' ? `${couponApplied.discount_value}% off` : couponApplied.discount_type === 'fixed' ? `$${couponApplied.discount_value} off` : `+${couponApplied.discount_value} trial days`}
                        </span>
                        <button onClick={() => { setCouponApplied(null); setCouponInput('') }} className="text-green-600 font-bold">✕</button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <input value={couponInput} onChange={e => { setCouponInput(e.target.value.toUpperCase()); setCouponError(null) }}
                          onKeyDown={e => e.key === 'Enter' && applyCoupon()}
                          placeholder="Coupon code"
                          className="flex-1 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:border-violet-400" />
                        <button onClick={applyCoupon} disabled={couponValidating || !couponInput.trim()}
                          className="px-3 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 disabled:opacity-50 text-gray-700 dark:text-gray-300 text-xs font-semibold rounded-lg transition-colors">
                          {couponValidating ? '…' : 'Apply'}
                        </button>
                      </div>
                    )}
                    {couponError && <p className="text-xs text-red-500">{couponError}</p>}
                  </div>
                )}

                {plan === 'free' && (
                  <div className="space-y-3">
                    <div className="bg-black text-white rounded-xl p-4">
                      <p className="text-sm font-extrabold mb-1">{tSettings('app_settings.plan_tab.upgrade_pro_title')}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">{tSettings('app_settings.plan_tab.upgrade_pro_sub')}</p>
                      <button onClick={() => handleCheckout(STRIPE_PRO_PRICE_ID)} disabled={checkoutLoading}
                        className="bg-white text-black text-xs font-bold px-4 py-2 rounded-lg hover:opacity-80 transition-all disabled:opacity-60">
                        {checkoutLoading ? tSettings('app_settings.plan_tab.loading') : tSettings('app_settings.plan_tab.upgrade_pro_btn')}
                      </button>
                    </div>
                    <div className="border border-purple-200 rounded-xl p-4">
                      <p className="text-sm font-extrabold mb-1">{tSettings('app_settings.plan_tab.upgrade_agency_title')}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">{tSettings('app_settings.plan_tab.upgrade_agency_sub')}</p>
                      <button onClick={() => handleCheckout(STRIPE_AGENCY_PRICE_ID)} disabled={checkoutLoading}
                        className="bg-purple-600 text-white text-xs font-bold px-4 py-2 rounded-lg hover:opacity-80 transition-all disabled:opacity-60">
                        {checkoutLoading ? tSettings('app_settings.plan_tab.loading') : tSettings('app_settings.plan_tab.upgrade_agency_btn')}
                      </button>
                    </div>
                  </div>
                )}

                {plan === 'pro' && (
                  <div className="space-y-3">
                    <div className="border border-purple-200 rounded-xl p-4">
                      <p className="text-sm font-extrabold mb-1">{tSettings('app_settings.plan_tab.upgrade_agency_title_pro')}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">{tSettings('app_settings.plan_tab.upgrade_agency_sub')}</p>
                      <button onClick={() => handleCheckout(STRIPE_AGENCY_PRICE_ID)} disabled={checkoutLoading}
                        className="bg-purple-600 text-white text-xs font-bold px-4 py-2 rounded-lg hover:opacity-80 transition-all disabled:opacity-60">
                        {checkoutLoading ? tSettings('app_settings.plan_tab.loading') : tSettings('app_settings.plan_tab.upgrade_agency_btn')}
                      </button>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{tSettings('app_settings.plan_tab.manage_billing')}</p>
                      <button onClick={handlePortal} disabled={checkoutLoading}
                        className="text-xs font-bold text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all disabled:opacity-60">
                        {checkoutLoading ? tSettings('app_settings.plan_tab.loading') : tSettings('app_settings.plan_tab.manage_sub')}
                      </button>
                    </div>
                  </div>
                )}

                {plan === 'agency' && (
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{tSettings('app_settings.plan_tab.manage_billing')}</p>
                    <button onClick={handlePortal} disabled={checkoutLoading}
                      className="text-xs font-bold text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all disabled:opacity-60">
                      {checkoutLoading ? tSettings('app_settings.plan_tab.loading') : tSettings('app_settings.plan_tab.manage_sub')}
                    </button>
                  </div>
                )}
              </div>

              {/* AI CREDITS */}
              <div className="bg-surface border border-theme rounded-2xl p-6">
                <h2 className="text-base font-extrabold mb-4">{tSettings('app_settings.plan_tab.ai_credits_title')}</h2>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">{tSettings('app_settings.plan_tab.monthly_credits')}</span>
                  <span className="text-xs font-bold">
                    {plan === 'free' ? '100 / 100' : plan === 'pro' ? '500 / 500' : '2,000 / 2,000'}
                  </span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2 mb-4">
                  <div className="bg-black h-2 rounded-full" style={{ width: '100%' }} />
                </div>
                <div className="flex items-center justify-between mb-6">
                  <span className="text-xs text-gray-500 dark:text-gray-400">{tSettings('app_settings.plan_tab.credit_bank')}</span>
                  <span className="text-xs font-bold">
                    {plan === 'free' ? '150' : plan === 'pro' ? '750' : '3,000'}
                  </span>
                </div>
                <div className="border-t border-gray-100 pt-5">
                  <p className="text-xs font-extrabold mb-1">{tSettings('app_settings.plan_tab.buy_credits')}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">{tSettings('app_settings.plan_tab.buy_credits_sub')}</p>
                  <div className="grid grid-cols-2 gap-3">
                    {CREDIT_PACKS.map(pack => (
                      <div key={pack.priceId} className={`relative border rounded-xl p-4 ${pack.popular ? 'border-amber-400 dark:border-amber-500' : 'border-gray-200 dark:border-gray-700'}`}>
                        {pack.popular && (
                          <span className="absolute -top-2 left-3 text-xs font-bold bg-amber-500 text-white px-2 py-0.5 rounded-full">{tSettings('app_settings.plan_tab.popular_badge')}</span>
                        )}
                        <p className="text-sm font-extrabold mb-0.5">{pack.label}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">{pack.credits.toLocaleString()} credits</p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-extrabold">{pack.price}</span>
                          <button onClick={() => handleCreditPack(pack.priceId)} disabled={creditPackLoading === pack.priceId}
                            className="text-xs font-bold px-3 py-1.5 bg-black text-white rounded-lg hover:opacity-80 transition-all disabled:opacity-60">
                            {creditPackLoading === pack.priceId ? '...' : tSettings('app_settings.plan_tab.buy_btn')}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* X BOOSTER PACKS */}
              <div id="x-booster" className="bg-surface border border-theme rounded-2xl p-6 scroll-mt-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">𝕏</span>
                  <h2 className="text-base font-extrabold">{tSettings('app_settings.plan_tab.x_booster_title')}</h2>
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
                  {tSettings('app_settings.plan_tab.x_booster_sub')}
                </p>

                {/* Booster balance */}
                <div className="flex items-center gap-2 mb-5 px-4 py-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl">
                  <span className="text-amber-600 dark:text-amber-400 text-sm">⚡</span>
                  <span className="text-xs text-gray-700 dark:text-gray-300">
                    {tSettings('app_settings.plan_tab.x_booster_balance')}{' '}
                    <strong className="text-amber-700 dark:text-amber-400">
                      {boosterBalance === null ? '…' : `${boosterBalance} posts remaining`}
                    </strong>
                  </span>
                </div>

                {savedTab === 'booster_purchased' && (
                  <div className="mb-4 px-4 py-2.5 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-xl text-xs text-green-700 dark:text-green-400 font-semibold">
                    {tSettings('app_settings.plan_tab.x_booster_added')}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  {X_BOOSTER_PACKS.map(pack => (
                    <div key={pack.tier} className={`relative border rounded-xl p-4 ${pack.popular ? 'border-amber-400 dark:border-amber-600' : 'border-gray-200 dark:border-gray-700'}`}>
                      {pack.popular && (
                        <span className="absolute -top-2 left-3 text-xs font-bold bg-amber-500 text-white px-2 py-0.5 rounded-full">{tSettings('app_settings.plan_tab.popular_badge')}</span>
                      )}
                      <p className="text-sm font-extrabold mb-0.5">{pack.label}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">{pack.posts} extra X posts</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">One-time · stacks on your quota · never expires</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-extrabold">{pack.price}</span>
                        <button
                          onClick={() => handleBoosterPurchase(pack.tier)}
                          disabled={boosterLoading === pack.tier}
                          className="text-xs font-bold px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-all disabled:opacity-60"
                        >
                          {boosterLoading === pack.tier ? '...' : tSettings('app_settings.plan_tab.buy_btn')}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CREDIT SOURCE PREFERENCE */}
              <div className="mt-6">
                <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--text)' }}>{tSettings('app_settings.plan_tab.credit_pref_title')}</h3>
                <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
                  {tSettings('app_settings.plan_tab.credit_pref_sub')}
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => saveCreditPreference('monthly_first')}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold border transition-all text-left ${
                      creditPref === 'monthly_first'
                        ? 'bg-black text-white border-black dark:bg-white dark:text-black'
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
                    }`}>
                    {tSettings('app_settings.plan_tab.monthly_first')}
                    <p className="font-normal text-xs opacity-70 mt-0.5">{tSettings('app_settings.plan_tab.monthly_first_sub')}</p>
                  </button>
                  <button
                    onClick={() => saveCreditPreference('bank_first')}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold border transition-all text-left ${
                      creditPref === 'bank_first'
                        ? 'bg-black text-white border-black dark:bg-white dark:text-black'
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
                    }`}>
                    {tSettings('app_settings.plan_tab.bank_first')}
                    <p className="font-normal text-xs opacity-70 mt-0.5">{tSettings('app_settings.plan_tab.bank_first_sub')}</p>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── REFERRALS ── */}
          {activeTab === 'Referrals' && (
            <div className="space-y-4">
              {referralLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-6 h-6 border-2 border-black dark:border-amber-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { label: tSettings('app_settings.referrals_tab.total'),  value: referralStats.totalReferrals  },
                      { label: tSettings('app_settings.referrals_tab.paying'), value: referralStats.payingReferrals },
                      { label: tSettings('app_settings.referrals_tab.earned'), value: referralStats.creditsEarned   },
                    ].map((stat, i) => (
                      <div key={i} className="bg-surface border border-theme rounded-2xl p-5 text-center">
                        <p className="text-3xl font-extrabold mb-1">{stat.value}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 font-semibold uppercase tracking-wide">{stat.label}</p>
                      </div>
                    ))}
                  </div>

                  <div className="bg-black text-white rounded-2xl p-6">
                    <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">{tSettings('app_settings.referrals_tab.your_link')}</p>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex-1 bg-white/10 rounded-xl px-4 py-3 text-sm font-mono truncate">
                        {referralLink || tSettings('app_settings.referrals_tab.loading')}
                      </div>
                      <button onClick={handleCopyLink} disabled={!referralLink}
                        className={`px-5 py-3 rounded-xl text-sm font-bold transition-all flex-shrink-0 ${copiedLink ? 'bg-green-500 text-white' : 'bg-white text-black hover:opacity-80'}`}>
                        {copiedLink ? tSettings('app_settings.referrals_tab.copied') : tSettings('app_settings.referrals_tab.copy')}
                      </button>
                    </div>
                    <p className="text-xs text-gray-400">
                      They upgrade to Pro → <span className="text-white font-bold">+50 credits</span> &nbsp;·&nbsp;
                      They upgrade to Agency → <span className="text-white font-bold">+50 credits</span>
                    </p>
                  </div>

                  {nextTier && (
                    <div className="bg-surface border border-theme rounded-2xl p-6">
                      <h2 className="text-base font-extrabold mb-1">{tSettings('app_settings.referrals_tab.next_milestone')}</h2>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
                        You have <span className="font-bold text-black">{referralStats.payingReferrals}</span> paying referral{referralStats.payingReferrals !== 1 ? 's' : ''}.
                        Reach <span className="font-bold text-black">{nextTier.paying}</span> to unlock <span className="font-bold text-black">{nextTier.reward}</span>.
                      </p>
                      <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2.5 mb-2">
                        <div className="bg-black h-2.5 rounded-full transition-all"
                          style={{ width: `${Math.min((referralStats.payingReferrals / nextTier.paying) * 100, 100)}%` }} />
                      </div>
                      <p className="text-xs text-gray-400 dark:text-gray-500">{referralStats.payingReferrals} / {nextTier.paying} paying referrals</p>
                    </div>
                  )}

                  <div className="bg-surface border border-theme rounded-2xl p-6">
                    <h2 className="text-base font-extrabold mb-5">{tSettings('app_settings.referrals_tab.reward_tiers')}</h2>
                    <div className="space-y-3">
                      {REFERRAL_TIERS.map((tier, i) => {
                        const unlocked = referralStats.payingReferrals >= tier.paying
                        return (
                          <div key={i} className={`flex items-center justify-between py-3 border-b border-gray-50 last:border-0 ${unlocked ? 'opacity-50' : ''}`}>
                            <div className="flex items-center gap-3">
                              <span className="text-xl">{unlocked ? '✅' : tier.icon}</span>
                              <div>
                                <p className="text-sm font-bold">
                                  {tier.paying} paying referral{tier.paying > 1 ? 's' : ''}
                                </p>
                                {unlocked && <p className="text-xs text-green-500 font-bold">Reached ✓</p>}
                              </div>
                            </div>
                            <span className="text-xs font-extrabold px-3 py-2 bg-black text-white rounded-xl flex-shrink-0">{tier.reward}</span>
                          </div>
                        )
                      })}
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-4 pt-4 border-t border-gray-50">
                      Every 5 paying referrals earns +100 bonus credits, stacking with no cap. Credits are added automatically when your referrals convert.
                    </p>
                  </div>

                  <div className="bg-surface border border-theme rounded-2xl p-6">
                    <h2 className="text-base font-extrabold mb-5">{tSettings('app_settings.referrals_tab.history')}</h2>
                    {referralHistory.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-3xl mb-3">🎁</p>
                        <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{tSettings('app_settings.referrals_tab.no_referrals')}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">{tSettings('app_settings.referrals_tab.no_referrals_sub')}</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {referralHistory.map((entry: any, i: number) => (
                          <div key={i} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                            <div>
                              <p className="text-sm font-bold">{tSettings('app_settings.referrals_tab.referred_user')}</p>
                              <p className="text-xs text-gray-400 dark:text-gray-500">
                                {new Date(entry.converted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · {entry.status}
                              </p>
                            </div>
                            {entry.total_earned > 0 && (
                              <span className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-xl">
                                ${entry.total_earned.toFixed(2)} earned
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── LANGUAGE ── */}
          {activeTab === 'Language' && <LanguageTab />}

          {/* ── BROWSER PUSH NOTIFICATIONS ── */}
          {activeTab === 'Notifications' && !pushSupported && (
            <div className="bg-surface border border-theme rounded-2xl p-6">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-base font-extrabold">{tSettings('app_settings.notifications_tab.browser_push_title')}</h2>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500">{tSettings('app_settings.notifications_tab.not_supported')}</span>
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-500">{tSettings('app_settings.notifications_tab.not_supported_sub')}</p>
            </div>
          )}
          {activeTab === 'Notifications' && pushSupported && (
            <div className="bg-surface border border-theme rounded-2xl p-6">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-base font-extrabold">{tSettings('app_settings.notifications_tab.browser_push_title')}</h2>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${pushSubscribed ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500'}`}>
                  {pushSubscribed ? tSettings('app_settings.notifications_tab.active') : tSettings('app_settings.notifications_tab.off')}
                </span>
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-5">Get notified when Enki makes a trade, your posts publish, or your X quota is running low.</p>
              {pushPermission === 'denied' ? (
                <p className="text-xs text-gray-400 dark:text-gray-500">{tSettings('app_settings.notifications_tab.push_blocked')}</p>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold">{tSettings('app_settings.notifications_tab.push_enable_label')}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                        {pushSubscribed ? 'You will receive browser push notifications from SocialMate' : 'Turn on to receive browser push notifications'}
                      </p>
                    </div>
                    <button
                      onClick={pushSubscribed ? pushUnsubscribe : pushSubscribe}
                      disabled={pushLoading}
                      className={`ml-4 flex-shrink-0 px-5 py-2 text-xs font-bold rounded-xl transition-all disabled:opacity-50 flex items-center gap-2 ${
                        pushSubscribed
                          ? 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-500 dark:hover:border-gray-400'
                          : 'bg-black text-white hover:opacity-80'
                      }`}>
                      {pushLoading && <div className="w-3 h-3 border-2 border-current/30 border-t-current rounded-full animate-spin" />}
                      {pushSubscribed ? tSettings('app_settings.notifications_tab.push_off') : tSettings('app_settings.notifications_tab.push_on')}
                    </button>
                  </div>
                  {pushSubscribed && (
                    <div className="pt-4 border-t border-theme">
                      <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-3">{tSettings('app_settings.notifications_tab.test_push')}</p>
                      <button
                        onClick={async () => {
                          try {
                            await fetch('/api/notifications/test', { method: 'POST' })
                          } catch {}
                        }}
                        className="px-4 py-2 border border-gray-200 dark:border-gray-600 text-xs font-bold rounded-xl hover:border-gray-400 transition-all">
                        {tSettings('app_settings.notifications_tab.send_test')}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── EMAIL NOTIFICATION PREFERENCES ── */}
          {activeTab === 'Notifications' && (
            <div className="bg-surface border border-theme rounded-2xl p-6">
              <h2 className="text-base font-extrabold mb-1">{tSettings('app_settings.notifications_tab.email_prefs_title')}</h2>
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-5">{tSettings('app_settings.notifications_tab.email_prefs_sub')}</p>
              <div className="space-y-4">
                {([
                  { key: 'post_published' as const, label: 'Email me when a post publishes successfully', desc: 'Get notified every time a scheduled post goes live' },
                  { key: 'post_failed'    as const, label: 'Email me when a post fails to publish',      desc: 'Get notified so you can retry or reschedule'       },
                  { key: 'credits_low'    as const, label: 'Email me when I have fewer than 10 credits', desc: 'Avoid running out of AI credits unexpectedly'       },
                  { key: 'team_joined'    as const, label: 'Email me when a team member joins',          desc: 'Know when someone accepts your workspace invite'   },
                  { key: 'weekly_digest'      as const, label: 'Send me a weekly digest of my activity',          desc: 'Every Monday: posts published, credits used, stats'             },
                  { key: 'performance_alerts' as const, label: 'Alert me when a post is taking off',              desc: 'Notify me when a post reaches 50+ engagements or 2× my average' },
                ] as { key: keyof typeof notifications; label: string; desc: string }[]).map(item => (
                  <div key={item.key} className="flex items-center justify-between py-3 border-b border-gray-50 dark:border-gray-800 last:border-0">
                    <div className="flex-1 min-w-0 pr-4">
                      <p className="text-sm font-bold">{item.label}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{item.desc}</p>
                      {notifSaving === item.key && (
                        <p className="text-xs text-gray-400 mt-1">{tSettings('app_settings.notifications_tab.saving')}</p>
                      )}
                      {notifSaved === item.key && notifSaving !== item.key && (
                        <p className="text-xs text-green-500 mt-1">{tSettings('app_settings.notifications_tab.saved')}</p>
                      )}
                    </div>
                    <button
                      role="switch"
                      aria-checked={notifications[item.key]}
                      onClick={() => handleNotifToggle(item.key)}
                      disabled={notifSaving === item.key}
                      className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 disabled:opacity-60 ${notifications[item.key] ? 'bg-pink-500' : 'bg-gray-200 dark:bg-gray-700'}`}>
                      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${notifications[item.key] ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* IRIS newsletter opt-in */}
          {activeTab === 'Notifications' && (
            <div className="bg-surface border border-theme rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 rounded-xl bg-amber-500 flex items-center justify-center text-white font-black text-xs">I</div>
                <h2 className="text-base font-extrabold">{tSettings('app_settings.notifications_tab.iris_title')}</h2>
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-5">{tSettings('app_settings.notifications_tab.iris_sub')}</p>
              <div className="flex items-center justify-between py-3">
                <div className="flex-1 min-w-0 pr-4">
                  <p className="text-sm font-bold">{tSettings('app_settings.notifications_tab.iris_label')}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{tSettings('app_settings.notifications_tab.iris_detail')}</p>
                  {irisSaving && <p className="text-xs text-gray-400 mt-1">{tSettings('app_settings.notifications_tab.saving')}</p>}
                </div>
                <button
                  role="switch"
                  aria-checked={irisOptIn}
                  onClick={handleIrisToggle}
                  disabled={irisSaving}
                  className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 disabled:opacity-60 ${irisOptIn ? 'bg-amber-500' : 'bg-gray-200 dark:bg-gray-700'}`}>
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${irisOptIn ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </div>
            </div>
          )}

          {/* ── SECURITY ── */}
          {activeTab === 'Security' && (
            <div className="space-y-4">
              <div className="bg-surface border border-theme rounded-2xl p-6">
                <div className="flex items-center justify-between mb-1">
                  <h2 className="text-base font-extrabold">{tSettings('app_settings.security_tab.title')}</h2>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${mfaEnabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'}`}>
                    {mfaEnabled ? tSettings('app_settings.security_tab.enabled') : tSettings('app_settings.security_tab.disabled')}
                  </span>
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-5">{tSettings('app_settings.security_tab.desc')}</p>
                {mfaError && (
                  <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-4">
                    <p className="text-xs font-semibold text-red-500">❌ {mfaError}</p>
                  </div>
                )}
                {mfaStep === 'idle' && !mfaEnabled && (
                  <button onClick={handleEnroll2FA} disabled={mfaLoading}
                    className="px-5 py-2.5 bg-black text-white text-xs font-bold rounded-xl hover:opacity-80 transition-all disabled:opacity-50 flex items-center gap-2">
                    {mfaLoading && <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                    {tSettings('app_settings.security_tab.enable_btn')}
                  </button>
                )}
                {mfaStep === 'enroll' && (
                  <div className="space-y-5">
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-5">
                      <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wide">{tSettings('app_settings.security_tab.step1')}</p>
                      <div className="flex justify-center mb-4">
                        <img src={mfaQR} alt="2FA QR Code" className="w-40 h-40 rounded-xl" />
                      </div>
                      <p className="text-xs text-gray-400 dark:text-gray-500 text-center mb-2">{tSettings('app_settings.security_tab.cant_scan')}</p>
                      <div className="bg-surface border border-theme-md rounded-xl px-4 py-2 text-center">
                        <p className="text-xs font-mono font-bold tracking-widest text-gray-700 dark:text-gray-300 break-all">{mfaSecret}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">{tSettings('app_settings.security_tab.step2')}</p>
                      <input type="text" inputMode="numeric" maxLength={6} value={mfaCode}
                        onChange={e => setMfaCode(e.target.value.replace(/\D/g, ''))} placeholder="000000"
                        className="w-full border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-sm text-center font-mono tracking-widest outline-none focus:border-black dark:focus:border-gray-400 transition-all" />
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => { setMfaStep('idle'); setMfaCode(''); setMfaError('') }}
                        className="px-5 py-2.5 border border-gray-200 text-xs font-bold rounded-xl hover:border-gray-400 transition-all">
                        {tSettings('app_settings.security_tab.cancel')}
                      </button>
                      <button onClick={handleVerify2FA} disabled={mfaLoading || mfaCode.length !== 6}
                        className="flex-1 py-2.5 bg-black text-white text-xs font-bold rounded-xl hover:opacity-80 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                        {mfaLoading && <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                        {tSettings('app_settings.security_tab.verify_btn')}
                      </button>
                    </div>
                  </div>
                )}
                {mfaStep === 'idle' && mfaEnabled && (
                  <button onClick={() => setMfaStep('disable_confirm')}
                    className="text-xs font-bold text-red-500 border border-red-100 rounded-xl px-4 py-2.5 hover:bg-red-50 transition-all">
                    {tSettings('app_settings.security_tab.disable_btn')}
                  </button>
                )}
                {mfaStep === 'disable_confirm' && (
                  <div className="border border-red-200 rounded-xl px-4 py-4 bg-red-50">
                    <p className="text-xs font-bold text-red-700 mb-3">{tSettings('app_settings.security_tab.disable_confirm')}</p>
                    <div className="flex gap-2">
                      <button onClick={handleDisable2FA} disabled={mfaLoading}
                        className="text-xs font-bold px-4 py-2 bg-red-500 text-white rounded-lg hover:opacity-80 transition-all disabled:opacity-40 flex items-center gap-2">
                        {mfaLoading && <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                        {tSettings('app_settings.security_tab.yes_disable')}
                      </button>
                      <button onClick={() => setMfaStep('idle')}
                        className="text-xs font-bold px-4 py-2 border border-gray-200 rounded-lg hover:border-gray-400 transition-all">
                        {tSettings('app_settings.security_tab.cancel')}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-surface border border-theme rounded-2xl p-6">
                <h2 className="text-base font-extrabold mb-1">{tSettings('app_settings.security_tab.password_title')}</h2>
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-5">{tSettings('app_settings.security_tab.password_desc')}</p>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1">{tSettings('app_settings.security_tab.current_password')}</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={e => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-black dark:focus:border-gray-400 transition-all" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1">{tSettings('app_settings.security_tab.new_password')}</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-black dark:focus:border-gray-400 transition-all" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1">{tSettings('app_settings.security_tab.confirm_password')}</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-black dark:focus:border-gray-400 transition-all" />
                  </div>
                  {passwordError && (
                    <p className="text-xs text-red-500 font-semibold">{passwordError}</p>
                  )}
                  {passwordSuccess && (
                    <p className="text-xs text-green-500 font-semibold">{tSettings('app_settings.security_tab.password_success')}</p>
                  )}
                  <button
                    onClick={handleChangePassword}
                    disabled={passwordLoading || !newPassword}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold transition-all bg-black dark:bg-white text-white dark:text-black hover:opacity-80 disabled:opacity-40 flex items-center gap-2">
                    {passwordLoading && <div className="w-3 h-3 border-2 border-white/30 dark:border-black/30 border-t-white dark:border-t-black rounded-full animate-spin" />}
                    {passwordLoading ? tSettings('app_settings.security_tab.updating') : tSettings('app_settings.security_tab.update_password')}
                  </button>
                </div>
              </div>

              <div className="bg-surface border border-theme rounded-2xl p-6">
                <h2 className="text-base font-extrabold mb-1">{tSettings('app_settings.security_tab.sessions_title')}</h2>
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
                  {tSettings('app_settings.security_tab.sessions_desc')}
                </p>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-green-600 bg-green-50 px-3 py-1.5 rounded-full">{tSettings('app_settings.security_tab.current_session')}</span>
                  <button
                    onClick={handleSignOutOtherSessions}
                    disabled={sessionsLoading}
                    className="text-xs font-bold px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl hover:border-gray-400 dark:hover:border-gray-400 transition-all disabled:opacity-40">
                    {sessionsLoading ? tSettings('app_settings.security_tab.signing_out') : tSettings('app_settings.security_tab.sign_out_others')}
                  </button>
                  {sessionSignedOut && <span className="text-xs text-green-500 font-semibold">{tSettings('app_settings.security_tab.done')}</span>}
                </div>
              </div>

              <div className="bg-surface border border-theme rounded-2xl p-6">
                <h2 className="text-base font-extrabold mb-1">{tSettings('app_settings.security_tab.danger_title')}</h2>
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">{tSettings('app_settings.security_tab.danger_desc')}</p>
                <div className="space-y-3">
                  {confirmDeletePosts ? (
                    <div className="border border-red-200 rounded-xl px-4 py-3 bg-red-50">
                      <p className="text-xs font-bold text-red-600 mb-2">{tSettings('app_settings.security_tab.delete_posts_confirm')}</p>
                      <div className="flex gap-2">
                        <button onClick={handleDeleteAllPosts} disabled={dangerLoading}
                          className="text-xs font-bold px-4 py-2 bg-red-500 text-white rounded-lg hover:opacity-80 transition-all disabled:opacity-40">
                          {dangerLoading ? tSettings('app_settings.security_tab.deleting') : tSettings('app_settings.security_tab.yes_delete_posts')}
                        </button>
                        <button onClick={() => setConfirmDeletePosts(false)}
                          className="text-xs font-bold px-4 py-2 border border-gray-200 rounded-lg hover:border-gray-400 transition-all">
                          {tSettings('app_settings.security_tab.cancel')}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => setConfirmDeletePosts(true)}
                      className="w-full text-left text-xs font-bold text-red-500 border border-red-100 rounded-xl px-4 py-3 hover:bg-red-50 transition-all">
                      {tSettings('app_settings.security_tab.delete_posts_btn')}
                    </button>
                  )}
                  {confirmDeleteAccount ? (
                    <div className="border border-red-300 rounded-xl px-4 py-4 bg-red-50">
                      <p className="text-xs font-bold text-red-700 mb-1">{tSettings('app_settings.security_tab.delete_account_warning')}</p>
                      <p className="text-xs text-red-600 mb-3">{tSettings('app_settings.security_tab.delete_account_confirm_note')}</p>
                      <input
                        type="text"
                        value={deleteConfirmText}
                        onChange={e => setDeleteConfirmText(e.target.value)}
                        placeholder={tSettings('app_settings.security_tab.delete_account_placeholder')}
                        className="w-full border border-red-200 rounded-xl px-3 py-2 text-sm mb-3 outline-none focus:border-red-400 transition-all" />
                      <div className="flex gap-2">
                        <button
                          onClick={handleDeleteAccount}
                          disabled={dangerLoading || deleteConfirmText !== 'DELETE'}
                          className="text-xs font-bold px-4 py-2 bg-red-600 text-white rounded-lg hover:opacity-80 transition-all disabled:opacity-40">
                          {dangerLoading ? tSettings('app_settings.security_tab.processing') : tSettings('app_settings.security_tab.delete_account_final')}
                        </button>
                        <button onClick={() => { setConfirmDeleteAccount(false); setDeleteConfirmText('') }}
                          className="text-xs font-bold px-4 py-2 border border-gray-200 rounded-lg hover:border-gray-400 transition-all">
                          {tSettings('app_settings.security_tab.cancel')}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => setConfirmDeleteAccount(true)}
                      className="w-full text-left text-xs font-bold text-red-600 border border-red-200 rounded-xl px-4 py-3 hover:bg-red-50 transition-all">
                      {tSettings('app_settings.security_tab.delete_account_btn')}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── WHITE LABEL ── */}
          {activeTab === 'White Label' && (
            <div className="space-y-4">

              {/* Free plan — fully locked */}
              {plan === 'free' && (
                <div className="bg-surface border border-theme rounded-2xl p-8 text-center">
                  <div className="text-3xl mb-3">🏷️</div>
                  <h2 className="text-base font-extrabold mb-2">{tSettings('app_settings.white_label_tab.locked_title')}</h2>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mb-5 max-w-sm mx-auto leading-relaxed">
                    {tSettings('app_settings.white_label_tab.locked_desc')}
                  </p>
                  <button onClick={() => handleCheckout(STRIPE_PRO_PRICE_ID)} disabled={checkoutLoading}
                    className="bg-black text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:opacity-80 transition-all disabled:opacity-60">
                    {checkoutLoading ? tSettings('app_settings.plan_tab.loading') : tSettings('app_settings.white_label_tab.upgrade_btn')}
                  </button>
                </div>
              )}

              {/* Pending review state */}
              {plan !== 'free' && !whiteLabelActive && whiteLabelStatus === 'pending' && (
                <div className="bg-amber-50 border border-amber-200 dark:bg-amber-900/10 dark:border-amber-800 rounded-2xl px-5 py-4 flex items-start gap-3">
                  <span className="text-amber-500 text-lg shrink-0 mt-0.5">🕐</span>
                  <div>
                    <p className="text-sm font-bold text-amber-700 dark:text-amber-400">{tSettings('app_settings.white_label_tab.review_title')}</p>
                    <p className="text-xs text-amber-600 dark:text-amber-500 mt-1 leading-relaxed">
                      {tSettings('app_settings.white_label_tab.review_desc')}
                    </p>
                  </div>
                </div>
              )}

              {/* Pro or Agency — not yet purchased */}
              {plan !== 'free' && !whiteLabelActive && whiteLabelStatus !== 'pending' && (
                <div className="space-y-4">
                  {wlActivated && (
                    <div className="bg-green-50 border border-green-200 rounded-2xl px-5 py-4">
                      <p className="text-sm font-extrabold text-green-700">{tSettings('app_settings.white_label_tab.activated')}</p>
                    </div>
                  )}
                  <div className="bg-surface border border-theme rounded-2xl p-6">
                    <h2 className="text-base font-extrabold mb-1">{tSettings('app_settings.white_label_tab.title')}</h2>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-6 leading-relaxed">
                      {tSettings('app_settings.white_label_tab.addon_sub')}
                    </p>
                    <div className="grid grid-cols-2 gap-4">

                      {/* Basic */}
                      <div className="border border-gray-200 dark:border-gray-600 rounded-2xl p-5">
                        <p className="text-sm font-extrabold mb-1">{tSettings('app_settings.white_label_tab.basic_title')}</p>
                        <p className="text-2xl font-extrabold mb-1">$20<span className="text-sm font-semibold text-gray-400 dark:text-gray-500">/mo</span></p>
                        <ul className="space-y-1.5 mb-5">
                          {[
                            'Remove SocialMate branding',
                            'Add your custom logo',
                            'Set your brand colors',
                            'Your brand name throughout the app',
                          ].map(f => (
                            <li key={f} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                              <span className="text-green-500 font-bold">✓</span>{f}
                            </li>
                          ))}
                        </ul>
                        <button onClick={() => handleWhiteLabelCheckout('basic')} disabled={wlCheckoutLoading}
                          className="w-full py-2.5 bg-black text-white text-xs font-bold rounded-xl hover:opacity-80 transition-all disabled:opacity-50">
                          {wlCheckoutLoading ? tSettings('app_settings.plan_tab.loading') : tSettings('app_settings.white_label_tab.add_basic_btn')}
                        </button>
                      </div>

                      {/* Pro */}
                      <div className="border-2 border-black rounded-2xl p-5 relative">
                        <span className="absolute -top-2.5 left-4 text-xs font-bold bg-black text-white px-2 py-0.5 rounded-full">{tSettings('app_settings.white_label_tab.best_for_agencies')}</span>
                        <p className="text-sm font-extrabold mb-1">{tSettings('app_settings.white_label_tab.pro_title')}</p>
                        <p className="text-2xl font-extrabold mb-1">$40<span className="text-sm font-semibold text-gray-400 dark:text-gray-500">/mo</span></p>
                        <ul className="space-y-1.5 mb-5">
                          {[
                            'Everything in Basic',
                            'Custom domain (app.yourbrand.com)',
                            'Full rebrand — clients never see SocialMate',
                            'Priority support',
                          ].map(f => (
                            <li key={f} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                              <span className="text-green-500 font-bold">✓</span>{f}
                            </li>
                          ))}
                        </ul>
                        <button onClick={() => handleWhiteLabelCheckout('pro')} disabled={wlCheckoutLoading}
                          className="w-full py-2.5 bg-black text-white text-xs font-bold rounded-xl hover:opacity-80 transition-all disabled:opacity-50">
                          {wlCheckoutLoading ? tSettings('app_settings.plan_tab.loading') : tSettings('app_settings.white_label_tab.add_pro_btn')}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Active white label — config UI */}
              {plan !== 'free' && whiteLabelActive && (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-2xl px-5 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-green-600 font-bold">✓</span>
                      <p className="text-xs font-bold text-green-700">
                        {whiteLabelTier === 'pro' ? tSettings('app_settings.white_label_tab.pro_title') : tSettings('app_settings.white_label_tab.basic_title')} Active
                      </p>
                    </div>
                    <button onClick={handlePortal} className="text-xs font-bold text-green-700 hover:underline">
                      {tSettings('app_settings.white_label_tab.manage_billing')}
                    </button>
                  </div>

                  <div className="bg-surface border border-theme rounded-2xl p-6 space-y-4">
                    <h2 className="text-base font-extrabold">{tSettings('app_settings.white_label_tab.brand_config_title')}</h2>

                    {/* Brand name */}
                    <div>
                      <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1">{tSettings('app_settings.white_label_tab.brand_name_label')}</label>
                      <input value={wlBrandName} onChange={e => setWlBrandName(e.target.value)}
                        placeholder="Your Brand"
                        className="w-full border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-black dark:focus:border-gray-400 transition-all" />
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{tSettings('app_settings.white_label_tab.brand_name_hint')}</p>
                    </div>

                    {/* Logo — file upload or URL */}
                    <div>
                      <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-2">{tSettings('app_settings.white_label_tab.logo_url_label')}</label>

                      {/* File upload button */}
                      <div className="flex items-center gap-3 mb-2">
                        {wlLogoUrl && (
                          <img src={wlLogoUrl} alt="Logo preview" className="h-10 w-10 object-contain rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex-shrink-0"
                            onError={e => (e.currentTarget.style.display = 'none')} />
                        )}
                        <label className={`min-h-[40px] flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                          wlLogoUploading
                            ? 'border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-60'
                            : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-black dark:hover:border-gray-400'
                        }`}>
                          {wlLogoUploading
                            ? <><div className="w-3 h-3 border-2 border-gray-400 border-t-gray-700 rounded-full animate-spin" /> Uploading...</>
                            : '📁 Upload logo'}
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/svg+xml"
                            className="hidden"
                            disabled={wlLogoUploading}
                            onChange={async (e) => {
                              const file = e.target.files?.[0]
                              if (!file) return
                              setWlLogoUploading(true)
                              setWlLogoError(null)
                              try {
                                const fd = new FormData()
                                fd.append('file', file)
                                const res = await fetch('/api/white-label/logo-upload', { method: 'POST', body: fd })
                                const data = await res.json()
                                if (!res.ok) { setWlLogoError(data.error || 'Upload failed'); return }
                                setWlLogoUrl(data.url)
                              } catch {
                                setWlLogoError('Upload failed — please try again')
                              } finally {
                                setWlLogoUploading(false)
                                e.target.value = ''
                              }
                            }}
                          />
                        </label>
                      </div>

                      {/* Or paste URL */}
                      <input value={wlLogoUrl} onChange={e => setWlLogoUrl(e.target.value)}
                        placeholder="https://yourbrand.com/logo.png (or upload above)"
                        className="w-full border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-black dark:focus:border-gray-400 transition-all" />
                      {wlLogoError && <p className="text-xs text-red-500 mt-1">{wlLogoError}</p>}
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Upload PNG, JPG, WebP, or SVG (max 5MB). Stored in your media library.</p>
                    </div>

                    {/* Custom domain — Pro only */}
                    {whiteLabelTier === 'pro' && (
                      <div>
                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1">{tSettings('app_settings.white_label_tab.domain_label')}</label>
                        <input value={wlDomain} onChange={e => setWlDomain(e.target.value)}
                          placeholder="app.yourbrand.com"
                          className="w-full border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-black dark:focus:border-gray-400 transition-all" />
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{tSettings('app_settings.white_label_tab.domain_hint')}</p>
                      </div>
                    )}

                    {/* Custom domain — locked for Basic */}
                    {whiteLabelTier === 'basic' && (
                      <div className="opacity-60 cursor-not-allowed">
                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1">
                          Custom domain <span className="text-amber-500 font-bold">Pro only</span>
                        </label>
                        <div className="w-full border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500">
                          app.yourbrand.com
                        </div>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Upgrade to White Label Pro to use a custom domain.</p>
                      </div>
                    )}

                    {/* Brand color */}
                    <div>
                      <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1">{tSettings('app_settings.white_label_tab.color_label')}</label>
                      <div className="flex items-center gap-3">
                        <input type="color" value={wlColor} onChange={e => setWlColor(e.target.value)}
                          className="h-10 w-16 border border-gray-200 dark:border-gray-600 rounded-xl cursor-pointer" />
                        <input value={wlColor} onChange={e => setWlColor(e.target.value)}
                          placeholder="#f59e0b"
                          className="flex-1 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-black dark:focus:border-gray-400 transition-all font-mono" />
                        {wlColor && (
                          <div
                            className="w-10 h-10 rounded-xl flex-shrink-0 border border-gray-200 dark:border-gray-700"
                            style={{ backgroundColor: wlColor }}
                            title="Color preview"
                          />
                        )}
                      </div>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Replaces the amber accent color throughout the app.</p>
                    </div>

                    {/* Remove SocialMate branding — Pro only */}
                    <div className={`flex items-start justify-between gap-4 py-3 border-t border-gray-100 dark:border-gray-800 ${whiteLabelTier !== 'pro' ? 'opacity-60' : ''}`}>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-sm font-bold">Remove SocialMate branding</p>
                          {whiteLabelTier !== 'pro' && (
                            <span className="text-xs font-bold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full">Pro only</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          {whiteLabelTier === 'pro'
                            ? 'Hides the "Powered by SocialMate" footer and removes SocialMate attribution from your white-labeled app.'
                            : 'Upgrade to White Label Pro to fully remove SocialMate branding for your clients.'}
                        </p>
                      </div>
                      <button
                        role="switch"
                        aria-checked={wlRemoveBranding}
                        disabled={whiteLabelTier !== 'pro'}
                        onClick={() => whiteLabelTier === 'pro' && setWlRemoveBranding(v => !v)}
                        className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed ${wlRemoveBranding && whiteLabelTier === 'pro' ? 'bg-black dark:bg-white' : 'bg-gray-200 dark:bg-gray-700'}`}>
                        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white dark:bg-gray-900 shadow transition-transform ${wlRemoveBranding && whiteLabelTier === 'pro' ? 'translate-x-5' : 'translate-x-0.5'}`} />
                      </button>
                    </div>

                    {/* Upgrade from Basic to Pro */}
                    {whiteLabelTier === 'basic' && (
                      <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl p-4">
                        <p className="text-xs font-bold mb-1">{tSettings('app_settings.white_label_tab.upgrade_to_pro_hint')}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">{tSettings('app_settings.white_label_tab.upgrade_to_pro_hint_sub')}</p>
                        <button onClick={() => handleWhiteLabelCheckout('pro')} disabled={wlCheckoutLoading}
                          className="text-xs font-bold px-4 py-2 bg-black text-white rounded-xl hover:opacity-80 transition-all disabled:opacity-50">
                          {wlCheckoutLoading ? tSettings('app_settings.plan_tab.loading') : tSettings('app_settings.white_label_tab.upgrade_to_pro_btn')}
                        </button>
                      </div>
                    )}

                    <button
                      onClick={() => handleSave('WhiteLabel')}
                      disabled={wlSaving}
                      className={`min-h-[44px] flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all disabled:opacity-60 ${savedTab === 'WhiteLabel' ? 'bg-green-500 text-white' : 'bg-black text-white hover:opacity-80'}`}>
                      {wlSaving && <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                      {savedTab === 'WhiteLabel' ? tSettings('app_settings.white_label_tab.saved') : tSettings('app_settings.white_label_tab.save_branding')}
                    </button>
                  </div>

                  {wlLogoUrl && (
                    <div className="bg-surface border border-theme rounded-2xl p-5">
                      <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">{tSettings('app_settings.white_label_tab.logo_preview')}</p>
                      <div className="flex items-center gap-4">
                        <img src={wlLogoUrl} alt="Brand logo" className="h-12 object-contain rounded-xl"
                          onError={e => (e.currentTarget.style.display = 'none')} />
                        {wlBrandName && (
                          <div>
                            <p className="text-sm font-bold" style={{ color: wlColor || undefined }}>{wlBrandName}</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500">Sidebar preview</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── BRAND VOICE ── */}
          {activeTab === 'Brand Voice' && (
            <div className="space-y-4">
              <div className="bg-surface border border-theme rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">🎙️</span>
                  <h2 className="text-base font-extrabold">{tSettings('app_settings.brand_voice_tab.title')}</h2>
                </div>
                <p className="text-xs text-[#9ca3af] mb-6 leading-relaxed">
                  {tSettings('app_settings.brand_voice_tab.desc')}
                </p>

                <div className="space-y-5">
                  {/* Voice Name */}
                  <div>
                    <label className="text-xs font-bold text-[#9ca3af] block mb-1.5">{tSettings('app_settings.brand_voice_tab.voice_name_label')}</label>
                    <input
                      value={voiceName}
                      onChange={e => setVoiceName(e.target.value)}
                      placeholder='e.g. "Bold & Direct" or "Warm Expert"'
                      className="w-full bg-[#111111] border border-[#1f1f1f] rounded-xl px-4 py-2.5 text-sm text-gray-100 outline-none focus:border-[#F59E0B] transition-all placeholder-[#9ca3af]"
                    />
                    <p className="text-xs text-[#9ca3af] mt-1">{tSettings('app_settings.brand_voice_tab.voice_name_hint')}</p>
                  </div>

                  {/* Tone */}
                  <div>
                    <label className="text-xs font-bold text-[#9ca3af] block mb-1.5">{tSettings('app_settings.brand_voice_tab.tone_label')}</label>
                    <select
                      value={bvTone}
                      onChange={e => setBvTone(e.target.value)}
                      className="w-full bg-[#111111] border border-[#1f1f1f] rounded-xl px-4 py-2.5 text-sm text-gray-100 outline-none focus:border-[#F59E0B] transition-all appearance-none">
                      {['Professional', 'Casual', 'Witty', 'Bold', 'Inspirational', 'Conversational', 'Educational'].map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  {/* Writing Style */}
                  <div>
                    <label className="text-xs font-bold text-[#9ca3af] block mb-1.5">{tSettings('app_settings.brand_voice_tab.style_label')}</label>
                    <select
                      value={bvWritingStyle}
                      onChange={e => setBvWritingStyle(e.target.value)}
                      className="w-full bg-[#111111] border border-[#1f1f1f] rounded-xl px-4 py-2.5 text-sm text-gray-100 outline-none focus:border-[#F59E0B] transition-all appearance-none">
                      {['Short & punchy', 'Long-form storytelling', 'List-heavy', 'Question-driven', 'Narrative'].map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  {/* Vocabulary */}
                  <div>
                    <label className="text-xs font-bold text-[#9ca3af] block mb-1.5">{tSettings('app_settings.brand_voice_tab.vocabulary_label')}</label>
                    <textarea
                      rows={3}
                      value={bvVocabulary}
                      onChange={e => setBvVocabulary(e.target.value)}
                      placeholder={`e.g. "Never say 'leverage', use 'use'. Avoid corporate jargon. Prefer plain language."`}
                      className="w-full bg-[#111111] border border-[#1f1f1f] rounded-xl px-4 py-2.5 text-sm text-gray-100 outline-none focus:border-[#F59E0B] transition-all resize-none placeholder-[#9ca3af]"
                    />
                  </div>

                  {/* Always Include */}
                  <div>
                    <label className="text-xs font-bold text-[#9ca3af] block mb-1.5">{tSettings('app_settings.brand_voice_tab.always_include_label')}</label>
                    <textarea
                      rows={3}
                      value={bvAlwaysInclude}
                      onChange={e => setBvAlwaysInclude(e.target.value)}
                      placeholder={`e.g. "End every post with a question. Always include a CTA."`}
                      className="w-full bg-[#111111] border border-[#1f1f1f] rounded-xl px-4 py-2.5 text-sm text-gray-100 outline-none focus:border-[#F59E0B] transition-all resize-none placeholder-[#9ca3af]"
                    />
                  </div>

                  {/* Never Include */}
                  <div>
                    <label className="text-xs font-bold text-[#9ca3af] block mb-1.5">{tSettings('app_settings.brand_voice_tab.never_include_label')}</label>
                    <textarea
                      rows={3}
                      value={bvNeverInclude}
                      onChange={e => setBvNeverInclude(e.target.value)}
                      placeholder={`e.g. "No emojis. No more than 2 hashtags. Never use exclamation points."`}
                      className="w-full bg-[#111111] border border-[#1f1f1f] rounded-xl px-4 py-2.5 text-sm text-gray-100 outline-none focus:border-[#F59E0B] transition-all resize-none placeholder-[#9ca3af]"
                    />
                  </div>

                  {/* Example Post */}
                  <div>
                    <label className="text-xs font-bold text-[#9ca3af] block mb-1.5">{tSettings('app_settings.brand_voice_tab.example_label')}</label>
                    <textarea
                      rows={4}
                      value={bvExamplePost}
                      onChange={e => setBvExamplePost(e.target.value)}
                      placeholder="Paste a real post that perfectly captures your voice. The AI will use this as a reference."
                      className="w-full bg-[#111111] border border-[#1f1f1f] rounded-xl px-4 py-2.5 text-sm text-gray-100 outline-none focus:border-[#F59E0B] transition-all resize-none placeholder-[#9ca3af]"
                    />
                  </div>

                  {/* Save button */}
                  <div className="flex items-center gap-3 pt-1">
                    <button
                      onClick={async () => {
                        setBvLoading(true)
                        setBvSaved(false)
                        try {
                          await fetch('/api/user/brand-voice', {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ voiceName, tone: bvTone, writingStyle: bvWritingStyle, vocabulary: bvVocabulary, alwaysInclude: bvAlwaysInclude, neverInclude: bvNeverInclude, examplePost: bvExamplePost }),
                          })
                          setBvSaved(true)
                          setTimeout(() => setBvSaved(false), 3000)
                        } catch {}
                        finally { setBvLoading(false) }
                      }}
                      disabled={bvLoading}
                      className="min-h-[44px] px-5 py-2.5 rounded-xl text-xs font-bold transition-all bg-[#F59E0B] hover:bg-[#D97706] text-black disabled:opacity-50 flex items-center gap-2">
                      {bvLoading && <div className="w-3 h-3 border-2 border-black/30 border-t-black rounded-full animate-spin" />}
                      {bvLoading ? tSettings('app_settings.brand_voice_tab.saving') : tSettings('app_settings.brand_voice_tab.save_btn')}
                    </button>
                    {bvSaved && (
                      <span className="text-xs font-bold text-green-400">{tSettings('app_settings.brand_voice_tab.saved')}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Preview card */}
              {voiceName && (
                <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-2xl p-5">
                  <p className="text-xs font-bold text-[#9ca3af] uppercase tracking-wide mb-3">{tSettings('app_settings.brand_voice_tab.preview_label')}</p>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm">🎙️</span>
                    <span className="text-sm font-extrabold text-[#F59E0B]">{voiceName}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl px-3 py-2">
                      <p className="text-[#9ca3af] mb-0.5">{tSettings('app_settings.brand_voice_tab.tone_preview')}</p>
                      <p className="font-semibold text-gray-200">{bvTone}</p>
                    </div>
                    <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl px-3 py-2">
                      <p className="text-[#9ca3af] mb-0.5">{tSettings('app_settings.brand_voice_tab.style_preview')}</p>
                      <p className="font-semibold text-gray-200">{bvWritingStyle}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── SCHEDULING ── */}
          {activeTab === 'Scheduling' && (
            <div className="bg-surface border border-theme rounded-2xl p-6 space-y-6">
              <div>
                <h2 className="text-base font-extrabold mb-1">{tSettings('app_settings_scheduling_tab.title')}</h2>
                <p className="text-xs text-gray-400 dark:text-gray-500">{tSettings('app_settings_scheduling_tab.desc')}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide block mb-1.5">{tSettings('app_settings_scheduling_tab.start_time')}</label>
                  <input type="time" value={schedStart} onChange={e => setSchedStart(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm font-semibold border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 rounded-xl focus:outline-none focus:border-black transition-all" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide block mb-1.5">{tSettings('app_settings_scheduling_tab.end_time')}</label>
                  <input type="time" value={schedEnd} onChange={e => setSchedEnd(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm font-semibold border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 rounded-xl focus:outline-none focus:border-black transition-all" />
                </div>
              </div>

              <div className="border-t border-theme pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm font-bold">{tSettings('app_settings_scheduling_tab.dnd_title')}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{tSettings('app_settings_scheduling_tab.dnd_desc')}</p>
                  </div>
                  <button
                    role="switch"
                    aria-checked={dndEnabled}
                    onClick={() => setDndEnabled(v => !v)}
                    className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${dndEnabled ? 'bg-amber-500' : 'bg-gray-200 dark:bg-gray-700'}`}>
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${dndEnabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </button>
                </div>

                {dndEnabled && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide block mb-1.5">{tSettings('app_settings_scheduling_tab.dnd_start')}</label>
                      <input type="time" value={dndStart} onChange={e => setDndStart(e.target.value)}
                        className="w-full px-3 py-2.5 text-sm font-semibold border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 rounded-xl focus:outline-none focus:border-black transition-all" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide block mb-1.5">{tSettings('app_settings_scheduling_tab.dnd_end')}</label>
                      <input type="time" value={dndEnd} onChange={e => setDndEnd(e.target.value)}
                        className="w-full px-3 py-2.5 text-sm font-semibold border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 rounded-xl focus:outline-none focus:border-black transition-all" />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={handleSaveScheduling}
                  disabled={schedSaving}
                  className="px-6 py-2.5 rounded-xl text-sm font-bold bg-black dark:bg-white text-white dark:text-black hover:opacity-80 transition-all disabled:opacity-50 flex items-center gap-1.5">
                  {schedSaving ? <><div className="w-3 h-3 border-2 border-white/30 dark:border-black/30 border-t-white dark:border-t-black rounded-full animate-spin" />{tSettings('app_settings_scheduling_tab.saving')}</> : tSettings('app_settings_scheduling_tab.save')}
                </button>
                {schedSaved && <span className="text-sm font-semibold text-green-500">{tSettings('app_settings_scheduling_tab.saved')}</span>}
              </div>
            </div>
          )}

          {/* ── APPEARANCE ── */}
          {activeTab === 'Integrations' && (
            <IntegrationsTab />
          )}

          {activeTab === 'Appearance' && (
            <div className="bg-surface border border-theme rounded-2xl p-6">
              <h2 className="text-base font-extrabold mb-1">{tSettings('app_settings.appearance_tab.title')}</h2>
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-5">{tSettings('app_settings.appearance_tab.subtitle')}</p>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-50 dark:border-gray-800">
                  <div className="flex-1 min-w-0 pr-4">
                    <p className="text-sm font-bold">{tSettings('app_settings.appearance_tab.sidebar_stats_label')}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{tSettings('app_settings.appearance_tab.sidebar_stats_desc')}</p>
                  </div>
                  <button
                    role="switch"
                    aria-checked={sidebarStatsVisible}
                    onClick={() => {
                      const next = !sidebarStatsVisible
                      setSidebarStatsVisible(next)
                      try {
                        localStorage.setItem('sidebar_stats_visible', String(next))
                        window.dispatchEvent(new CustomEvent('sidebar-stats-toggle'))
                      } catch {}
                    }}
                    className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${sidebarStatsVisible ? 'bg-pink-500' : 'bg-gray-200 dark:bg-gray-700'}`}>
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${sidebarStatsVisible ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </button>
                </div>

                {/* Default Platforms */}
                <div className="pt-4">
                  <p className="text-sm font-bold mb-0.5">{tSettings('app_settings.appearance_tab.default_platforms_label')}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">
                    {tSettings('app_settings.appearance_tab.default_platforms_desc')}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {[
                      { id: 'bluesky',  name: 'Bluesky',  icon: '🦋' },
                      { id: 'mastodon', name: 'Mastodon', icon: '🐘' },
                      { id: 'discord',  name: 'Discord',  icon: '💬' },
                      { id: 'telegram', name: 'Telegram', icon: '✈️' },
                      { id: 'twitter',  name: 'X',        icon: '🐦' },
                      { id: 'linkedin', name: 'LinkedIn', icon: '💼' },
                      { id: 'tiktok',   name: 'TikTok',   icon: '🎵' },
                    ].map(platform => {
                      const selected = defaultPlatforms.includes(platform.id)
                      return (
                        <button
                          key={platform.id}
                          type="button"
                          onClick={() => {
                            const next = selected
                              ? defaultPlatforms.filter(p => p !== platform.id)
                              : [...defaultPlatforms, platform.id]
                            setDefaultPlatforms(next)
                          }}
                          className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all ${
                            selected
                              ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white'
                              : 'border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500'
                          }`}>
                          <span>{platform.icon}</span>
                          <span>{platform.name}</span>
                        </button>
                      )
                    })}
                  </div>
                  <button
                    onClick={() => saveDefaultPlatforms(defaultPlatforms)}
                    disabled={defaultPlatformsSaving}
                    className="text-xs font-bold px-4 py-2 bg-black text-white dark:bg-white dark:text-black rounded-xl hover:opacity-80 transition-all disabled:opacity-50 flex items-center gap-1.5">
                    {defaultPlatformsSaving
                      ? <><div className="w-3 h-3 border-2 border-white/30 dark:border-black/30 border-t-white dark:border-t-black rounded-full animate-spin" />{tSettings('app_settings.appearance_tab.saving')}</>
                      : defaultPlatformsSaved
                        ? tSettings('app_settings.appearance_tab.saved')
                        : tSettings('app_settings.appearance_tab.save_defaults')}
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* TOASTS */}
      {savedTab === 'credits_purchased' && (
        <div style={{ bottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))' }} className="fixed right-6 z-50 px-5 py-3 rounded-2xl text-sm font-semibold shadow-lg bg-black text-white">
          {tSettings('app_settings.plan_tab.credits_purchased')}
        </div>
      )}
    </div>
  )
}

// ─── Integrations / Webhooks Tab ──────────────────────────────────────────
type Webhook = {
  id: string
  url: string
  events: string[]
  active: boolean
  created_at: string
}

function IntegrationsTab() {
  const [webhooks, setWebhooks] = useState<Webhook[]>([])
  const [loading, setLoading]   = useState(true)
  const [newUrl, setNewUrl]     = useState('')
  const [newEvents, setNewEvents] = useState<string[]>(['post.published', 'post.failed'])
  const [adding, setAdding]     = useState(false)
  const [addError, setAddError] = useState<string | null>(null)
  const [newSecret, setNewSecret] = useState<string | null>(null)
  const [copiedSecret, setCopiedSecret] = useState(false)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/webhooks')
      .then(r => r.json())
      .then(d => { setWebhooks(d.webhooks ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const toggleEvent = (event: string) => {
    setNewEvents(prev =>
      prev.includes(event) ? prev.filter(e => e !== event) : [...prev, event]
    )
  }

  const handleAdd = async () => {
    if (!newUrl.trim()) { setAddError('URL is required'); return }
    if (newEvents.length === 0) { setAddError('Select at least one event'); return }
    setAdding(true)
    setAddError(null)
    setNewSecret(null)
    try {
      const res = await fetch('/api/webhooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: newUrl.trim(), events: newEvents }),
      })
      const data = await res.json()
      if (!res.ok) { setAddError(data.error || 'Failed to add webhook'); return }
      setWebhooks(prev => [data.webhook, ...prev])
      setNewSecret(data.webhook.secret)
      setNewUrl('')
      setNewEvents(['post.published', 'post.failed'])
    } catch {
      setAddError('Network error — please try again')
    } finally {
      setAdding(false)
    }
  }

  const handleToggle = async (wh: Webhook) => {
    setTogglingId(wh.id)
    try {
      const res = await fetch(`/api/webhooks/${wh.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !wh.active }),
      })
      const data = await res.json()
      if (res.ok) {
        setWebhooks(prev => prev.map(w => w.id === wh.id ? data.webhook : w))
      }
    } finally {
      setTogglingId(null)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this webhook endpoint?')) return
    setDeletingId(id)
    try {
      await fetch(`/api/webhooks/${id}`, { method: 'DELETE' })
      setWebhooks(prev => prev.filter(w => w.id !== id))
    } finally {
      setDeletingId(null)
    }
  }

  const copySecret = async () => {
    if (!newSecret) return
    try {
      await navigator.clipboard.writeText(newSecret)
      setCopiedSecret(true)
      setTimeout(() => setCopiedSecret(false), 2000)
    } catch {}
  }

  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  return (
    <div className="space-y-6">
      {/* Explainer */}
      <div className="bg-surface border border-theme rounded-2xl p-6">
        <h2 className="text-base font-extrabold mb-1">Outbound Webhooks</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          SocialMate sends a signed POST request to your URL whenever the selected events fire.
          Connect to <span className="font-semibold text-gray-700 dark:text-gray-300">Zapier</span>,{' '}
          <span className="font-semibold text-gray-700 dark:text-gray-300">Make</span>,{' '}
          <span className="font-semibold text-gray-700 dark:text-gray-300">n8n</span>, or any custom receiver.
          Verify the <code className="text-xs bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded font-mono">X-SocialMate-Signature</code> header to confirm authenticity.{' '}
          <a href="/integrations" className="text-amber-500 hover:text-amber-600 font-semibold">View docs →</a>
        </p>

        {/* Add webhook form */}
        <div className="space-y-3">
          <div>
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1">Endpoint URL</label>
            <input
              type="url"
              value={newUrl}
              onChange={e => setNewUrl(e.target.value)}
              placeholder="https://hooks.zapier.com/hooks/catch/..."
              className="w-full border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-black dark:focus:border-gray-400 transition-all bg-transparent"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-2">Events</label>
            <div className="flex flex-wrap gap-2">
              {(['post.published', 'post.failed'] as const).map(ev => (
                <button
                  key={ev}
                  type="button"
                  onClick={() => toggleEvent(ev)}
                  className={`min-h-[44px] flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${
                    newEvents.includes(ev)
                      ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white'
                      : 'border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${ev === 'post.published' ? 'bg-green-400' : 'bg-red-400'}`} />
                  {ev}
                </button>
              ))}
            </div>
          </div>
          {addError && (
            <p className="text-xs text-red-500 font-semibold">{addError}</p>
          )}
          <button
            onClick={handleAdd}
            disabled={adding}
            className="min-h-[44px] px-5 py-2.5 rounded-xl text-sm font-bold bg-black text-white dark:bg-white dark:text-black hover:opacity-80 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {adding
              ? <><div className="w-4 h-4 border-2 border-white/40 dark:border-black/40 border-t-white dark:border-t-black rounded-full animate-spin" /> Adding...</>
              : '+ Add webhook'}
          </button>
        </div>

        {/* Secret reveal — shown once */}
        {newSecret && (
          <div className="mt-4 p-4 rounded-xl border border-amber-400 bg-amber-50 dark:bg-amber-900/20 space-y-2">
            <p className="text-xs font-bold text-amber-700 dark:text-amber-300">
              Save this secret — it will not be shown again
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs font-mono bg-white dark:bg-gray-900 border border-amber-300 dark:border-amber-600 px-3 py-2 rounded-lg break-all text-gray-800 dark:text-gray-200">
                {newSecret}
              </code>
              <button
                onClick={copySecret}
                className="min-h-[44px] min-w-[44px] px-3 py-2 rounded-lg border border-amber-400 text-xs font-bold text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-all flex-shrink-0"
              >
                {copiedSecret ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Existing webhooks */}
      <div className="bg-surface border border-theme rounded-2xl p-6">
        <h3 className="text-sm font-bold mb-4">Active endpoints</h3>
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
            Loading...
          </div>
        ) : webhooks.length === 0 ? (
          <div className="text-center py-8 text-sm text-gray-400 dark:text-gray-500">
            <p className="text-2xl mb-2">🔗</p>
            <p className="font-semibold mb-1">No webhooks yet</p>
            <p>Connect to Zapier, Make, n8n, or any custom receiver above.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {webhooks.map(wh => (
              <div key={wh.id} className="flex items-start gap-3 p-4 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/40">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate text-gray-800 dark:text-gray-200">{wh.url}</p>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {wh.events.map(ev => (
                      <span key={ev} className="text-xs px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-mono">
                        {ev}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Added {fmtDate(wh.created_at)}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Active toggle */}
                  <button
                    role="switch"
                    aria-checked={wh.active}
                    disabled={togglingId === wh.id}
                    onClick={() => handleToggle(wh)}
                    title={wh.active ? 'Disable' : 'Enable'}
                    className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 disabled:opacity-50 ${wh.active ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-600'}`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${wh.active ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </button>
                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(wh.id)}
                    disabled={deletingId === wh.id}
                    title="Delete"
                    className="min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors disabled:opacity-40 text-lg"
                  >
                    {deletingId === wh.id ? (
                      <div className="w-4 h-4 border-2 border-red-300 border-t-red-500 rounded-full animate-spin" />
                    ) : '×'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function LanguageTab() {
  const { locale, setLocale, t } = useI18n()
  const [saved, setSaved] = useState(false)
  const [pending, setPending] = useState(locale)

  const save = async () => {
    await setLocale(pending)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="bg-surface border border-theme rounded-2xl p-6 space-y-6">
      <div>
        <h2 className="text-base font-extrabold mb-1">{t('app_settings.language_tab.title')}</h2>
        <p className="text-sm text-gray-400 dark:text-gray-500">{t('app_settings.language_tab.subtitle')}</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {SUPPORTED_LOCALES.map(loc => (
          <button
            key={loc.code}
            onClick={() => setPending(loc.code)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
              pending === loc.code
                ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300'
                : 'border-theme bg-surface text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <span className="text-xl">{loc.flag}</span>
            <span>{loc.label}</span>
            {pending === loc.code && <span className="ml-auto text-amber-500">✓</span>}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={save}
          className="px-6 py-2.5 rounded-xl text-sm font-bold bg-black dark:bg-white text-white dark:text-black hover:opacity-80 transition-all"
        >
          {t('app_settings.language_tab.save_language')}
        </button>
        {saved && <span className="text-sm font-semibold text-green-500">{t('app_settings.language_tab.saved')}</span>}
      </div>
    </div>
  )
}

export default function Settings() {
  return (
    <Suspense fallback={
      <div className="min-h-dvh bg-theme flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-black dark:border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <SettingsInner />
    </Suspense>
  )
}