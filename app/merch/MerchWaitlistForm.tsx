'use client'
import { useState } from 'react'

const amber    = '#F59E0B'
const amberDim = '#D97706'
const surface2 = '#161616'
const border   = '#222222'
const muted    = '#6b7280'

export function MerchWaitlistForm() {
  const [email, setEmail]   = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  async function handleNotify(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !email.includes('@')) return
    setStatus('loading')
    try {
      const res = await fetch('/api/merch/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (res.ok) { setStatus('success'); setEmail('') }
      else setStatus('error')
    } catch { setStatus('error') }
  }

  if (status === 'success') {
    return (
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 10,
        background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)',
        borderRadius: 12, padding: '14px 24px',
      }}>
        <span style={{ fontSize: 18 }}>✅</span>
        <span style={{ fontSize: 14, fontWeight: 700, color: '#10B981' }}>
          You&apos;re on the list! We&apos;ll keep you updated on new drops.
        </span>
      </div>
    )
  }

  return (
    <>
      <form onSubmit={handleNotify} style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          style={{
            padding: '12px 18px', borderRadius: 10, fontSize: 14,
            background: surface2, border: `1px solid ${border}`,
            color: '#f1f1f1', outline: 'none', minWidth: 260,
            fontFamily: 'inherit',
          }}
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          style={{
            padding: '12px 24px', borderRadius: 10, fontSize: 14, fontWeight: 800,
            background: status === 'loading' ? amberDim : amber, color: '#000',
            border: 'none', cursor: status === 'loading' ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit', whiteSpace: 'nowrap',
          }}
        >
          {status === 'loading' ? 'Saving...' : 'Notify Me →'}
        </button>
      </form>
      {status === 'error' && (
        <p style={{ fontSize: 13, color: '#f87171', marginTop: 12 }}>Something went wrong. Please try again.</p>
      )}
    </>
  )
}
