import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SocialMate vs Unum (2026) — Full Comparison',
  description: "Unum is an Instagram visual planner at $8/mo. SocialMate covers 7 platforms including Discord and Telegram, has 20+ AI tools, SOMA autonomous content, Enki trading bot, and a free plan.",
  openGraph: {
    title:       'SocialMate vs Unum (2026)',
    description: "Unum: $8/mo, Instagram/TikTok/X only, no SOMA or AI content system. SocialMate: free — 7 platforms, 20+ AI tools, SOMA, Enki, full Creator OS.",
    url:         'https://socialmate.studio/vs/unum',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/unum' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
