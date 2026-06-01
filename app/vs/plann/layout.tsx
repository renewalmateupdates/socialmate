import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SocialMate vs Plann (2026) — Full Comparison',
  description: "Plann is an Instagram-centric visual planner at $13/mo+. SocialMate covers 7 platforms including Discord and Telegram, has 20+ AI tools, SOMA autonomous content, and a $0 free plan.",
  openGraph: {
    title:       'SocialMate vs Plann (2026)',
    description: "Plann is built for Instagram feeds. SocialMate is a full Creator OS — Discord, Telegram, Bluesky, TikTok, SOMA, Enki, 20+ AI tools — starting at $0.",
    url:         'https://socialmate.studio/vs/plann',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/plann' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
