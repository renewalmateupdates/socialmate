'use client'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { useWorkspace } from '@/contexts/WorkspaceContext'
import { usePushNotifications } from '@/hooks/usePushNotifications'

const STRIPE_PRO_PRICE_ID    = 'price_1T9S2v7OMwDowUuULHznqUD5'
const STRIPE_AGENCY_PRICE_ID = 'price_1TFMHp7OMwDowUuUgeLAeJNY'

const ALL_TABS    = ['Profile', 'Plan', 'Referrals', 'Notifications', 'Security', 'White Label', 'Appearance']
const FREE_TABS   = ['Profile', 'Plan', 'Notifications', 'Security', 'Appearance']

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

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://socialmate.studio'

function SettingsInner() {
  const { plan } = useWorkspace()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Push notification support
  const { isSupported: pushSupported, permission: pushPermission, isSubscribed: pushSubscribed, isLoading: pushLoading, subscribe: pushSubscribe, unsubscribe: pushUnsubscribe } = usePushNotifications()

  // Tabs depend on plan — computed inside component
  const TABS = plan === 'free' ? FREE_TABS : ALL_TABS

  const [userEmail, setUserEmail]       = useState('')
  const [userId, setUserId]             = useState<string | null>(null)
  const [displayName, setDisplayName]   = useState('')
  const [username, setUsername]         = useState('')
  const [bio, setBio]                   = useState('')
  const [authLoading, setAuthLoading]   = useState(true)

  const tabFromUrl  = searchParams.get('tab')
  const [activeTab, setActiveTab] = useState(
    tabFromUrl && ALL_TABS.includes(tabFromUrl) ? tabFromUrl : 'Profile'
  )

  const [savedTab, setSavedTab]                   = useState<string | null>(null)
  const [checkoutLoading, setCheckoutLoading]     = useState(false)
  const [couponInput, setCouponInput]     = useState('')
  const [couponValidating, setCouponValidating] = useState(false)
  const [couponApplied, setCouponApplied] = useState<{ id: string; code: string; discount_type: string; discount_value: number } | null>(null)
  const [couponError, setCouponError]     = useState<string | null>(null)
  const [creditPackLoading, setCreditPackLoading] = useState<string | null>(null)
  const [notifications, setNotifications] = useState({
    post_published: true,
    post_failed:    true,
    credits_low:    true,
    team_joined:    true,
    weekly_digest:  true,
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
  const [wlBrandName, setWlBrandName]           = useState('')
  const [wlLogoUrl, setWlLogoUrl]               = useState('')
  const [wlDomain, setWlDomain]                 = useState('')
  const [wlColor, setWlColor]                   = useState('#000000')
  const [wlCheckoutLoading, setWlCheckoutLoading] = useState(false)
  const [wlActivated, setWlActivated]           = useState(false)

  const [creditPref, setCreditPref] = useState<'monthly_first' | 'bank_first'>('monthly_first')

  // Appearance — sidebar stats visibility
  const [sidebarStatsVisible, setSidebarStatsVisible] = useState(true)
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

      const { data: settings } = await supabase
        .from('user_settings')
        .select('referral_code, white_label_active, white_label_tier, white_label_brand_name, white_label_logo_url, white_label_custom_domain, white_label_brand_color, notification_prefs, credit_source_preference')
        .eq('user_id', user.id)
        .single()

      if (settings) {
        if (settings.referral_code) setReferralCode(settings.referral_code)
        setWhiteLabelActive(settings.white_label_active || false)
        setWhiteLabelTier(settings.white_label_tier || null)
        setWlBrandName(settings.white_label_brand_name || '')
        setWlLogoUrl(settings.white_label_logo_url || '')
        setWlDomain(settings.white_label_custom_domain || '')
        setWlColor(settings.white_label_brand_color || '#000000')
        if (settings.credit_source_preference) {
          setCreditPref(settings.credit_source_preference as 'monthly_first' | 'bank_first')
        }
        if (settings.notification_prefs) {
          setNotifications(prev => ({
            post_published: settings.notification_prefs.post_published ?? prev.post_published,
            post_failed:    settings.notification_prefs.post_failed    ?? prev.post_failed,
            credits_low:    settings.notification_prefs.credits_low    ?? prev.credits_low,
            team_joined:    settings.notification_prefs.team_joined    ?? prev.team_joined,
            weekly_digest:  settings.notification_prefs.weekly_digest  ?? prev.weekly_digest,
          }))
        }
      }

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

      const { data: factors } = await supabase.auth.mfa.listFactors()
      const totpFactor = factors?.totp?.find((f: any) => f.status === 'verified')
      if (totpFactor) { setMfaEnabled(true); setMfaFactorId(totpFactor.id) }

      if (searchParams.get('white_label') === 'activated') setWlActivated(true)

      setAuthLoading(false)
    }
    init()
  }, [router, searchParams])

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

  const referralLink = referralCode ? `${appUrl}/?ref=${referralCode}` : ''
  const nextTier     = REFERRAL_TIERS.find(t => referralStats.payingReferrals < t.paying)

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
          <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
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
            <h1 className="text-2xl font-extrabold tracking-tight">Settings</h1>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">Manage your account, plan, and preferences</p>
          </div>

          {/* Mobile: dropdown selector */}
          <div className="mb-6 sm:hidden">
            <select
              value={activeTab}
              onChange={e => setActiveTab(e.target.value)}
              className="w-full border border-theme rounded-2xl px-4 py-3 text-sm font-bold bg-surface text-gray-700 dark:text-gray-200 outline-none focus:border-gray-400 transition-all">
              {TABS.map(tab => (
                <option key={tab} value={tab}>{tab}</option>
              ))}
            </select>
          </div>

          {/* Desktop: pill tabs */}
          <div className="hidden sm:flex items-center gap-1 mb-6 bg-surface border border-theme rounded-2xl p-1.5">
            {TABS.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${activeTab === tab ? 'bg-black text-white dark:bg-white dark:text-black' : 'text-gray-500 hover:text-black dark:hover:text-white'}`}>
                {tab}
              </button>
            ))}
          </div>

          {/* ── PROFILE ── */}
          {activeTab === 'Profile' && (
            <div className="bg-surface border border-theme rounded-2xl p-6 space-y-4">
              <h2 className="text-base font-extrabold">Profile</h2>
              <div>
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1">Display Name</label>
                <input value={displayName} onChange={e => setDisplayName(e.target.value)}
                  className="w-full border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-black dark:focus:border-gray-400 transition-all" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1">Email</label>
                <input value={userEmail} disabled
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed" />
                <p className="text-xs text-gray-400 mt-1">Email cannot be changed here.</p>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1">Username / Handle</label>
                <input value={username} onChange={e => setUsername(e.target.value)} placeholder="@yourhandle"
                  className="w-full border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-black dark:focus:border-gray-400 transition-all" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1">Bio</label>
                <textarea rows={3} value={bio} onChange={e => setBio(e.target.value)}
                  placeholder="Tell your audience about yourself..."
                  className="w-full border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-black dark:focus:border-gray-400 transition-all resize-none" />
              </div>
              <button onClick={() => handleSave('Profile')}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${savedTab === 'Profile' ? 'bg-green-500 text-white' : 'bg-black text-white hover:opacity-80'}`}>
                {savedTab === 'Profile' ? '✓ Saved!' : 'Save Changes'}
              </button>
            </div>
          )}

          {/* ── PLAN ── */}
          {activeTab === 'Plan' && (
            <div className="space-y-4">
              <div className="bg-surface border border-theme rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-base font-extrabold">Current Plan</h2>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Your active subscription</p>
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
                      <p className="text-sm font-extrabold mb-1">Upgrade to Pro — $5/month</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">5 accounts per platform · 500 AI credits · 1 client workspace · 90-day analytics</p>
                      <button onClick={() => handleCheckout(STRIPE_PRO_PRICE_ID)} disabled={checkoutLoading}
                        className="bg-white text-black text-xs font-bold px-4 py-2 rounded-lg hover:opacity-80 transition-all disabled:opacity-60">
                        {checkoutLoading ? 'Loading...' : 'Upgrade to Pro →'}
                      </button>
                    </div>
                    <div className="border border-purple-200 rounded-xl p-4">
                      <p className="text-sm font-extrabold mb-1">Agency — $20/month</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">15 team seats · 5 client workspaces · 2,000 AI credits · 6-month analytics</p>
                      <button onClick={() => handleCheckout(STRIPE_AGENCY_PRICE_ID)} disabled={checkoutLoading}
                        className="bg-purple-600 text-white text-xs font-bold px-4 py-2 rounded-lg hover:opacity-80 transition-all disabled:opacity-60">
                        {checkoutLoading ? 'Loading...' : 'Upgrade to Agency →'}
                      </button>
                    </div>
                  </div>
                )}

                {plan === 'pro' && (
                  <div className="space-y-3">
                    <div className="border border-purple-200 rounded-xl p-4">
                      <p className="text-sm font-extrabold mb-1">Upgrade to Agency — $20/month</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">15 team seats · 5 client workspaces · 2,000 AI credits · 6-month analytics</p>
                      <button onClick={() => handleCheckout(STRIPE_AGENCY_PRICE_ID)} disabled={checkoutLoading}
                        className="bg-purple-600 text-white text-xs font-bold px-4 py-2 rounded-lg hover:opacity-80 transition-all disabled:opacity-60">
                        {checkoutLoading ? 'Loading...' : 'Upgrade to Agency →'}
                      </button>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Manage billing, invoices, and cancellation below.</p>
                      <button onClick={handlePortal} disabled={checkoutLoading}
                        className="text-xs font-bold text-black border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all disabled:opacity-60">
                        {checkoutLoading ? 'Loading...' : 'Manage Subscription →'}
                      </button>
                    </div>
                  </div>
                )}

                {plan === 'agency' && (
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Manage billing, invoices, and cancellation below.</p>
                    <button onClick={handlePortal} disabled={checkoutLoading}
                      className="text-xs font-bold text-black border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all disabled:opacity-60">
                      {checkoutLoading ? 'Loading...' : 'Manage Subscription →'}
                    </button>
                  </div>
                )}
              </div>

              {/* AI CREDITS */}
              <div className="bg-surface border border-theme rounded-2xl p-6">
                <h2 className="text-base font-extrabold mb-4">AI Credits</h2>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Monthly credits</span>
                  <span className="text-xs font-bold">
                    {plan === 'free' ? '100 / 100' : plan === 'pro' ? '500 / 500' : '2,000 / 2,000'}
                  </span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2 mb-4">
                  <div className="bg-black h-2 rounded-full" style={{ width: '100%' }} />
                </div>
                <div className="flex items-center justify-between mb-6">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Credit bank capacity</span>
                  <span className="text-xs font-bold">
                    {plan === 'free' ? '150' : plan === 'pro' ? '750' : '3,000'}
                  </span>
                </div>
                <div className="border-t border-gray-100 pt-5">
                  <p className="text-xs font-extrabold mb-1">Buy Credit Packs</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">One-time purchase — credits added instantly to your balance.</p>
                  <div className="grid grid-cols-2 gap-3">
                    {CREDIT_PACKS.map(pack => (
                      <div key={pack.priceId} className={`relative border rounded-xl p-4 ${pack.popular ? 'border-black' : 'border-gray-200'}`}>
                        {pack.popular && (
                          <span className="absolute -top-2 left-3 text-xs font-bold bg-black text-white px-2 py-0.5 rounded-full">Popular</span>
                        )}
                        <p className="text-sm font-extrabold mb-0.5">{pack.label}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">{pack.credits.toLocaleString()} credits</p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-extrabold">{pack.price}</span>
                          <button onClick={() => handleCreditPack(pack.priceId)} disabled={creditPackLoading === pack.priceId}
                            className="text-xs font-bold px-3 py-1.5 bg-black text-white rounded-lg hover:opacity-80 transition-all disabled:opacity-60">
                            {creditPackLoading === pack.priceId ? '...' : 'Buy'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* CREDIT SOURCE PREFERENCE */}
              <div className="mt-6">
                <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--text)' }}>Credit Usage Preference</h3>
                <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
                  Choose which credits AI tools use first.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => saveCreditPreference('monthly_first')}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold border transition-all text-left ${
                      creditPref === 'monthly_first'
                        ? 'bg-black text-white border-black dark:bg-white dark:text-black'
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
                    }`}>
                    Monthly first
                    <p className="font-normal text-xs opacity-70 mt-0.5">Use monthly allowance before bank</p>
                  </button>
                  <button
                    onClick={() => saveCreditPreference('bank_first')}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold border transition-all text-left ${
                      creditPref === 'bank_first'
                        ? 'bg-black text-white border-black dark:bg-white dark:text-black'
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
                    }`}>
                    Bank first
                    <p className="font-normal text-xs opacity-70 mt-0.5">Save monthly credits, use bank</p>
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
                  <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { label: 'Total Referrals',  value: referralStats.totalReferrals  },
                      { label: 'Paying Referrals', value: referralStats.payingReferrals },
                      { label: 'Credits Earned',   value: referralStats.creditsEarned   },
                    ].map((stat, i) => (
                      <div key={i} className="bg-surface border border-theme rounded-2xl p-5 text-center">
                        <p className="text-3xl font-extrabold mb-1">{stat.value}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 font-semibold uppercase tracking-wide">{stat.label}</p>
                      </div>
                    ))}
                  </div>

                  <div className="bg-black text-white rounded-2xl p-6">
                    <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">Your Referral Link</p>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex-1 bg-white/10 rounded-xl px-4 py-3 text-sm font-mono truncate">
                        {referralLink || 'Loading...'}
                      </div>
                      <button onClick={handleCopyLink} disabled={!referralLink}
                        className={`px-5 py-3 rounded-xl text-sm font-bold transition-all flex-shrink-0 ${copiedLink ? 'bg-green-500 text-white' : 'bg-white text-black hover:opacity-80'}`}>
                        {copiedLink ? '✓ Copied!' : 'Copy'}
                      </button>
                    </div>
                    <p className="text-xs text-gray-400">
                      They upgrade to Pro → <span className="text-white font-bold">+50 credits</span> &nbsp;·&nbsp;
                      They upgrade to Agency → <span className="text-white font-bold">+50 credits</span>
                    </p>
                  </div>

                  {nextTier && (
                    <div className="bg-surface border border-theme rounded-2xl p-6">
                      <h2 className="text-base font-extrabold mb-1">Next Milestone</h2>
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
                    <h2 className="text-base font-extrabold mb-5">Reward Tiers</h2>
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
                    <h2 className="text-base font-extrabold mb-5">Referral History</h2>
                    {referralHistory.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-3xl mb-3">🎁</p>
                        <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">No referrals yet</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">Share your link above to start earning credits.</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {referralHistory.map((entry: any, i: number) => (
                          <div key={i} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                            <div>
                              <p className="text-sm font-bold">Referred user</p>
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

          {/* ── NOTIFICATIONS ── */}
          {activeTab === 'Notifications' && (
            <div className="bg-surface border border-theme rounded-2xl p-6">
              <h2 className="text-base font-extrabold mb-1">Notification Preferences</h2>
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-5">Each toggle saves immediately. Changes take effect on the next event.</p>
              <div className="space-y-4">
                {([
                  { key: 'post_published' as const, label: 'Email me when a post publishes successfully', desc: 'Get notified every time a scheduled post goes live' },
                  { key: 'post_failed'    as const, label: 'Email me when a post fails to publish',      desc: 'Get notified so you can retry or reschedule'       },
                  { key: 'credits_low'    as const, label: 'Email me when I have fewer than 10 credits', desc: 'Avoid running out of AI credits unexpectedly'       },
                  { key: 'team_joined'    as const, label: 'Email me when a team member joins',          desc: 'Know when someone accepts your workspace invite'   },
                  { key: 'weekly_digest'  as const, label: 'Send me a weekly digest of my activity',     desc: 'Every Monday: posts published, credits used, stats' },
                ] as { key: keyof typeof notifications; label: string; desc: string }[]).map(item => (
                  <div key={item.key} className="flex items-center justify-between py-3 border-b border-gray-50 dark:border-gray-800 last:border-0">
                    <div className="flex-1 min-w-0 pr-4">
                      <p className="text-sm font-bold">{item.label}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{item.desc}</p>
                      {notifSaving === item.key && (
                        <p className="text-xs text-gray-400 mt-1">Saving...</p>
                      )}
                      {notifSaved === item.key && notifSaving !== item.key && (
                        <p className="text-xs text-green-500 mt-1">Saved ✓</p>
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

          {/* ── PUSH NOTIFICATIONS ── */}
          {activeTab === 'Notifications' && !pushSupported && (
            <div className="bg-surface border border-theme rounded-2xl p-6">
              <h2 className="text-base font-extrabold mb-1">Push Notifications</h2>
              <p className="text-xs text-gray-400 dark:text-gray-500">Push notifications are not supported in this browser. Try a modern browser like Chrome or Firefox on desktop.</p>
            </div>
          )}
          {activeTab === 'Notifications' && pushSupported && (
            <div className="bg-surface border border-theme rounded-2xl p-6">
              <h2 className="text-base font-extrabold mb-1">Push Notifications</h2>
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-5">Get notified when posts publish and when your streak is at risk</p>
              {pushPermission === 'denied' ? (
                <p className="text-xs text-gray-400 dark:text-gray-500">Notifications blocked in browser settings. Enable them in your browser to use push notifications.</p>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold">{pushSubscribed ? 'Push notifications are on' : 'Push notifications are off'}</p>
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
                      {pushSubscribed ? 'Turn off' : 'Turn on'}
                    </button>
                  </div>
                  {pushSubscribed && (
                    <div className="pt-4 border-t border-theme">
                      <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-3">Test your push subscription</p>
                      <button
                        onClick={async () => {
                          try {
                            await fetch('/api/notifications/test', { method: 'POST' })
                          } catch {}
                        }}
                        className="px-4 py-2 border border-gray-200 dark:border-gray-600 text-xs font-bold rounded-xl hover:border-gray-400 transition-all">
                        Send test notification
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── SECURITY ── */}
          {activeTab === 'Security' && (
            <div className="space-y-4">
              <div className="bg-surface border border-theme rounded-2xl p-6">
                <div className="flex items-center justify-between mb-1">
                  <h2 className="text-base font-extrabold">Two-Factor Authentication</h2>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${mfaEnabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'}`}>
                    {mfaEnabled ? '✓ Enabled' : 'Disabled'}
                  </span>
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-5">Add an extra layer of security using Google Authenticator or any TOTP app.</p>
                {mfaError && (
                  <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-4">
                    <p className="text-xs font-semibold text-red-500">❌ {mfaError}</p>
                  </div>
                )}
                {mfaStep === 'idle' && !mfaEnabled && (
                  <button onClick={handleEnroll2FA} disabled={mfaLoading}
                    className="px-5 py-2.5 bg-black text-white text-xs font-bold rounded-xl hover:opacity-80 transition-all disabled:opacity-50 flex items-center gap-2">
                    {mfaLoading && <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                    Enable 2FA →
                  </button>
                )}
                {mfaStep === 'enroll' && (
                  <div className="space-y-5">
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-5">
                      <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wide">Step 1 — Scan with your authenticator app</p>
                      <div className="flex justify-center mb-4">
                        <img src={mfaQR} alt="2FA QR Code" className="w-40 h-40 rounded-xl" />
                      </div>
                      <p className="text-xs text-gray-400 dark:text-gray-500 text-center mb-2">Can't scan? Enter this code manually:</p>
                      <div className="bg-surface border border-theme-md rounded-xl px-4 py-2 text-center">
                        <p className="text-xs font-mono font-bold tracking-widest text-gray-700 dark:text-gray-300 break-all">{mfaSecret}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Step 2 — Enter the 6-digit code</p>
                      <input type="text" inputMode="numeric" maxLength={6} value={mfaCode}
                        onChange={e => setMfaCode(e.target.value.replace(/\D/g, ''))} placeholder="000000"
                        className="w-full border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-sm text-center font-mono tracking-widest outline-none focus:border-black dark:focus:border-gray-400 transition-all" />
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => { setMfaStep('idle'); setMfaCode(''); setMfaError('') }}
                        className="px-5 py-2.5 border border-gray-200 text-xs font-bold rounded-xl hover:border-gray-400 transition-all">
                        Cancel
                      </button>
                      <button onClick={handleVerify2FA} disabled={mfaLoading || mfaCode.length !== 6}
                        className="flex-1 py-2.5 bg-black text-white text-xs font-bold rounded-xl hover:opacity-80 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                        {mfaLoading && <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                        Verify & Enable →
                      </button>
                    </div>
                  </div>
                )}
                {mfaStep === 'idle' && mfaEnabled && (
                  <button onClick={() => setMfaStep('disable_confirm')}
                    className="text-xs font-bold text-red-500 border border-red-100 rounded-xl px-4 py-2.5 hover:bg-red-50 transition-all">
                    Disable 2FA
                  </button>
                )}
                {mfaStep === 'disable_confirm' && (
                  <div className="border border-red-200 rounded-xl px-4 py-4 bg-red-50">
                    <p className="text-xs font-bold text-red-700 mb-3">Disabling 2FA will remove the extra security layer from your account. Are you sure?</p>
                    <div className="flex gap-2">
                      <button onClick={handleDisable2FA} disabled={mfaLoading}
                        className="text-xs font-bold px-4 py-2 bg-red-500 text-white rounded-lg hover:opacity-80 transition-all disabled:opacity-40 flex items-center gap-2">
                        {mfaLoading && <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                        Yes, disable 2FA
                      </button>
                      <button onClick={() => setMfaStep('idle')}
                        className="text-xs font-bold px-4 py-2 border border-gray-200 rounded-lg hover:border-gray-400 transition-all">
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-surface border border-theme rounded-2xl p-6">
                <h2 className="text-base font-extrabold mb-1">Change Password</h2>
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-5">Must be at least 8 characters.</p>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1">Current Password</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={e => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-black dark:focus:border-gray-400 transition-all" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-black dark:focus:border-gray-400 transition-all" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1">Confirm New Password</label>
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
                    <p className="text-xs text-green-500 font-semibold">Password updated successfully ✓</p>
                  )}
                  <button
                    onClick={handleChangePassword}
                    disabled={passwordLoading || !newPassword}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold transition-all bg-black dark:bg-white text-white dark:text-black hover:opacity-80 disabled:opacity-40 flex items-center gap-2">
                    {passwordLoading && <div className="w-3 h-3 border-2 border-white/30 dark:border-black/30 border-t-white dark:border-t-black rounded-full animate-spin" />}
                    {passwordLoading ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </div>

              <div className="bg-surface border border-theme rounded-2xl p-6">
                <h2 className="text-base font-extrabold mb-1">Active Sessions</h2>
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
                  You are currently signed in. Sign out all other browsers and devices.
                </p>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-green-600 bg-green-50 px-3 py-1.5 rounded-full">Current session</span>
                  <button
                    onClick={handleSignOutOtherSessions}
                    disabled={sessionsLoading}
                    className="text-xs font-bold px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl hover:border-gray-400 dark:hover:border-gray-400 transition-all disabled:opacity-40">
                    {sessionsLoading ? 'Signing out...' : 'Sign out all other sessions'}
                  </button>
                  {sessionSignedOut && <span className="text-xs text-green-500 font-semibold">Done ✓</span>}
                </div>
              </div>

              <div className="bg-surface border border-theme rounded-2xl p-6">
                <h2 className="text-base font-extrabold mb-1">Danger Zone</h2>
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">These actions are irreversible. Please be certain.</p>
                <div className="space-y-3">
                  {confirmDeletePosts ? (
                    <div className="border border-red-200 rounded-xl px-4 py-3 bg-red-50">
                      <p className="text-xs font-bold text-red-600 mb-2">This will permanently delete all your scheduled and draft posts. Are you sure?</p>
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
                  {confirmDeleteAccount ? (
                    <div className="border border-red-300 rounded-xl px-4 py-4 bg-red-50">
                      <p className="text-xs font-bold text-red-700 mb-1">⚠️ This will permanently delete your account and all data.</p>
                      <p className="text-xs text-red-600 mb-3">This action cannot be undone. Type <strong>DELETE</strong> to confirm.</p>
                      <input
                        type="text"
                        value={deleteConfirmText}
                        onChange={e => setDeleteConfirmText(e.target.value)}
                        placeholder="Type DELETE to confirm"
                        className="w-full border border-red-200 rounded-xl px-3 py-2 text-sm mb-3 outline-none focus:border-red-400 transition-all" />
                      <div className="flex gap-2">
                        <button
                          onClick={handleDeleteAccount}
                          disabled={dangerLoading || deleteConfirmText !== 'DELETE'}
                          className="text-xs font-bold px-4 py-2 bg-red-600 text-white rounded-lg hover:opacity-80 transition-all disabled:opacity-40">
                          {dangerLoading ? 'Processing...' : 'Delete my account'}
                        </button>
                        <button onClick={() => { setConfirmDeleteAccount(false); setDeleteConfirmText('') }}
                          className="text-xs font-bold px-4 py-2 border border-gray-200 rounded-lg hover:border-gray-400 transition-all">
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => setConfirmDeleteAccount(true)}
                      className="w-full text-left text-xs font-bold text-red-600 border border-red-200 rounded-xl px-4 py-3 hover:bg-red-50 transition-all">
                      Delete my account
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
                  <h2 className="text-base font-extrabold mb-2">White Label is a Pro & Agency add-on</h2>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mb-5 max-w-sm mx-auto leading-relaxed">
                    Remove SocialMate branding and replace it with your own. Available in two tiers as a monthly add-on on Pro and Agency plans.
                  </p>
                  <button onClick={() => handleCheckout(STRIPE_PRO_PRICE_ID)} disabled={checkoutLoading}
                    className="bg-black text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:opacity-80 transition-all disabled:opacity-60">
                    {checkoutLoading ? 'Loading...' : 'Upgrade to Pro to unlock →'}
                  </button>
                </div>
              )}

              {/* Pro or Agency — not yet purchased */}
              {plan !== 'free' && !whiteLabelActive && (
                <div className="space-y-4">
                  {wlActivated && (
                    <div className="bg-green-50 border border-green-200 rounded-2xl px-5 py-4">
                      <p className="text-sm font-extrabold text-green-700">✅ White Label activated! Configure your branding below.</p>
                    </div>
                  )}
                  <div className="bg-surface border border-theme rounded-2xl p-6">
                    <h2 className="text-base font-extrabold mb-1">White Label Add-on</h2>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-6 leading-relaxed">
                      Remove SocialMate branding and replace it with your own. Billed monthly — cancel anytime from your billing portal.
                    </p>
                    <div className="grid grid-cols-2 gap-4">

                      {/* Basic */}
                      <div className="border border-gray-200 dark:border-gray-600 rounded-2xl p-5">
                        <p className="text-sm font-extrabold mb-1">White Label Basic</p>
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
                          {wlCheckoutLoading ? 'Loading...' : 'Add White Label Basic →'}
                        </button>
                      </div>

                      {/* Pro */}
                      <div className="border-2 border-black rounded-2xl p-5 relative">
                        <span className="absolute -top-2.5 left-4 text-xs font-bold bg-black text-white px-2 py-0.5 rounded-full">Best for agencies</span>
                        <p className="text-sm font-extrabold mb-1">White Label Pro</p>
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
                          {wlCheckoutLoading ? 'Loading...' : 'Add White Label Pro →'}
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
                        White Label {whiteLabelTier === 'pro' ? 'Pro — $40/mo' : 'Basic — $20/mo'} Active
                      </p>
                    </div>
                    <button onClick={handlePortal} className="text-xs font-bold text-green-700 hover:underline">
                      Manage billing →
                    </button>
                  </div>

                  <div className="bg-surface border border-theme rounded-2xl p-6 space-y-4">
                    <h2 className="text-base font-extrabold">Brand Configuration</h2>
                    <div>
                      <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1">Brand Name</label>
                      <input value={wlBrandName} onChange={e => setWlBrandName(e.target.value)}
                        placeholder="Your Brand"
                        className="w-full border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-black dark:focus:border-gray-400 transition-all" />
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Replaces "SocialMate" throughout the app.</p>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1">Logo URL</label>
                      <input value={wlLogoUrl} onChange={e => setWlLogoUrl(e.target.value)}
                        placeholder="https://yourbrand.com/logo.png"
                        className="w-full border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-black dark:focus:border-gray-400 transition-all" />
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">PNG or SVG recommended. Will replace the SocialMate logo.</p>
                    </div>
                    {whiteLabelTier === 'pro' && (
                      <div>
                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1">Custom Domain</label>
                        <input value={wlDomain} onChange={e => setWlDomain(e.target.value)}
                          placeholder="app.yourbrand.com"
                          className="w-full border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-black dark:focus:border-gray-400 transition-all" />
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Point your DNS CNAME to socialmate.studio then enter your domain here.</p>
                      </div>
                    )}
                    <div>
                      <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1">Brand Color</label>
                      <div className="flex items-center gap-3">
                        <input type="color" value={wlColor} onChange={e => setWlColor(e.target.value)}
                          className="h-10 w-16 border border-gray-200 dark:border-gray-600 rounded-xl cursor-pointer" />
                        <input value={wlColor} onChange={e => setWlColor(e.target.value)}
                          placeholder="#000000"
                          className="flex-1 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-black dark:focus:border-gray-400 transition-all font-mono" />
                      </div>
                    </div>

                    {/* Upgrade from Basic to Pro */}
                    {whiteLabelTier === 'basic' && (
                      <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl p-4">
                        <p className="text-xs font-bold mb-1">Want a custom domain?</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">Upgrade to White Label Pro for custom domain support and full rebrand at $40/mo.</p>
                        <button onClick={() => handleWhiteLabelCheckout('pro')} disabled={wlCheckoutLoading}
                          className="text-xs font-bold px-4 py-2 bg-black text-white rounded-xl hover:opacity-80 transition-all disabled:opacity-50">
                          {wlCheckoutLoading ? 'Loading...' : 'Upgrade to White Label Pro →'}
                        </button>
                      </div>
                    )}

                    <button onClick={() => handleSave('WhiteLabel')}
                      className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${savedTab === 'WhiteLabel' ? 'bg-green-500 text-white' : 'bg-black text-white hover:opacity-80'}`}>
                      {savedTab === 'WhiteLabel' ? '✓ Saved!' : 'Save Branding'}
                    </button>
                  </div>

                  {wlLogoUrl && (
                    <div className="bg-surface border border-theme rounded-2xl p-5">
                      <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Logo Preview</p>
                      <img src={wlLogoUrl} alt="Brand logo" className="h-10 object-contain"
                        onError={e => (e.currentTarget.style.display = 'none')} />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── APPEARANCE ── */}
          {activeTab === 'Appearance' && (
            <div className="bg-surface border border-theme rounded-2xl p-6">
              <h2 className="text-base font-extrabold mb-1">Appearance</h2>
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-5">Customize how the app looks and behaves.</p>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-50 dark:border-gray-800">
                  <div className="flex-1 min-w-0 pr-4">
                    <p className="text-sm font-bold">Sidebar stats</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Show the AI Credits and Team Seats panels at the bottom of the sidebar.</p>
                  </div>
                  <button
                    role="switch"
                    aria-checked={sidebarStatsVisible}
                    onClick={() => {
                      const next = !sidebarStatsVisible
                      setSidebarStatsVisible(next)
                      try { localStorage.setItem('sidebar_stats_visible', String(next)) } catch {}
                    }}
                    className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${sidebarStatsVisible ? 'bg-pink-500' : 'bg-gray-200 dark:bg-gray-700'}`}>
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${sidebarStatsVisible ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* TOASTS */}
      {savedTab === 'credits_purchased' && (
        <div className="fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl text-sm font-semibold shadow-lg bg-black text-white">
          ✅ Credits added to your account!
        </div>
      )}
    </div>
  )
}

export default function Settings() {
  return (
    <Suspense fallback={
      <div className="min-h-dvh bg-theme flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <SettingsInner />
    </Suspense>
  )
}