import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SocialMate vs Combin (2026) — Full Comparison',
  description: 'Combin is an Instagram-only growth tool at $15/month with no scheduling. SocialMate gives you scheduling across 7 platforms plus AI tools — starting free.',
  openGraph: {
    title:       'SocialMate vs Combin (2026)',
    description: 'Combin is Instagram-only with no scheduling at $15/month. SocialMate schedules to 7 platforms with 15+ AI tools — free to start.',
    url:         'https://socialmate.studio/vs/combin',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/combin' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
