'use client'
import Link from 'next/link'

const gold  = '#F59E0B'
const dark  = '#0a0a0a'
const border = '#222222'
const muted  = '#6b7280'

export default function DeclinedPage() {
  return (
    <div style={{ minHeight: '100vh', background: dark, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ maxWidth: 440, textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🤝</div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#f1f1f1', margin: '0 0 12px', letterSpacing: '-0.02em' }}>
          No worries, it's all good!
        </h1>
        <p style={{ fontSize: 14, color: muted, lineHeight: 1.7, margin: '0 0 28px' }}>
          You've declined the SocialMate Partner Program invite — totally understood. If you ever change your mind, reach out and we'll set you up.
        </p>
        <a
          href="mailto:hello@socialmate.studio?subject=Partner Program"
          style={{
            display: 'block', padding: '11px 24px', borderRadius: 10,
            background: `rgba(245,158,11,0.1)`, border: `1px solid rgba(245,158,11,0.3)`,
            color: gold, fontSize: 14, fontWeight: 700, textDecoration: 'none', marginBottom: 12,
          }}
        >
          Change your mind? Reach out →
        </a>
        <Link href="/" style={{ display: 'block', fontSize: 13, color: muted, textDecoration: 'none' }}>
          Back to SocialMate
        </Link>
      </div>
    </div>
  )
}
