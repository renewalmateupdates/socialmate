import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SocialMate vs Sendible (2026) — Full Comparison',
  description: 'Sendible starts at $29/mo for only 1 user and 6 profiles with no free plan. SocialMate is free forever with no profile limits and 15+ AI tools included.',
  openGraph: {
    title:       'SocialMate vs Sendible (2026)',
    description: 'Sendible charges $29/mo for just 1 user and 6 profiles. SocialMate is free — no credit card, no profile cap, no agency pricing required.',
    url:         'https://socialmate.studio/vs/sendible',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/sendible' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
