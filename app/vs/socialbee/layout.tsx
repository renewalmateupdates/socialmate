import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SocialMate vs SocialBee (2026) — Full Comparison',
  description: 'SocialBee starts at $29/month with no free plan. Content categories are useful but paywalled. SocialMate is free forever with bulk scheduling, AI tools, and Discord/Bluesky/Telegram/Mastodon.',
  openGraph: {
    title:       'SocialMate vs SocialBee (2026)',
    description: 'SocialBee charges $29/month with no free plan. Its best feature — content categories — is paywalled. SocialMate is free forever.',
    url:         'https://socialmate.studio/vs/socialbee',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/socialbee' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
