import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SocialMate vs Nuelink (2026) — Full Comparison',
  description: 'Nuelink starts at $15/month with a clean UI but no free plan at all. SocialMate is free forever with bulk scheduling, AI tools, and Discord/Bluesky/Telegram/Mastodon included.',
  openGraph: {
    title:       'SocialMate vs Nuelink (2026)',
    description: 'Nuelink has a clean interface but zero free plan. SocialMate gives you the same core scheduling features plus AI tools for $0.',
    url:         'https://socialmate.studio/vs/nuelink',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/nuelink' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
