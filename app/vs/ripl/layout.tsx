import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SocialMate vs Ripl (2026) — Full Comparison',
  description: "Ripl is a video/animated post tool for small businesses at $15/mo. SocialMate covers 7 platforms, has 20+ AI tools, SOMA autonomous content, Enki trading bot, and a free plan.",
  openGraph: {
    title:       'SocialMate vs Ripl (2026)',
    description: "Ripl: $15/mo, video animations, limited platforms. SocialMate: $5/mo — 7 platforms, 20+ AI tools, SOMA, Enki, free plan included.",
    url:         'https://socialmate.studio/vs/ripl',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/ripl' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
