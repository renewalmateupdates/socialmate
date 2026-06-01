import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SocialMate vs ContentStudio (2026) — Full Comparison',
  description: 'ContentStudio starts at $25/month with no free plan and a complex UI. SocialMate is free forever with bulk scheduling, Discord/Bluesky/Telegram/Mastodon, and 15+ AI tools included.',
  openGraph: {
    title:       'SocialMate vs ContentStudio (2026)',
    description: 'ContentStudio charges $25/month with no free plan and a UI that takes time to learn. SocialMate is free forever and ready in minutes.',
    url:         'https://socialmate.studio/vs/contentstudio',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/contentstudio' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
