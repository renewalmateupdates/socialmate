import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SocialMate vs Pallyy (2026) — Full Comparison',
  description: 'Pallyy free plan allows only 15 posts/month and paid plans start at $18/month per social set — costs multiply per brand. No Mastodon/Bluesky/Discord/Telegram, link-in-bio locked to paid. SocialMate is free forever.',
  openGraph: {
    title:       'SocialMate vs Pallyy (2026)',
    description: 'Pallyy free plan caps at 15 posts/month and paid plans charge per social set. SocialMate is free forever with unlimited posts and flat pricing.',
    url:         'https://socialmate.studio/vs/pallyy',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/pallyy' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
