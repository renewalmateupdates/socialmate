import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SocialMate vs Oktopost (2026) — Full Comparison',
  description: 'Oktopost is an enterprise B2B platform starting at $500+/month. SocialMate starts at $0. See the full feature comparison.',
  openGraph: {
    title:       'SocialMate vs Oktopost (2026)',
    description: 'Oktopost is built for enterprise B2B teams with a $500+/month price tag. SocialMate is free with 7 platforms and 15+ AI tools.',
    url:         'https://socialmate.studio/vs/oktopost',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/oktopost' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
