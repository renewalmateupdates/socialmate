import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SocialMate vs StoryChief (2026) — Full Comparison',
  description: 'StoryChief charges $99/month for content marketing with no Discord or Telegram support. SocialMate gives you 7 platforms, 15+ AI tools, and autonomous content generation — starting free.',
  openGraph: {
    title:       'SocialMate vs StoryChief (2026)',
    description: 'StoryChief is $99/month for content marketing. SocialMate is free — and covers 7 platforms including Discord and Telegram.',
    url:         'https://socialmate.studio/vs/storychief',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/storychief' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
