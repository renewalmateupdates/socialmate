'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import AuthShell from '@/components/instrument/AuthShell'
import { Label, Input, ErrorNote, Submit } from '@/components/instrument/form'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  // Track whether a valid recovery session exists
  const [sessionReady, setSessionReady] = useState(false)
  const [sessionChecking, setSessionChecking] = useState(true)
  const router = useRouter()

  // Verify there's an active recovery session on mount
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      // Supabase sets the session type to 'recovery' when the user arrives via the link
      if (session) setSessionReady(true)
      setSessionChecking(false)
    }
    checkSession()

    // Also listen for PASSWORD_RECOVERY in case the token is still being
    // exchanged when the component mounts
    const { data: { subscription } } = supabase.auth.onAuthStateChange(event => {
      if (event === 'PASSWORD_RECOVERY') {
        setSessionReady(true)
        setSessionChecking(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password) { setError('Enter a new password.'); return }
    if (password.length < 6) { setError('Passwords need to be at least 6 characters.'); return }
    if (password !== confirmPassword) { setError("Those two passwords don't match."); return }
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.updateUser({ password })
    if (error) { setError(error.message); setLoading(false); return }
    setDone(true)
    setTimeout(() => router.push('/dashboard'), 2000)
  }

  if (sessionChecking) {
    return (
      <AuthShell headline="Checking your link">
        <div className="flex items-center gap-3 rounded-2xl border border-edge bg-panel px-5 py-4">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-edge border-t-amber" />
          <p className="text-small text-ink-muted">Verifying the reset link</p>
        </div>
      </AuthShell>
    )
  }

  if (!sessionReady && !done) {
    return (
      <AuthShell
        headline="That link has expired"
        sub="Reset links are good for one hour, and only once."
        altHref="/login"
        altLabel="Back to sign in"
      >
        <Link
          href="/forgot-password"
          className="tap flex w-full items-center justify-center rounded-xl bg-amber py-3.5 text-small font-semibold text-void transition-colors hover:bg-amber/90"
        >
          Send a new link
        </Link>
      </AuthShell>
    )
  }

  if (done) {
    return (
      <AuthShell headline="Password updated" sub="Taking you to your dashboard.">
        <div className="flex items-center gap-3 rounded-2xl border border-jade/40 bg-jade/10 px-5 py-4">
          {/* jade, because something genuinely succeeded */}
          <span className="h-1.5 w-1.5 rounded-full bg-jade" aria-hidden="true" />
          <p className="font-mono text-eyebrow uppercase text-jade">Signed in</p>
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell
      headline="Set a new password"
      sub="Pick something you haven't used before."
      altHref="/login"
      altLabel="Back to sign in"
    >
      <form onSubmit={handleReset} className="space-y-5">
        <div>
          <Label htmlFor="password">New password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              name="new-password"
              autoComplete="new-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              autoFocus
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

        {error && <ErrorNote>{error}</ErrorNote>}

        <Submit loading={loading} loadingLabel="Updating">
          Update password
        </Submit>
      </form>
    </AuthShell>
  )
}
