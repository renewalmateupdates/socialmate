import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SocialMate vs SocialOomph (2026) — Full Comparison',
  description: 'SocialOomph starts at $15/month with no TikTok or LinkedIn support. SocialMate covers 7 platforms including TikTok and LinkedIn — free to start.',
  openGraph: {
    title:       'SocialMate vs SocialOomph (2026)',
    description: 'SocialOomph is an old-school scheduler at $15+/month. SocialMate is modern, free, and covers 7 platforms.',
    url:         'https://socialmate.studio/vs/socialoomph',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/socialoomph' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
