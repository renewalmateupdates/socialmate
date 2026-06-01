import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SocialMate vs Later (2026) — Full Comparison',
  description: "Later's free plan is Instagram-only with 1 profile and 30 posts/month. SocialMate supports Discord, Bluesky, Telegram, and Mastodon for free — no Instagram lock-in.",
  openGraph: {
    title:       'SocialMate vs Later (2026)',
    description: "Later free plan: Instagram-only, 1 profile, 30 posts/month. SocialMate: 7 platforms including Discord and Bluesky, unlimited posts, free.",
    url:         'https://socialmate.studio/vs/later',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/later' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
