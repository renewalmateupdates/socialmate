'use client'
import { useState } from 'react'
import Link from 'next/link'
import PublicLayout from '@/components/PublicLayout'

const gold   = '#F59E0B'
const dark   = '#0a0a0a'
const surface = '#111111'
const border  = '#1f1f1f'
const muted   = '#9ca3af'

const PILLARS = [
  {
    label: 'Build',
    icon: '🏗️',
    heading: 'Start from zero.',
    desc: 'Starting and growing a business or creative project without VC, without connections, without excuses. How to legally form your business, price your work, get your first sale, and keep going.',
  },
  {
    label: 'Create',
    icon: '🎙️',
    heading: 'Turn your story into your brand.',
    desc: 'Content strategy, platform building, and how to grow an audience without paid ads or luck. Your story is the product — this is how you package and ship it.',
  },
  {
    label: 'Become',
    icon: '🔥',
    heading: 'Do the unglamorous daily work.',
    desc: 'Mindset, habits, and the invisible reps that compound into something real. What nobody tells you about building alone — and how to keep going when nobody's watching.',
  },
]

export default function GilsGuidePage() {
  const [name, setName]       = useState('')
  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone]       = useState(false)
  const [err, setErr]         = useState('')

  async function handleSubscribe(e: React.FormEvent) {
    e.preventDefault()
    setErr('')
    if (!email || !email.includes('@')) {
      setErr('Enter a valid email address.')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/gils-guide/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name }),
      })
      const json = await res.json()
      if (json.success) {
        setDone(true)
      } else {
        setErr(json.error || 'Something went wrong. Try again.')
      }
    } catch {
      setErr('Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PublicLayout>
      <div style={{ background: dark, minHeight: '100vh', color: '#fff' }}>

        {/* ── HERO ─────────────────────────────────────────────────────────── */}
        <section style={{ maxWidth: 760, margin: '0 auto', padding: '80px 24px 72px', textAlign: 'center' }}>
          <span style={{
            display: 'inline-block', fontSize: 12, fontWeight: 700,
            color: gold, background: 'rgba(245,158,11,0.1)',
            border: `1px solid rgba(245,158,11,0.3)`,
            padding: '4px 14px', borderRadius: 999, marginBottom: 28, letterSpacing: '0.08em',
          }}>
            By Joshua Bostic — Founder of SocialMate
          </span>

          {/* Cover mock */}
          <div style={{
            width: 160, height: 220, margin: '0 auto 36px',
            borderRadius: 12,
            background: `linear-gradient(160deg, #1a1200, #0a0a0a)`,
            border: `2px solid ${gold}`,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 20px 60px rgba(245,158,11,0.18), 0 4px 24px rgba(0,0,0,0.8)`,
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', inset: 0,
              background: `radial-gradient(ellipse at top, rgba(245,158,11,0.12), transparent 65%)`,
              pointerEvents: 'none',
            }} />
            <div style={{ fontSize: 40, marginBottom: 10 }}>📖</div>
            <div style={{
              fontSize: 11, fontWeight: 900, color: gold,
              letterSpacing: '0.14em', textAlign: 'center',
              padding: '0 16px', lineHeight: 1.4, textTransform: 'uppercase',
            }}>
              Gilgamesh's<br />Guide
            </div>
            <div style={{ fontSize: 10, color: '#6b7280', marginTop: 8, letterSpacing: '0.06em' }}>
              Vol. 1
            </div>
          </div>

          <h1 style={{
            fontSize: 'clamp(42px, 8vw, 72px)', fontWeight: 900,
            lineHeight: 1.05, marginBottom: 18, letterSpacing: '-0.03em',
          }}>
            Gilgamesh's{' '}
            <span style={{ color: gold }}>Guide</span>
          </h1>

          <p style={{ fontSize: 18, color: '#d1d5db', maxWidth: 560, margin: '0 auto 14px', lineHeight: 1.7, fontWeight: 400 }}>
            A free guide for creators, builders, and entrepreneurs who refuse to wait for permission.
          </p>

          <p style={{ fontSize: 15, color: muted, marginBottom: 40, lineHeight: 1.6 }}>
            Free forever. No $997 course. Just real knowledge — from someone still in the trenches.
          </p>

          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="#download" style={{
              background: gold, color: '#000', fontWeight: 800,
              padding: '14px 28px', borderRadius: 14, fontSize: 15,
              textDecoration: 'none', display: 'inline-block',
            }}>
              Download Free →
            </a>
            <a href="#donate" style={{
              border: `1px solid #333`, color: '#d1d5db', fontWeight: 600,
              padding: '14px 28px', borderRadius: 14, fontSize: 15,
              textDecoration: 'none', display: 'inline-block',
            }}>
              Support the Guide →
            </a>
          </div>
        </section>

        {/* ── WHAT'S INSIDE ────────────────────────────────────────────────── */}
        <section style={{ borderTop: `1px solid ${border}`, padding: '72px 24px' }}>
          <div style={{ maxWidth: 900, margin: '0 auto' }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: muted, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 14, textAlign: 'center' }}>
              What's inside
            </p>
            <h2 style={{ fontSize: 'clamp(26px, 5vw, 38px)', fontWeight: 900, textAlign: 'center', marginBottom: 48, letterSpacing: '-0.02em' }}>
              Three pillars. One guide.
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
              {PILLARS.map(p => (
                <div key={p.label} style={{
                  background: surface, border: `1px solid ${border}`,
                  borderRadius: 20, padding: '32px 28px',
                  position: 'relative', overflow: 'hidden',
                }}>
                  <div style={{
                    position: 'absolute', top: 0, right: 0, width: 120, height: 120,
                    background: `radial-gradient(circle at top right, rgba(245,158,11,0.06), transparent 70%)`,
                    pointerEvents: 'none',
                  }} />
                  <div style={{ fontSize: 32, marginBottom: 16 }}>{p.icon}</div>
                  <div style={{
                    fontSize: 11, fontWeight: 700, color: gold,
                    letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8,
                  }}>
                    {p.label}
                  </div>
                  <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12, lineHeight: 1.3 }}>
                    {p.heading}
                  </h3>
                  <p style={{ fontSize: 14, color: muted, lineHeight: 1.75, margin: 0 }}>
                    {p.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── ABOUT THE AUTHOR ─────────────────────────────────────────────── */}
        <section style={{ borderTop: `1px solid ${border}`, padding: '72px 24px' }}>
          <div style={{ maxWidth: 680, margin: '0 auto' }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: muted, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 28 }}>
              About the author
            </p>
            <div style={{ display: 'flex', gap: 28, alignItems: 'flex-start', flexWrap: 'wrap' }}>
              {/* Photo placeholder */}
              <div style={{
                width: 80, height: 80, borderRadius: '50%', flexShrink: 0,
                background: `linear-gradient(135deg, ${gold}, #d97706)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 32, border: `2px solid rgba(245,158,11,0.4)`,
              }}>
                👑
              </div>
              <div style={{ flex: 1, minWidth: 240 }}>
                <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Joshua Bostic</h3>
                <p style={{ fontSize: 13, color: gold, fontWeight: 600, marginBottom: 16 }}>
                  Founder · SocialMate / Gilgamesh Enterprise LLC
                </p>
                <p style={{ fontSize: 15, color: '#d1d5db', lineHeight: 1.8, marginBottom: 16 }}>
                  Joshua works a deli job and builds SocialMate in his spare hours.
                  This guide is everything he wishes someone had handed him when he started —
                  the ungated, no-bullshit knowledge that wealthy families just have
                  and everyone else has to pay $997 for.
                </p>
                <p style={{ fontSize: 15, color: '#d1d5db', lineHeight: 1.8, marginBottom: 0 }}>
                  He's not a guru. He's still in it. That's the point.
                </p>
              </div>
            </div>

            {/* Pull quote */}
            <div style={{
              borderLeft: `3px solid ${gold}`,
              background: 'rgba(245,158,11,0.04)',
              borderRadius: '0 12px 12px 0',
              padding: '20px 24px',
              margin: '36px 0 0',
            }}>
              <p style={{ fontSize: 17, fontStyle: 'italic', color: '#f9fafb', lineHeight: 1.7, margin: 0 }}>
                "The goal isn't to sell you a course. The goal is to give you the door."
              </p>
              <p style={{ fontSize: 13, color: muted, marginTop: 10, marginBottom: 0 }}>
                — Joshua Bostic
              </p>
            </div>
          </div>
        </section>

        {/* ── DOWNLOAD SECTION ─────────────────────────────────────────────── */}
        <section id="download" style={{ borderTop: `1px solid ${border}`, padding: '72px 24px' }}>
          <div style={{ maxWidth: 560, margin: '0 auto', textAlign: 'center' }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: muted, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 14 }}>
              Get the guide
            </p>
            <h2 style={{ fontSize: 'clamp(24px, 5vw, 36px)', fontWeight: 900, marginBottom: 14, letterSpacing: '-0.02em' }}>
              Send me my free copy
            </h2>
            <p style={{ fontSize: 15, color: muted, marginBottom: 36, lineHeight: 1.7 }}>
              Enter your name and email — we'll send you the download link instantly.
              Free forever. No spam. Unsubscribe anytime.
            </p>

            {done ? (
              <div style={{
                background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)',
                borderRadius: 16, padding: '24px',
              }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>📬</div>
                <p style={{ color: '#22c55e', fontWeight: 700, fontSize: 16, margin: '0 0 8px' }}>
                  Check your inbox!
                </p>
                <p style={{ color: '#86efac', fontSize: 14, margin: 0, lineHeight: 1.6 }}>
                  Your copy of Gilgamesh's Guide is on its way. If it doesn't show up in a minute, check your spam folder.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 420, margin: '0 auto' }}>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Your name (optional)"
                  style={{
                    padding: '13px 16px', borderRadius: 12,
                    border: `1px solid ${border}`, background: surface, color: '#fff',
                    fontSize: 15, outline: 'none', width: '100%', boxSizing: 'border-box',
                  }}
                />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  style={{
                    padding: '13px 16px', borderRadius: 12,
                    border: `1px solid ${border}`, background: surface, color: '#fff',
                    fontSize: 15, outline: 'none', width: '100%', boxSizing: 'border-box',
                  }}
                />
                <button type="submit" disabled={loading} style={{
                  background: gold, color: '#000', fontWeight: 800,
                  padding: '14px', borderRadius: 12, border: 'none',
                  fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1, width: '100%',
                }}>
                  {loading ? 'Sending...' : 'Send me the guide →'}
                </button>
                {err && (
                  <p style={{ color: '#ef4444', fontSize: 13, margin: 0, textAlign: 'center' }}>{err}</p>
                )}
              </form>
            )}

            <p style={{ fontSize: 12, color: '#6b7280', marginTop: 16 }}>
              Free forever. No spam. Unsubscribe anytime.
            </p>
          </div>
        </section>

        {/* ── DONATION SECTION ─────────────────────────────────────────────── */}
        <section id="donate" style={{ borderTop: `1px solid ${border}`, padding: '72px 24px' }}>
          <div style={{ maxWidth: 560, margin: '0 auto', textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>❤️</div>
            <p style={{ fontSize: 11, fontWeight: 700, color: muted, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 14 }}>
              Pay it forward
            </p>
            <h2 style={{ fontSize: 'clamp(24px, 5vw, 34px)', fontWeight: 900, marginBottom: 16, letterSpacing: '-0.02em' }}>
              If this guide helps you, give back.
            </h2>
            <p style={{ fontSize: 15, color: '#d1d5db', lineHeight: 1.75, marginBottom: 12 }}>
              The guide is free and always will be. But if it unlocks something for you —
              a business, a direction, a mindset shift — consider donating.
            </p>
            <p style={{ fontSize: 15, color: muted, lineHeight: 1.75, marginBottom: 36 }}>
              <strong style={{ color: gold }}>100% of donations go to SM-Give</strong> — our community fund for creators in need.
              You're not just supporting a guide. You're opening the door for the next person.
            </p>

            <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/give" style={{
                background: 'rgba(244,63,94,0.12)', border: '1px solid rgba(244,63,94,0.4)',
                color: '#fb7185', fontWeight: 700, padding: '13px 26px',
                borderRadius: 14, fontSize: 15, textDecoration: 'none', display: 'inline-block',
              }}>
                ❤️ Donate via SM-Give →
              </Link>
              <Link href="/pricing" style={{
                border: `1px solid ${border}`, color: muted,
                fontWeight: 600, padding: '13px 26px',
                borderRadius: 14, fontSize: 15, textDecoration: 'none', display: 'inline-block',
              }}>
                Try SocialMate Free →
              </Link>
            </div>

            <p style={{ fontSize: 13, color: '#6b7280', marginTop: 24, lineHeight: 1.6 }}>
              SM-Give is SocialMate's initiative to give back as we grow.<br />
              Every donation goes toward creators and entrepreneurs in need.
            </p>
          </div>
        </section>

      </div>
    </PublicLayout>
  )
}
