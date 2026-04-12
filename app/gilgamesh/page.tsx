'use client'
import { useState } from 'react'
import Link from 'next/link'
import PublicLayout from '@/components/PublicLayout'

const gold   = '#F59E0B'
const dark   = '#0a0a0a'
const surface = '#111111'
const border  = '#1f1f1f'
const muted   = '#9ca3af'

const WHATS_INSIDE = [
  'How to legally form your business — LLC vs sole prop, which state, and why it matters',
  'Choosing a business name and protecting it without a lawyer',
  'Opening a business bank account with $0',
  'Building your first product or service without outside funding',
  'How to price your work when you have no clients yet',
  'Free tools to run a real business on a tight budget',
  'Your first sale: how to get it without a marketing budget',
  'Taxes, quarterly payments, and what actually matters when you\'re starting out',
  'Building an online presence from zero',
  'The mindset chapter: what nobody tells you about building alone',
]

const COMING_SOON = [
  {
    vol: 'Volume 2',
    title: 'Building an Audience from Zero',
    desc: 'How to grow an audience for your business or brand — without paid ads or luck.',
  },
  {
    vol: 'Volume 3',
    title: 'Creator Tools & Systems',
    desc: 'The free and affordable tools that actually work for solo builders.',
  },
  {
    vol: 'Volume 4',
    title: 'The Money Chapter',
    desc: 'Revenue, taxes, saving, and building financial stability from nothing.',
  },
]

