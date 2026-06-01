import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SocialMate vs Statusbrew (2026) — Full Comparison',
  description: 'Statusbrew starts at $69/month with no free plan — built for enterprise teams and agencies. SocialMate is free forever with bulk scheduling, AI tools, and Discord/Bluesky included.',
  openGraph: {
    title:       'SocialMate vs Statusbrew (2026)',
    description: 'Statusbrew charges $69/month minimum with no free plan and enterprise-focused features. SocialMate is free forever for creators and small teams.',
    url:         'https://socialmate.studio/vs/statusbrew',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/statusbrew' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
