'use client'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { useWorkspace } from '@/contexts/WorkspaceContext'

const STRIPE_PRO_PRICE_ID    = 'price_1T9pay7OMwDowUuU7S3G3lNX'
const STRIPE_AGENCY_PRICE_ID = 'price_1T9qAd7OMwDowUuUpzjxLlG2'

const TABS = ['Profile', 'Plan', 'Referrals', 'Notifications', 'Security', 'White Label']

const REFERRAL_TIERS = [
  { paying: 5,   reward: '1 month Pro free',       icon: '🎁', conditional: false },
  { paying: 10,  reward: '3 months Pro free',      icon: '⭐', conditional: false },
  { paying: 25,  reward: '6 months Pro free',      icon: '🚀', conditional: false },
  { paying: 50,  reward: 'Pro free while active',  icon: '💎', conditional: true  },
  { paying: 100, reward: 'Pro free while active',  icon: '👑', conditional: true  },
]

const CREDIT_PACKS = [
  { label: 'Starter',  credits: 100,  price: '$1.99',  priceId: 'price_1TA0jd7OMwDowUuULUw5W7EQ', popular: false },
  { label: 'Popular',  credits: 300,  price: '$4.99',  priceId: 'price_1TA0l37OMwDowUuUU5JpIcDK', popular: true  },
  { label: 'Pro Pack', credits: 750,  price: '$9.99',  priceId: 'price_1TA0nA7OMwDowUuU5wHTbucn', popular: false },
  { label: 'Max Pack', credits: 2000, price: '$19.99', priceId: 'price_1TA0nS7OMwDowUuUKURJ7ZM4', popular: false },
]

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://socialmate.studio'

