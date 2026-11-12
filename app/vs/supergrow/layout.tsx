import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SocialMate vs Supergrow (2026): LinkedIn Plus 6 Platforms',
  description: 'Supergrow is a LinkedIn-only AI tool at $39/month after a 7-day trial. SocialMate schedules LinkedIn, X, TikTok, Bluesky, Mastodon, Discord and Telegram, free to start, Pro $8.',
  openGraph: {
    title:       'SocialMate vs Supergrow (2026)',
    description: 'LinkedIn-only at $39/month, or 7 platforms free to start.',
    url:         'https://socialmate.studio/vs/supergrow',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/supergrow' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
