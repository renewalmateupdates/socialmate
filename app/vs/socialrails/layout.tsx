import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SocialMate vs SocialRails (2026) — Full Comparison',
  description: 'SocialRails starts at $29/month with no free plan and no Discord or Telegram. SocialMate is free forever with 7 platforms — including Discord and Telegram — plus 15+ AI tools, link in bio, and a hashtag manager.',
  openGraph: {
    title:       'SocialMate vs SocialRails (2026)',
    description: '$29/month minimum for a tool that still skips Discord and Telegram. SocialMate is free forever with more platforms and more tools.',
    url:         'https://socialmate.studio/vs/socialrails',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/socialrails' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
