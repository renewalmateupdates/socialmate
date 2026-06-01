import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SocialMate vs Flick (2026) — Full Comparison',
  description: "Flick starts at £14/month (~$18) with no free plan. SocialMate is free forever with TikTok included, plus Bluesky, Discord, and Telegram that Flick doesn't support.",
  openGraph: {
    title: 'SocialMate vs Flick (2026)',
    description: "Flick is £14/month (~$18) with a 14-day trial only. SocialMate is free forever — TikTok, Bluesky, Discord, Telegram, 15+ AI tools, all included.",
    url: 'https://socialmate.studio/vs/flick',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/flick' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
