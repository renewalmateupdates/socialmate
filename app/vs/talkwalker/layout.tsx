import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SocialMate vs Talkwalker (2026) — Full Comparison',
  description: 'Talkwalker charges $9,600+/year for social listening with no post scheduling. SocialMate gives you scheduling across 7 platforms, competitor tracking, and 15+ AI tools — starting free.',
  openGraph: {
    title:       'SocialMate vs Talkwalker (2026)',
    description: 'Talkwalker is $9,600+/year for listening only. SocialMate schedules, monitors, and creates content across 7 platforms — free to start.',
    url:         'https://socialmate.studio/vs/talkwalker',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/talkwalker' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
