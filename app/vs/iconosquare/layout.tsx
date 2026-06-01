import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SocialMate vs Iconosquare (2026) — Full Comparison',
  description: 'Iconosquare starts at $49/month and is an analytics tool, not a scheduler. No free plan, no Discord/Telegram/Mastodon/Bluesky. SocialMate is free forever with 15+ AI tools and real scheduling.',
  openGraph: {
    title:       'SocialMate vs Iconosquare (2026)',
    description: 'Iconosquare is an analytics-first platform starting at $49/month with no free plan. SocialMate is free forever with built-in scheduling, AI tools, and 7 platforms.',
    url:         'https://socialmate.studio/vs/iconosquare',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/iconosquare' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
