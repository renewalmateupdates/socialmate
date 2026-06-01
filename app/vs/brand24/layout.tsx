import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SocialMate vs Brand24 (2026) — Full Comparison',
  description: 'Brand24 charges $79/month for social monitoring only — no scheduling. SocialMate gives you scheduling across 7 platforms, 15+ AI tools, and monitoring features — starting free.',
  openGraph: {
    title:       'SocialMate vs Brand24 (2026)',
    description: 'Brand24 is $79/month for monitoring only. SocialMate schedules, monitors, and creates content across 7 platforms — free to start.',
    url:         'https://socialmate.studio/vs/brand24',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/brand24' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
