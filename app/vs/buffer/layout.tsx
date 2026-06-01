import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SocialMate vs Buffer (2026) — Full Comparison',
  description: "Buffer's free plan limits you to 3 channels and 10 queued posts total. SocialMate's free plan includes bulk scheduling, no channel cap, and 15+ AI tools.",
  openGraph: {
    title:       'SocialMate vs Buffer (2026)',
    description: "Buffer free plan: 3 channels, 10 queued posts, no bulk scheduling. SocialMate free plan: no channel cap, bulk scheduler included, 15+ AI tools.",
    url:         'https://socialmate.studio/vs/buffer',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/buffer' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
