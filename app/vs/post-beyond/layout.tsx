import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SocialMate vs PostBeyond (2026) — Full Comparison',
  description: 'PostBeyond is an employee advocacy platform starting at $1,000+/month for enterprises. SocialMate gives creators and small teams 7 platforms and 15+ AI tools — starting free.',
  openGraph: {
    title:       'SocialMate vs PostBeyond (2026)',
    description: 'PostBeyond is enterprise employee advocacy at $1,000+/month. SocialMate is free for creators and small teams with 7 platforms and AI tools built in.',
    url:         'https://socialmate.studio/vs/post-beyond',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/post-beyond' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
