import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SocialMate vs Khoros (2026) — Full Comparison',
  description: 'Khoros is an enterprise community and social management platform at $500+/month. SocialMate gives creators and small teams 7 platforms, 15+ AI tools, and SOMA — starting free.',
  openGraph: {
    title:       'SocialMate vs Khoros (2026)',
    description: 'Khoros is enterprise-only at $500+/month. SocialMate covers 7 platforms with 15+ AI tools — free to start.',
    url:         'https://socialmate.studio/vs/khoros',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/khoros' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
