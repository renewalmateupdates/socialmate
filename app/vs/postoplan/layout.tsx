import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SocialMate vs Postoplan (2026) — Full Comparison',
  description: 'Postoplan charges $19/month for social scheduling with no Discord or Telegram. SocialMate gives you 7 platforms, 15+ AI tools, and autonomous content generation — starting free.',
  openGraph: {
    title:       'SocialMate vs Postoplan (2026)',
    description: 'Postoplan is $19/month with no Discord, Telegram, or Bluesky. SocialMate covers all 7 platforms with AI built in — free to start.',
    url:         'https://socialmate.studio/vs/postoplan',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/postoplan' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
