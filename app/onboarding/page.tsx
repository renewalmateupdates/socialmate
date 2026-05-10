'use client'
import { useEffect, useState, useRef, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

const LIVE_PLATFORMS = [
  { id: 'bluesky',  label: 'Bluesky',     icon: '🦋', desc: 'Decentralized social — great for builders & creators', badge: '✨ Easiest to start' },
  { id: 'mastodon', label: 'Mastodon',     icon: '🐘', desc: 'Federated network — engaged, ad-free community',       badge: null },
  { id: 'discord',  label: 'Discord',      icon: '💬', desc: 'Post announcements to your server channels',           badge: null },
  { id: 'telegram', label: 'Telegram',     icon: '✈️', desc: 'Broadcast to your Telegram channel or group',          badge: null },
  { id: 'twitter',  label: 'X / Twitter',  icon: '🐦', desc: '280 characters — $0.01/tweet on free plan',           badge: null },
]

const CHAR_LIMITS: Record<string, number> = {
  bluesky: 300, mastodon: 500, discord: 2000, telegram: 4096, twitter: 280,
}

const STRIPE_PRO_PRICE_ID    = 'price_1T9S2v7OMwDowUuULHznqUD5'
const STRIPE_AGENCY_PRICE_ID = 'price_1TFMHp7OMwDowUuUgeLAeJNY'

const STEPS = [
  { id: 1, label: 'Welcome'  },
  { id: 2, label: 'Platform' },
  { id: 3, label: 'Connect'  },
  { id: 4, label: '5 Posts'  },
  { id: 5, label: "You're in!" },
]

function generateStarterPosts(topic: string): string[] {
  const t = topic.trim() || 'my journey'
  return [
    `Hot take: Most people approach ${t} completely wrong. Here's what actually works:\n\n[share your take]`,
    `3 things I wish I knew when I started with ${t}:\n\n1. [lesson one]\n2. [lesson two]\n3. [lesson three]`,
    `The biggest mistake I see people make with ${t}: [describe it].\n\nHere's what to do instead: [your solution]`,
    `Quick ${t} tip for today:\n\n[your tip here]\n\nSave this for when you need it. 💡`,
    `Real talk — ${t} is harder than people say. But here's the one thing that changed everything for me:\n\n[your insight]`,
  ]
}

function OnboardingInner() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [user, setUser] = useState<any>(null)
  const [step, setStep] = useState(1)
  const [displayName, setDisplayName] = useState('')
  const [selectedPlatform, setSelectedPlatform] = useState('')
  const [topic, setTopic] = useState('')
  const [starterPosts, setStarterPosts] = useState<string[]>([])
  const [postsGenerated, setPostsGenerated] = useState(false)
  const [saving, setSaving] = useState(false)
  const [hasFinished, setHasFinished] = useState(false)
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null)
  const [upgradedPlan, setUpgradedPlan] = useState<'free' | 'pro' | 'agency'>('free')
  const [couponInput, setCouponInput] = useState('')
  const [couponValidating, setCouponValidating] = useState(false)
  const [couponApplied, setCouponApplied] = useState<{ id: string; code: string; discount_type: string; discount_value: number } | null>(null)
  const [couponError, setCouponError] = useState<string | null>(null)
  const [connectionDetected, setConnectionDetected] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'info' } | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

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

      const { data: settings } = await supabase
        .from('user_settings')
        .select('plan')
        .eq('user_id', authUser.id)
        .single()

      if (settings?.plan && settings.plan !== 'free') {
        setUpgradedPlan(settings.plan as 'pro' | 'agency')
      }

      const upgraded = searchParams.get('upgraded')
      const stepParam = searchParams.get('step')
      if (upgraded === 'true' && stepParam) {
        setUpgradedPlan('pro')
        setStep(parseInt(stepParam))
      }
    }
    init()
  }, [router, searchParams])

  // Poll for connected account while on step 3
  useEffect(() => {
    if (step !== 3 || !selectedPlatform) return
    const check = async () => {
      try {
        const res = await fetch('/api/accounts/connected')
        if (!res.ok) return
        const data = await res.json()
        if ((data.platforms as string[]).includes(selectedPlatform)) {
          setConnectionDetected(true)
          if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null }
          setTimeout(() => setStep(4), 1500)
        }
      } catch {}
    }
    pollRef.current = setInterval(check, 3000)
    const timeout = setTimeout(() => {
      if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null }
    }, 90000)
    return () => { clearInterval(pollRef.current!); clearTimeout(timeout) }
  }, [step, selectedPlatform])

  async function applyCoupon() {
    if (!couponInput.trim()) return
    setCouponValidating(true); setCouponError(null); setCouponApplied(null)
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponInput.trim() }),
      })
      const json = await res.json()
      if (json.valid) { setCouponApplied(json.coupon) }
      else { setCouponError(json.error || 'Invalid code') }
    } catch { setCouponError('Could not validate code') }
    finally { setCouponValidating(false) }
  }

  const handlePlanCheckout = async (plan: 'pro' | 'agency') => {
    const priceId = plan === 'pro' ? STRIPE_PRO_PRICE_ID : STRIPE_AGENCY_PRICE_ID
    setCheckoutLoading(plan)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId,
          fromOnboarding: true,
          returnStep: 5,
          ...(couponApplied ? { coupon_code: couponApplied.code } : {}),
        }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch { showToast('Checkout failed — please try again') }
    finally { setCheckoutLoading(null) }
  }

  const handleFinish = async () => {
    if (hasFinished) return
    setHasFinished(true)
    setSaving(true)

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

    const platforms = selectedPlatform ? [selectedPlatform] : []
    const upsertPayload: Record<string, any> = {
      user_id: user.id,
      display_name: displayName,
      use_case: 'creator',
      default_platforms: platforms,
      onboarding_completed: true,
    }

    if (!currentSettings?.onboarding_completed) {
      upsertPayload.ai_credits_remaining = (currentSettings?.ai_credits_remaining ?? 50) + 50
    }

    await supabase.from('user_settings').upsert(upsertPayload, { onConflict: 'user_id' })

    const postsToSave = starterPosts.filter(p => p.trim())
    if (postsToSave.length > 0) {
      await supabase.from('posts').insert(
        postsToSave.map(content => ({
          user_id: user.id,
          content: content.trim(),
          platforms,
          status: 'draft',
        }))
      )
    }

    const { data: settingsNow } = await supabase
      .from('user_settings')
      .select('ai_credits_remaining, earned_credits')
      .eq('user_id', user.id)
      .single()

    await supabase.from('user_settings').update({
      ai_credits_remaining: (settingsNow?.ai_credits_remaining ?? 50) + 50,
      earned_credits:       (settingsNow?.earned_credits ?? 0) + 50,
    }).eq('user_id', user.id)

    setSaving(false)
    window.location.href = '/dashboard?welcome=1'
  }

  const progress = ((step - 1) / (STEPS.length - 1)) * 100
  const platformData = LIVE_PLATFORMS.find(p => p.id === selectedPlatform)
  const charLimit = CHAR_LIMITS[selectedPlatform] ?? 300
  const isUpgraded = upgradedPlan !== 'free' || searchParams.get('upgraded') === 'true'

  return (
    <div className="min-h-dvh bg-theme flex flex-col">

      {/* Header */}
      <div className="bg-surface border-b border-theme px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="SocialMate" className="w-7 h-7 rounded-lg" />
          <span className="font-bold text-base tracking-tight">SocialMate</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-gray-400 dark:text-gray-500 font-semibold">Step {step} of {STEPS.length}</span>
          <button
            onClick={async () => {
              if (user) await supabase.from('profiles').update({ onboarding_completed: true }).eq('id', user.id)
              router.push('/dashboard')
            }}
            className="text-xs text-gray-400 dark:text-gray-500 hover:text-black dark:hover:text-white transition-colors font-semibold">
            Skip setup →
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-100 dark:bg-gray-800 h-1">
        <div className="bg-black h-1 transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>

      {/* Step pills */}
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
            {i < STEPS.length - 1 && (
              <div className={`w-4 h-px ${step > s.id ? 'bg-gray-300 dark:bg-gray-600' : 'bg-gray-100 dark:bg-gray-800'}`} />
            )}
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
                <p className="text-gray-400 dark:text-gray-500 text-sm">Set up in under 2 minutes.</p>
              </div>

              <div className="mb-6">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide block mb-2">What should we call you?</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  placeholder="Your name or brand..."
                  onKeyDown={e => e.key === 'Enter' && displayName.trim() && setStep(2)}
                  className="w-full px-4 py-3 text-lg font-semibold text-center border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 rounded-2xl focus:outline-none focus:border-black transition-all"
                  autoFocus
                />
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-5 mb-5">
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Here's what you'll do:</p>
                <div className="space-y-2.5">
                  {[
                    ['📱', 'Pick your main platform'],
                    ['🔗', 'Connect your account'],
                    ['✏️', 'Get 5 posts ready to go'],
                    ['🚀', 'Hit the dashboard'],
                  ].map(([icon, label]) => (
                    <div key={label} className="flex items-center gap-3">
                      <span className="text-base">{icon}</span>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900 rounded-2xl p-4 mb-5">
                <div className="flex items-start gap-3">
                  <span className="text-xl">⚡</span>
                  <div>
                    <p className="text-xs font-extrabold text-blue-800 dark:text-blue-300 mb-1">Complete setup → earn 50 bonus AI credits</p>
                    <p className="text-xs text-blue-600 dark:text-blue-400">Refer a friend after and you both earn 25 more.</p>
                  </div>
                </div>
              </div>

              <div className="border border-gray-100 dark:border-gray-700 rounded-2xl p-4 mb-6 flex items-start gap-3">
                <span className="text-base flex-shrink-0">❤️</span>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  <span className="font-bold text-gray-800 dark:text-gray-200">2% of every subscription goes to SM-Give</span> — our built-in charity initiative. No ads, no selling your data.
                </p>
              </div>

              <button
                onClick={() => displayName.trim() ? setStep(2) : showToast('Enter your name to continue')}
                className="w-full py-3.5 bg-black text-white text-sm font-bold rounded-2xl hover:opacity-80 transition-all">
                Let's go →
              </button>
            </div>
          )}

          {/* ── STEP 2 — PICK PLATFORM ── */}
          {step === 2 && (
            <div className="bg-surface border border-theme rounded-3xl p-8 md:p-10">
              <div className="text-center mb-8">
                <div className="text-5xl mb-4">📱</div>
                <h2 className="text-2xl font-extrabold tracking-tight mb-2">Which platform do you mainly post on?</h2>
                <p className="text-gray-400 dark:text-gray-500 text-sm">Pick one to start — you can connect more later from Settings.</p>
              </div>

              <div className="space-y-3 mb-8">
                {LIVE_PLATFORMS.map(p => (
                  <button
                    key={p.id}
                    onClick={() => { setSelectedPlatform(p.id); setStep(3) }}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-gray-100 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-500 text-left transition-all group">
                    <span className="text-2xl flex-shrink-0">{p.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-bold">{p.label}</p>
                        {p.badge && (
                          <span className="text-[10px] font-extrabold px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 rounded-full leading-none flex-shrink-0">{p.badge}</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 dark:text-gray-500">{p.desc}</p>
                    </div>
                    <span className="text-gray-300 dark:text-gray-600 group-hover:text-black dark:group-hover:text-white transition-colors text-sm font-bold flex-shrink-0">→</span>
                  </button>
                ))}
              </div>

              <button onClick={() => setStep(1)}
                className="w-full py-2.5 border border-gray-200 dark:border-gray-700 text-sm font-semibold rounded-2xl hover:border-gray-400 transition-all text-gray-500 dark:text-gray-400">
                ← Back
              </button>
            </div>
          )}

          {/* ── STEP 3 — CONNECT ── */}
          {step === 3 && (
            <div className="bg-surface border border-theme rounded-3xl p-8 md:p-10">
              <div className="text-center mb-8">
                <div className="text-5xl mb-4">{platformData?.icon || '🔗'}</div>
                <h2 className="text-2xl font-extrabold tracking-tight mb-2">
                  Connect your {platformData?.label} account
                </h2>
                {connectionDetected ? (
                  <p className="text-green-600 dark:text-green-400 font-bold text-sm">✓ Account connected — moving you along…</p>
                ) : (
                  <p className="text-gray-400 dark:text-gray-500 text-sm">Keep this tab open and come back when done.</p>
                )}
              </div>

              {connectionDetected ? (
                <div className="flex justify-center py-4">
                  <div className="w-6 h-6 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                </div>
              ) : (
                <>
                  <a
                    href="/accounts"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-4 mb-3 bg-black text-white text-sm font-bold rounded-2xl hover:opacity-80 transition-all">
                    🔗 Connect {platformData?.label} →
                  </a>
                  <p className="text-xs text-center text-gray-400 dark:text-gray-500 mb-6">
                    Opens accounts page in a new tab · come back here after connecting
                  </p>

                  <div className="flex gap-3">
                    <button onClick={() => setStep(2)}
                      className="px-6 py-3 border border-gray-200 dark:border-gray-700 text-sm font-semibold rounded-2xl hover:border-gray-400 transition-all">
                      ← Back
                    </button>
                    <button onClick={() => setStep(4)}
                      className="flex-1 py-3 border border-gray-200 dark:border-gray-700 text-sm font-semibold rounded-2xl hover:border-gray-400 transition-all text-gray-500 dark:text-gray-400">
                      Skip for now →
                    </button>
                  </div>
                  <p className="text-xs text-center text-gray-400 dark:text-gray-500 mt-3">
                    You can connect accounts anytime from Settings → Accounts
                  </p>
                </>
              )}
            </div>
          )}

          {/* ── STEP 4 — STARTER POSTS ── */}
          {step === 4 && (
            <div className="bg-surface border border-theme rounded-3xl p-8 md:p-10">
              <div className="text-center mb-6">
                <div className="text-5xl mb-4">✏️</div>
                <h2 className="text-2xl font-extrabold tracking-tight mb-2">Let's get 5 posts ready</h2>
                <p className="text-gray-400 dark:text-gray-500 text-sm">
                  Tell us what you post about — we'll fill in 5 starter drafts you can edit and schedule.
                </p>
              </div>

              {!postsGenerated ? (
                <>
                  <div className="mb-6">
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide block mb-2">
                      What do you create or post about?
                    </label>
                    <input
                      type="text"
                      value={topic}
                      onChange={e => setTopic(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && topic.trim() && (setStarterPosts(generateStarterPosts(topic)), setPostsGenerated(true))}
                      placeholder="e.g. fitness tips, my SaaS startup, photography, cooking"
                      className="w-full px-4 py-3 text-sm border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 rounded-2xl focus:outline-none focus:border-black transition-all"
                      autoFocus
                    />
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">
                      Be specific — "vegan meal prep for busy parents" beats "food"
                    </p>
                  </div>

                  <div className="flex gap-3 mb-4">
                    <button onClick={() => setStep(3)}
                      className="px-6 py-3 border border-gray-200 dark:border-gray-700 text-sm font-semibold rounded-2xl hover:border-gray-400 transition-all">
                      ← Back
                    </button>
                    <button
                      onClick={() => { setStarterPosts(generateStarterPosts(topic)); setPostsGenerated(true) }}
                      disabled={!topic.trim()}
                      className="flex-1 py-3 bg-black text-white text-sm font-bold rounded-2xl hover:opacity-80 transition-all disabled:opacity-40">
                      Generate 5 Posts →
                    </button>
                  </div>

                  <button onClick={() => setStep(5)}
                    className="w-full text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors py-2">
                    Skip — I'll write my own posts later
                  </button>
                </>
              ) : (
                <>
                  <div className="space-y-4 mb-5">
                    {starterPosts.map((post, i) => (
                      <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-2xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-gray-400 dark:text-gray-500">Post {i + 1} of 5</span>
                          <span className={`text-xs font-semibold ${post.length > charLimit ? 'text-red-500' : 'text-gray-400 dark:text-gray-500'}`}>
                            {post.length} / {charLimit}
                          </span>
                        </div>
                        <textarea
                          value={post}
                          onChange={e => {
                            const updated = [...starterPosts]
                            updated[i] = e.target.value
                            setStarterPosts(updated)
                          }}
                          rows={4}
                          className="w-full text-sm text-gray-800 dark:text-gray-200 bg-transparent resize-none outline-none leading-relaxed"
                        />
                      </div>
                    ))}
                  </div>

                  <p className="text-xs text-center text-gray-400 dark:text-gray-500 mb-4">
                    Replace [brackets] with your actual content. These save as drafts — publish when ready.
                  </p>

                  <div className="flex gap-3">
                    <button onClick={() => setPostsGenerated(false)}
                      className="px-6 py-3 border border-gray-200 dark:border-gray-700 text-sm font-semibold rounded-2xl hover:border-gray-400 transition-all">
                      ← Redo
                    </button>
                    <button onClick={() => setStep(5)}
                      className="flex-1 py-3 bg-black text-white text-sm font-bold rounded-2xl hover:opacity-80 transition-all">
                      Save all 5 as drafts →
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── STEP 5 — DONE ── */}
          {step === 5 && (
            <div className="bg-surface border border-theme rounded-3xl p-8 md:p-10 text-center">
              {searchParams.get('upgraded') === 'true' && (
                <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-2xl px-4 py-3 mb-6 flex items-center gap-3 text-left">
                  <span className="text-xl">🎉</span>
                  <div>
                    <p className="text-sm font-extrabold text-green-700 dark:text-green-400">Payment confirmed — you're on Pro!</p>
                    <p className="text-xs text-green-600 dark:text-green-500 mt-0.5">500 AI credits and all Pro features are now active.</p>
                  </div>
                </div>
              )}

              <div className="text-6xl mb-4">🚀</div>
              <h2 className="text-3xl font-extrabold tracking-tight mb-2">
                You're all set, {displayName || 'friend'}!
              </h2>
              <p className="text-gray-400 dark:text-gray-500 mb-6 text-sm">
                {starterPosts.filter(p => p.trim()).length > 0
                  ? `${starterPosts.filter(p => p.trim()).length} draft posts saved and ready to schedule.`
                  : 'Your account is ready.'}
              </p>

              <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-2xl p-5 mb-5 text-left">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">⚡</span>
                  <div>
                    <p className="text-sm font-extrabold text-green-700 dark:text-green-400">50 bonus AI credits added!</p>
                    <p className="text-xs text-green-600 dark:text-green-500 mt-0.5">Refer a friend and you both earn 25 more credits on top.</p>
                  </div>
                </div>
              </div>

              {/* Upgrade CTA — only if still on free */}
              {!isUpgraded && (
                <div className="border-2 border-amber-400 bg-amber-50 dark:bg-amber-950/20 rounded-2xl p-5 mb-5 text-left">
                  <div className="mb-3">
                    <p className="text-sm font-extrabold text-amber-800 dark:text-amber-300">⚡ Upgrade to Pro — $5/month</p>
                    <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">500 AI credits · 5 connected accounts · Smart Queue · Brand Voice AI</p>
                  </div>
                  <div className="mb-3">
                    {couponApplied ? (
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-green-700 dark:text-green-400 font-bold">
                          {couponApplied.code} — {couponApplied.discount_type === 'percent' ? `${couponApplied.discount_value}% off` : `$${couponApplied.discount_value} off`} applied ✓
                        </span>
                        <button onClick={() => { setCouponApplied(null); setCouponInput('') }} className="text-green-600">✕</button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <input
                          value={couponInput}
                          onChange={e => { setCouponInput(e.target.value.toUpperCase()); setCouponError(null) }}
                          onKeyDown={e => e.key === 'Enter' && applyCoupon()}
                          placeholder="Coupon code?"
                          className="flex-1 text-xs bg-white dark:bg-gray-900 border border-amber-200 dark:border-amber-800 rounded-xl px-3 py-2 focus:outline-none focus:border-amber-400 dark:text-gray-100"
                        />
                        <button onClick={applyCoupon} disabled={couponValidating || !couponInput.trim()}
                          className="px-3 py-2 bg-amber-100 dark:bg-amber-900/40 hover:bg-amber-200 disabled:opacity-50 text-amber-800 dark:text-amber-300 text-xs font-semibold rounded-xl transition-colors">
                          {couponValidating ? '…' : 'Apply'}
                        </button>
                      </div>
                    )}
                    {couponError && <p className="text-xs text-red-500 mt-1">{couponError}</p>}
                  </div>
                  <button
                    onClick={() => handlePlanCheckout('pro')}
                    disabled={checkoutLoading === 'pro'}
                    className="w-full py-2.5 bg-amber-400 hover:bg-amber-500 text-black text-sm font-bold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                    {checkoutLoading === 'pro'
                      ? <><div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />Processing...</>
                      : 'Upgrade to Pro →'}
                  </button>
                </div>
              )}

              {/* SM-Give */}
              <div className="rounded-2xl p-5 mb-6 text-left" style={{ background: 'linear-gradient(135deg, #FFF7ED 0%, #FEF3C7 100%)', border: '1px solid #FED7AA' }}>
                <p className="text-sm font-extrabold text-amber-800 mb-2">Every plan powers something bigger 🧡</p>
                <p className="text-xs text-amber-700 leading-relaxed mb-3">
                  2% of every subscription goes to SM-Give — funding school supplies, baby essentials, and care packages for people experiencing homelessness. When you upgrade, you're not just getting more features.
                </p>
                <Link href="/give" className="text-xs font-bold text-amber-800 underline underline-offset-2 hover:text-amber-900 transition-colors">
                  Learn more →
                </Link>
              </div>

              <Link href={starterPosts.filter(p => p.trim()).length > 0 ? '/queue' : '/compose'}
                className="flex items-center justify-center gap-2 w-full py-4 mb-3 bg-violet-600 hover:bg-violet-700 text-white text-sm font-extrabold rounded-2xl transition-all">
                {starterPosts.filter(p => p.trim()).length > 0 ? '📬 Schedule Your Drafts →' : '✏️ Write Your First Post →'}
              </Link>

              <button onClick={handleFinish} disabled={saving}
                className="w-full py-3.5 bg-black text-white text-sm font-bold rounded-2xl hover:opacity-80 transition-all disabled:opacity-50">
                {saving ? 'Setting up your account…' : 'Go to Dashboard →'}
              </button>

              <p className="text-xs text-gray-400 dark:text-gray-500 mt-4">
                Everything can be changed anytime in <Link href="/settings" className="underline">Settings</Link>
              </p>
            </div>
          )}

        </div>
      </div>

      {toast && (
        <div style={{ bottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))' }}
          className={`fixed right-6 z-50 px-5 py-3 rounded-2xl text-sm font-semibold shadow-lg ${
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
      <div className="min-h-dvh bg-theme flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black" />
      </div>
    }>
      <OnboardingInner />
    </Suspense>
  )
}
