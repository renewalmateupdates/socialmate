'use client'
import { useState } from 'react'
import Link from 'next/link'

// Design tokens matching /give page
const amber    = '#F59E0B'
const amberDim = '#D97706'
const dark     = '#0a0a0a'
const surface  = '#111111'
const surface2 = '#161616'
const border   = '#222222'
const muted    = '#6b7280'

const PRODUCTS = [
  {
    emoji: '👕',
    name: 'Classic Tee',
    description: 'Your handle. Your brand. The SM-Give mark — right there on the chest.',
    price: 'TBD',
    color: '#3B82F6',
    colorDim: 'rgba(59,130,246,0.1)',
    colorBorder: 'rgba(59,130,246,0.25)',
  },
  {
    emoji: '🧥',
    name: 'Creator Hoodie',
    description: 'Premium heavyweight fleece. Wear the mission in comfort. Printed with your identity.',
    price: 'TBD',
    color: '#8B5CF6',
    colorDim: 'rgba(139,92,246,0.1)',
    colorBorder: 'rgba(139,92,246,0.25)',
  },
  {
    emoji: '☕',
    name: 'Brand Mug',
    description: 'Start every morning as a creator. 11oz ceramic. Handle-logo front, SM-Give mark back.',
    price: 'TBD',
    color: '#10B981',
    colorDim: 'rgba(16,185,129,0.1)',
    colorBorder: 'rgba(16,185,129,0.25)',
  },
]

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Pick your item',
    desc: 'Choose from tees, hoodies, mugs, and more. Every item ships globally through our print partner.',
  },
  {
    step: '02',
    title: 'Submit your handle or logo',
    desc: 'Drop your social handle, channel name, or upload your brand logo. We personalize it so it feels like yours.',
  },
  {
    step: '03',
    title: 'We fulfill globally',
    desc: 'Orders are printed on demand and shipped worldwide. No inventory, no waste — just your merch, made fresh.',
  },
  {
    step: '04',
    title: '75% of profit → SM-Give',
    desc: 'Three quarters of every order\'s profit goes directly to school supplies, baby essentials, and homeless care packages.',
  },
]