export default function GilgameshGuidePage() {
  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone]       = useState(false)
  const [existing, setExisting] = useState(false)
  const [err, setErr]         = useState('')

  async function handleWaitlist(e: React.FormEvent) {
    e.preventDefault()
    setErr('')
    if (!email || !email.includes('@')) { setErr('Enter a valid email address.'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/gilgamesh/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const json = await res.json()
      if (json.success) {
        setDone(true)
        setExisting(json.existing ?? false)
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
        <section style={{ maxWidth: 760, margin: '0 auto', padding: '80px 24px 64px', textAlign: 'center' }}>
          <span style={{
            display: 'inline-block', fontSize: 12, fontWeight: 700,
            color: gold, background: 'rgba(245,158,11,0.1)',
            border: `1px solid rgba(245,158,11,0.3)`,
            padding: '4px 14px', borderRadius: 999, marginBottom: 28, letterSpacing: '0.08em',
          }}>
            From the founder of SocialMate
          </span>

          <h1 style={{ fontSize: 'clamp(48px, 8vw, 80px)', fontWeight: 900, lineHeight: 1.05, marginBottom: 16, letterSpacing: '-0.03em' }}>
            Gilgamesh's{' '}
            <span style={{ color: gold }}>Guide</span>
          </h1>

          <p style={{ fontSize: 18, color: muted, fontStyle: 'italic', marginBottom: 24, lineHeight: 1.6 }}>
            "Knowledge is the only door no one can close behind you."
          </p>

          <p style={{ fontSize: 17, color: '#d1d5db', maxWidth: 580, margin: '0 auto 36px', lineHeight: 1.75 }}>
            Free guides for creators, entrepreneurs, and builders who are figuring it out without a roadmap.
            No gatekeeping. No $997 courses. Just real knowledge — free, forever.
          </p>

          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
            <a href="#guide"
              style={{
                background: gold, color: '#000', fontWeight: 800,
                padding: '14px 28px', borderRadius: 14, fontSize: 15,
                textDecoration: 'none', display: 'inline-block',
              }}>
              Get the First Guide Free →
            </a>
            <Link href="/story"
              style={{
                border: `1px solid #333`, color: '#d1d5db', fontWeight: 600,
                padding: '14px 28px', borderRadius: 14, fontSize: 15,
                textDecoration: 'none', display: 'inline-block',
              }}>
              Our mission
            </Link>
          </div>
          <p style={{ fontSize: 13, color: '#6b7280' }}>Always free. Always will be.</p>
        </section>

        {/* ── VOLUME 1 ─────────────────────────────────────────────────────── */}
        <section id="guide" style={{ maxWidth: 860, margin: '0 auto', padding: '0 24px 80px' }}>

          {/* Cover card */}
          <div style={{
            border: `2px solid ${gold}`, borderRadius: 20, padding: '40px 40px 36px',
            background: surface, marginBottom: 48, position: 'relative', overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', top: 0, right: 0, width: 200, height: 200,
              background: `radial-gradient(circle at top right, rgba(245,158,11,0.08), transparent 70%)`,
              pointerEvents: 'none',
            }} />
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 32, flexWrap: 'wrap' }}>
              {/* Book spine */}
              <div style={{
                width: 100, minWidth: 100, height: 140, borderRadius: 8,
                background: `linear-gradient(135deg, #1a1a1a, #0a0a0a)`,
                border: `2px solid ${gold}`, display: 'flex', alignItems: 'center',
                justifyContent: 'center', flexShrink: 0,
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 28 }}>📖</div>
                  <div style={{ fontSize: 10, color: gold, fontWeight: 800, marginTop: 6, letterSpacing: '0.05em' }}>VOL. 1</div>
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: gold, fontWeight: 700, letterSpacing: '0.1em', marginBottom: 8 }}>VOLUME 1</div>
                <h2 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8, letterSpacing: '-0.02em' }}>
                  How to Start a Business
                </h2>
                <p style={{ fontSize: 14, color: muted, marginBottom: 16, lineHeight: 1.6 }}>
                  Everything they don't teach you — without the $1,000 course.
                </p>
                <p style={{ fontSize: 12, color: '#6b7280' }}>
                  By Joshua Bostic · Gilgamesh Enterprise LLC
                </p>
              </div>
            </div>
          </div>

          {/* What's inside */}
          <div style={{ marginBottom: 56 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: muted, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 20 }}>
              What's inside
            </p>
            <h3 style={{ fontSize: 26, fontWeight: 800, marginBottom: 28, letterSpacing: '-0.02em' }}>
              Everything you need to get started — <span style={{ color: gold }}>for real</span>
            </h3>
            <div style={{ display: 'grid', gap: 14 }}>
              {WHATS_INSIDE.map((item, i) => (
                <div key={i} style={{
                  display: 'flex', gap: 14, alignItems: 'flex-start',
                  background: surface, border: `1px solid ${border}`,
                  borderRadius: 12, padding: '14px 18px',
                }}>
                  <span style={{ color: gold, fontWeight: 800, fontSize: 14, flexShrink: 0, marginTop: 1 }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span style={{ fontSize: 14, color: '#d1d5db', lineHeight: 1.6 }}>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Waitlist */}
          <div style={{
            background: surface, border: `1px solid ${border}`,
            borderRadius: 20, padding: '40px 36px', textAlign: 'center',
          }}>
            <span style={{
              display: 'inline-block', fontSize: 11, fontWeight: 700,
              color: '#f97316', background: 'rgba(249,115,22,0.1)',
              border: '1px solid rgba(249,115,22,0.3)',
              padding: '3px 12px', borderRadius: 999, marginBottom: 20, letterSpacing: '0.08em',
            }}>
              Coming Soon
            </span>
            <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 10 }}>
              Get notified when it drops
            </h3>
            <p style={{ fontSize: 14, color: muted, marginBottom: 28, maxWidth: 420, margin: '0 auto 28px' }}>
              It's free. We'll email you the moment it's ready — no pitch, no upsell, just the guide.
            </p>

            {done ? (
              <div style={{
                background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)',
                borderRadius: 12, padding: '16px 24px', color: '#22c55e', fontWeight: 600, fontSize: 14,
              }}>
                {existing
                  ? "You're already on the list — we haven't forgotten you. 🙌"
                  : "You're on the list. We'll email you the moment it's ready — free, no catch. 🎉"}
              </div>
            ) : (
              <form onSubmit={handleWaitlist} style={{ display: 'flex', gap: 10, maxWidth: 420, margin: '0 auto', flexWrap: 'wrap', justifyContent: 'center' }}>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  style={{
                    flex: 1, minWidth: 220, padding: '12px 16px', borderRadius: 10,
                    border: `1px solid ${border}`, background: dark, color: '#fff',
                    fontSize: 14, outline: 'none',
                  }}
                />
                <button type="submit" disabled={loading}
                  style={{
                    background: gold, color: '#000', fontWeight: 800,
                    padding: '12px 22px', borderRadius: 10, border: 'none',
                    fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.7 : 1, whiteSpace: 'nowrap',
                  }}>
                  {loading ? 'Adding...' : 'Notify me →'}
                </button>
                {err && <p style={{ width: '100%', color: '#ef4444', fontSize: 13, margin: 0 }}>{err}</p>}
              </form>
            )}
          </div>
        </section>

        {/* ── WHY FREE ─────────────────────────────────────────────────────── */}
        <section style={{ borderTop: `1px solid ${border}`, padding: '72px 24px' }}>
          <div style={{ maxWidth: 680, margin: '0 auto' }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: muted, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>
              Why free?
            </p>
            <h2 style={{ fontSize: 32, fontWeight: 900, marginBottom: 24, letterSpacing: '-0.02em' }}>
              Because someone should have done this sooner.
            </h2>
            <div style={{ fontSize: 16, color: '#d1d5db', lineHeight: 1.85, marginBottom: 36 }}>
              <p style={{ marginBottom: 16 }}>
                I grew up without access to the knowledge that wealthy families just... have.
                How to form a business. How to build wealth. How to build online.
                These aren't secrets — but they get kept behind $997 courses, paywalls, and gatekeeping.
              </p>
              <p style={{ marginBottom: 16 }}>
                Gilgamesh's Guide exists to tear that wall down.
                Everything in these guides is stuff I've had to figure out the hard way —
                working a deli job, building at night, making mistakes and starting over.
              </p>
              <p>
                If even one person reads this and gets a year ahead of where I was,
                that's worth it.
              </p>
            </div>

            {/* Pull quote */}
            <div style={{
              borderLeft: `3px solid ${gold}`, paddingLeft: 24,
              margin: '36px 0', background: 'rgba(245,158,11,0.04)',
              borderRadius: '0 12px 12px 0', padding: '20px 24px',
            }}>
              <p style={{ fontSize: 18, fontStyle: 'italic', color: '#f9fafb', lineHeight: 1.7, margin: 0 }}>
                "The goal isn't to sell you a course. The goal is to give you the door."
              </p>
              <p style={{ fontSize: 13, color: muted, marginTop: 10, marginBottom: 0 }}>
                — Joshua Bostic, Founder · Gilgamesh Enterprise LLC
              </p>
            </div>
          </div>
        </section>

        {/* ── MORE GUIDES COMING ───────────────────────────────────────────── */}
        <section style={{ borderTop: `1px solid ${border}`, padding: '72px 24px' }}>
          <div style={{ maxWidth: 860, margin: '0 auto' }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: muted, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>
              What's coming next
            </p>
            <h2 style={{ fontSize: 28, fontWeight: 900, marginBottom: 36, letterSpacing: '-0.02em' }}>
              The series is just getting started
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
              {COMING_SOON.map((g, i) => (
                <div key={i} style={{
                  background: surface, border: `1px solid ${border}`,
                  borderRadius: 16, padding: '24px 22px', opacity: 0.7,
                }}>
                  <div style={{ fontSize: 11, color: gold, fontWeight: 700, letterSpacing: '0.08em', marginBottom: 10 }}>
                    {g.vol}
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 8 }}>{g.title}</h3>
                  <p style={{ fontSize: 13, color: muted, lineHeight: 1.6, marginBottom: 14 }}>{g.desc}</p>
                  <span style={{
                    fontSize: 11, fontWeight: 700, color: '#6b7280',
                    background: '#1a1a1a', padding: '3px 10px', borderRadius: 999,
                  }}>
                    Coming soon
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── ABOUT THE FOUNDER ────────────────────────────────────────────── */}
        <section style={{ borderTop: `1px solid ${border}`, padding: '72px 24px' }}>
          <div style={{ maxWidth: 600, margin: '0 auto', display: 'flex', gap: 28, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%', flexShrink: 0,
              background: `linear-gradient(135deg, ${gold}, #d97706)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 28,
            }}>
              👑
            </div>
            <div style={{ flex: 1, minWidth: 240 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: muted, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
                Written by
              </p>
              <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 10 }}>Joshua Bostic</h3>
              <p style={{ fontSize: 14, color: '#d1d5db', lineHeight: 1.75, marginBottom: 16 }}>
                Founder of SocialMate and Gilgamesh Enterprise LLC. Works a deli job.
                Builds at night. Started with nothing and is figuring it out publicly.
                These guides are what he wishes he'd had.
              </p>
              <Link href="/story" style={{ fontSize: 14, color: gold, fontWeight: 600, textDecoration: 'none' }}>
                Read the full story →
              </Link>
            </div>
          </div>
        </section>

        {/* ── FOOTER CTA ───────────────────────────────────────────────────── */}
        <section style={{ borderTop: `1px solid ${border}`, padding: '64px 24px', textAlign: 'center' }}>
          <div style={{ maxWidth: 560, margin: '0 auto' }}>
            <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 12 }}>
              While you wait — SocialMate is free to start
            </h2>
            <p style={{ fontSize: 15, color: muted, lineHeight: 1.7, marginBottom: 28 }}>
              The tools referenced in these guides include SocialMate — free social media scheduling,
              12 AI writing tools, link in bio, analytics, and more. Free forever plan, no card required.
            </p>
            <Link href="/signup" style={{
              background: '#fff', color: '#000', fontWeight: 800,
              padding: '14px 28px', borderRadius: 14, fontSize: 15,
              textDecoration: 'none', display: 'inline-block',
            }}>
              Try SocialMate Free →
            </Link>
          </div>
        </section>

      </div>
    </PublicLayout>
  )
}
