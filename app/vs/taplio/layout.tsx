import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SocialMate vs Taplio (2026) — Full Comparison',
  description: 'Taplio costs $39–$79/month for LinkedIn-only scheduling. SocialMate schedules LinkedIn, Bluesky, X, TikTok, Discord, Telegram, and Mastodon — starting free.',
  openGraph: {
    title:       'SocialMate vs Taplio (2026)',
    description: 'Taplio is $39/month for LinkedIn alone. SocialMate is free — and covers 7 platforms including LinkedIn.',
    url:         'https://socialmate.studio/vs/taplio',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/taplio' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
