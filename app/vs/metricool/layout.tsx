import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SocialMate vs Metricool (2026) — Full Comparison',
  description: 'Metricool free tier caps at 50 scheduled posts per month. SocialMate has no post limits, no per-brand fees, and 15+ AI tools included free.',
  openGraph: {
    title:       'SocialMate vs Metricool (2026)',
    description: 'Metricool limits free users to 50 posts/month and 1 brand. SocialMate gives you 100 posts/month, unlimited scheduling, free forever.',
    url:         'https://socialmate.studio/vs/metricool',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/metricool' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
