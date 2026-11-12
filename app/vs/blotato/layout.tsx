import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SocialMate vs Blotato (2026): Free Plan vs $29/Month',
  description: 'Blotato is $29/month after a card-required trial, with AI images, video and 9 platforms. SocialMate is free for 250 posts a month, Pro $8, with Discord, Telegram and Mastodon.',
  openGraph: {
    title:       'SocialMate vs Blotato (2026)',
    description: 'Blotato starts at $29/month with no free plan. SocialMate starts free, Pro is $8.',
    url:         'https://socialmate.studio/vs/blotato',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/blotato' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
