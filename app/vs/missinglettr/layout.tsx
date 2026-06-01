import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SocialMate vs MissingLettr (2026) — Full Comparison',
  description: 'MissingLettr auto-creates drip campaigns but has no free plan and starts at $19/month. SocialMate is free forever with bulk scheduling, Discord/Bluesky/Telegram/Mastodon, and 15+ AI tools.',
  openGraph: {
    title:       'SocialMate vs MissingLettr (2026)',
    description: 'MissingLettr charges $19/month with no free plan. Its drip campaign feature is clever but paywalled. SocialMate is free forever.',
    url:         'https://socialmate.studio/vs/missinglettr',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/missinglettr' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
