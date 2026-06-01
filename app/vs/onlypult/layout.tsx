import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SocialMate vs Onlypult (2026) — Full Comparison',
  description: 'Onlypult starts at $25/month for 3 profiles. SocialMate starts at $0. See the full feature and pricing comparison.',
  openGraph: {
    title:       'SocialMate vs Onlypult (2026)',
    description: 'Onlypult charges $25–$97+/month. SocialMate is free with 7 platforms and 15+ AI tools.',
    url:         'https://socialmate.studio/vs/onlypult',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/onlypult' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
