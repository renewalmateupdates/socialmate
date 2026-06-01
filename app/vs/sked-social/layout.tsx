import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SocialMate vs Sked Social (2026) — Full Comparison',
  description: 'Sked Social starts at $25/month. SocialMate starts at $0. Compare features, platforms, and pricing for social media scheduling.',
  openGraph: {
    title:       'SocialMate vs Sked Social (2026)',
    description: 'Sked Social charges $25–$135+/month. SocialMate is free with 7 platforms and 15+ AI tools.',
    url:         'https://socialmate.studio/vs/sked-social',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/sked-social' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
