'use client'
import { useState, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { isDisposableEmail } from '@/lib/disposable-email-domains'
import { useI18n } from '@/contexts/I18nContext'
import LoginSkeleton from './LoginSkeleton'
import AuthShell from '@/components/instrument/AuthShell'
import { Label, Input, ErrorNote, Submit } from '@/components/instrument/form'

function LoginInner() {
  const { t } = useI18n()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [magicSent, setMagicSent] = useState(false)
  const [mode, setMode] = useState<'password' | 'magic'>('password')

  // 2FA state
  const [mfaRequired, setMfaRequired] = useState(false)
  const [mfaFactorId, setMfaFactorId] = useState('')
  const [mfaCode, setMfaCode] = useState('')
  const [mfaLoading, setMfaLoading] = useState(false)

  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/dashboard'

  const handleGoogleLogin = async () => {
    setGoogleLoading(true)
    setError('')
    // On Android (inside Capacitor app), use custom URI scheme so the OS
    // intercepts the OAuth callback and routes it back into the app.
    const isAndroid = typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent)
    const callbackUrl = isAndroid
      ? 'studio.socialmate.app://auth/callback'
      : redirectTo && redirectTo !== '/dashboard'
        ? `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirectTo)}`
        : `${window.location.origin}/auth/callback`
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: callbackUrl },
    })
    if (error) { setError(error.message); setGoogleLoading(false) }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) { setError('Enter your email'); return }
    if (mode === 'password' && !password) { setError('Enter your password'); return }
    setLoading(true)
    setError('')

    if (mode === 'magic') {
      if (isDisposableEmail(email)) { setError('Disposable email addresses are not allowed.'); setLoading(false); return }
      const { error } = await supabase.auth.signInWithOtp({ email: email.trim() })
      if (error) { setError(error.message); setLoading(false); return }
      setMagicSent(true)
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (error) {
        setError(error.message === 'Invalid login credentials' ? 'Wrong email or password' : error.message)
        setLoading(false)
        return
      }

      if (data?.user) {
        // Check if 2FA is required
        const { data: factors } = await supabase.auth.mfa.listFactors()
        const totpFactor = factors?.totp?.find((f: any) => f.status === 'verified')
        if (totpFactor) {
          setMfaFactorId(totpFactor.id)
          setMfaRequired(true)
          setLoading(false)
          return
        }
        router.push(redirectTo)
      }
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  const handleMfaVerify = async () => {
    if (mfaCode.length !== 6) { setError('Enter the 6-digit code'); return }
    setMfaLoading(true)
    setError('')

    const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId: mfaFactorId })
    if (challengeError || !challenge) {
      setError(challengeError?.message || 'Challenge failed')
      setMfaLoading(false)
      return
    }

    const { error } = await supabase.auth.mfa.verify({
      factorId: mfaFactorId,
      challengeId: challenge.id,
      code: mfaCode,
    })

    if (error) {
      setError('Incorrect code — try again')
      setMfaLoading(false)
      return
    }

    router.push(redirectTo)
  }

  // ── 2FA challenge screen ──
  if (mfaRequired) {
    return (
      <AuthShell
        headline="Two-factor authentication"
        sub="Open your authenticator app and enter the six-digit code."
      >
        <div className="space-y-5">
          <div>
            <Label htmlFor="mfa">Code</Label>
            <input
              id="mfa"
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={mfaCode}
              onChange={e => setMfaCode(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              autoFocus
              className="w-full rounded-xl border border-edge bg-void px-4 py-4 text-center font-mono text-2xl tracking-[0.4em] text-ink-high transition-colors placeholder:text-ink-faint focus:border-amber focus:outline-none"
            />
          </div>

          {error && <ErrorNote>{error}</ErrorNote>}

          <button
            onClick={handleMfaVerify}
            disabled={mfaLoading || mfaCode.length !== 6}
            className="tap flex w-full items-center justify-center gap-2.5 rounded-xl bg-amber py-3.5 text-small font-semibold text-void transition-colors hover:bg-amber/90 disabled:opacity-50"
          >
            {mfaLoading && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-void/30 border-t-void" />
            )}
            Verify
          </button>

          <button
            onClick={() => { setMfaRequired(false); setMfaCode(''); setError('') }}
            className="text-small text-ink-muted transition-colors hover:text-ink-high"
          >
            Back to sign in
          </button>
        </div>
      </AuthShell>
    )
  }

  // ── Magic link sent screen ──
  if (magicSent) {
    return (
      <AuthShell headline="Check your inbox" sub="We sent you a one-click sign-in link.">
        <div className="rounded-2xl border border-edge bg-panel p-6">
          <p className="font-mono text-eyebrow uppercase text-ink-muted">Sent to</p>
          <p className="mt-2 font-mono text-mono text-ink-high">{email}</p>
          <p className="mt-5 text-small leading-relaxed text-ink-muted">
            Open the link on this device and you&apos;ll be signed in. No password needed.
            If it hasn&apos;t arrived in a few minutes, check your spam folder.
          </p>
        </div>

        <button
          onClick={() => { setMagicSent(false); setMode('password') }}
          className="mt-6 text-small text-ink-muted transition-colors hover:text-ink-high"
        >
          Use a password instead
        </button>
      </AuthShell>
    )
  }

  // ── Main login screen ──
  return (
    <AuthShell
      headline={t('login.headline')}
      sub={t('login.subheadline')}
      altHref="/signup"
      altLabel={t('login.sign_up')}
    >
      <button
        onClick={handleGoogleLogin}
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
        {t('login.google_cta')}
      </button>

      <p className="mt-3 text-small leading-relaxed text-ink-faint">
        Google may show an unfamiliar URL during sign-in. That&apos;s our auth provider,
        not a third party.
      </p>

      <div className="my-7 flex items-center gap-4">
        <span className="h-px flex-1 bg-edge" />
        <span className="font-mono text-eyebrow uppercase text-ink-faint">{t('login.or')}</span>
        <span className="h-px flex-1 bg-edge" />
      </div>

      {/* Segmented control. Mono labels, no emoji — this is a control, not decoration. */}
      <div className="mb-6 flex gap-1 rounded-xl border border-edge bg-panel p-1">
        {([
          { key: 'password', label: 'Password' },
          { key: 'magic',    label: 'Magic link' },
        ] as const).map(opt => (
          <button
            key={opt.key}
            onClick={() => { setMode(opt.key); setError('') }}
            aria-pressed={mode === opt.key}
            className={`flex-1 rounded-lg py-2 font-mono text-eyebrow uppercase transition-colors ${
              mode === opt.key
                ? 'bg-raised text-ink-high'
                : 'text-ink-muted hover:text-ink-high'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleLogin} className="space-y-5">
        <div>
          <Label htmlFor="email">{t('login.email_label')}</Label>
          <Input
            id="email"
            type="email"
            name="email"
            autoComplete="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoFocus
          />
        </div>

        {mode === 'password' && (
          <div>
            <div className="flex items-baseline justify-between">
              <Label htmlFor="password">{t('login.password_label')}</Label>
              <Link
                href="/forgot-password"
                className="text-small text-ink-muted transition-colors hover:text-ink-high"
              >
                {t('login.forgot_password')}
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                autoComplete="current-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Your password"
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
          </div>
        )}

        {mode === 'magic' && (
          <div className="rounded-xl border border-edge bg-panel px-4 py-3">
            <p className="text-small text-ink-muted">
              We&apos;ll email you a one-click sign-in link. No password needed.
            </p>
          </div>
        )}

        {error && <ErrorNote>{error}</ErrorNote>}

        <Submit
          loading={loading}
          loadingLabel={mode === 'magic' ? t('login.sending') : t('login.signing_in')}
        >
          {mode === 'magic' ? t('login.send_magic_link') : t('login.sign_in_cta')}
        </Submit>
      </form>

      <p className="mt-7 text-small text-ink-muted">
        {t('login.no_account')}{' '}
        <Link href="/signup" className="text-amber underline underline-offset-2 transition-colors hover:text-amber/80">
          {t('login.sign_up')}
        </Link>
      </p>

      <p className="mt-4 text-small text-ink-faint">
        {t('signup.tos_i_agree')}{' '}
        <Link href="/terms" className="underline transition-colors hover:text-ink-muted">{t('signup.tos_terms')}</Link>
        {' '}{t('signup.and')}{' '}
        <Link href="/privacy" className="underline transition-colors hover:text-ink-muted">{t('signup.privacy')}</Link>
      </p>
    </AuthShell>
  )
}

export default function Login() {
  return (
    // The fallback matters: LoginInner uses useSearchParams(), which opts this
    // page out of static prerendering. With an empty fallback the server sent
    // BLANK HTML for /login and nothing painted until the JS bundle hydrated —
    // a 20s white screen on slow mobile networks (Speed Insights RES 33).
    // A static skeleton fallback prerenders into the HTML and paints instantly.
    <Suspense fallback={<LoginSkeleton />}>
      <LoginInner />
    </Suspense>
  )
}
