import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SocialMate vs Later Free Plan (2026) — Full Comparison',
  description: "Later's free plan limits you to 1 social set and 5 posts/month. SocialMate's free plan covers 7 platforms with 50 AI credits and no social set limit.",
  openGraph: {
    title:       'SocialMate vs Later Free Plan (2026)',
    description: "Later free plan: 1 social set, 5 posts. SocialMate free plan: 7 platforms, 50 credits, no set limit.",
    url:         'https://socialmate.studio/vs/later-free',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/later-free' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
