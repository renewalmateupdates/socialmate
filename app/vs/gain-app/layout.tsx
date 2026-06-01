import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SocialMate vs Gain (2026) — Full Comparison',
  description: "Gain is an agency approval platform at $99/mo+. SocialMate's Agency plan is $20/mo with approval workflows, Discord/Telegram, 20+ AI tools, SOMA, and Enki.",
  openGraph: {
    title:       'SocialMate vs Gain (2026)',
    description: "Gain: $99/mo+ for client approvals, no Discord/Telegram/Bluesky, no AI content. SocialMate Agency: $20/mo — full approval workflows + 7 platforms + SOMA + Enki.",
    url:         'https://socialmate.studio/vs/gain-app',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/gain-app' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
