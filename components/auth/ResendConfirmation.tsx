'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { friendlyResendError } from '@/lib/email-help'

/**
 * "Send it again" for the signup confirmation email.
 *
 * Neither the screen after signup nor the login page offered one, so someone
 * whose confirmation landed in spam, or never came, had no way forward. Supabase
 * allows one resend a minute per address, so the button counts that down rather
 * than letting people click into an error.
 */
export default function ResendConfirmation({
  email,
  redirect,
  label = 'Send it again',
  startCoolingDown = false,
}: {
  email: string
  /** Where to land after confirming, passed through the auth callback. */
  redirect?: string
  label?: string
  /** True right after signup, when the first email went out seconds ago. */
  startCoolingDown?: boolean
}) {
  const [sending, setSending] = useState(false)
  const [sentOnce, setSentOnce] = useState(false)
  const [cooldown, setCooldown] = useState(startCoolingDown ? 60 : 0)
  const [error, setError] = useState('')

  useEffect(() => {
    if (cooldown <= 0) return
    const id = setTimeout(() => setCooldown(c => c - 1), 1000)
    return () => clearTimeout(id)
  }, [cooldown])

  const send = async () => {
    setSending(true)
    setError('')
    const origin = window.location.origin
    const { error: err } = await supabase.auth.resend({
      type: 'signup',
      email: email.trim(),
      options: {
        emailRedirectTo: redirect
          ? `${origin}/auth/callback?redirect=${encodeURIComponent(redirect)}`
          : `${origin}/auth/callback`,
      },
    })
    setSending(false)
    if (err) {
      setError(friendlyResendError(err.message))
      return
    }
    setSentOnce(true)
    setCooldown(60)
  }

  return (
    <div>
      <button
        type="button"
        onClick={send}
        disabled={sending || cooldown > 0 || !email.trim()}
        className="tap min-h-[44px] rounded-xl border border-edge px-4 text-small font-medium text-ink-body transition-colors hover:border-edge-lit hover:bg-panel disabled:cursor-not-allowed disabled:opacity-50"
      >
        {sending ? 'Sending…' : cooldown > 0 ? `${label} in ${cooldown}s` : label}
      </button>
      <p aria-live="polite" className="mt-2 text-small">
        {error
          ? <span className="text-alert">{error}</span>
          : sentOnce && <span className="text-jade">Sent again. Check your inbox and spam folder.</span>}
      </p>
    </div>
  )
}
