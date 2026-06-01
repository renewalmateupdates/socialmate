import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SocialMate vs Crowdfire (2026) — Full Comparison',
  description: 'Crowdfire free plan allows only 1 social account and 10 scheduled posts per month. Plus plan is $7.48/month and still very limited. No Discord/Telegram/Mastodon support. SocialMate is free forever.',
  openGraph: {
    title:       'SocialMate vs Crowdfire (2026)',
    description: 'Crowdfire free plan caps at 10 posts/month across 1 account. SocialMate is free forever with unlimited posts, 7 platforms, and 15+ AI tools.',
    url:         'https://socialmate.studio/vs/crowdfire',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/crowdfire' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
