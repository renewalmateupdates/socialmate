import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SocialMate vs Audiense (2026) — Full Comparison',
  description: 'Audiense costs $79+/month for Twitter audience analytics — no scheduling. SocialMate schedules 7 platforms with analytics included, free to start.',
  openGraph: {
    title:       'SocialMate vs Audiense (2026)',
    description: 'Audiense is $79+/month for audience insights only. SocialMate schedules + analyzes 7 platforms — free to start.',
    url:         'https://socialmate.studio/vs/audiense',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/audiense' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
