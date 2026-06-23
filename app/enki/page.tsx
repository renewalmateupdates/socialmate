'use client'
import { useState } from 'react'
import Link from 'next/link'

const TIERS = [
  { value: 'citizen',   label: 'Citizen — Free',    color: '#10b981' },
  { value: 'commander', label: 'Commander — $15/mo', color: '#F59E0B' },
  { value: 'emperor',   label: 'Emperor — $29/mo',  color: '#7C3AED' },
]

export default function EnkiPage() {
  const [name, setName]       = useState('')
  const [email, setEmail]     = useState('')
  const [tier, setTier]       = useState<'citizen' | 'commander' | 'emperor'>('citizen')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) { setError('Email is required'); return }
    setLoading(true)
    setError(null)

    const res = await fetch('/api/enki/waitlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim() || null, email: email.trim(), tier_interest: tier }),
    })

    if (!res.ok) {
      const json = await res.json().catch(() => ({}))
      setError(json.error || 'Something went wrong. Try again.')
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#050505',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px',
      fontFamily: 'inherit',
    }}>
      {/* Glow */}
      <div style={{
        position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)',
        width: 600, height: 400,
        background: 'radial-gradient(ellipse at center, rgba(245,158,11,0.07) 0%, rgba(124,58,237,0.05) 50%, transparent 70%)',
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 460, textAlign: 'center' }}>

        {/* Icon */}
        <div style={{ fontSize: 56, marginBottom: 20, lineHeight: 1 }}>🤖</div>

        {/* Wordmark */}
        <h1 style={{
          margin: '0 0 12px',
          fontSize: 48,
          fontWeight: 900,
          letterSpacing: '-0.04em',
          background: 'linear-gradient(135deg, #F59E0B 0%, #7C3AED 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          Enki
        </h1>

        <p style={{ margin: '0 0 8px', fontSize: 16, color: '#d1d5db', lineHeight: 1.6, fontWeight: 500 }}>
          AI-powered trading intelligence.
        </p>
        <p style={{ margin: '0 0 40px', fontSize: 13, color: '#6b7280', lineHeight: 1.7 }}>
          Enki is moving to its own home. Sign up below to get early access
          and lock in founding member pricing.
        </p>

        {/* Form */}
        {success ? (
          <div style={{
            background: '#0d0d0d',
            border: '1px solid #1f2937',
            borderRadius: 20,
            padding: '40px 32px',
            boxShadow: '0 0 60px rgba(245,158,11,0.08)',
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
            <h2 style={{ margin: '0 0 10px', fontSize: 22, fontWeight: 900, color: '#f1f1f1' }}>
              You&apos;re on the list.
            </h2>
            <p style={{ margin: 0, fontSize: 14, color: '#9ca3af', lineHeight: 1.7 }}>
              We&apos;ll notify you the moment Enki opens for early access.
              Founding member pricing is locked in.
            </p>
          </div>
        ) : (
          <form
            onSubmit={submit}
            style={{
              background: '#0d0d0d',
              border: '1px solid #1f2937',
              borderRadius: 20,
              padding: '32px',
              boxShadow: '0 0 60px rgba(245,158,11,0.08)',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              textAlign: 'left',
            }}
          >
            {/* Name */}
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                Name (optional)
              </label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your name"
                style={{
                  width: '100%', padding: '11px 14px', borderRadius: 10,
                  background: '#0a0a0a', border: '1px solid #2d2d2d',
                  color: '#f1f1f1', fontSize: 14, outline: 'none',
                  boxSizing: 'border-box', fontFamily: 'inherit',
                }}
              />
            </div>

            {/* Email */}
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                Email *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                style={{
                  width: '100%', padding: '11px 14px', borderRadius: 10,
                  background: '#0a0a0a', border: '1px solid #2d2d2d',
                  color: '#f1f1f1', fontSize: 14, outline: 'none',
                  boxSizing: 'border-box', fontFamily: 'inherit',
                }}
              />
            </div>

            {/* Tier */}
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                Interested In
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                {TIERS.map(t => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setTier(t.value as typeof tier)}
                    style={{
                      flex: 1, padding: '9px 6px', borderRadius: 10, cursor: 'pointer',
                      border: `1px solid ${tier === t.value ? t.color : '#2d2d2d'}`,
                      background: tier === t.value ? `${t.color}18` : '#0a0a0a',
                      color: tier === t.value ? t.color : '#6b7280',
                      fontSize: 10, fontWeight: 700, fontFamily: 'inherit',
                      transition: 'all 0.15s',
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <p style={{ margin: 0, fontSize: 13, color: '#f87171' }}>{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '13px', borderRadius: 12, border: 'none',
                background: 'linear-gradient(135deg, #F59E0B, #7C3AED)',
                color: '#fff', fontSize: 15, fontWeight: 800,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1, fontFamily: 'inherit',
                marginTop: 4,
              }}
            >
              {loading ? 'Joining...' : 'Get Early Access →'}
            </button>

            <p style={{ margin: 0, fontSize: 11, color: '#374151', textAlign: 'center' }}>
              No spam. No commitment. No credit card for Citizen tier.
            </p>
          </form>
        )}

        {/* Existing user link */}
        <p style={{ marginTop: 28, fontSize: 13, color: '#4b5563' }}>
          Already a member?{' '}
          <Link href="/enki/dashboard" style={{ color: '#F59E0B', textDecoration: 'none', fontWeight: 600 }}>
            Go to your dashboard
          </Link>
        </p>

        {/* Back to SocialMate */}
        <p style={{ marginTop: 8, fontSize: 12, color: '#374151' }}>
          <Link href="/" style={{ color: '#6b7280', textDecoration: 'none' }}>
            ← Back to SocialMate
          </Link>
        </p>
      </div>
    </div>
  )
}
