'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

const gold   = '#F59E0B'
const purple = '#7C3AED'
const dark   = '#0a0a0a'
const border  = '#222222'
const muted   = '#6b7280'

const ADMIN_EMAIL = 'socialmatehq@gmail.com'

export default function AccessDeniedPage() {
  const [loggedIn, setLoggedIn]   = useState(false)
  const [applying, setApplying]   = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [sending, setSending]     = useState(false)
  const [form, setForm] = useState({ name: '', email: '', socials: '', why: '' })
  const [error, setError] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      // Admin should never see this page — send them straight to the portal
      if (user?.email === ADMIN_EMAIL) {
        window.location.replace('/admin/affiliates')
        return
      }
      setLoggedIn(!!user)
      if (user?.email) setForm(f => ({ ...f, email: user.email ?? '' }))
    })
  }, [])

  async function handleApply(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.email || !form.why) { setError('Please fill in all required fields.'); return }
    setSending(true)
    setError('')
    try {
      const res = await fetch('/api/partners/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setSubmitted(true)
      } else {
        const json = await res.json().catch(() => ({}))
        setError(json.error || 'Something went wrong. Please try again.')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: dark, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 500, textAlign: 'center' }}>

        {!applying ? (
          <>
            {/* Icon */}
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 32, margin: '0 auto 24px',
            }}>
              🔒
            </div>

            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(245,158,11,0.1)', border: `1px solid rgba(245,158,11,0.3)`,
              borderRadius: 20, padding: '6px 14px', marginBottom: 20,
            }}>
              <span style={{ color: gold, fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Partner Portal</span>
            </div>

            <h1 style={{ fontSize: 26, fontWeight: 800, color: '#f1f1f1', margin: '0 0 12px', letterSpacing: '-0.02em' }}>
              You don't have access yet
            </h1>

            <p style={{ fontSize: 15, color: muted, lineHeight: 1.7, margin: '0 0 32px' }}>
              The SocialMate Partner Portal is invite-only for now. If you'd like to become an affiliate partner, apply below — we review every application personally.
            </p>

            {/* What affiliates get */}
            <div style={{ background: '#111', border: `1px solid ${border}`, borderRadius: 14, padding: 24, marginBottom: 32, textAlign: 'left' }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: muted, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 16px' }}>
                Affiliate partners earn:
              </p>
              {[
                { icon: '💰', label: '30% recurring commission on subscriptions' },
                { icon: '🚀', label: '40% at 100+ active referrals' },
                { icon: '🎟️', label: 'Unique promo codes for your audience' },
                { icon: '📊', label: 'Real-time dashboard with conversion tracking' },
                { icon: '💳', label: 'Weekly payouts via Stripe Connect' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: i < 4 ? 12 : 0 }}>
                  <span style={{ fontSize: 16, flexShrink: 0 }}>{item.icon}</span>
                  <span style={{ fontSize: 14, color: '#d1d5db', lineHeight: 1.5 }}>{item.label}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button
                onClick={() => setApplying(true)}
                style={{
                  display: 'block', padding: '12px 24px', borderRadius: 10, border: 'none',
                  background: `linear-gradient(135deg, ${gold}, ${purple})`,
                  color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer',
                  textAlign: 'center', fontFamily: 'inherit',
                }}
              >
                Apply to become a partner →
              </button>

              {loggedIn ? (
                <button
                  onClick={() => supabase.auth.signOut().then(() => window.location.href = '/partners')}
                  style={{
                    padding: '11px 24px', borderRadius: 10, background: 'transparent',
                    border: `1px solid ${border}`, color: muted, fontSize: 14,
                    fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >
                  Sign out
                </button>
              ) : (
                <Link href="/partners" style={{
                  display: 'block', padding: '11px 24px', borderRadius: 10,
                  border: `1px solid ${border}`, color: muted, fontSize: 14,
                  fontWeight: 600, textDecoration: 'none', textAlign: 'center',
                }}>
                  Back to sign in
                </Link>
              )}
            </div>
          </>
        ) : submitted ? (
          <>
            <div style={{ fontSize: 56, marginBottom: 20 }}>🙌</div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#f1f1f1', margin: '0 0 12px' }}>Application received!</h1>
            <p style={{ fontSize: 14, color: muted, lineHeight: 1.7, marginBottom: 28 }}>
              We review every application personally. You'll hear back at <strong style={{ color: '#d1d5db' }}>{form.email}</strong> within a few days.
            </p>
            <Link href="/" style={{
              display: 'inline-block', padding: '11px 24px', borderRadius: 10,
              background: `linear-gradient(135deg, ${gold}, ${purple})`,
              color: '#fff', fontSize: 14, fontWeight: 700, textDecoration: 'none',
            }}>
              Back to SocialMate →
            </Link>
          </>
        ) : (
          <>
            <button
              onClick={() => { setApplying(false); setError('') }}
              style={{ background: 'none', border: 'none', color: muted, fontSize: 13, cursor: 'pointer', marginBottom: 24, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6, margin: '0 auto 24px' }}
            >
              ← Back
            </button>

            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(245,158,11,0.1)', border: `1px solid rgba(245,158,11,0.3)`,
              borderRadius: 20, padding: '6px 14px', marginBottom: 20,
            }}>
              <span style={{ color: gold, fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Partner Application</span>
            </div>

            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#f1f1f1', margin: '0 0 8px' }}>Tell us about yourself</h1>
            <p style={{ fontSize: 13, color: muted, lineHeight: 1.6, marginBottom: 28 }}>
              We'll review your application and reach out within a few days.
            </p>

            {error && (
              <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#f87171', textAlign: 'left' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleApply} style={{ display: 'flex', flexDirection: 'column', gap: 14, textAlign: 'left' }}>
              {[
                { key: 'name',    label: 'Your name *',                     placeholder: 'Joshua Bostic',                  type: 'text'  },
                { key: 'email',   label: 'Email *',                          placeholder: 'you@example.com',                type: 'email' },
                { key: 'socials', label: 'Social media handles or website',  placeholder: '@yourhandle / yoursite.com',      type: 'text'  },
              ].map(field => (
                <div key={field.key}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: muted, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    value={(form as any)[field.key]}
                    onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    style={{
                      width: '100%', padding: '10px 14px', borderRadius: 10,
                      background: '#0f0f0f', border: `1px solid ${border}`,
                      color: '#f1f1f1', fontSize: 14, outline: 'none',
                      boxSizing: 'border-box', fontFamily: 'inherit',
                    }}
                  />
                </div>
              ))}

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: muted, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Why do you want to partner with SocialMate? *
                </label>
                <textarea
                  value={form.why}
                  onChange={e => setForm(f => ({ ...f, why: e.target.value }))}
                  placeholder="Tell us about your audience, how you'd promote SocialMate, and why you'd be a great partner."
                  rows={4}
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: 10,
                    background: '#0f0f0f', border: `1px solid ${border}`,
                    color: '#f1f1f1', fontSize: 14, outline: 'none', resize: 'vertical',
                    boxSizing: 'border-box', fontFamily: 'inherit',
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={sending}
                style={{
                  width: '100%', padding: '12px 16px', borderRadius: 10, border: 'none',
                  background: `linear-gradient(135deg, ${gold}, ${purple})`,
                  color: '#fff', fontSize: 14, fontWeight: 700,
                  cursor: sending ? 'not-allowed' : 'pointer',
                  opacity: sending ? 0.6 : 1, fontFamily: 'inherit',
                }}
              >
                {sending ? 'Submitting...' : 'Submit application →'}
              </button>
            </form>
          </>
        )}

        <p style={{ marginTop: 24, fontSize: 12, color: '#374151' }}>
          Already invited?{' '}
          <Link href="/partners" style={{ color: gold, textDecoration: 'none' }}>
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  )
}
