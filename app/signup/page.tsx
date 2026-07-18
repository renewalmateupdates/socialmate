'use client'
import { useState, useEffect, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Check } from 'lucide-react'
import { isDisposableEmail } from '@/lib/disposable-email-domains'
import { useI18n } from '@/contexts/I18nContext'
import AuthShell from '@/components/instrument/AuthShell'
import { Label, Input, ErrorNote, Submit } from '@/components/instrument/form'

const PERKS = [
  '7 live platforms — more coming',
  '100 posts/month free forever',
  'Bulk scheduler and calendar',
  'SIGIL link in bio builder',
  'Team collaboration (2 seats)',
  'Analytics and best-times heatmap',
]

/** What you actually get, shown beside the form. jade = included. */
function SignupPerks() {
  return (
    <div>
      <p className="font-mono text-eyebrow uppercase text-jade">Included at $0</p>
      <ul className="mt-5 space-y-3">
        {PERKS.map(perk => (
          <li key={perk} className="flex items-start gap-3 text-small text-ink-body">
            <Check className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-jade" strokeWidth={3} aria-hidden="true" />
            {perk}
          </li>
        ))}
      </ul>
    </div>
  )
}

function SignupForm() {
  const { t } = useI18n()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [done, setDone] = useState(false)
  const [refCode, setRefCode] = useState('')
  const [tosAccepted, setTosAccepted] = useState(false)
  const [newsletterOptIn, setNewsletterOptIn] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()

  const redirectTo = searchParams.get('redirect') || ''

  useEffect(() => {
    const ref = searchParams.get('ref')
    if (ref) setRefCode(ref)

    // Capture UTM params + page referrer as short-lived cookies for post-signup attribution.
    // Auth callback reads these on new account creation and persists to user_settings.
    const utmSource = searchParams.get('utm_source')
    const utmMedium = searchParams.get('utm_medium')
    const utmCampaign = searchParams.get('utm_campaign')
    const referrer = typeof document !== 'undefined' ? document.referrer : ''
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString()
    if (utmSource) document.cookie = `sm_utm_source=${encodeURIComponent(utmSource)};path=/;expires=${expires};SameSite=Lax`
    if (utmMedium) document.cookie = `sm_utm_medium=${encodeURIComponent(utmMedium)};path=/;expires=${expires};SameSite=Lax`
    if (utmCampaign) document.cookie = `sm_utm_campaign=${encodeURIComponent(utmCampaign)};path=/;expires=${expires};SameSite=Lax`
    // Only store external referrers (skip self-referrals from the same domain)
    if (referrer && !referrer.includes('socialmate.studio')) {
      document.cookie = `sm_referrer=${encodeURIComponent(referrer)};path=/;expires=${expires};SameSite=Lax`
    }
  }, [searchParams])

  const handleGoogleSignup = async () => {
    if (!tosAccepted) { setError('Accept the Terms and Privacy Policy to continue.'); return }
    setGoogleLoading(true)
    setError('')
    const callbackUrl = redirectTo
      ? `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirectTo)}`
      : `${window.location.origin}/auth/callback`
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: callbackUrl },
    })
    if (error) {
      setError(error.message)
      setGoogleLoading(false)
    }
  }

  // Strength stays inside the colour system: alert for "this is a problem",
  // neutral for "acceptable", jade for "good". No invented yellow/blue scale.
  const passwordStrength = (pw: string) => {
    if (!pw) return { score: 0, label: '', color: '' }
    let score = 0
    if (pw.length >= 8) score++
    if (/[A-Z]/.test(pw)) score++
    if (/[0-9]/.test(pw)) score++
    if (/[^A-Za-z0-9]/.test(pw)) score++
    if (score <= 1)   return { score, label: 'Weak',   color: 'bg-alert' }
    if (score === 2)  return { score, label: 'Fair',   color: 'bg-alert/70' }
    if (score === 3)  return { score, label: 'Good',   color: 'bg-ink-muted' }
    return { score, label: 'Strong', color: 'bg-jade' }
  }

  const strength = passwordStrength(password)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!tosAccepted) { setError('Accept the Terms and Privacy Policy to continue.'); return }
    if (!email.trim()) { setError('Enter your email'); return }
    if (!email.includes('@')) { setError('Enter a valid email'); return }
    if (isDisposableEmail(email)) { setError('Disposable email addresses are not allowed. Please use a real email.'); return }
    if (!password) { setError('Choose a password'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    if (password !== confirmPassword) { setError('Passwords do not match'); return }
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: redirectTo
          ? `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirectTo)}`
          : `${window.location.origin}/auth/callback`,
        data: { referral_code: refCode || null, newsletter_opted_in: newsletterOptIn },
      },
    })
    if (error) {
      setError(error.message.includes('already registered') ? 'This email is already registered. Try signing in.' : error.message)
      setLoading(false)
      return
    }
    setDone(true)
    setLoading(false)
  }

  if (done) {
    return (
      <AuthShell
        headline="Confirm your email"
        sub="One click and your account is live."
        altHref="/login"
        altLabel="Sign in"
        asideNote={<SignupPerks />}
      >
        <div className="rounded-2xl border border-edge bg-panel p-6">
          <p className="font-mono text-eyebrow uppercase text-ink-muted">Sent to</p>
          <p className="mt-2 font-mono text-mono text-ink-high">{email}</p>
          <p className="mt-5 text-small leading-relaxed text-ink-muted">
            Open the link in that email to finish setting up. If it hasn&apos;t arrived
            in a few minutes, check your spam folder.
          </p>
        </div>

        <button
          onClick={() => router.push('/login')}
          className="mt-6 text-small text-ink-muted transition-colors hover:text-ink-high"
        >
          Go to sign in
        </button>
      </AuthShell>
    )
  }

  // altLabel is a literal, not t(): there is no signup.have_account key, and
  // t() returns the key itself when one is missing, so a `||` fallback never
  // fires and "signup.have_account" renders straight into the page.
  return (
    <AuthShell
      headline="Create your account"
      sub="Free plan, no card, about a minute."
      altHref="/login"
      altLabel="Sign in"
      asideNote={<SignupPerks />}
    >
      {refCode && (
        <div className="mb-6 rounded-xl border border-amber/40 bg-amber/10 px-4 py-3">
          <p className="font-mono text-eyebrow uppercase text-amber">Invited by a friend</p>
          <p className="mt-1.5 text-small text-ink-muted">
            Your referral code <span className="font-mono text-ink-high">{refCode}</span> is applied.
          </p>
        </div>
      )}

      <button
        onClick={handleGoogleSignup}
        disabled={googleLoading}
        className="tap flex w-full items-center justify-center gap-3 rounded-xl border border-edge py-3 text-small font-medium text-ink-body transition-colors hover:border-edge-lit hover:bg-panel disabled:opacity-50"
      >
        {googleLoading ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-edge border-t-ink-muted" />
        ) : (
          <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
        )}
        Continue with Google
      </button>

      <div className="my-7 flex items-center gap-4">
        <span className="h-px flex-1 bg-edge" />
        <span className="font-mono text-eyebrow uppercase text-ink-faint">{t('signup.divider') || 'or'}</span>
        <span className="h-px flex-1 bg-edge" />
      </div>

      <form onSubmit={handleSignup} className="space-y-5">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            name="email"
            autoComplete="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>

        <div>
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              name="new-password"
              autoComplete="new-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="pr-16"
            />
            <button
              type="button"
              onClick={() => setShowPassword(p => !p)}
              className="absolute right-1 top-1/2 flex h-9 -translate-y-1/2 items-center rounded-lg px-3 font-mono text-eyebrow uppercase text-ink-muted transition-colors hover:text-ink-high"
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>

          {password && (
            <div className="mt-3 flex items-center gap-3">
              <div className="flex h-1 flex-1 gap-1">
                {[0, 1, 2, 3].map(i => (
                  <span
                    key={i}
                    className={`h-full flex-1 rounded-full transition-colors ${
                      i < strength.score ? strength.color : 'bg-edge'
                    }`}
                  />
                ))}
              </div>
              <span className="font-mono text-eyebrow uppercase text-ink-muted">{strength.label}</span>
            </div>
          )}
        </div>

        <div>
          <Label htmlFor="confirm">Confirm password</Label>
          <Input
            id="confirm"
            type={showPassword ? 'text' : 'password'}
            name="confirm-password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            placeholder="Type it again"
          />
        </div>

        {/* Required. A real checkbox so keyboard and screen readers get the right thing. */}
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={tosAccepted}
            onChange={e => setTosAccepted(e.target.checked)}
            className="mt-0.5 h-4 w-4 flex-shrink-0 rounded border-edge bg-void accent-[var(--color-amber)]"
          />
          <span className="text-small leading-relaxed text-ink-muted">
            {t('signup.tos_i_agree')}{' '}
            <Link href="/terms" className="underline transition-colors hover:text-ink-high" onClick={e => e.stopPropagation()}>
              {t('signup.tos_terms')}
            </Link>
            {' '}{t('signup.and')}{' '}
            <Link href="/privacy" className="underline transition-colors hover:text-ink-high" onClick={e => e.stopPropagation()}>
              {t('signup.privacy')}
            </Link>
          </span>
        </label>

        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={newsletterOptIn}
            onChange={e => setNewsletterOptIn(e.target.checked)}
            className="mt-0.5 h-4 w-4 flex-shrink-0 rounded border-edge bg-void accent-[var(--color-amber)]"
          />
          <span className="text-small leading-relaxed text-ink-muted">
            Send me <span className="text-ink-body">IRIS Dispatch</span>, the biweekly
            build-in-public newsletter. Unsubscribe anytime.
          </span>
        </label>

        {error && <ErrorNote>{error}</ErrorNote>}

        <Submit loading={loading} loadingLabel="Creating account">
          Create account
        </Submit>
      </form>

      <p className="mt-7 text-small text-ink-muted">
        Already have an account?{' '}
        <Link href="/login" className="text-amber underline underline-offset-2 transition-colors hover:text-amber/80">
          Sign in
        </Link>
      </p>
    </AuthShell>
  )
}

export default function Signup() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-void" />}>
      <SignupForm />
    </Suspense>
  )
}
