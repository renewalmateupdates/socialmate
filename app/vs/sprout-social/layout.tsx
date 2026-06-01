import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SocialMate vs Sprout Social (2026) — Full Comparison',
  description: 'Sprout Social starts at $249/month for just 5 social profiles with no free plan. SocialMate is free forever — bulk scheduling, 15+ AI tools, and 7 platforms included at $0.',
  openGraph: {
    title:       'SocialMate vs Sprout Social (2026)',
    description: 'Sprout Social costs $249/mo for 5 profiles and zero free plan. SocialMate is free forever — no credit card, no profile cap, bulk scheduling included.',
    url:         'https://socialmate.studio/vs/sprout-social',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/sprout-social' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
