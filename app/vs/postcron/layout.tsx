import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SocialMate vs Postcron (2026) — Full Comparison',
  description: 'Postcron starts at $8/month for basic scheduling. SocialMate starts at $0 with 7 platforms and 15+ AI tools. See the full comparison.',
  openGraph: {
    title:       'SocialMate vs Postcron (2026)',
    description: 'Postcron charges $8–$79/month. SocialMate is free with 7 platforms and 15+ AI tools.',
    url:         'https://socialmate.studio/vs/postcron',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/postcron' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
