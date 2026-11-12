import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SocialMate vs Post Bridge (2026): Free Plan vs $39/Month',
  description: 'Post Bridge is $39/month for 15 accounts after a 7-day trial, with Instagram and YouTube. SocialMate is free for 250 posts a month, Pro $8, and posts to Discord, Telegram and Mastodon.',
  openGraph: {
    title:       'SocialMate vs Post Bridge (2026)',
    description: 'Post Bridge starts at $39/month with no free plan. SocialMate starts free, Pro is $8.',
    url:         'https://socialmate.studio/vs/post-bridge',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/post-bridge' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
