import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SocialMate vs SocialPilot (2026) — Full Comparison',
  description: 'SocialPilot has no free plan — cheapest option is $25.50/month for 1 user and 10 accounts. SocialMate is free forever with Discord, Bluesky, Telegram, and Mastodon support.',
  openGraph: {
    title:       'SocialMate vs SocialPilot (2026)',
    description: 'SocialPilot calls itself affordable but has zero free tier. SocialMate is genuinely free — no credit card, 100 posts/month, 15+ AI tools, and alternative platform support.',
    url:         'https://socialmate.studio/vs/socialpilot',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/socialpilot' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
