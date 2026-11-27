import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SocialMate vs Fedica (2026) — Full Comparison',
  description: 'Fedica is a Twitter/X-only analytics tool starting at $15/month with no multi-platform support. SocialMate is free forever on 6 platforms (X needs Pro), with AI tools and scheduling built in.',
  openGraph: {
    title:       'SocialMate vs Fedica (2026)',
    description: 'Fedica focuses on Twitter/X analytics. If you post on Bluesky, Discord, Instagram, or Mastodon — it cannot help. SocialMate covers 7 platforms, 6 of them free.',
    url:         'https://socialmate.studio/vs/fedica',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/fedica' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
