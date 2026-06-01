import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SocialMate vs eClincher (2026) — Full Comparison',
  description: 'eClincher starts at $65/month. SocialMate starts at $0. Compare features, pricing, and platforms side by side.',
  openGraph: {
    title:       'SocialMate vs eClincher (2026)',
    description: 'eClincher charges $65–$425/month. SocialMate is free with 7 platforms and 15+ AI tools.',
    url:         'https://socialmate.studio/vs/eclincher',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/eclincher' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
