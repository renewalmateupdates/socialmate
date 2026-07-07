import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SocialMate vs TikTok Native Scheduler (2026) — Full Comparison',
  description: "TikTok's built-in scheduler only posts to TikTok. SocialMate schedules TikTok plus 6 other platforms — Discord, LinkedIn, Bluesky, Telegram, Mastodon, X — free.",
  openGraph: {
    title:       'SocialMate vs TikTok Scheduler (2026)',
    description: "TikTok native scheduler = TikTok only. SocialMate = TikTok + 6 more platforms + 15 AI tools. Free.",
    url:         'https://socialmate.studio/vs/tiktok-scheduler',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/tiktok-scheduler' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
