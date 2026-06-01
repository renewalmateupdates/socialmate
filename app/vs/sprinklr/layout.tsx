import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SocialMate vs Sprinklr (2026) — Full Comparison',
  description: 'Sprinklr starts at $299/month and is enterprise-only. SocialMate is free forever with bulk scheduling, Discord/Bluesky/Telegram/Mastodon, and 15+ AI tools included.',
  openGraph: {
    title:       'SocialMate vs Sprinklr (2026)',
    description: 'Sprinklr is built for enterprise at $299+/month — far too much for creators and small teams. SocialMate is free forever with no enterprise overhead.',
    url:         'https://socialmate.studio/vs/sprinklr',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/sprinklr' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
