'use client'
import { useState } from 'react'

interface Props {
  children: React.ReactNode
  className?: string
  defaultTier?: 'citizen' | 'commander' | 'emperor'
}

const TIERS = [
  { value: 'citizen',   label: 'Citizen — Free',          color: '#10b981' },
  { value: 'commander', label: 'Commander — $15/mo',       color: '#F59E0B' },
  { value: 'emperor',   label: 'Emperor — $29/mo',         color: '#7C3AED' },
]

export default function WaitlistButton({ children, className, defaultTier = 'citizen' }: Props) {
  const [open, setOpen]           = useState(false)
  const [name, setName]           = useState('')
  const [email, setEmail]         = useState('')
  const [tier, setTier]           = useState<'citizen' | 'commander' | 'emperor'>(defaultTier)
  const [loading, setLoading]     = useState(false)
  const [success, setSuccess]     = useState(false)
  const [error, setError]         = useState<string | null>(null)

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
    <>
      <button
        onClick={() => setOpen(true)}
        className={className}
        style={{ cursor: 'pointer', border: 'none', background: 'transparent', padding: 0, font: 'inherit', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
      >
        {children}
      </button>

      {open && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '24px',
            backdropFilter: 'blur(6px)',
          }}
          onClick={e => { if (e.target === e.currentTarget) { setOpen(false); setSuccess(false); setError(null) } }}
        >
          <div style={{
            background: '#111', border: '1px solid #333',
            borderRadius: 20, padding: '36px 32px',
            maxWidth: 460, width: '100%',
            boxShadow: '0 0 80px rgba(245,158,11,0.12)',
            animation: 'enkiModalIn 0.25s ease',
          }}>
            <style>{`
              @keyframes enkiModalIn {
                from { transform: scale(0.95) translateY(12px); opacity: 0; }
                to   { transform: scale(1) translateY(0);       opacity: 1; }
              }
            `}</style>

            {success ? (
              <div style={{ textAlign: 'center', padding: '12px 0' }}>
                <div style={{ fontSize: 56, marginBottom: 16 }}>🤖</div>
                <h3 style={{ margin: '0 0 10px', fontSize: 22, fontWeight: 900, color: '#f1f1f1', letterSpacing: '-0.02em' }}>
                  You're on the list.
                </h3>
                <p style={{ margin: '0 0 24px', fontSize: 14, color: '#9ca3af', lineHeight: 1.7 }}>
                  We'll notify you the moment Enki opens for beta access. Founding member pricing is locked in — no increases for you.
                </p>
                <button
                  onClick={() => { setOpen(false); setSuccess(false) }}
                  style={{
                    padding: '10px 28px', borderRadius: 12,
                    background: 'linear-gradient(135deg, #F59E0B, #7C3AED)',
                    border: 'none', color: '#fff', fontSize: 14, fontWeight: 700,
                    cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => { setOpen(false); setError(null) }}
                  style={{
                    position: 'absolute', top: 16, right: 16,
                    background: 'none', border: 'none', color: '#6b7280',
                    fontSize: 20, cursor: 'pointer', lineHeight: 1,
                  }}
                  aria-label="Close"
                >
                  ✕
                </button>

                <div style={{ marginBottom: 24 }}>
                  <div style={{ fontSize: 36, marginBottom: 10 }}>🤖</div>
                  <h3 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 900, color: '#f1f1f1', letterSpacing: '-0.02em' }}>
                    Join the Enki Waitlist
                  </h3>
                  <p style={{ margin: 0, fontSize: 13, color: '#9ca3af', lineHeight: 1.6 }}>
                    Be first to access the beta. Founding member pricing locked in — no price increases for early members.
                  </p>
                </div>

                <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                      Name (optional)
                    </label>
                    <input
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Your name"
                      style={{
                        width: '100%', padding: '10px 14px', borderRadius: 10,
                        background: '#0a0a0a', border: '1px solid #333',
                        color: '#f1f1f1', fontSize: 14, outline: 'none',
                        boxSizing: 'border-box', fontFamily: 'inherit',
                      }}
                    />
                  </div>

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
                        width: '100%', padding: '10px 14px', borderRadius: 10,
                        background: '#0a0a0a', border: '1px solid #333',
                        color: '#f1f1f1', fontSize: 14, outline: 'none',
                        boxSizing: 'border-box', fontFamily: 'inherit',
                      }}
                    />
                  </div>

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
                            flex: 1, padding: '8px 6px', borderRadius: 10, cursor: 'pointer',
                            border: `1px solid ${tier === t.value ? t.color : '#333'}`,
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
                      padding: '12px', borderRadius: 12, border: 'none',
                      background: 'linear-gradient(135deg, #F59E0B, #7C3AED)',
                      color: '#fff', fontSize: 14, fontWeight: 800,
                      cursor: loading ? 'not-allowed' : 'pointer',
                      opacity: loading ? 0.7 : 1, fontFamily: 'inherit',
                      marginTop: 4,
                    }}
                  >
                    {loading ? 'Joining...' : 'Join the Waitlist →'}
                  </button>

                  <p style={{ margin: 0, fontSize: 11, color: '#374151', textAlign: 'center' }}>
                    No spam. No commitment. No credit card for Citizen.
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
