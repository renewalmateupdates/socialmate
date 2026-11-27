import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SocialMate vs TweetDeck (2026) — Full Comparison',
  description: 'TweetDeck is X/Twitter-only and requires a paid X subscription. SocialMate supports 7 platforms, 6 of them free; X needs Pro. See the full comparison.',
  openGraph: {
    title:       'SocialMate vs TweetDeck (2026)',
    description: 'TweetDeck is locked to X/Twitter and requires a paid subscription. SocialMate is free on 6 platforms (X needs Pro), with 15+ AI tools.',
    url:         'https://socialmate.studio/vs/tweetdeck',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/tweetdeck' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
