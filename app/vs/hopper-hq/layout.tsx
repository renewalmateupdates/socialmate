import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SocialMate vs Hopper HQ (2026) — Full Comparison',
  description: 'Hopper HQ starts at $19/month for 1 social set. SocialMate starts at $0. See the full feature and pricing comparison.',
  openGraph: {
    title:       'SocialMate vs Hopper HQ (2026)',
    description: 'Hopper HQ charges $19+/month per social set. SocialMate is free with 7 platforms and 15+ AI tools.',
    url:         'https://socialmate.studio/vs/hopper-hq',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/hopper-hq' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
