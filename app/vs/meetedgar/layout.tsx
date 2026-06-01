import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SocialMate vs MeetEdgar (2026) — Full Comparison',
  description: 'MeetEdgar starts at $29.99/month with no free plan. SocialMate has evergreen recycling free, supports Bluesky/Discord/Telegram/Mastodon, and costs $0 to start.',
  openGraph: {
    title:       'SocialMate vs MeetEdgar (2026)',
    description: 'MeetEdgar charges $29.99/month and skips Bluesky, Discord, Telegram, and Mastodon. SocialMate does evergreen recycling free on 7 platforms.',
    url:         'https://socialmate.studio/vs/meetedgar',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/meetedgar' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
