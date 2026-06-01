import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SocialMate vs Typefully (2026) — Full Comparison',
  description: 'Typefully starts at $12.50/month and focuses on X/Twitter threads and LinkedIn. SocialMate starts at $0 with 7 platforms and 15+ AI tools.',
  openGraph: {
    title:       'SocialMate vs Typefully (2026)',
    description: 'Typefully charges $12.50–$29/month and is thread-focused. SocialMate is free with 7 platforms and 15+ AI tools.',
    url:         'https://socialmate.studio/vs/typefully',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/typefully' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
