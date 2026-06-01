import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SocialMate vs Tailwind App (2026) — Full Comparison',
  description: 'Tailwind App (tailwindapp.com) starts at $12.99/month and focuses on Pinterest and Instagram only. No free auto-publish, no Discord/Telegram/Mastodon/Bluesky, no AI writing tools. SocialMate is free forever.',
  openGraph: {
    title:       'SocialMate vs Tailwind App (2026)',
    description: 'Tailwind App is a Pinterest-focused scheduler with no free auto-publish plan. SocialMate is free forever with 7 platforms and 15+ AI tools.',
    url:         'https://socialmate.studio/vs/tailwind-social',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/tailwind-social' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
