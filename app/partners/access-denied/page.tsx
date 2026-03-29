'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

const gold   = '#F59E0B'
const purple = '#7C3AED'
const dark   = '#0a0a0a'
const border  = '#222222'
const muted   = '#6b7280'

export default function AccessDeniedPage() {
  const [loggedIn, setLoggedIn] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setLoggedIn(!!user))
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: dark, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>

      <div style={{ width: '100%', maxWidth: 500, textAlign: 'center' }}>

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
          <span style={{ color: gold, fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Access Denied</span>
        </div>

        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#f1f1f1', margin: '0 0 12px', letterSpacing: '-0.02em' }}>
          Partner access required
        </h1>

        <p style={{ fontSize: 15, color: muted, lineHeight: 1.7, margin: '0 0 32px' }}>
          The SocialMate Partner Portal is invite-only. You need to be an approved affiliate partner to access the dashboard, earnings, and promo codes.
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
          <a
            href="mailto:hello@socialmate.studio?subject=Affiliate Partner Application"
            style={{
              display: 'block', padding: '12px 24px', borderRadius: 10, border: 'none',
              background: `linear-gradient(135deg, ${gold}, ${purple})`,
              color: '#fff', fontSize: 14, fontWeight: 700, textDecoration: 'none',
              textAlign: 'center',
            }}
          >
            Apply to become a partner →
          </a>

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