export default function MerchPage() {
  const [email, setEmail] = useState('')
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
      if (res.ok) {
        setStatus('success')
        setEmail('')
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: dark, fontFamily: 'inherit', display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <header style={{
        padding: '20px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: `1px solid ${border}`,
        position: 'sticky', top: 0, background: dark, zIndex: 50,
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: '#000',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 800, color: '#fff', flexShrink: 0,
          }}>S</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 16, fontWeight: 800, color: '#f1f1f1' }}>SocialMate</span>
            <span style={{
              fontSize: 10, color: '#000', fontWeight: 800,
              background: amber, padding: '2px 7px', borderRadius: 4,
              textTransform: 'uppercase', letterSpacing: '0.06em',
            }}>Merch</span>
          </div>
        </Link>
        <Link href="/" style={{ fontSize: 13, color: muted, textDecoration: 'none' }}>← Back to SocialMate</Link>
      </header>

      {/* Hero */}
      <section style={{ padding: '72px 24px 64px', textAlign: 'center', maxWidth: 760, margin: '0 auto', width: '100%' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)',
          borderRadius: 20, padding: '6px 16px', marginBottom: 28,
        }}>
          <span style={{ fontSize: 14 }}>👕</span>
          <span style={{ color: amber, fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Creator Merch · Powered by Purpose
          </span>
        </div>

        <h1 style={{
          fontSize: 'clamp(38px, 6vw, 60px)', fontWeight: 900, color: '#f1f1f1',
          letterSpacing: '-0.03em', lineHeight: 1.08, margin: '0 0 20px',
        }}>
          Wear the mission.
        </h1>

        <p style={{
          fontSize: 18, color: '#9ca3af', lineHeight: 1.75,
          margin: '0 auto 36px', maxWidth: 580,
        }}>
          Your handle. Your brand. The SM-Give charity mark. On every item, 75% of the profit goes
          to school supplies, baby essentials, and homeless care packages. Merch that means something.
        </p>

        {/* Stat pills */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap', marginBottom: 16 }}>
          {[
            { value: '75%', label: 'of profit to SM-Give' },
            { value: '🌍', label: 'Global fulfillment' },
            { value: '🎨', label: 'Your handle + logo' },
          ].map(s => (
            <div key={s.label} style={{
              background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)',
              borderRadius: 12, padding: '12px 20px', textAlign: 'center',
            }}>
              <div style={{ fontSize: 22, fontWeight: 900, color: amber, letterSpacing: '-0.02em' }}>{s.value}</div>
              <div style={{ fontSize: 12, color: '#d1d5db', fontWeight: 600, marginTop: 3 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section style={{ maxWidth: 880, margin: '0 auto', padding: '0 24px 72px', width: '100%' }}>
        <h2 style={{ fontSize: 26, fontWeight: 800, color: '#f1f1f1', textAlign: 'center', margin: '0 0 36px', letterSpacing: '-0.02em' }}>
          How it works
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          {HOW_IT_WORKS.map(item => (
            <div key={item.step} style={{
              background: surface, border: `1px solid ${border}`,
              borderRadius: 16, padding: '22px 22px', position: 'relative', overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: 2,
                background: `linear-gradient(90deg, transparent, ${amber}, transparent)`, opacity: 0.5,
              }} />
              <div style={{
                fontSize: 11, fontWeight: 800, color: amber,
                textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10,
              }}>Step {item.step}</div>
              <p style={{ fontSize: 15, fontWeight: 700, color: '#e5e7eb', margin: '0 0 8px', lineHeight: 1.4 }}>{item.title}</p>
              <p style={{ fontSize: 13, color: muted, margin: 0, lineHeight: 1.65 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Product teaser grid */}
      <section style={{ maxWidth: 880, margin: '0 auto', padding: '0 24px 72px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: '#f1f1f1', margin: '0 0 10px', letterSpacing: '-0.02em' }}>
            What&apos;s coming
          </h2>
          <p style={{ fontSize: 14, color: muted, margin: 0, lineHeight: 1.6 }}>
            These are the first drops. Every item carries your brand and the SM-Give mark.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
          {PRODUCTS.map(product => (
            <div key={product.name} style={{
              background: surface, border: `1px solid ${product.colorBorder}`,
              borderRadius: 20, padding: '32px 28px', position: 'relative', overflow: 'hidden',
              display: 'flex', flexDirection: 'column', gap: 14,
            }}>
              {/* Top color glow */}
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: 2,
                background: `linear-gradient(90deg, transparent, ${product.color}, transparent)`,
              }} />

              {/* Coming Soon badge */}
              <div style={{ position: 'absolute', top: 16, right: 16 }}>
                <span style={{
                  fontSize: 10, fontWeight: 800, color: '#000',
                  background: amber, padding: '3px 9px', borderRadius: 6,
                  textTransform: 'uppercase', letterSpacing: '0.06em',
                }}>Coming Soon</span>
              </div>

              {/* Icon */}
              <div style={{
                width: 64, height: 64, borderRadius: 18,
                background: product.colorDim, border: `1px solid ${product.colorBorder}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 30,
              }}>
                {product.emoji}
              </div>

              <div>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: '#f1f1f1', margin: '0 0 6px', letterSpacing: '-0.01em' }}>
                  {product.name}
                </h3>
                <p style={{ fontSize: 13, color: '#9ca3af', margin: 0, lineHeight: 1.65 }}>
                  {product.description}
                </p>
              </div>

              {/* SM-Give badge */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)',
                borderRadius: 8, padding: '5px 10px', alignSelf: 'flex-start',
              }}>
                <span style={{ fontSize: 11, color: '#10B981', fontWeight: 700 }}>❤️ 75% → SM-Give</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Custom merch / differentiator section */}
      <section style={{ maxWidth: 880, margin: '0 auto', padding: '0 24px 72px', width: '100%' }}>
        <div style={{
          background: `linear-gradient(135deg, rgba(245,158,11,0.06), rgba(139,92,246,0.04))`,
          border: `1px solid rgba(245,158,11,0.2)`,
          borderRadius: 24, padding: '48px 40px',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 640 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)',
              borderRadius: 10, padding: '5px 12px', alignSelf: 'flex-start',
            }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: amber, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                For Creators & Agencies
              </span>
            </div>

            <h2 style={{ fontSize: 28, fontWeight: 900, color: '#f1f1f1', margin: 0, letterSpacing: '-0.02em', lineHeight: 1.15 }}>
              Want your brand on it?
            </h2>

            <p style={{ fontSize: 15, color: '#9ca3af', margin: 0, lineHeight: 1.8 }}>
              No other merch platform ties your brand, your social identity, and a charity mark together in one item.
              SocialMate Merch lets creators and agencies put their <strong style={{ color: '#e5e7eb' }}>handle or logo</strong> front-and-center
              alongside the <strong style={{ color: '#10B981' }}>SM-Give mark</strong> — so every time someone
              wears your merch, they&apos;re also advertising that you give back.
            </p>

            <p style={{ fontSize: 15, color: '#9ca3af', margin: 0, lineHeight: 1.8 }}>
              That&apos;s a story no Shopify store can tell on its own.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
              {[
                'Your @handle or logo printed on every item',
                'SM-Give charity mark co-branded alongside your brand',
                '75% of profit goes to real people — kids, parents, and those experiencing homelessness',
                'Global print-on-demand — no inventory required',
                'Available to all SocialMate users (Pro, Agency, and beyond)',
              ].map(point => (
                <div key={point} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <span style={{ color: amber, fontWeight: 800, fontSize: 14, flexShrink: 0, marginTop: 1 }}>✓</span>
                  <span style={{ fontSize: 14, color: '#d1d5db', lineHeight: 1.55 }}>{point}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Waitlist CTA */}
      <section style={{ maxWidth: 880, margin: '0 auto', padding: '0 24px 80px', width: '100%' }}>
        <div style={{
          background: surface, border: `1px solid ${border}`,
          borderRadius: 24, padding: '48px 40px', textAlign: 'center',
        }}>
          <span style={{ fontSize: 36 }}>🚀</span>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: '#f1f1f1', margin: '16px 0 10px', letterSpacing: '-0.02em' }}>
            Get notified when we launch
          </h2>
          <p style={{ fontSize: 15, color: muted, margin: '0 auto 28px', maxWidth: 440, lineHeight: 1.7 }}>
            Drop your email and you&apos;ll be first to know when SocialMate Merch goes live. No spam — just the launch.
          </p>

          {status === 'success' ? (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)',
              borderRadius: 12, padding: '14px 24px',
            }}>
              <span style={{ fontSize: 18 }}>✅</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#10B981' }}>
                You&apos;re on the list! We&apos;ll let you know when merch drops.
              </span>
            </div>
          ) : (
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
          )}

          {status === 'error' && (
            <p style={{ fontSize: 13, color: '#f87171', marginTop: 12 }}>
              Something went wrong. Please try again.
            </p>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: `1px solid ${border}`, padding: '28px 24px', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, flexWrap: 'wrap', marginBottom: 12 }}>
          <Link href="/give" style={{ fontSize: 13, color: '#10B981', textDecoration: 'none', fontWeight: 600 }}>
            ❤️ SM-Give — How we give back
          </Link>
          <Link href="/signup" style={{ fontSize: 13, color: muted, textDecoration: 'none' }}>
            Get started free
          </Link>
          <Link href="/affiliates" style={{ fontSize: 13, color: muted, textDecoration: 'none' }}>
            Affiliate program
          </Link>
          <Link href="/" style={{ fontSize: 13, color: muted, textDecoration: 'none' }}>
            ← SocialMate home
          </Link>
        </div>
        <p style={{ fontSize: 12, color: '#374151', margin: 0 }}>
          © 2026 SocialMate · Gilgamesh Enterprise LLC
        </p>
      </footer>

    </div>
  )
}
