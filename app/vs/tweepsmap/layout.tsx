import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SocialMate vs Tweepsmap (2026) — Full Comparison',
  description: 'Tweepsmap costs $12+/month for X/Twitter analytics only — no scheduling. SocialMate schedules 7 platforms with analytics — free to start.',
  openGraph: {
    title:       'SocialMate vs Tweepsmap (2026)',
    description: 'Tweepsmap is Twitter analytics only. SocialMate schedules 7 platforms and includes analytics — free to start.',
    url:         'https://socialmate.studio/vs/tweepsmap',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/tweepsmap' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
