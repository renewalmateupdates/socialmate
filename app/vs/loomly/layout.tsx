import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SocialMate vs Loomly (2026) — Full Comparison',
  description: 'Loomly has no free plan and starts at $32/month. SocialMate is free forever with bulk scheduling, Discord/Bluesky/Telegram/Mastodon, and 15+ AI tools included.',
  openGraph: {
    title:       'SocialMate vs Loomly (2026)',
    description: 'Loomly charges $32/month with no free plan and per-workspace pricing. SocialMate is free forever — no credit card, no per-brand fees.',
    url:         'https://socialmate.studio/vs/loomly',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/loomly' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
