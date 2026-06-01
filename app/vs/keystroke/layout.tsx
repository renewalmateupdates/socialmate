import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SocialMate vs Keystroke (2026) — Full Comparison',
  description: 'Keystroke is a $29/month LinkedIn-only scheduler with basic AI. SocialMate gives you 7 platforms, 15+ AI tools, and SOMA — starting free.',
  openGraph: {
    title:       'SocialMate vs Keystroke (2026)',
    description: 'Keystroke is $29/month for LinkedIn-only scheduling. SocialMate covers LinkedIn plus 6 more platforms — free to start.',
    url:         'https://socialmate.studio/vs/keystroke',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/keystroke' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
