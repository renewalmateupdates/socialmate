import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SocialMate vs Fedica (2026) — Full Comparison',
  description: 'Fedica is a Twitter/X-only analytics tool starting at $15/month with no multi-platform support. SocialMate is free forever with 7 platforms, AI tools, and scheduling built in.',
  openGraph: {
    title:       'SocialMate vs Fedica (2026)',
    description: 'Fedica focuses on Twitter/X analytics. If you post on Bluesky, Discord, Instagram, or Mastodon — it cannot help. SocialMate covers 7 platforms free.',
    url:         'https://socialmate.studio/vs/fedica',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/fedica' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
