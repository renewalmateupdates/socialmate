import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SocialMate vs Mention (2026) — Full Comparison',
  description: 'Mention charges $41/month for social listening with no post scheduling. SocialMate gives you scheduling across 7 platforms (6 free, X on Pro), competitor tracking, and AI tools — starting free.',
  openGraph: {
    title:       'SocialMate vs Mention (2026)',
    description: 'Mention is $41/month for listening only. SocialMate schedules, monitors, and creates content across 7 platforms, 6 of them free.',
    url:         'https://socialmate.studio/vs/mention',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/mention' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
