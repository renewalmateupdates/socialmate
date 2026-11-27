import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SocialMate vs Plann (2026) — Full Comparison',
  description: "Plann is an Instagram-centric visual planner at $13/mo+. SocialMate covers 7 platforms including Discord and Telegram, has 15 AI tools, SOMA autonomous content on Pro, and a $0 free plan on 6 platforms.",
  openGraph: {
    title:       'SocialMate vs Plann (2026)',
    description: "Plann is built for Instagram feeds. SocialMate is a full Creator OS: Discord, Telegram, Bluesky, TikTok and 15 AI tools from $0, and SOMA on Pro.",
    url:         'https://socialmate.studio/vs/plann',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/plann' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
