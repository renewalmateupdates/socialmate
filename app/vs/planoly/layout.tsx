import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SocialMate vs Planoly (2026): Full Comparison',
  description: 'Planoly is Instagram-first, from $14/month, with a 10-upload free plan in its app. SocialMate posts to TikTok, LinkedIn, X, Bluesky, Discord, Telegram and Mastodon, free for 250 posts a month.',
  openGraph: {
    title:       'SocialMate vs Planoly (2026)',
    description: 'Planoly plans your Instagram grid. SocialMate posts to 7 other platforms, free to start, Pro $8.',
    url:         'https://socialmate.studio/vs/planoly',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/planoly' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
