import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SocialMate vs Hootsuite (2026) — Full Comparison',
  description: 'Hootsuite starts at $99/month. SocialMate starts at $0. See the full feature comparison and decide for yourself.',
  openGraph: {
    title:       'SocialMate vs Hootsuite (2026)',
    description: 'Hootsuite charges $99–$249+/month. SocialMate is free with 7 platforms and 15+ AI tools.',
    url:         'https://socialmate.studio/vs/hootsuite',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/hootsuite' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
