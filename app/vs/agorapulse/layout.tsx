import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SocialMate vs Agorapulse (2026) — Full Comparison',
  description: 'Agorapulse starts at $49/month with no free plan and is built for agencies. SocialMate is free forever with bulk scheduling, Discord/Bluesky/Telegram/Mastodon, and 15+ AI tools included.',
  openGraph: {
    title:       'SocialMate vs Agorapulse (2026)',
    description: 'Agorapulse charges $49/month with no free plan and heavy agency features you may not need. SocialMate is free forever — no credit card, no agency overhead.',
    url:         'https://socialmate.studio/vs/agorapulse',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/agorapulse' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
