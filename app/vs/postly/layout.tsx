import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SocialMate vs Postly (2026) — Full Comparison',
  description: 'Postly costs $18/month with limited TikTok support. SocialMate schedules TikTok, LinkedIn, Bluesky, Discord, Telegram, and more — free to start.',
  openGraph: {
    title:       'SocialMate vs Postly (2026)',
    description: 'Postly is $18/month with limited TikTok. SocialMate is free — 7 platforms, TikTok free, LinkedIn live.',
    url:         'https://socialmate.studio/vs/postly',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/postly' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
