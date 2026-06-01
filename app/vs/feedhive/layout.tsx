import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SocialMate vs FeedHive (2026) — Full Comparison',
  description: 'FeedHive starts at $19/month with limited platform support and no Discord, Telegram, or Bluesky. SocialMate is free forever with 7 platforms, 15+ AI tools, and SOMA built in.',
  openGraph: {
    title:       'SocialMate vs FeedHive (2026)',
    description: 'FeedHive charges $19/month with AI features but misses Discord, Telegram, Bluesky, and TikTok. SocialMate covers 7 platforms with 15+ AI tools — starting free.',
    url:         'https://socialmate.studio/vs/feedhive',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/feedhive' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
