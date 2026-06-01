import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SocialMate vs Social Report (2026) — Full Comparison',
  description: 'Social Report charges $49/month for social scheduling and analytics with no Discord or Telegram. SocialMate gives you 7 platforms, 15+ AI tools, and SOMA — starting free.',
  openGraph: {
    title:       'SocialMate vs Social Report (2026)',
    description: 'Social Report is $49/month with no Discord, Telegram, or Bluesky. SocialMate covers 7 platforms with AI built in — free to start.',
    url:         'https://socialmate.studio/vs/social-report',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/social-report' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
