import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SocialMate vs TweetHunter (2026) — Full Comparison',
  description: 'TweetHunter costs $49/month for X/Twitter-only scheduling. SocialMate schedules X on Pro, plus LinkedIn, TikTok, Bluesky, Discord, Telegram, and Mastodon free.',
  openGraph: {
    title:       'SocialMate vs TweetHunter (2026)',
    description: 'TweetHunter is $49/month for X/Twitter alone. SocialMate covers 7 platforms including X and LinkedIn; X is on Pro and the other 6 are free.',
    url:         'https://socialmate.studio/vs/tweethunter',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/tweethunter' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
