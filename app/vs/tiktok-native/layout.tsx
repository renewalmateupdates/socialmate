import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "SocialMate vs TikTok's Native Scheduler (2026) — Full Comparison",
  description: "TikTok's native scheduler only posts to TikTok. SocialMate schedules TikTok plus 6 other platforms — Discord, LinkedIn, Bluesky, and more — with AI tools and analytics. Free.",
  openGraph: {
    title:       "SocialMate vs TikTok's Native Scheduler (2026)",
    description: "TikTok's own scheduler is TikTok-only. SocialMate schedules TikTok alongside LinkedIn, Discord, Telegram, Bluesky, Mastodon, and X — all from one dashboard. Free.",
    url:         'https://socialmate.studio/vs/tiktok-native',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/tiktok-native' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
