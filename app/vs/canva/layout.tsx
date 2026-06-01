import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SocialMate vs Canva (2026) — Full Comparison',
  description: "Canva is a design tool that bolted on scheduling. SocialMate is a real scheduling platform with 20+ AI tools, Discord/Telegram support, SOMA autonomous content, and a $0 free plan.",
  openGraph: {
    title:       'SocialMate vs Canva (2026)',
    description: "Canva Pro is $15/mo for a design tool with bolt-on scheduling. SocialMate is $5/mo for a full Creator OS — Discord, Telegram, Bluesky, SOMA, Enki, 20+ AI tools.",
    url:         'https://socialmate.studio/vs/canva',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/canva' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