function SettingsInner() {
  const { plan } = useWorkspace()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [userEmail, setUserEmail] = useState('')
  const [userId, setUserId] = useState<string | null>(null)
  const [displayName, setDisplayName] = useState('')
  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')
  const [authLoading, setAuthLoading] = useState(true)

  const tabFromUrl = searchParams.get('tab')
  const [activeTab, setActiveTab] = useState(
    tabFromUrl && TABS.includes(tabFromUrl) ? tabFromUrl : 'Profile'
  )

  const [savedTab, setSavedTab] = useState<string | null>(null)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [creditPackLoading, setCreditPackLoading] = useState<string | null>(null)
  const [notifications, setNotifications] = useState({
    postPublished: true,
    postFailed: true,
    weeklyDigest: false,
    creditLow: true,
    teamActivity: false,
    productUpdates: true,
  })
  const [copiedLink, setCopiedLink] = useState(false)
  const [confirmDeletePosts, setConfirmDeletePosts] = useState(false)
  const [confirmDeleteAccount, setConfirmDeleteAccount] = useState(false)
  const [dangerLoading, setDangerLoading] = useState(false)

  const [referralCode, setReferralCode] = useState('')
  const [referralStats, setReferralStats] = useState({ totalReferrals: 0, payingReferrals: 0, creditsEarned: 0 })
  const [referralHistory, setReferralHistory] = useState<any[]>([])
  const [referralLoading, setReferralLoading] = useState(false)

  const [mfaEnabled, setMfaEnabled] = useState(false)
  const [mfaFactorId, setMfaFactorId] = useState<string | null>(null)
  const [mfaStep, setMfaStep] = useState<'idle' | 'enroll' | 'disable_confirm'>('idle')
  const [mfaQR, setMfaQR] = useState('')
  const [mfaSecret, setMfaSecret] = useState('')
  const [mfaEnrollId, setMfaEnrollId] = useState('')
  const [mfaCode, setMfaCode] = useState('')
  const [mfaLoading, setMfaLoading] = useState(false)
  const [mfaError, setMfaError] = useState('')

  // White label state
  const [whiteLabelActive, setWhiteLabelActive] = useState(false)
  const [whiteLabelTier, setWhiteLabelTier] = useState<string | null>(null)
  const [wlBrandName, setWlBrandName] = useState('')
  const [wlLogoUrl, setWlLogoUrl] = useState('')
  const [wlDomain, setWlDomain] = useState('')
  const [wlColor, setWlColor] = useState('#000000')
  const [wlCheckoutLoading, setWlCheckoutLoading] = useState(false)
  const [wlActivated, setWlActivated] = useState(false)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUserEmail(user.email || '')
      setUserId(user.id)

      const { data: settings } = await supabase
        .from('user_settings')
        .select('referral_code, white_label_active, white_label_tier, white_label_brand_name, white_label_logo_url, white_label_custom_domain, white_label_brand_color')
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

      // Check if just activated white label
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
        const paying = data.filter((r: any) => r.status === 'eligible' || r.status === 'paid')
        const totalCredits = data.reduce((sum: number, r: any) => sum + (r.total_earned ?? 0), 0)
        setReferralStats({ totalReferrals: data.length, payingReferrals: paying.length, creditsEarned: totalCredits })
        setReferralHistory(data.slice(0, 10))
      }
      setReferralLoading(false)
    }
    loadReferrals()
  }, [activeTab, userId])

  const referralLink = referralCode ? `${appUrl}/?ref=${referralCode}` : ''
  const nextTier = REFERRAL_TIERS.find(t => referralStats.payingReferrals < t.paying)

  const handleSave = async (tab: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    if (tab === 'Profile') {
      await supabase.from('profiles').update({ display_name: displayName, username, bio }).eq('id', user.id)
    }
    if (tab === 'WhiteLabel') {
      await supabase.from('user_settings').update({
        white_label_brand_name: wlBrandName,
        white_label_logo_url: wlLogoUrl,
        white_label_custom_domain: wlDomain,
        white_label_brand_color: wlColor,
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

  const handleCheckout = async (priceId: string) => {
    setCheckoutLoading(true)
    try {
      const res = await fetch('/api/stripe/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ priceId }) })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      if (data.error === 'Unauthorized') router.push('/login')
    } catch { console.error('Checkout failed') }
    finally { setCheckoutLoading(false) }
  }

  const handleWhiteLabelCheckout = async (tier: 'basic' | 'pro') => {
    setWlCheckoutLoading(true)
    try {
      const res = await fetch('/api/stripe/whitelabel', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tier }) })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      if (data.error) alert(data.error)
    } catch { console.error('White label checkout failed') }
    finally { setWlCheckoutLoading(false) }
  }

  const handleCreditPack = async (priceId: string) => {
    setCreditPackLoading(priceId)
    try {
      const res = await fetch('/api/stripe/credits', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ priceId }) })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      if (data.error === 'Unauthorized') router.push('/login')
    } catch { console.error('Credit pack checkout failed') }
    finally { setCreditPackLoading(null) }
  }

  const handlePortal = async () => {
    setCheckoutLoading(true)
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
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

  const handleDeleteAccount = async () => {
    setDangerLoading(true)
    await supabase.auth.signOut()
    router.push('/login')
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

          <div className="flex items-center gap-1 mb-6 bg-white border border-gray-100 rounded-2xl p-1.5 flex-wrap">
            {TABS.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === tab ? 'bg-black text-white' : 'text-gray-500 hover:text-black'}`}>
                {tab}
              </button>
            ))}
          </div>

          {/* ── PROFILE ── */}
          {activeTab === 'Profile' && (
            <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-4">
              <h2 className="text-base font-extrabold">Profile</h2>
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">Display Name</label>
                <input value={displayName} onChange={e => setDisplayName(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-black transition-all" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">Email</label>
                <input value={userEmail} disabled
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none bg-gray-50 text-gray-400 cursor-not-allowed" />
                <p className="text-xs text-gray-400 mt-1">Email cannot be changed here.</p>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">Username / Handle</label>
                <input value={username} onChange={e => setUsername(e.target.value)} placeholder="@yourhandle"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-black transition-all" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">Bio</label>
                <textarea rows={3} value={bio} onChange={e => setBio(e.target.value)}
                  placeholder="Tell your audience about yourself..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-black transition-all resize-none" />
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
              <div className="bg-white border border-gray-100 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-base font-extrabold">Current Plan</h2>
                    <p className="text-xs text-gray-400 mt-0.5">Your active subscription</p>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1.5 rounded-full capitalize ${
                    plan === 'free' ? 'bg-gray-100 text-gray-600' : plan === 'pro' ? 'bg-black text-white' : 'bg-purple-100 text-purple-700'
                  }`}>{plan}</span>
                </div>
                {plan === 'free' && (
                  <div className="space-y-3">
                    <div className="bg-black text-white rounded-xl p-4">
                      <p className="text-sm font-extrabold mb-1">Upgrade to Pro — $5/month</p>
                      <p className="text-xs text-gray-400 mb-3">5 accounts per platform, 500 AI credits, 10 GB storage, 90-day analytics</p>
                      <button onClick={() => handleCheckout(STRIPE_PRO_PRICE_ID)} disabled={checkoutLoading}
                        className="bg-white text-black text-xs font-bold px-4 py-2 rounded-lg hover:opacity-80 transition-all disabled:opacity-60">
                        {checkoutLoading ? 'Loading...' : 'Upgrade to Pro →'}
                      </button>
                    </div>
                    <div className="border border-purple-200 rounded-xl p-4">
                      <p className="text-sm font-extrabold mb-1">Agency — $20/month</p>
                      <p className="text-xs text-gray-400 mb-3">15 team seats, client workspaces, 50 GB storage, 6-month analytics</p>
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
                      <p className="text-xs text-gray-400 mb-3">15 team seats, client workspaces, 2,000 AI credits, 6-month analytics</p>
                      <button onClick={() => handleCheckout(STRIPE_AGENCY_PRICE_ID)} disabled={checkoutLoading}
                        className="bg-purple-600 text-white text-xs font-bold px-4 py-2 rounded-lg hover:opacity-80 transition-all disabled:opacity-60">
                        {checkoutLoading ? 'Loading...' : 'Upgrade to Agency →'}
                      </button>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-3">Manage billing, invoices, and cancellation below.</p>
                      <button onClick={handlePortal} disabled={checkoutLoading}
                        className="text-xs font-bold text-black border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 transition-all disabled:opacity-60">
                        {checkoutLoading ? 'Loading...' : 'Manage Subscription →'}
                      </button>
                    </div>
                  </div>
                )}
                {plan === 'agency' && (
                  <div>
                    <p className="text-xs text-gray-500 mb-3">Manage billing, invoices, and cancellation below.</p>
                    <button onClick={handlePortal} disabled={checkoutLoading}
                      className="text-xs font-bold text-black border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 transition-all disabled:opacity-60">
                      {checkoutLoading ? 'Loading...' : 'Manage Subscription →'}
                    </button>
                  </div>
                )}
              </div>

              <div className="bg-white border border-gray-100 rounded-2xl p-6">
                <h2 className="text-base font-extrabold mb-4">AI Credits</h2>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500">Monthly credits</span>
                  <span className="text-xs font-bold">{plan === 'free' ? '100 / 100' : plan === 'pro' ? '500 / 500' : '2,000 / 2,000'}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 mb-4">
                  <div className="bg-black h-2 rounded-full" style={{ width: '100%' }} />
                </div>
                <div className="flex items-center justify-between mb-6">
                  <span className="text-xs text-gray-500">Credit bank capacity</span>
                  <span className="text-xs font-bold">{plan === 'free' ? '150' : plan === 'pro' ? '750' : '3,000'}</span>
                </div>
                <div className="border-t border-gray-100 pt-5">
                  <p className="text-xs font-extrabold mb-1">Buy Credit Packs</p>
                  <p className="text-xs text-gray-400 mb-4">One-time purchase — credits added instantly to your balance.</p>
                  <div className="grid grid-cols-2 gap-3">
                    {CREDIT_PACKS.map(pack => (
                      <div key={pack.priceId} className={`relative border rounded-xl p-4 ${pack.popular ? 'border-black' : 'border-gray-200'}`}>
                        {pack.popular && (
                          <span className="absolute -top-2 left-3 text-xs font-bold bg-black text-white px-2 py-0.5 rounded-full">Popular</span>
                        )}
                        <p className="text-sm font-extrabold mb-0.5">{pack.label}</p>
                        <p className="text-xs text-gray-400 mb-3">{pack.credits.toLocaleString()} credits</p>
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
                      <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 text-center">
                        <p className="text-3xl font-extrabold mb-1">{stat.value}</p>
                        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                  <div className="bg-black text-white rounded-2xl p-6">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Your Referral Link</p>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex-1 bg-white/10 rounded-xl px-4 py-3 text-sm font-mono truncate">{referralLink || 'Loading...'}</div>
                      <button onClick={handleCopyLink} disabled={!referralLink}
                        className={`px-5 py-3 rounded-xl text-sm font-bold transition-all flex-shrink-0 ${copiedLink ? 'bg-green-500 text-white' : 'bg-white text-black hover:opacity-80'}`}>
                        {copiedLink ? '✓ Copied!' : 'Copy'}
                      </button>
                    </div>
                    <p className="text-xs text-gray-400">
                      They upgrade to Pro → <span className="text-white font-bold">+50 credits</span> &nbsp;·&nbsp;
                      They upgrade to Agency → <span className="text-white font-bold">+100 credits</span>
                    </p>
                  </div>
                  {nextTier && (
                    <div className="bg-white border border-gray-100 rounded-2xl p-6">
                      <h2 className="text-base font-extrabold mb-1">Next Milestone</h2>
                      <p className="text-xs text-gray-400 mb-4">
                        You have <span className="font-bold text-black">{referralStats.payingReferrals}</span> paying referral{referralStats.payingReferrals !== 1 ? 's' : ''}.
                        Reach <span className="font-bold text-black">{nextTier.paying}</span> to unlock <span className="font-bold text-black">{nextTier.reward}</span>.
                      </p>
                      <div className="w-full bg-gray-100 rounded-full h-2.5 mb-2">
                        <div className="bg-black h-2.5 rounded-full transition-all"
                          style={{ width: `${Math.min((referralStats.payingReferrals / nextTier.paying) * 100, 100)}%` }} />
                      </div>
                      <p className="text-xs text-gray-400">{referralStats.payingReferrals} / {nextTier.paying} paying referrals</p>
                    </div>
                  )}
                  <div className="bg-white border border-gray-100 rounded-2xl p-6">
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
                                  {tier.conditional && <span className="ml-2 text-xs font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">while active</span>}
                                </p>
                                {unlocked && <p className="text-xs text-green-500 font-bold">Unlocked</p>}
                              </div>
                            </div>
                            <span className="text-xs font-extrabold px-3 py-2 bg-black text-white rounded-xl flex-shrink-0">{tier.reward}</span>
                          </div>
                        )
                      })}
                    </div>
                    <p className="text-xs text-gray-400 mt-4 pt-4 border-t border-gray-50">
                      Tiers 1–3 are permanent once earned. Tiers 4–5 remain active as long as you maintain the required paying referrals.
                    </p>
                  </div>
                  <div className="bg-white border border-gray-100 rounded-2xl p-6">
                    <h2 className="text-base font-extrabold mb-5">Referral History</h2>
                    {referralHistory.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-3xl mb-3">🎁</p>
                        <p className="text-sm font-bold text-gray-700 mb-1">No referrals yet</p>
                        <p className="text-xs text-gray-400">Share your link above to start earning credits.</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {referralHistory.map((entry: any, i: number) => (
                          <div key={i} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                            <div>
                              <p className="text-sm font-bold">Referred user</p>
                              <p className="text-xs text-gray-400">
                                {new Date(entry.converted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · {entry.status}
                              </p>
                            </div>
                            {entry.total_earned > 0 && (
                              <span className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-xl">${entry.total_earned.toFixed(2)} earned</span>
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
            <div className="bg-white border border-gray-100 rounded-2xl p-6">
              <h2 className="text-base font-extrabold mb-5">Notification Preferences</h2>
              <div className="space-y-4">
                {[
                  { key: 'postPublished',  label: 'Post published',  desc: 'When a scheduled post goes live'               },
                  { key: 'postFailed',     label: 'Post failed',     desc: 'When a scheduled post fails to publish'        },
                  { key: 'weeklyDigest',   label: 'Weekly digest',   desc: 'Summary of your posting activity every Monday' },
                  { key: 'creditLow',      label: 'Low AI credits',  desc: 'When your credits drop below 20'               },
                  { key: 'teamActivity',   label: 'Team activity',   desc: 'When team members schedule or edit posts'      },
                  { key: 'productUpdates', label: 'Product updates', desc: 'New features and platform announcements'       },
                ].map(item => (
                  <div key={item.key} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="text-sm font-bold">{item.label}</p>
                      <p className="text-xs text-gray-400">{item.desc}</p>
                    </div>
                    <button
                      onClick={() => setNotifications(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof prev] }))}
                      className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${notifications[item.key as keyof typeof notifications] ? 'bg-black' : 'bg-gray-200'}`}>
                      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${notifications[item.key as keyof typeof notifications] ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                ))}
              </div>
              <button onClick={() => handleSave('Notifications')}
                className={`mt-5 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${savedTab === 'Notifications' ? 'bg-green-500 text-white' : 'bg-black text-white hover:opacity-80'}`}>
                {savedTab === 'Notifications' ? '✓ Saved!' : 'Save Preferences'}
              </button>
            </div>
          )}

          {/* ── SECURITY ── */}
          {activeTab === 'Security' && (
            <div className="space-y-4">
              <div className="bg-white border border-gray-100 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-1">
                  <h2 className="text-base font-extrabold">Two-Factor Authentication</h2>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${mfaEnabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {mfaEnabled ? '✓ Enabled' : 'Disabled'}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mb-5">Add an extra layer of security using Google Authenticator or any TOTP app.</p>
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
                    <div className="bg-gray-50 rounded-2xl p-5">
                      <p className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wide">Step 1 — Scan with your authenticator app</p>
                      <div className="flex justify-center mb-4">
                        <img src={mfaQR} alt="2FA QR Code" className="w-40 h-40 rounded-xl" />
                      </div>
                      <p className="text-xs text-gray-400 text-center mb-2">Can't scan? Enter this code manually:</p>
                      <div className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-center">
                        <p className="text-xs font-mono font-bold tracking-widest text-gray-700 break-all">{mfaSecret}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Step 2 — Enter the 6-digit code</p>
                      <input type="text" inputMode="numeric" maxLength={6} value={mfaCode}
                        onChange={e => setMfaCode(e.target.value.replace(/\D/g, ''))} placeholder="000000"
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-center font-mono tracking-widest outline-none focus:border-black transition-all" />
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
                    className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${savedTab === 'Security' ? 'bg-green-500 text-white' : 'bg-black text-white hover:opacity-80'}`}>
                    {savedTab === 'Security' ? '✓ Updated!' : 'Update Password'}
                  </button>
                </div>
              </div>

              <div className="bg-white border border-gray-100 rounded-2xl p-6">
                <h2 className="text-base font-extrabold mb-1">Danger Zone</h2>
                <p className="text-xs text-gray-400 mb-4">These actions are irreversible. Please be certain.</p>
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
                    <div className="border border-red-300 rounded-xl px-4 py-3 bg-red-50">
                      <p className="text-xs font-bold text-red-700 mb-2">Your account and all data will be permanently deleted. This cannot be undone.</p>
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

              {/* Free plan — locked */}
              {plan === 'free' && (
                <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center">
                  <div className="text-3xl mb-3">🏷️</div>
                  <h2 className="text-base font-extrabold mb-2">White Label is a Pro & Agency feature</h2>
                  <p className="text-xs text-gray-400 mb-5 max-w-sm mx-auto leading-relaxed">
                    Remove SocialMate branding and replace it with your own logo, colors, and domain. Available as a monthly add-on on Pro and Agency plans.
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
                  <div className="bg-white border border-gray-100 rounded-2xl p-6">
                    <h2 className="text-base font-extrabold mb-1">White Label Add-on</h2>
                    <p className="text-xs text-gray-400 mb-6 leading-relaxed">
                      Purchase the White Label add-on to remove SocialMate branding and replace it with your own. Billed monthly — cancel anytime from your billing portal.
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="border border-gray-200 rounded-2xl p-5">
                        <p className="text-sm font-extrabold mb-1">White Label Basic</p>
                        <p className="text-2xl font-extrabold mb-1">$20<span className="text-sm font-semibold text-gray-400">/mo</span></p>
                        <ul className="space-y-1.5 mb-5">
                          {['Remove SocialMate branding', 'Add your logo', 'Custom brand colors', 'Your brand name throughout'].map(f => (
                            <li key={f} className="flex items-center gap-2 text-xs text-gray-600">
                              <span className="text-green-500 font-bold">✓</span>{f}
                            </li>
                          ))}
                        </ul>
                        <button onClick={() => handleWhiteLabelCheckout('basic')} disabled={wlCheckoutLoading}
                          className="w-full py-2.5 bg-black text-white text-xs font-bold rounded-xl hover:opacity-80 transition-all disabled:opacity-50">
                          {wlCheckoutLoading ? 'Loading...' : 'Add White Label Basic →'}
                        </button>
                      </div>
                      <div className="border-2 border-black rounded-2xl p-5 relative">
                        <span className="absolute -top-2.5 left-4 text-xs font-bold bg-black text-white px-2 py-0.5 rounded-full">Best for agencies</span>
                        <p className="text-sm font-extrabold mb-1">White Label Pro</p>
                        <p className="text-2xl font-extrabold mb-1">$40<span className="text-sm font-semibold text-gray-400">/mo</span></p>
                        <ul className="space-y-1.5 mb-5">
                          {['Everything in Basic', 'Custom domain (app.yourbrand.com)', 'Full rebrand — clients never see SocialMate', 'Priority support'].map(f => (
                            <li key={f} className="flex items-center gap-2 text-xs text-gray-600">
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
                        White Label {whiteLabelTier === 'pro' ? 'Pro' : 'Basic'} — Active
                      </p>
                    </div>
                    <button onClick={handlePortal} className="text-xs font-bold text-green-700 hover:underline">
                      Manage billing →
                    </button>
                  </div>

                  <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-4">
                    <h2 className="text-base font-extrabold">Brand Configuration</h2>
                    <div>
                      <label className="text-xs font-bold text-gray-500 block mb-1">Brand Name</label>
                      <input value={wlBrandName} onChange={e => setWlBrandName(e.target.value)}
                        placeholder="Your Brand"
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-black transition-all" />
                      <p className="text-xs text-gray-400 mt-1">Replaces "SocialMate" throughout the app.</p>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 block mb-1">Logo URL</label>
                      <input value={wlLogoUrl} onChange={e => setWlLogoUrl(e.target.value)}
                        placeholder="https://yourbrand.com/logo.png"
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-black transition-all" />
                      <p className="text-xs text-gray-400 mt-1">PNG or SVG recommended. Will replace the SocialMate logo.</p>
                    </div>
                    {whiteLabelTier === 'pro' && (
                      <div>
                        <label className="text-xs font-bold text-gray-500 block mb-1">Custom Domain</label>
                        <input value={wlDomain} onChange={e => setWlDomain(e.target.value)}
                          placeholder="app.yourbrand.com"
                          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-black transition-all" />
                        <p className="text-xs text-gray-400 mt-1">Point your DNS CNAME to socialmate.studio then enter your domain here.</p>
                      </div>
                    )}
                    <div>
                      <label className="text-xs font-bold text-gray-500 block mb-1">Brand Color</label>
                      <div className="flex items-center gap-3">
                        <input type="color" value={wlColor} onChange={e => setWlColor(e.target.value)}
                          className="h-10 w-16 border border-gray-200 rounded-xl cursor-pointer" />
                        <input value={wlColor} onChange={e => setWlColor(e.target.value)}
                          placeholder="#000000"
                          className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-black transition-all font-mono" />
                      </div>
                    </div>
                    <button onClick={() => handleSave('WhiteLabel')}
                      className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${savedTab === 'WhiteLabel' ? 'bg-green-500 text-white' : 'bg-black text-white hover:opacity-80'}`}>
                      {savedTab === 'WhiteLabel' ? '✓ Saved!' : 'Save Branding'}
                    </button>
                  </div>

                  {wlLogoUrl && (
                    <div className="bg-white border border-gray-100 rounded-2xl p-5">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Logo Preview</p>
                      <img src={wlLogoUrl} alt="Brand logo" className="h-10 object-contain" onError={e => (e.currentTarget.style.display = 'none')} />
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

export default function Settings() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <SettingsInner />
    </Suspense>
  )
}