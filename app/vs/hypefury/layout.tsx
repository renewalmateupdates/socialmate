import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SocialMate vs Hypefury (2026) — Full Comparison',
  description: 'Hypefury starts at $19/month and focuses on X/Twitter and LinkedIn. SocialMate starts at $0 with 7 platforms. See the full comparison.',
  openGraph: {
    title:       'SocialMate vs Hypefury (2026)',
    description: 'Hypefury charges $19–$49/month and is X/Twitter-focused. SocialMate is free with 7 platforms and 15+ AI tools.',
    url:         'https://socialmate.studio/vs/hypefury',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/hypefury' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
