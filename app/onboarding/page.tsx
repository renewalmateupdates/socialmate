'use client'
import { useEffect, useState, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

const PLATFORMS = [
  { id: 'discord',   label: 'Discord',     icon: '💬', desc: 'Announcements',  available: true  },
  { id: 'bluesky',   label: 'Bluesky',     icon: '🦋', desc: 'Decentralized',  available: true  },
  { id: 'mastodon',  label: 'Mastodon',    icon: '🐘', desc: 'Federated',      available: true  },
  { id: 'telegram',  label: 'Telegram',    icon: '✈️', desc: 'Channels',       available: true  },
  { id: 'linkedin',  label: 'LinkedIn',    icon: '💼', desc: 'Coming soon',    available: false },
  { id: 'youtube',   label: 'YouTube',     icon: '▶️', desc: 'Coming soon',    available: false },
  { id: 'pinterest', label: 'Pinterest',   icon: '📌', desc: 'Coming soon',    available: false },
  { id: 'reddit',    label: 'Reddit',      icon: '🤖', desc: 'Coming soon',    available: false },
  { id: 'instagram', label: 'Instagram',   icon: '📸', desc: 'Coming soon',    available: false },
  { id: 'tiktok',    label: 'TikTok',      icon: '🎵', desc: 'Coming soon',    available: false },
  { id: 'twitter',   label: 'X / Twitter', icon: '🐦', desc: 'Coming soon',    available: false },
  { id: 'threads',   label: 'Threads',     icon: '🧵', desc: 'Coming soon',    available: false },
]

const USE_CASES = [
  { id: 'creator',   label: 'Content Creator',     icon: '🎨', desc: 'Growing my personal brand'    },
  { id: 'business',  label: 'Business Owner',      icon: '🏢', desc: 'Marketing my business'        },
  { id: 'agency',    label: 'Agency / Freelancer', icon: '💼', desc: 'Managing client accounts'     },
  { id: 'marketing', label: 'Marketing Team',      icon: '📣', desc: 'Team social media management' },
  { id: 'nonprofit', label: 'Nonprofit',           icon: '❤️', desc: 'Spreading our mission'        },
  { id: 'other',     label: 'Just Exploring',      icon: '🔍', desc: 'Checking it out'              },
]

const STRIPE_PRO_PRICE_ID    = 'price_1T9S2v7OMwDowUuULHznqUD5'
const STRIPE_AGENCY_PRICE_ID = 'price_1TFMHp7OMwDowUuUgeLAeJNY'

const PLAN_DETAILS = {
  free: {
    label: 'Free',
    price: '$0/mo',
    color: 'border-emerald-400',
    cardBg: 'bg-emerald-50 dark:bg-emerald-950/20',
    badgeBg: 'bg-emerald-100 text-emerald-700',
    badgeLabel: 'Always Free',
    badge: 'bg-gray-100 text-gray-600',
    icon: '🆓',
    credits: 50,
    creditBank: 150,
    platforms: 1,
    seats: 2,
    posts: 100,
    storage: '1 GB',
    schedule: '2 weeks',
    analytics: '30 days',
    features: [
      '4 live platforms now',
      '50 AI credits / month',
      '1 connected account per platform',
      '2 team seats',
      '100 posts / month',
      '1 GB media storage',
      '2-week scheduling window',
      'Link in Bio builder',
      'Bulk scheduler',
      'Post templates & hashtag library',
      'Analytics dashboard',
    ],
    aiTools: [
      { name: 'Caption Generator', cost: 3 },
      { name: 'Hashtag Generator', cost: 2 },
      { name: 'Post Rewrite',      cost: 3 },
      { name: 'Viral Hook',        cost: 4 },
      { name: 'Thread Generator',  cost: 8 },
      { name: 'Content Repurposer',cost: 8 },
      { name: 'Post Score',        cost: 2 },
      { name: 'SM-Pulse',          cost: 10 },
      { name: 'SM-Radar',          cost: 10 },
      { name: 'Content Gap',       cost: 10 },
    ],
  },
  pro: {
    label: 'Pro',
    price: '$5/mo',
    color: 'border-amber-400',
    cardBg: 'bg-amber-50 dark:bg-amber-950/20',
    badgeBg: 'bg-amber-100 text-amber-700',
    badgeLabel: 'Most Popular',
    badge: 'bg-amber-400 text-black',
    icon: '⚡',
    credits: 500,
    creditBank: 750,
    platforms: 5,
    seats: 5,
    posts: 1000,
    storage: '10 GB',
    schedule: '1 month',
    analytics: '90 days',
    features: [
      'Everything in Free',
      '500 AI credits / month',
      '5 connected accounts per platform',
      '5 team seats',
      '1,000 posts / month',
      '10 GB media storage',
      '1-month scheduling window',
      '90-day analytics history',
      'AI Content Calendar (20 cr)',
      'AI Image Generation (25 cr)',
      'White Label add-on available',
    ],
    aiTools: [
      { name: 'Caption Generator',   cost: 3  },
      { name: 'Hashtag Generator',   cost: 2  },
      { name: 'Post Rewrite',        cost: 3  },
      { name: 'Viral Hook',          cost: 4  },
      { name: 'Thread Generator',    cost: 8  },
      { name: 'Content Repurposer',  cost: 8  },
      { name: 'Post Score',          cost: 2  },
      { name: 'SM-Pulse',            cost: 10 },
      { name: 'SM-Radar',            cost: 10 },
      { name: 'Content Gap',         cost: 10 },
      { name: 'AI Content Calendar', cost: 20 },
      { name: 'AI Image Generation', cost: 25 },
    ],
  },
  agency: {
    label: 'Agency',
    price: '$20/mo',
    color: 'border-purple-500',
    cardBg: 'bg-purple-50 dark:bg-purple-950/20',
    badgeBg: 'bg-purple-100 text-purple-700',
    badgeLabel: 'Power Users',
    badge: 'bg-purple-600 text-white',
    icon: '🏢',
    credits: 2000,
    creditBank: 3000,
    platforms: 10,
    seats: 15,
    posts: 5000,
    storage: '50 GB',
    schedule: '3 months',
    analytics: '6 months',
    features: [
      'Everything in Pro',
      '2,000 AI credits / month',
      '10 connected accounts per platform',
      '15 team seats',
      '5,000 posts / month',
      '50 GB media storage',
      '3-month scheduling window',
      '6-month analytics history',
      'Client workspace management',
      'PDF analytics reports',
      'White Label add-on available',
    ],
    aiTools: [
      { name: 'Caption Generator',   cost: 3  },
      { name: 'Hashtag Generator',   cost: 2  },
      { name: 'Post Rewrite',        cost: 3  },
      { name: 'Viral Hook',          cost: 4  },
      { name: 'Thread Generator',    cost: 8  },
      { name: 'Content Repurposer',  cost: 8  },
      { name: 'Post Score',          cost: 2  },
      { name: 'SM-Pulse',            cost: 10 },
      { name: 'SM-Radar',            cost: 10 },
      { name: 'Content Gap',         cost: 10 },
      { name: 'AI Content Calendar', cost: 20 },
      { name: 'AI Image Generation', cost: 25 },
    ],
  },
}

const STEPS = [
  { id: 1, label: 'Welcome'   },
  { id: 2, label: 'Your Plan' },
  { id: 3, label: 'About You' },
  { id: 4, label: 'Platforms' },
  { id: 5, label: 'Security'  },
  { id: 6, label: 'First Post'},
  { id: 7, label: "You're in!"},
]

function OnboardingInner() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [user, setUser] = useState<any>(null)
  const [step, setStep] = useState(1)
  const [displayName, setDisplayName] = useState('')
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'pro' | 'agency'>('free')
  const [useCase, setUseCase] = useState('')
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])
  const [firstPost, setFirstPost] = useState('')
  const [saving, setSaving] = useState(false)
  const [hasFinished, setHasFinished] = useState(false)
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'info' } | null>(null)

  // 2FA state
  const [mfaStep, setMfaStep] = useState<'idle' | 'enroll'>('idle')
  const [mfaQR, setMfaQR] = useState('')
  const [mfaSecret, setMfaSecret] = useState('')
  const [mfaEnrollId, setMfaEnrollId] = useState('')
  const [mfaCode, setMfaCode] = useState('')
  const [mfaLoading, setMfaLoading] = useState(false)
  const [mfaError, setMfaError] = useState('')
  const [mfaDone, setMfaDone] = useState(false)

  const showToast = (message: string, type: 'error' | 'info' = 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  useEffect(() => {
    const init = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) { router.push('/login'); return }
      setUser(authUser)
      setDisplayName(authUser.email?.split('@')[0] || '')

      // Load existing plan from user_settings if returning from Stripe
      const { data: settings } = await supabase
        .from('user_settings')
        .select('plan')
        .eq('user_id', authUser.id)
        .single()

      if (settings?.plan && settings.plan !== 'free') {
        setSelectedPlan(settings.plan as 'pro' | 'agency')
      }

      // Handle return from Stripe checkout
      const upgraded = searchParams.get('upgraded')
      const stepParam = searchParams.get('step')
      if (upgraded === 'true' && stepParam) {
        setStep(parseInt(stepParam))
      }
    }
    init()
  }, [router, searchParams])

  const planConfig = PLAN_DETAILS[selectedPlan]
  const maxPlatforms = planConfig.platforms

  const togglePlatform = (id: string) => {
    const platform = PLATFORMS.find(p => p.id === id)
    if (!platform?.available) return
    setSelectedPlatforms(prev => {
      if (prev.includes(id)) return prev.filter(p => p !== id)
      if (prev.length >= maxPlatforms) {
        showToast(`Your ${selectedPlan} plan supports up to ${maxPlatforms} connected account${maxPlatforms > 1 ? 's' : ''}`, 'info')
        return prev
      }
      return [...prev, id]
    })
  }

  const handlePlanCheckout = async (plan: 'pro' | 'agency') => {
    const priceId = plan === 'pro' ? STRIPE_PRO_PRICE_ID : STRIPE_AGENCY_PRICE_ID
    setCheckoutLoading(plan)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, fromOnboarding: true }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch {
      showToast('Checkout failed — please try again')
    } finally {
      setCheckoutLoading(null)
    }
  }

  const handleEnroll2FA = async () => {
    setMfaLoading(true); setMfaError('')
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' })
    if (error || !data) { setMfaError('Failed to start 2FA setup'); setMfaLoading(false); return }
    setMfaEnrollId(data.id)
    setMfaQR(data.totp.qr_code)
    setMfaSecret(data.totp.secret)
    setMfaStep('enroll')
    setMfaLoading(false)
  }

  const handleVerify2FA = async () => {
    if (mfaCode.length !== 6) { setMfaError('Enter the 6-digit code'); return }
    setMfaLoading(true); setMfaError('')
    const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId: mfaEnrollId })
    if (challengeError || !challenge) { setMfaError('Challenge failed — try again'); setMfaLoading(false); return }
    const { error } = await supabase.auth.mfa.verify({ factorId: mfaEnrollId, challengeId: challenge.id, code: mfaCode })
    if (error) { setMfaError('Incorrect code — try again'); setMfaLoading(false); return }
    setMfaDone(true)
    setMfaStep('idle')
    setMfaLoading(false)
  }

  const handleFinish = async () => {
    if (hasFinished) return // prevent double-invoke (React StrictMode / double-click)
    setHasFinished(true)
    setSaving(true)

    // Check if already completed (server-side guard against double award)
    const { data: currentSettings } = await supabase
      .from('user_settings')
      .select('onboarding_completed, ai_credits_remaining')
      .eq('user_id', user.id)
      .single()

    await supabase.from('profiles').update({
      full_name: displayName,
      display_name: displayName,
      onboarding_completed: true,
    }).eq('id', user.id)

    const upsertPayload: Record<string, any> = {
      user_id: user.id,
      display_name: displayName,
      use_case: useCase,
      default_platforms: selectedPlatforms,
      onboarding_completed: true,
    }

    // Only award onboarding credits once
    if (!currentSettings?.onboarding_completed) {
      const currentCredits = currentSettings?.ai_credits_remaining ?? 50
      upsertPayload.ai_credits_remaining = currentCredits + 50
    }

    await supabase.from('user_settings').upsert(upsertPayload, { onConflict: 'user_id' })

    if (firstPost.trim()) {
      await supabase.from('posts').insert({
        user_id: user.id,
        content: firstPost.trim(),
        platforms: selectedPlatforms,
        status: 'draft',
      })
    }

    // Award 50 bonus onboarding credits to earned_credits pool
    const { data: settingsNow } = await supabase
      .from('user_settings')
      .select('ai_credits_remaining, earned_credits')
      .eq('user_id', user.id)
      .single()

    const currentCredits = settingsNow?.ai_credits_remaining ?? 50
    const currentEarned  = settingsNow?.earned_credits        ?? 0

    await supabase.from('user_settings').update({
      ai_credits_remaining: currentCredits + 50,
      earned_credits:       currentEarned + 50,
    }).eq('user_id', user.id)

    setSaving(false)
    // Use full page reload so WorkspaceContext re-fetches fresh credits from DB
    // (Next.js router.push reuses the cached context and may show stale credits)
    window.location.href = '/dashboard?welcome=1'
  }

  const progress = ((step - 1) / (STEPS.length - 1)) * 100

  const PlanBadge = () => (
    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${planConfig.badge}`}>
      {planConfig.icon} {planConfig.label}
    </span>
  )

  return (
    <div className="min-h-screen bg-theme flex flex-col">

      <div className="bg-surface border-b border-theme px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-black rounded-lg flex items-center justify-center text-white text-sm font-bold">S</div>
          <span className="font-bold text-base tracking-tight">SocialMate</span>
          {step > 2 && <PlanBadge />}
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-gray-400 dark:text-gray-500 font-semibold">Step {step} of {STEPS.length}</span>
          <button
            onClick={async () => {
              if (user) await supabase.from('profiles').update({ onboarding_completed: true }).eq('id', user.id)
              router.push('/dashboard')
            }}
            className="text-xs text-gray-400 dark:text-gray-500 hover:text-black transition-colors font-semibold">
            Skip setup →
          </button>
        </div>
      </div>

      <div className="w-full bg-gray-100 dark:bg-gray-800 h-1">
        <div className="bg-black h-1 transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>

      <div className="flex items-center justify-center gap-1 py-4 overflow-x-auto px-4">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center gap-1 flex-shrink-0">
            <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              step === s.id ? 'bg-black text-white' :
              step > s.id  ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400' :
              'text-gray-300 dark:text-gray-600'
            }`}>
              <span>{step > s.id ? '✓' : s.id}</span>
              <span className="hidden md:inline">{s.label}</span>
            </div>
            {i < STEPS.length - 1 && <div className={`w-4 h-px ${step > s.id ? 'bg-gray-300 dark:bg-gray-600' : 'bg-gray-100 dark:bg-gray-700'}`} />}
          </div>
        ))}
      </div>

      <div className="flex-1 flex items-start justify-center px-4 pb-12 pt-2">
        <div className="w-full max-w-2xl">

          {/* ── STEP 1 — WELCOME ── */}
          {step === 1 && (
            <div className="bg-surface border border-theme rounded-3xl p-8 md:p-10">
              <div className="text-center mb-8">
                <div className="text-5xl mb-4">👋</div>
                <h1 className="text-3xl font-extrabold tracking-tight mb-2">Welcome to SocialMate</h1>
                <p className="text-gray-400 dark:text-gray-500 text-sm">Let's get you set up in under 3 minutes.</p>
              </div>

              <div className="mb-6">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide block mb-2">What should we call you?</label>
                <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)}
                  placeholder="Your name or brand..."
                  onKeyDown={e => e.key === 'Enter' && displayName.trim() && setStep(2)}
                  className="w-full px-4 py-3 text-lg font-semibold text-center border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 rounded-2xl focus:outline-none focus:border-black transition-all"
                  autoFocus />
              </div>

              <div className="bg-black rounded-2xl p-6 mb-6 text-white">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">What you get — free, forever</p>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 mb-4">
                  {[
                    '4 live platforms now',
                    '50 AI credits / month',
                    'Bulk Scheduler',
                    'Link in Bio page',
                    '2 team seats',
                    'Analytics dashboard',
                    'Post templates',
                    'Hashtag library',
                    'Media library (1 GB)',
                    '100 posts / month',
                  ].map(f => (
                    <div key={f} className="flex items-center gap-2 text-xs text-gray-300 dark:text-gray-400">
                      <span className="text-green-400 font-bold flex-shrink-0">✓</span>{f}
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-700 pt-4">
                  <p className="text-xs text-gray-400 dark:text-gray-500">Need more? Choose Pro or Agency on the next step — or upgrade anytime later.</p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <span className="text-xl">⚡</span>
                  <div>
                    <p className="text-xs font-extrabold text-blue-800 mb-1">Complete setup and earn 50 bonus AI credits</p>
                    <p className="text-xs text-blue-600 leading-relaxed">Finish all setup steps and they'll go straight into your credit bank. Refer a friend after and you both earn 25 more.</p>
                  </div>
                </div>
              </div>

              <button onClick={() => displayName.trim() ? setStep(2) : showToast('Enter your name to continue')}
                className="w-full py-3.5 bg-black text-white text-sm font-bold rounded-2xl hover:opacity-80 transition-all">
                Let's go →
              </button>
            </div>
          )}

          {/* ── STEP 2 — PLAN SELECTION ── */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <div className="text-5xl mb-3">📦</div>
                <h2 className="text-2xl font-extrabold tracking-tight mb-1">Choose your plan</h2>
                <p className="text-gray-400 dark:text-gray-500 text-sm">Start free or go straight to Pro or Agency — no pressure, upgrade anytime.</p>
              </div>

              {(['free', 'pro', 'agency'] as const).map(p => {
                const cfg = PLAN_DETAILS[p]
                const isSelected = selectedPlan === p
                return (
                  <div key={p} className={`border-2 rounded-2xl p-6 transition-all cursor-pointer ${cfg.color} ${isSelected ? cfg.cardBg : 'bg-surface hover:opacity-90'}`}
                    onClick={() => { if (p === 'free') setSelectedPlan('free') }}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{cfg.icon}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-base font-extrabold">{cfg.label}</p>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${cfg.badgeBg}`}>{cfg.badgeLabel}</span>
                          </div>
                          <p className="text-xl font-extrabold">{cfg.price}</p>
                        </div>
                      </div>
                      {isSelected && p === 'free' && (
                        <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-full">Selected</span>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-3 mb-4 text-center">
                      {[
                        { label: 'AI Credits',  value: cfg.credits.toLocaleString() + '/mo' },
                        { label: 'Platforms',   value: cfg.platforms + ' accounts'           },
                        { label: 'Team Seats',  value: cfg.seats + ' seats'                  },
                      ].map(stat => (
                        <div key={stat.label} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-2">
                          <p className="text-xs font-extrabold">{stat.value}</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">{stat.label}</p>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 mb-4">
                      {cfg.features.slice(0, 6).map(f => (
                        <div key={f} className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                          <span className="text-green-500 font-bold flex-shrink-0">✓</span>{f}
                        </div>
                      ))}
                    </div>

                    {p === 'free' && (
                      <button
                        onClick={() => { setSelectedPlan('free'); setStep(3) }}
                        className="w-full py-2.5 border-2 border-emerald-500 text-emerald-700 text-sm font-bold rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-all">
                        Continue with Free →
                      </button>
                    )}
                    {p === 'pro' && (
                      <button
                        onClick={() => handlePlanCheckout('pro')}
                        disabled={checkoutLoading === 'pro'}
                        className="w-full py-2.5 bg-amber-400 hover:bg-amber-500 text-black text-sm font-bold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                        {checkoutLoading === 'pro' ? (
                          <><div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />Processing...</>
                        ) : 'Start Pro — $5/month →'}
                      </button>
                    )}
                    {p === 'agency' && (
                      <button
                        onClick={() => handlePlanCheckout('agency')}
                        disabled={checkoutLoading === 'agency'}
                        className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                        {checkoutLoading === 'agency' ? (
                          <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Processing...</>
                        ) : 'Start Agency — $20/month →'}
                      </button>
                    )}
                  </div>
                )
              })}

              <div className="bg-surface border border-theme rounded-2xl p-5">
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">All AI tools included — every plan</p>
                <div className="grid grid-cols-2 gap-2">
                  {PLAN_DETAILS.free.aiTools.map(tool => (
                    <div key={tool.name} className="flex items-center justify-between text-xs py-1.5 border-b border-gray-50 dark:border-gray-800 last:border-0">
                      <span className="text-gray-700 dark:text-gray-300 font-semibold">{tool.name}</span>
                      <span className="text-gray-400 dark:text-gray-500 font-bold">{tool.cost} cr</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">Pro & Agency also unlock AI Content Calendar (20 cr) and AI Image Generation (25 cr).</p>
              </div>

              <button onClick={() => setStep(1)}
                className="w-full py-2.5 border border-gray-200 dark:border-gray-700 text-sm font-semibold rounded-2xl hover:border-gray-400 transition-all text-gray-500 dark:text-gray-400">
                ← Back
              </button>
            </div>
          )}

          {/* ── STEP 3 — USE CASE ── */}
          {step === 3 && (
            <div className="bg-surface border border-theme rounded-3xl p-8 md:p-10">
              {searchParams.get('upgraded') === 'true' && (
                <div className="bg-green-50 border border-green-200 rounded-2xl px-4 py-3 mb-6 flex items-center gap-3">
                  <span className="text-xl">🎉</span>
                  <div>
                    <p className="text-sm font-extrabold text-green-700">Payment confirmed — welcome to {planConfig.label}!</p>
                    <p className="text-xs text-green-600 mt-0.5">Your {planConfig.credits.toLocaleString()} AI credits and all {planConfig.label} features are now active.</p>
                  </div>
                </div>
              )}
              <div className="text-center mb-8">
                <div className="text-5xl mb-4">🎯</div>
                <h2 className="text-2xl font-extrabold tracking-tight mb-2">How will you use SocialMate?</h2>
                <p className="text-gray-400 dark:text-gray-500 text-sm">Helps us personalize your dashboard and tips</p>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-8">
                {USE_CASES.map(uc => (
                  <button key={uc.id} onClick={() => setUseCase(uc.id)}
                    className={`p-4 rounded-2xl border-2 text-left transition-all ${
                      useCase === uc.id ? 'border-black bg-black/5 dark:bg-white/5' : 'border-gray-100 dark:border-gray-700 hover:border-gray-300'
                    }`}>
                    <div className="text-2xl mb-2">{uc.icon}</div>
                    <p className="text-sm font-bold">{uc.label}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{uc.desc}</p>
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(2)}
                  className="px-6 py-3 border border-gray-200 dark:border-gray-700 text-sm font-semibold rounded-2xl hover:border-gray-400 transition-all">
                  ← Back
                </button>
                <button onClick={() => useCase ? setStep(4) : showToast('Pick an option to continue')}
                  className="flex-1 py-3 bg-black text-white text-sm font-bold rounded-2xl hover:opacity-80 transition-all">
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 4 — PLATFORMS ── */}
          {step === 4 && (
            <div className="bg-surface border border-theme rounded-3xl p-8 md:p-10">
              <div className="text-center mb-6">
                <div className="text-5xl mb-4">📱</div>
                <h2 className="text-2xl font-extrabold tracking-tight mb-2">Which platforms do you use?</h2>
                <p className="text-gray-400 dark:text-gray-500 text-sm">
                  Your <span className={`font-bold ${selectedPlan === 'agency' ? 'text-purple-600' : 'text-black dark:text-white'}`}>{planConfig.label}</span> plan supports {maxPlatforms} connected account{maxPlatforms > 1 ? 's' : ''} · 4 live now · 12 more coming soon
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3 mb-5 flex items-center gap-3">
                <span>⚡</span>
                <p className="text-xs text-blue-700 font-semibold">Connect at least one platform to activate your {planConfig.credits.toLocaleString()} AI credits</p>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-4">
                {PLATFORMS.map(p => {
                  const isSelected = selectedPlatforms.includes(p.id)
                  const isAtLimit = selectedPlatforms.length >= maxPlatforms && !isSelected
                  return (
                    <button key={p.id}
                      onClick={() => togglePlatform(p.id)}
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                        !p.available || isAtLimit
                          ? 'border-gray-50 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 opacity-40 cursor-not-allowed'
                          : isSelected
                          ? 'border-black bg-black/5 dark:bg-white/5'
                          : 'border-gray-100 dark:border-gray-700 hover:border-gray-300'
                      }`}>
                      <span className="text-xl">{p.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold truncate">{p.label}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">{p.available ? p.desc : 'Coming soon'}</p>
                      </div>
                      {isSelected && p.available && <span className="text-black font-bold text-sm flex-shrink-0">✓</span>}
                    </button>
                  )
                })}
              </div>

              <p className="text-xs text-center text-gray-400 dark:text-gray-500 mb-6">
                {selectedPlatforms.length} / {maxPlatforms} accounts selected
              </p>

              <div className="flex gap-3">
                <button onClick={() => setStep(3)}
                  className="px-6 py-3 border border-gray-200 dark:border-gray-700 text-sm font-semibold rounded-2xl hover:border-gray-400 transition-all">
                  ← Back
                </button>
                {selectedPlatforms.length > 0 ? (
                  <button onClick={() => setStep(5)}
                    className="flex-1 py-3 bg-black text-white text-sm font-bold rounded-2xl hover:opacity-80 transition-all">
                    Continue →
                  </button>
                ) : (
                  <button onClick={() => setStep(5)}
                    className="flex-1 py-3 border border-gray-200 dark:border-gray-700 text-sm font-semibold rounded-2xl hover:border-gray-400 transition-all text-gray-500 dark:text-gray-400">
                    Skip for now →
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ── STEP 5 — SECURITY / 2FA ── */}
          {step === 5 && (
            <div className="bg-surface border border-theme rounded-3xl p-8 md:p-10">
              <div className="text-center mb-6">
                <div className="text-5xl mb-4">🔐</div>
                <h2 className="text-2xl font-extrabold tracking-tight mb-2">Secure your account</h2>
                <p className="text-gray-400 dark:text-gray-500 text-sm">Two-factor authentication adds a second layer of protection. Takes 60 seconds.</p>
              </div>

              {mfaDone ? (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center mb-6">
                  <div className="text-4xl mb-3">✅</div>
                  <p className="text-sm font-extrabold text-green-700 mb-1">2FA enabled — your account is secured</p>
                  <p className="text-xs text-green-600">You'll need your authenticator app each time you log in from a new device.</p>
                </div>
              ) : mfaStep === 'idle' ? (
                <div className="space-y-4 mb-6">
                  <div className="bg-gray-50 dark:bg-gray-800 border border-theme rounded-2xl p-5">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white text-lg flex-shrink-0">🛡️</div>
                      <div>
                        <p className="text-sm font-extrabold mb-1">Why enable 2FA?</p>
                        <div className="space-y-1">
                          {[
                            'Protects your connected social accounts',
                            'Blocks unauthorized logins even if password is leaked',
                            'Required for Agency plan team security compliance',
                          ].map(r => (
                            <div key={r} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                              <span className="text-green-500 font-bold flex-shrink-0">✓</span>{r}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <button onClick={handleEnroll2FA} disabled={mfaLoading}
                    className="w-full py-3 bg-black text-white text-sm font-bold rounded-2xl hover:opacity-80 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                    {mfaLoading ? (
                      <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Setting up...</>
                    ) : '🔐 Enable Two-Factor Authentication'}
                  </button>
                </div>
              ) : (
                <div className="space-y-5 mb-6">
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
                      onChange={e => setMfaCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="000000"
                      className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 rounded-xl px-4 py-3 text-sm text-center font-mono tracking-widest outline-none focus:border-black transition-all" />
                    {mfaError && <p className="text-xs text-red-500 font-semibold mt-2">❌ {mfaError}</p>}
                  </div>
                  <button onClick={handleVerify2FA} disabled={mfaLoading || mfaCode.length !== 6}
                    className="w-full py-3 bg-black text-white text-sm font-bold rounded-2xl hover:opacity-80 transition-all disabled:opacity-40 flex items-center justify-center gap-2">
                    {mfaLoading ? (
                      <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Verifying...</>
                    ) : 'Verify & Secure Account →'}
                  </button>
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={() => setStep(4)}
                  className="px-6 py-3 border border-gray-200 dark:border-gray-700 text-sm font-semibold rounded-2xl hover:border-gray-400 transition-all">
                  ← Back
                </button>
                <button onClick={() => setStep(6)}
                  className={`flex-1 py-3 text-sm font-bold rounded-2xl transition-all ${
                    mfaDone
                      ? 'bg-black text-white hover:opacity-80'
                      : 'border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-400'
                  }`}>
                  {mfaDone ? 'Continue →' : 'Skip for now →'}
                </button>
              </div>
              {!mfaDone && (
                <p className="text-xs text-center text-gray-400 dark:text-gray-500 mt-2">You can enable 2FA anytime in Settings → Security</p>
              )}
            </div>
          )}

          {/* ── STEP 6 — FIRST POST ── */}
          {step === 6 && (
            <div className="bg-surface border border-theme rounded-3xl p-8 md:p-10">
              <div className="text-center mb-6">
                <div className="text-5xl mb-4">✏️</div>
                <h2 className="text-2xl font-extrabold tracking-tight mb-2">Write your first post</h2>
                <p className="text-gray-400 dark:text-gray-500 text-sm">Publish or schedule this to unlock your {planConfig.credits.toLocaleString()} AI credits</p>
              </div>

              <div className="bg-green-50 border border-green-100 rounded-2xl px-4 py-3 mb-5">
                <div className="flex items-center gap-2 mb-2">
                  <span>⚡</span>
                  <p className="text-xs text-green-700 font-semibold">Credit unlock checklist</p>
                </div>
                <div className="flex items-center gap-4 flex-wrap">
                  {[
                    { label: 'Email verified',     done: true                         },
                    { label: 'Platform connected', done: selectedPlatforms.length > 0 },
                    { label: 'First post',         done: firstPost.trim().length > 0  },
                  ].map(item => (
                    <div key={item.label} className="flex items-center gap-1.5">
                      <span className={`text-xs font-bold ${item.done ? 'text-green-600' : 'text-gray-400 dark:text-gray-500'}`}>{item.done ? '✓' : '○'}</span>
                      <span className={`text-xs ${item.done ? 'text-green-700 font-semibold' : 'text-gray-400 dark:text-gray-500'}`}>{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                {selectedPlatforms.length > 0 && (
                  <div className="flex items-center gap-1 flex-wrap mb-3">
                    {selectedPlatforms.slice(0, 6).map(p => {
                      const pl = PLATFORMS.find(pl => pl.id === p)
                      return pl ? <span key={p} className="text-lg">{pl.icon}</span> : null
                    })}
                    {selectedPlatforms.length > 6 && <span className="text-xs text-gray-400 dark:text-gray-500">+{selectedPlatforms.length - 6} more</span>}
                  </div>
                )}
                <textarea value={firstPost} onChange={e => setFirstPost(e.target.value)}
                  placeholder={`Write something for your audience...\n\nTip: Use [brackets] for fill-in-the-blank sections`}
                  rows={5}
                  className="w-full px-4 py-3 text-sm border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 rounded-xl focus:outline-none focus:border-black transition-all resize-none"
                  autoFocus />
                <div className="flex items-center justify-between mt-1.5">
                  <p className="text-xs text-gray-400 dark:text-gray-500">Saved as a draft — edit before publishing</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{firstPost.length} chars</p>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-6">
                <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-2">Need inspiration?</p>
                <div className="space-y-1.5">
                  {[
                    "Excited to share something new with you all 🎉 [describe what's coming]",
                    "Here's what I've been working on lately: [project or update]",
                    "Quick tip for [your audience]: [share a valuable insight]",
                    "Something I wish I knew earlier about [your niche]: [insight]",
                  ].map(idea => (
                    <button key={idea} onClick={() => setFirstPost(idea)}
                      className="w-full text-left text-xs text-gray-500 dark:text-gray-400 hover:text-black p-2 rounded-lg hover:bg-white dark:hover:bg-gray-700 transition-all">
                      → {idea.length > 70 ? idea.slice(0, 70) + '...' : idea}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(5)}
                  className="px-6 py-3 border border-gray-200 dark:border-gray-700 text-sm font-semibold rounded-2xl hover:border-gray-400 transition-all">
                  ← Back
                </button>
                {firstPost.trim() ? (
                  <button onClick={() => setStep(7)}
                    className="flex-1 py-3 bg-black text-white text-sm font-bold rounded-2xl hover:opacity-80 transition-all">
                    Save Draft & Continue →
                  </button>
                ) : (
                  <button onClick={() => setStep(7)}
                    className="flex-1 py-3 border border-gray-200 dark:border-gray-700 text-sm font-semibold rounded-2xl hover:border-gray-400 transition-all text-gray-500 dark:text-gray-400">
                    Skip for now →
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ── STEP 7 — DONE ── */}
          {step === 7 && (
            <div className="bg-surface border border-theme rounded-3xl p-8 md:p-10 text-center">
              <div className="text-6xl mb-4">🚀</div>
              <h2 className="text-3xl font-extrabold tracking-tight mb-2">
                You're all set, {displayName || 'friend'}!
              </h2>
              <p className="text-gray-400 dark:text-gray-500 mb-2 text-sm">Your {planConfig.label} account is ready.</p>
              <div className="flex justify-center mb-6"><PlanBadge /></div>

              <div className={`rounded-2xl p-5 mb-6 text-left ${
                firstPost.trim() && selectedPlatforms.length > 0
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-amber-50 border border-amber-100'
              }`}>
                {firstPost.trim() && selectedPlatforms.length > 0 ? (
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">⚡</span>
                    <div>
                      <p className="text-sm font-extrabold text-green-700">50 bonus AI credits added to your bank!</p>
                      <p className="text-xs text-green-600 mt-0.5">Refer a friend and you both earn another 25 credits on top.</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3">
                    <span className="text-2xl mt-0.5">⚡</span>
                    <div>
                      <p className="text-sm font-extrabold text-amber-700">Credits activate on your first post</p>
                      <p className="text-xs text-amber-600 mt-0.5">
                        {!selectedPlatforms.length
                          ? 'Connect a platform and publish one post from the dashboard to unlock your credits.'
                          : 'Publish or schedule your first post from the dashboard to unlock your credits.'}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {mfaDone && (
                <div className="bg-green-50 border border-green-100 rounded-2xl px-4 py-3 mb-4 flex items-center gap-2">
                  <span>🔐</span>
                  <p className="text-xs text-green-700 font-semibold">Two-factor authentication is enabled — your account is secured.</p>
                </div>
              )}

              <div className="space-y-3 mb-8 text-left">
                {[
                  { icon: '✏️', title: 'Compose a post',        desc: 'Write, schedule, and use AI tools',           href: '/compose',          cta: 'Start writing'   },
                  { icon: '🤖', title: 'Explore AI Features',   desc: `${planConfig.aiTools.length} tools — captions, hooks, scoring & more`, href: '/ai-features', cta: 'Explore tools'   },
                  { icon: '📆', title: 'Bulk Scheduler',        desc: 'Plan a whole week of content at once',         href: '/bulk-scheduler',   cta: 'Open scheduler'  },
                  { icon: '🔗', title: 'Set up Link in Bio',    desc: 'Your free bio page — no Linktree needed',      href: '/link-in-bio',      cta: 'Build page'      },
                  { icon: '📊', title: 'Analytics',             desc: `Up to ${planConfig.analytics} of history`,    href: '/analytics',        cta: 'View analytics'  },
                  ...(selectedPlatforms.length === 0 ? [
                    { icon: '📱', title: 'Connect a Platform',  desc: 'Activate your AI credits',                    href: '/accounts',         cta: 'Connect now'     },
                  ] : []),
                ].map(action => (
                  <div key={action.title}
                    className="flex items-center gap-4 p-4 border border-theme rounded-2xl hover:border-gray-300 dark:hover:border-gray-600 transition-all group">
                    <div className="w-10 h-10 bg-gray-50 dark:bg-gray-800 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                      {action.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold">{action.title}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">{action.desc}</p>
                    </div>
                    <Link href={action.href}
                      className="text-xs font-bold text-gray-400 dark:text-gray-500 group-hover:text-black transition-colors flex-shrink-0">
                      {action.cta} →
                    </Link>
                  </div>
                ))}
              </div>

              <button onClick={handleFinish} disabled={saving}
                className="w-full py-4 bg-black text-white text-sm font-bold rounded-2xl hover:opacity-80 transition-all disabled:opacity-50">
                {saving ? 'Setting up your account...' : 'Go to Dashboard →'}
              </button>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-4">
                Everything can be changed anytime in <Link href="/settings" className="underline">Settings</Link>
              </p>
            </div>
          )}

        </div>
      </div>

      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl text-sm font-semibold shadow-lg ${
          toast.type === 'info' ? 'bg-gray-800 text-white' : 'bg-red-500 text-white'
        }`}>
          {toast.type === 'info' ? '💡' : '❌'} {toast.message}
        </div>
      )}
    </div>
  )
}

export default function Onboarding() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-theme flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black" />
      </div>
    }>
      <OnboardingInner />
    </Suspense>
  )
}