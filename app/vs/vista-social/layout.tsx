import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SocialMate vs Vista Social (2026) — Full Comparison',
  description: "Vista Social starts at $39/month with no permanent free plan. SocialMate is free forever with TikTok included, plus Discord, Telegram, and Mastodon that Vista Social doesn't support.",
  openGraph: {
    title: 'SocialMate vs Vista Social (2026)',
    description: "Vista Social starts at $39/month — no free plan, just a 15-day trial. SocialMate is free forever, includes TikTok, Discord, Telegram, Mastodon, and 15+ AI tools.",
    url: 'https://socialmate.studio/vs/vista-social',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/vista-social' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
