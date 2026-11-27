import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SocialMate vs Zoho Social (2026) — Full Comparison',
  description: 'Zoho Social has no free plan and starts at $15/month — and is built for teams already inside the Zoho ecosystem. SocialMate is free forever on 6 platforms (X needs Pro), with 15+ AI tools, Discord, Telegram, Mastodon, Bluesky, and no CRM dependency.',
  openGraph: {
    title:       'SocialMate vs Zoho Social (2026)',
    description: 'Zoho Social is a Zoho ecosystem add-on with no free plan. SocialMate is free forever — no Zoho required, no trial countdown, 6 platforms included (X needs Pro).',
    url:         'https://socialmate.studio/vs/zoho-social',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/zoho-social' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
