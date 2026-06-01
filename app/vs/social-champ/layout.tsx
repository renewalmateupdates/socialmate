import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SocialMate vs Social Champ (2026) — Full Comparison',
  description: "Social Champ starts at $29/mo with no Discord, Telegram, or Bluesky. SocialMate is $5/mo with 7 platforms, 20+ AI tools, SOMA autonomous content, and a free plan.",
  openGraph: {
    title:       'SocialMate vs Social Champ (2026)',
    description: "Social Champ: $29/mo, no Discord/Telegram/Bluesky. SocialMate: $5/mo — 7 platforms, 20+ AI tools, SOMA, Enki, free plan included.",
    url:         'https://socialmate.studio/vs/social-champ',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/social-champ' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
