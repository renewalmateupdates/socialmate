import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SocialMate vs Planly (2026) — Full Comparison',
  description: "Planly starts at $15/month with no TikTok on the free plan. SocialMate is free forever with TikTok scheduling included, plus Discord, Telegram, and Mastodon that Planly doesn't support.",
  openGraph: {
    title: 'SocialMate vs Planly (2026)',
    description: "Planly starts at $15/month with TikTok locked behind paid plans. SocialMate includes TikTok free — Production API approved — plus Discord, Telegram, and Mastodon.",
    url: 'https://socialmate.studio/vs/planly',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/planly' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
