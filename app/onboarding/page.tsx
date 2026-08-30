'use client'
import { useEffect, useState, useRef, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import { normalizePlan } from '@/lib/plan'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { track } from '@/lib/analytics'
import BlueskyConnectModal from '@/components/BlueskyConnectModal'
import TelegramConnectModal from '@/components/TelegramConnectModal'
import MastodonConnectModal from '@/components/MastodonConnectModal'

// How a platform is actually connected, which is the thing that decides whether
// someone finishes onboarding:
//
//   oauth  - one button, a consent screen, done. Nothing to prepare.
//   modal  - a short form here, but you need a value from somewhere else first.
//   invite - you must administer a Discord server and invite a bot to it.
//
// Ordered easiest-first, and honest about what each one costs you up front.
// TikTok and LinkedIn were missing from this list entirely, which meant the two
// genuine two-click connects were not offered at all, while Bluesky - which
// requires generating an app password on a different website - was badged
// "Easiest to start". Every one of the three signups on Aug 29 reached the
// connect step and none of them connected anything.
type ConnectKind = 'oauth' | 'modal' | 'invite'

const LIVE_PLATFORMS: {
  id: string; label: string; icon: string; desc: string
  connect: ConnectKind; needs: string | null; badge: string | null
}[] = [
  { id: 'tiktok',   label: 'TikTok',      icon: '🎵', desc: 'Schedule videos straight to your account',
    connect: 'oauth',  needs: null,                          badge: '⚡ 2 clicks' },
  { id: 'linkedin', label: 'LinkedIn',    icon: '💼', desc: 'Post to your personal profile',
    connect: 'oauth',  needs: null,                          badge: '⚡ 2 clicks' },
  { id: 'twitter',  label: 'X / Twitter', icon: '🐦', desc: '280 characters — 5 free posts a month, then $0.01 each',
    connect: 'oauth',  needs: null,                          badge: '⚡ 2 clicks' },
  { id: 'bluesky',  label: 'Bluesky',     icon: '🦋', desc: 'Decentralized social — great for builders & creators',
    connect: 'modal',  needs: 'an app password from bsky.app', badge: null },
  { id: 'mastodon', label: 'Mastodon',    icon: '🐘', desc: 'Federated network — engaged, ad-free community',
    connect: 'modal',  needs: 'your instance address',         badge: null },
  { id: 'telegram', label: 'Telegram',    icon: '✈️', desc: 'Broadcast to your Telegram channel or group',
    connect: 'modal',  needs: 'a bot token from @BotFather',   badge: null },
  { id: 'discord',  label: 'Discord',     icon: '💬', desc: 'Post announcements to your server channels',
    connect: 'invite', needs: 'a server you administer',       badge: null },
]

const TWO_CLICK   = LIVE_PLATFORMS.filter(p => p.connect === 'oauth')
const NEEDS_SETUP = LIVE_PLATFORMS.filter(p => p.connect !== 'oauth')

// Where each OAuth platform's consent flow starts. Same routes /accounts uses.
const OAUTH_ROUTES: Record<string, string> = {
  tiktok:   '/api/tiktok/auth',
  linkedin: '/api/accounts/linkedin/connect',
  twitter:  '/api/accounts/twitter/connect',
}

// Send people straight to the thing they need rather than making them find it.
// "Needs an app password" is only useful if you also say where app passwords
// live, and that page is four levels into Bluesky's settings.
const NEEDS_LINKS: Record<string, { href: string; label: string }> = {
  bluesky:  { href: 'https://bsky.app/settings/app-passwords', label: 'Create one on Bluesky' },
  telegram: { href: 'https://t.me/BotFather',                  label: 'Open @BotFather' },
}

const CHAR_LIMITS: Record<string, number> = {
  bluesky: 300, mastodon: 500, discord: 2000, telegram: 4096, twitter: 280,
  tiktok: 2200, linkedin: 3000,
}

const STRIPE_PRO_PRICE_ID    = 'price_1U3jSI7OMwDowUuUm0oMEpiT'
const STRIPE_AGENCY_PRICE_ID = 'price_1U3jSJ7OMwDowUuUjK3igDLr'

const STEPS = [
  { id: 1, label: 'Welcome'  },
  { id: 2, label: 'Platform' },
  { id: 3, label: 'Connect'  },
  { id: 4, label: 'First post' },
  { id: 5, label: "You're in!" },
]

// One post, not five.
//
// Onboarding asked people to review and schedule five posts before they had
// published anything at all. That is a lot of commitment to ask for from
// someone still deciding whether the product works. One post they can actually
// put on a calendar and watch go out is the whole point of the step.
//
// Random rather than fixed, so "Rewrite it" gives a genuinely different angle.
function generateStarterPost(topic: string): string {
  const t = topic.trim() || 'my journey'
  const options = [
    `Hot take: most people overthink ${t}. The ones who win just start before they feel ready and adjust as they go. Consistency beats perfection every time.`,
    `3 things I wish I knew starting out with ${t}:

1. Show up on the days you don't feel like it.
2. Don't compare your start to someone else's middle.
3. Master the basics before chasing shortcuts.`,
    `The biggest mistake I see people make with ${t}: waiting for the "right time" to begin. There isn't one. Start small, stay steady, and let momentum do the heavy lifting.`,
    `Quick ${t} tip: pick one thing to improve this week and go deep on it instead of spreading yourself thin. Small, focused reps compound fast. Save this for when you need it.`,
    `Real talk: ${t} is harder than people make it look. The thing that changed everything for me? I stopped waiting to feel motivated and built a routine I could keep on my worst days.`,
  ]
  return options[Math.floor(Math.random() * options.length)]
}

// Default the picker to tomorrow at 09:00 local. Far enough away to feel
// deliberate, close enough that they see it happen.
function defaultSchedule(): { date: string; time: string } {
  const d = new Date(Date.now() + 24 * 60 * 60 * 1000)
  const pad = (n: number) => String(n).padStart(2, '0')
  return { date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`, time: '09:00' }
}

function OnboardingInner() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [user, setUser] = useState<any>(null)
  const [step, setStep] = useState(1)
  // Where people fall out of the flow. Fires on every step change, so the
  // shape of the drop-off is visible rather than just the endpoints.
  useEffect(() => { track('onboarding_step', { step }) }, [step])
  const [displayName, setDisplayName] = useState('')
  const [irisOptIn, setIrisOptIn] = useState(true)
  const [selectedPlatform, setSelectedPlatform] = useState('')
  const [topic, setTopic] = useState('')
  const [starterPost, setStarterPost] = useState('')
  const [postsGenerated, setPostsGenerated] = useState(false)
  const [scheduleDate, setScheduleDate] = useState(defaultSchedule().date)
  const [scheduleTime, setScheduleTime] = useState(defaultSchedule().time)
  // What actually happened when we tried to save. Step 5 reads this instead of
  // asserting success, because it used to claim "5 posts scheduled" after an
  // insert that never ran.
  const [saveResult, setSaveResult] = useState<{ kind: 'scheduled' | 'draft' | 'none' | 'error'; detail?: string } | null>(null)
  const [saving, setSaving] = useState(false)
  const [hasFinished, setHasFinished] = useState(false)
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null)
  const [upgradedPlan, setUpgradedPlan] = useState<'free' | 'pro' | 'agency'>('free')
  const [couponInput, setCouponInput] = useState('')
  const [couponValidating, setCouponValidating] = useState(false)
  const [couponApplied, setCouponApplied] = useState<{ id: string; code: string; discount_type: string; discount_value: number } | null>(null)
  const [couponError, setCouponError] = useState<string | null>(null)
  const [connectionDetected, setConnectionDetected] = useState(false)
  // Which connect form is open inline. The three form-based platforms already
  // have self-contained modal components on /accounts; onboarding mounts the
  // same ones rather than shipping people over there to find them.
  const [inlineModal, setInlineModal] = useState<string | null>(null)
  const [checkingConnection, setCheckingConnection] = useState(false)
  const [pollExpired, setPollExpired] = useState(false)
  const [checkMissed, setCheckMissed] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'info' } | null>(null)
  const [quickMode, setQuickMode] = useState(false)
  const [referralCode, setReferralCode] = useState<string | null>(null)
  const [onboardingGoal, setOnboardingGoal] = useState<string | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const checkConnectionRef = useRef<(() => Promise<boolean>) | null>(null)

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

      // Read referral cookie
      const refCookie = document.cookie.split(';').find(c => c.trim().startsWith('ref_code='))
      if (refCookie) setReferralCode(refCookie.split('=')[1]?.trim() || null)

      const { data: settings } = await supabase
        .from('user_settings')
        .select('plan')
        .eq('user_id', authUser.id)
        .single()

      if (settings?.plan && settings.plan !== 'free') {
        // Was `as 'pro' | 'agency'`, which is false for an annual subscriber —
        // the runtime value is 'pro_annual'. Nothing downstream depended on it,
        // but the cast invited the next reader to compare it against 'pro'.
        setUpgradedPlan(normalizePlan(settings.plan))
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

  // Poll for connected account while on step 3.
  //
  // This used to give up after 90 seconds, which is shorter than the task takes.
  // Connecting means leaving for another tab, finding your platform among seven,
  // and completing OAuth - and for Bluesky, generating an app password on a
  // different service entirely. Three minutes is normal. People were coming back
  // having genuinely connected, to a tab that had stopped listening and offered
  // no way to say so, where the widest button on screen was "Skip for now".
  //
  // 38 of 72 accounts finished onboarding; 12 ever connected anything.
  //
  // Three changes: the window is long enough to finish in, returning to the tab
  // re-checks immediately (which is the actual moment of truth), and there is a
  // manual check for when both of those somehow miss.
  useEffect(() => {
    if (step !== 3 || !selectedPlatform) return
    let stopped = false

    const check = async () => {
      if (stopped) return false
      try {
        const res = await fetch('/api/accounts/connected')
        if (!res.ok) return false
        const data = await res.json()
        if ((data.platforms as string[]).includes(selectedPlatform)) {
          stopped = true
          setConnectionDetected(true)
          setCheckingConnection(false)
          if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null }
          setTimeout(() => setStep(quickMode ? 5 : 4), 1500)
          return true
        }
      } catch {}
      return false
    }
    checkConnectionRef.current = check

    pollRef.current = setInterval(check, 3000)
    // Coming back to this tab is the moment they have just finished, so check
    // then rather than waiting up to 3s for the next tick.
    const onFocus = () => { void check() }
    window.addEventListener('focus', onFocus)
    document.addEventListener('visibilitychange', onFocus)

    const timeout = setTimeout(() => {
      if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null }
      setPollExpired(true)
    }, 10 * 60 * 1000)

    return () => {
      stopped = true
      clearInterval(pollRef.current!)
      clearTimeout(timeout)
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', onFocus)
    }
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
    track('onboarding_completed', {
      platform: selectedPlatform || 'none',
      connected: !!connectionDetected,
    })

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

    const platforms = (selectedPlatform && connectionDetected) ? [selectedPlatform] : []
    // `use_case` was in this payload and has never existed on user_settings.
    // Nothing reads it either. `default_platforms` also did not exist until the
    // 20260812 migration — it had been created on `workspaces` by mistake.
    //
    // Either one made Postgres reject the entire upsert, so this write has been
    // failing for every user since it was written: no onboarding_goal (null for
    // all 73 accounts), no display_name, no iris_opt_in, and no +50 completion
    // credits. The error was discarded, so it never surfaced.
    const upsertPayload: Record<string, any> = {
      user_id: user.id,
      display_name: displayName,
      default_platforms: platforms,
      onboarding_completed: true,
      iris_opt_in: irisOptIn,
      ...(onboardingGoal ? { onboarding_goal: onboardingGoal } : {}),
    }

    if (!currentSettings?.onboarding_completed) {
      upsertPayload.ai_credits_remaining = (currentSettings?.ai_credits_remaining ?? 50) + 50
    }

    const { error: settingsErr } = await supabase
      .from('user_settings')
      .upsert(upsertPayload, { onConflict: 'user_id' })
    if (settingsErr) {
      // Never silently again. This is the write that grants the completion
      // credits, so a failure here is worth seeing.
      console.error('[onboarding] settings upsert failed:', settingsErr.message)
    }

    // Save the starter post.
    //
    // This block used to be `if (posts.length && platforms.length)` around an
    // insert whose error was discarded — and step 5 announced "5 posts
    // scheduled and on your calendar" regardless. With no platform connected,
    // `platforms` is [] and the insert simply never ran, so the flow's final
    // screen was congratulating people for nothing. Verified against production:
    // a full run through onboarding wrote zero rows.
    //
    // Two changes. A post with nowhere to go is saved as a draft rather than
    // discarded, so the work survives and shows up in /drafts. And whatever
    // happens is recorded in saveResult, which step 5 reports honestly.
    const content = starterPost.trim()
    if (!content) {
      setSaveResult({ kind: 'none' })
    } else {
      // Local date+time from the picker -> instant. Constructing from parts
      // avoids the Safari/Firefox disagreement over bare "YYYY-MM-DD HH:MM".
      const [y, mo, d] = scheduleDate.split('-').map(Number)
      const [hh, mm]   = scheduleTime.split(':').map(Number)
      const when = new Date(y, (mo ?? 1) - 1, d ?? 1, hh ?? 9, mm ?? 0)
      const valid = !Number.isNaN(when.getTime())

      const connected = platforms.length > 0
      const { error: postErr } = await supabase.from('posts').insert({
        user_id: user.id,
        content,
        platforms,
        status: connected ? 'scheduled' : 'draft',
        // A draft has no destination, so a scheduled_at on it would only invite
        // the scheduler to sweep it up and stamp it failed.
        scheduled_at: connected && valid ? when.toISOString() : null,
      })

      if (postErr) {
        console.error('[onboarding] starter post insert failed:', postErr.message)
        setSaveResult({ kind: 'error', detail: postErr.message })
      } else {
        setSaveResult({
          kind: connected ? 'scheduled' : 'draft',
          detail: connected && valid
            ? when.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
            : undefined,
        })
      }
    }

    setSaving(false)
  }

  // Run the save when they reach the last step, not when they press a
  // particular button on it.
  //
  // handleFinish is the only thing that writes anything at all: the profile
  // name, the user_settings upsert carrying onboarding_completed / goal /
  // IRIS opt-in, the +50 completion credits, the starter post, and the
  // onboarding_completed funnel event. It was wired exclusively to the
  // secondary "Go to Dashboard" button. The primary CTA above it is a plain
  // <Link>, so anyone who pressed the big obvious purple button navigated away
  // having saved nothing.
  //
  // Measured in production: onboarding_completed is true for 5 accounts out of
  // 103, and onboarding_goal — captured on step 1, written only here — is set
  // on 2. Ninety-eight people finished onboarding and none of it was kept.
  //
  // hasFinished makes this idempotent, so re-rendering step 5 cannot double
  // write, and the redirect is gone because the buttons now do the navigating.
  useEffect(() => {
    if (step !== 5 || !user || hasFinished) return
    void handleFinish()
    // handleFinish is stable enough for this guard; hasFinished is the latch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, user, hasFinished])

  const progress = ((step - 1) / (STEPS.length - 1)) * 100
  const platformData = LIVE_PLATFORMS.find(p => p.id === selectedPlatform)

  // Start the connect for whatever they picked, from here.
  //
  // The form platforms open inline. The OAuth ones have to leave for a consent
  // screen - that part is unavoidable - but they open in a new tab so this page
  // survives, and the existing poll picks the connection up on return. What
  // does not happen any more is dumping someone on /accounts to re-find their
  // platform among seven cards with no memory of what they just chose.
  const startConnect = () => {
    if (!platformData) return
    track('connect_clicked', { platform: platformData.id })

    if (platformData.connect === 'modal') { setInlineModal(platformData.id); return }

    const href = platformData.connect === 'invite'
      ? '/api/accounts/discord/connect'
      : OAUTH_ROUTES[platformData.id]
    if (href) window.open(href, '_blank', 'noopener,noreferrer')
  }

  // A form modal reporting success is a connection we know about immediately,
  // so skip waiting for the next poll tick.
  const onInlineConnected = (platform: string) => {
    track('connect_succeeded', { platform })
    setInlineModal(null)
    setConnectionDetected(true)
    setTimeout(() => setStep(quickMode ? 5 : 4), 1200)
  }
  const charLimit = CHAR_LIMITS[selectedPlatform] ?? 300
  const isUpgraded = upgradedPlan !== 'free' || searchParams.get('upgraded') === 'true'
  // Starter posts are only scheduled when a platform is actually connected —
  // otherwise they have no destination and would just fail. Drives honest copy below.
  // Read from what the save actually returned, not from what we intended to do.
  // The old version derived this from component state and step 5 announced
  // success on the strength of it, while the insert it was describing had been
  // skipped entirely.
  const didSchedule = saveResult?.kind === 'scheduled'
  const didDraft    = saveResult?.kind === 'draft'

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
              track('onboarding_skipped', { step })
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
              {referralCode && (
                <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl px-4 py-3 mb-6 flex items-center gap-3">
                  <span className="text-xl">🎉</span>
                  <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">You were invited by a friend — you'll both earn bonus credits when you upgrade.</p>
                </div>
              )}

              <div className="text-center mb-7">
                <div className="text-5xl mb-4">👋</div>
                <h1 className="text-3xl font-extrabold tracking-tight mb-2">Welcome to SocialMate</h1>
                <p className="text-gray-400 dark:text-gray-500 text-sm">Set up in under 2 minutes.</p>
              </div>

              <div className="mb-5">
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

              {/* Goal selection */}
              <div className="mb-5">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide block mb-2">What's your main goal?</label>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { id: 'schedule',  icon: '📅', label: 'Schedule & publish content', desc: 'Plan posts across platforms in advance' },
                    { id: 'grow',      icon: '📈', label: 'Grow my audience',           desc: 'Build reach with consistent posting + AI tools' },
                    { id: 'clients',   icon: '👥', label: 'Manage client accounts',     desc: 'Handle multiple brands from one workspace' },
                  ].map(g => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setOnboardingGoal(g.id)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-2xl border-2 text-left transition-all ${
                        onboardingGoal === g.id
                          ? 'border-black dark:border-white bg-gray-50 dark:bg-gray-800'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}>
                      <span className="text-xl flex-shrink-0">{g.icon}</span>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-800 dark:text-gray-100 leading-tight">{g.label}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{g.desc}</p>
                      </div>
                      {onboardingGoal === g.id && <span className="ml-auto text-black dark:text-white font-black flex-shrink-0">✓</span>}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900 rounded-2xl p-4 mb-4">
                <div className="flex items-start gap-3">
                  <span className="text-xl">⚡</span>
                  <div>
                    <p className="text-xs font-extrabold text-blue-800 dark:text-blue-300 mb-1">Complete setup → earn 50 bonus AI credits</p>
                    <p className="text-xs text-blue-600 dark:text-blue-400">Refer a friend after and you both earn 25 more.</p>
                  </div>
                </div>
              </div>

              {/* Compact IRIS opt-in */}
              <button
                type="button"
                onClick={() => setIrisOptIn(v => !v)}
                className="w-full flex items-center gap-3 px-4 py-3 mb-5 rounded-2xl border border-gray-200 dark:border-gray-700 text-left hover:border-gray-300 dark:hover:border-gray-600 transition-all">
                <div className={`w-4 h-4 flex-shrink-0 rounded border-2 flex items-center justify-center transition-all ${irisOptIn ? 'bg-amber-500 border-amber-500' : 'border-gray-300 dark:border-gray-600'}`}>
                  {irisOptIn && <span className="text-white text-[9px] font-black">✓</span>}
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  <span className="font-bold text-gray-800 dark:text-gray-200">📬 IRIS Dispatch</span> — weekly build-in-public newsletter. No spam.
                </p>
              </button>

              <button
                onClick={() => displayName.trim() ? setStep(2) : showToast('Enter your name to continue')}
                className="w-full py-3.5 bg-black text-white text-sm font-bold rounded-2xl hover:opacity-80 transition-all">
                Let's go →
              </button>

              <button
                onClick={() => {
                  setQuickMode(true)
                  setDisplayName(user?.email?.split('@')[0] || 'Friend')
                  setStep(2)
                }}
                className="w-full mt-3 py-2.5 text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors font-semibold">
                Quick Start — skip the tour, just connect my account →
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

              {/* Two groups, because "which platform" and "how much work is
                  this about to be" are the same question at this step, and
                  hiding the second half is what loses people one screen later. */}
              {([
                { title: 'Connects in two clicks', items: TWO_CLICK   },
                { title: 'Needs one thing first',  items: NEEDS_SETUP },
              ]).map(group => (
                <div key={group.title} className="mb-6">
                  <p className="text-[11px] font-extrabold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2 px-1">
                    {group.title}
                  </p>
                  <div className="space-y-3">
                    {group.items.map(p => (
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
                          {p.needs && (
                            <p className="text-xs text-amber-600 dark:text-amber-500 mt-0.5">Needs {p.needs}</p>
                          )}
                        </div>
                        <span className="text-gray-300 dark:text-gray-600 group-hover:text-black dark:group-hover:text-white transition-colors text-sm font-bold flex-shrink-0">→</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}

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
                  {/* What this platform needs, said before they click, with a
                      direct link to go get it. Previously this step sent people
                      to /accounts in a new tab with no indication of which of
                      the seven platforms they had just chosen, and no mention
                      that Bluesky wants a credential from another website. */}
                  {platformData?.needs && (
                    <div className="mb-4 p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50">
                      <p className="text-xs font-bold text-amber-800 dark:text-amber-300 mb-1">
                        First you need {platformData.needs}
                      </p>
                      {NEEDS_LINKS[selectedPlatform] && (
                        <a
                          href={NEEDS_LINKS[selectedPlatform].href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-semibold text-amber-700 dark:text-amber-400 underline underline-offset-2">
                          {NEEDS_LINKS[selectedPlatform].label} →
                        </a>
                      )}
                    </div>
                  )}

                  <button
                    onClick={startConnect}
                    className="flex items-center justify-center gap-2 w-full py-4 mb-3 bg-black text-white text-sm font-bold rounded-2xl hover:opacity-80 transition-all">
                    {platformData?.icon} Connect {platformData?.label}
                  </button>
                  <p className="text-xs text-center text-gray-400 dark:text-gray-500 mb-4">
                    {platformData?.connect === 'modal'
                      ? 'Opens right here — you will not lose this page'
                      : 'Opens a consent screen · we detect it automatically when you come back'}
                  </p>

                  {/* The escape hatch for when polling and the focus check both
                      miss. Without it, someone who has genuinely connected has
                      no way to tell us so, and Skip is their only live control. */}
                  <button
                    onClick={async () => {
                      setCheckingConnection(true)
                      setCheckMissed(false)
                      const found = await checkConnectionRef.current?.()
                      setCheckingConnection(false)
                      if (!found) setCheckMissed(true)
                    }}
                    disabled={checkingConnection}
                    className="w-full py-3 mb-2 border border-gray-300 dark:border-gray-600 text-sm font-bold rounded-2xl hover:border-gray-500 transition-all disabled:opacity-60">
                    {checkingConnection ? 'Checking…' : "I've connected — check now"}
                  </button>

                  {checkMissed && (
                    <p className="text-xs text-center text-amber-600 dark:text-amber-500 mb-3">
                      Still not seeing it. Finish connecting in the other tab, then check again.
                    </p>
                  )}
                  {pollExpired && !checkMissed && (
                    <p className="text-xs text-center text-gray-400 dark:text-gray-500 mb-3">
                      Taking a while? Hit check above once you&apos;re done — we&apos;ll pick it up.
                    </p>
                  )}

                  <div className="flex gap-3 mt-4">
                    <button onClick={() => setStep(2)}
                      className="px-6 py-3 border border-gray-200 dark:border-gray-700 text-sm font-semibold rounded-2xl hover:border-gray-400 transition-all">
                      ← Back
                    </button>
                    {/* Was flex-1, which made Skip the widest control on the
                        screen at the exact step we need people not to skip. */}
                    <button onClick={() => setStep(quickMode ? 5 : 4)}
                      className="px-6 py-3 text-sm font-semibold text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-all">
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

          {/* ── STEP 4 — FIRST POST ── */}
          {step === 4 && (
            <div className="bg-surface border border-theme rounded-3xl p-8 md:p-10">
              <div className="text-center mb-6">
                <div className="text-5xl mb-4">✏️</div>
                <h2 className="text-2xl font-extrabold tracking-tight mb-2">Schedule your first post</h2>
                <p className="text-gray-400 dark:text-gray-500 text-sm">
                  Tell us what you post about and we&apos;ll write one for you. Pick when it goes out.
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
                      onKeyDown={e => e.key === 'Enter' && topic.trim() && (setStarterPost(generateStarterPost(topic)), setPostsGenerated(true))}
                      placeholder="e.g. fitness tips, my SaaS startup, photography, cooking"
                      className="w-full px-4 py-3 text-sm border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 rounded-2xl focus:outline-none focus:border-black transition-all"
                      autoFocus
                    />
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">
                      Be specific — &quot;vegan meal prep for busy parents&quot; beats &quot;food&quot;
                    </p>
                  </div>

                  <div className="flex gap-3 mb-4">
                    <button onClick={() => setStep(3)}
                      className="px-6 py-3 border border-gray-200 dark:border-gray-700 text-sm font-semibold rounded-2xl hover:border-gray-400 transition-all">
                      ← Back
                    </button>
                    <button
                      onClick={() => { setStarterPost(generateStarterPost(topic)); setPostsGenerated(true) }}
                      disabled={!topic.trim()}
                      className="flex-1 py-3 bg-black text-white text-sm font-bold rounded-2xl hover:opacity-80 transition-all disabled:opacity-40">
                      Write my first post →
                    </button>
                  </div>

                  <button onClick={() => setStep(5)}
                    className="w-full text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors py-2">
                    Skip — I&apos;ll write my own later
                  </button>
                </>
              ) : (
                <>
                  <div className="border border-gray-200 dark:border-gray-700 rounded-2xl p-4 mb-5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-gray-400 dark:text-gray-500">Your first post</span>
                      <span className={`text-xs font-semibold ${starterPost.length > charLimit ? 'text-red-500' : 'text-gray-400 dark:text-gray-500'}`}>
                        {starterPost.length} / {charLimit}
                      </span>
                    </div>
                    <textarea
                      value={starterPost}
                      onChange={e => setStarterPost(e.target.value)}
                      rows={5}
                      className="w-full text-sm text-gray-800 dark:text-gray-200 bg-transparent resize-none outline-none leading-relaxed"
                    />
                  </div>

                  {/* When it goes out. Previously this was implicit — five posts,
                      30 minutes apart, starting two hours from now, with no say
                      in it. Picking a day and a time is the thing people came to
                      this product to do. */}
                  {connectionDetected ? (
                    <div className="mb-5">
                      <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide block mb-2">
                        When should it go out?
                      </label>
                      <div className="flex gap-3">
                        <input
                          type="date"
                          value={scheduleDate}
                          onChange={e => setScheduleDate(e.target.value)}
                          className="flex-1 px-4 py-3 text-sm border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 rounded-2xl focus:outline-none focus:border-black transition-all"
                        />
                        <input
                          type="time"
                          value={scheduleTime}
                          onChange={e => setScheduleTime(e.target.value)}
                          className="w-36 px-4 py-3 text-sm border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 rounded-2xl focus:outline-none focus:border-black transition-all"
                        />
                      </div>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">
                        Goes to {platformData?.label} in your local time. Change it anytime from the calendar.
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-center text-amber-600 dark:text-amber-500 mb-5">
                      No account connected yet, so we&apos;ll save this as a draft. Connect a platform
                      and you can schedule it from Drafts in one click.
                    </p>
                  )}

                  <div className="flex gap-3 mb-3">
                    <button onClick={() => setPostsGenerated(false)}
                      className="px-6 py-3 border border-gray-200 dark:border-gray-700 text-sm font-semibold rounded-2xl hover:border-gray-400 transition-all">
                      ← Rewrite
                    </button>
                    <button onClick={() => setStep(5)}
                      disabled={!starterPost.trim()}
                      className="flex-1 py-3 bg-black text-white text-sm font-bold rounded-2xl hover:opacity-80 transition-all disabled:opacity-40">
                      {connectionDetected ? 'Schedule it →' : 'Save as draft →'}
                    </button>
                  </div>

                  {/* Skip stayed available on the input screen but vanished the
                      moment a post was generated, so the only ways out were
                      Redo or commit. */}
                  <button onClick={() => { setStarterPost(''); setStep(5) }}
                    className="w-full text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors py-2">
                    Skip — I&apos;ll do this later
                  </button>
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
                {didSchedule
                  ? `Your first post is scheduled for ${saveResult?.detail ?? 'the time you picked'}.`
                  : didDraft
                    ? 'Your first post is saved in Drafts. Connect a platform and you can schedule it in one click.'
                    : saveResult?.kind === 'error'
                      ? 'Your account is ready, but we could not save that post. Nothing was lost — write it again from Compose.'
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
                    <p className="text-sm font-extrabold text-amber-800 dark:text-amber-300">⚡ Upgrade to Pro — $8/month</p>
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
              <div className="rounded-2xl p-5 mb-6 text-left bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                <p className="text-sm font-extrabold text-amber-800 mb-2">Every plan powers something bigger 🧡</p>
                <p className="text-xs text-amber-700 leading-relaxed mb-3">
                  2% of every subscription goes to SM-Give — funding school supplies, baby essentials, and care packages for people experiencing homelessness. When you upgrade, you're not just getting more features.
                </p>
                <Link href="/give" className="text-xs font-bold text-amber-800 underline underline-offset-2 hover:text-amber-900 transition-colors">
                  Learn more →
                </Link>
              </div>

              {/* Both of these are now pure navigation. The save runs on
                  arrival at this step, so neither button can be the thing that
                  decides whether the account was written. They are held until
                  it settles, because leaving mid-write is exactly how the
                  starter post used to disappear. */}
              {saving ? (
                <div className="flex items-center justify-center gap-3 w-full py-4 mb-3 bg-violet-600/40 text-white text-sm font-extrabold rounded-2xl">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Setting up your account…
                </div>
              ) : (
                <Link href={didSchedule ? '/calendar' : didDraft ? '/drafts' : '/compose'}
                  className="flex items-center justify-center gap-2 w-full py-4 mb-3 bg-violet-600 hover:bg-violet-700 text-white text-sm font-extrabold rounded-2xl transition-all">
                  {didSchedule ? '📅 View Your Scheduled Post →' : didDraft ? '📄 Open Your Draft →' : '✏️ Write Your First Post →'}
                </Link>
              )}

              <Link href="/dashboard?welcome=1"
                aria-disabled={saving}
                className={`block text-center w-full py-3.5 bg-black text-white text-sm font-bold rounded-2xl transition-all ${
                  saving ? 'opacity-50 pointer-events-none' : 'hover:opacity-80'
                }`}>
                Go to Dashboard →
              </Link>

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

      {/* The same connect forms /accounts uses, mounted here so connecting
          never requires leaving onboarding. Mastodon has no onSuccess because
          its flow redirects out to the user's instance for OAuth; the step 3
          poll catches that one on return, same as the OAuth platforms. */}
      {inlineModal === 'bluesky' && (
        <BlueskyConnectModal
          onSuccess={() => onInlineConnected('bluesky')}
          onClose={() => setInlineModal(null)}
        />
      )}
      {inlineModal === 'telegram' && (
        <TelegramConnectModal
          onSuccess={() => onInlineConnected('telegram')}
          onClose={() => setInlineModal(null)}
        />
      )}
      {inlineModal === 'mastodon' && (
        <MastodonConnectModal onClose={() => setInlineModal(null)} />
      )}
    </div>
  )
}

function OnboardingSkeleton() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950">
      <div className="w-full max-w-lg px-6 flex flex-col items-center gap-8 animate-pulse">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 flex items-center justify-center">
            <span className="text-amber-500 font-bold text-lg">S</span>
          </div>
          <span className="text-white font-bold text-xl tracking-tight">SocialMate</span>
        </div>
        <div className="flex gap-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className={`h-1.5 w-10 rounded-full ${i === 0 ? 'bg-amber-500' : 'bg-gray-700'}`} />
          ))}
        </div>
        <div className="w-full space-y-4">
          <div className="h-6 w-48 rounded-lg bg-gray-800" />
          <div className="h-4 w-64 rounded bg-gray-800" />
          <div className="h-12 w-full rounded-xl bg-gray-800 mt-6" />
          <div className="h-12 w-full rounded-xl bg-gray-800" />
          <div className="h-12 w-full rounded-xl bg-amber-500/20 mt-2" />
        </div>
      </div>
    </div>
  )
}

export default function Onboarding() {
  return (
    <Suspense fallback={<OnboardingSkeleton />}>
      <OnboardingInner />
    </Suspense>
  )
}
