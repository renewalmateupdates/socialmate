import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SocialMate vs Taplio (2026) — Full Comparison',
  description: 'Taplio costs $39–$79/month for LinkedIn-only scheduling. SocialMate schedules LinkedIn, Bluesky, TikTok, Discord, Telegram, and Mastodon free, and X on Pro.',
  openGraph: {
    title:       'SocialMate vs Taplio (2026)',
    description: 'Taplio is $39/month for LinkedIn alone. SocialMate covers 7 platforms including LinkedIn, all free except X.',
    url:         'https://socialmate.studio/vs/taplio',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/taplio' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
