import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SocialMate vs OneUp (2026) — Full Comparison',
  description: 'OneUp charges $18/month for social scheduling with limited AI and no Discord or Telegram. SocialMate gives you 7 platforms, 15+ AI tools, and SOMA — starting free.',
  openGraph: {
    title:       'SocialMate vs OneUp (2026)',
    description: 'OneUp is $18/month with limited AI. SocialMate is free — and covers 7 platforms with 15+ AI tools built in.',
    url:         'https://socialmate.studio/vs/oneup',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/oneup' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
