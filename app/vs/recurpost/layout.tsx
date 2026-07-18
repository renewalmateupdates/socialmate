import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SocialMate vs RecurPost (2026) — Full Comparison',
  description: 'RecurPost free plan: 3 social accounts and a 100-post lifetime cap. SocialMate is free forever with 100 posts a month, no account cap, and Discord/Bluesky/Telegram/Mastodon included.',
  openGraph: {
    title:       'SocialMate vs RecurPost (2026)',
    description: "RecurPost's free plan hits a 100-post lifetime cap — use it up once and it's gone. SocialMate is free forever with no lifetime limits.",
    url:         'https://socialmate.studio/vs/recurpost',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/recurpost' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
