import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SocialMate vs Publer (2026) — Full Comparison',
  description: 'Publer free plan limits you to 3 accounts and 10 posts per account. SocialMate gives you 100 posts/month, no per-account fees, and 15+ AI tools free.',
  openGraph: {
    title:       'SocialMate vs Publer (2026)',
    description: 'Publer caps free users at 3 accounts and 10 scheduled posts each. SocialMate is unlimited, free, with 15+ AI tools built in.',
    url:         'https://socialmate.studio/vs/publer',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/publer' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
