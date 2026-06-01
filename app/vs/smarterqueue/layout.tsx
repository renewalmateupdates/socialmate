import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SocialMate vs SmarterQueue (2026) — Full Comparison',
  description: 'SmarterQueue starts at $16.99/month. SocialMate starts at $0. Compare evergreen recycling, AI tools, and platform support.',
  openGraph: {
    title:       'SocialMate vs SmarterQueue (2026)',
    description: 'SmarterQueue charges $16.99–$82.99+/month. SocialMate is free with 7 platforms and 15+ AI tools.',
    url:         'https://socialmate.studio/vs/smarterqueue',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/smarterqueue' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
