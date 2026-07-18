'use client'
import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import AuthShell from '@/components/instrument/AuthShell'
import { Label, Input, ErrorNote, Submit } from '@/components/instrument/form'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) { setError('Enter the email address on your account.'); return }
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) { setError(error.message); setLoading(false); return }
    setSent(true)
    setLoading(false)
  }

  if (sent) {
    return (
      <AuthShell
        headline="Check your inbox"
        sub="If that address has an account, a reset link is on its way."
        altHref="/login"
        altLabel="Back to sign in"
      >
        <div className="rounded-2xl border border-edge bg-panel p-6">
          <p className="font-mono text-eyebrow uppercase text-ink-muted">Sent to</p>
          <p className="mt-2 font-mono text-mono text-ink-high">{email}</p>
          <p className="mt-5 text-small leading-relaxed text-ink-muted">
            The link opens a page where you can set a new password. It expires in an
            hour. If it hasn&apos;t arrived in a few minutes, check your spam folder.
          </p>
        </div>

        <div className="mt-6">
          <Link
            href="/login"
            className="tap flex w-full items-center justify-center rounded-xl bg-amber py-3.5 text-small font-semibold text-void transition-colors hover:bg-amber/90"
          >
            Back to sign in
          </Link>
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell
      headline="Reset your password"
      sub="We'll email you a link to set a new one."
      altHref="/login"
      altLabel="Back to sign in"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
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
            autoFocus
          />
        </div>

        {error && <ErrorNote>{error}</ErrorNote>}

        <Submit loading={loading} loadingLabel="Sending">
          Send reset link
        </Submit>
      </form>

      <p className="mt-6 text-small text-ink-muted">
        Remember it?{' '}
        <Link href="/login" className="text-amber underline underline-offset-2 transition-colors hover:text-amber/80">
          Sign in
        </Link>
      </p>
    </AuthShell>
  )
}
