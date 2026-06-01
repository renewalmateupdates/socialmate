import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SocialMate vs CoSchedule (2026) — Full Comparison',
  description: 'CoSchedule free tier is manual-only with no auto-publish. SocialMate auto-publishes on free, includes bulk scheduling, and supports Discord/Bluesky/Telegram/Mastodon.',
  openGraph: {
    title:       'SocialMate vs CoSchedule (2026)',
    description: 'CoSchedule free plan has no auto-publishing. SocialMate auto-publishes on free — no per-user pricing, no editorial calendar bloat.',
    url:         'https://socialmate.studio/vs/coschedule',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/coschedule' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
