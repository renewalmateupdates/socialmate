import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Social Media Tools for Streamers & Clippers — SocialMate',
  description: 'Schedule Twitch clips and YouTube videos to every social platform in seconds. Free tools built for streamers, clippers, and content creators. No $99/month nonsense.',
  openGraph: {
    title: 'Social Media Tools for Streamers & Clippers — SocialMate',
    description: 'Browse your Twitch VODs and YouTube videos, pick the best moments, and schedule them to every platform — Bluesky, X, Mastodon, Discord, Telegram — in one click.',
    url: 'https://socialmate.studio/for/streamers',
    images: [{ url: 'https://socialmate.studio/og-image.png', width: 1270, height: 760, alt: 'SocialMate for Streamers' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Social Media Tools for Streamers & Clippers — SocialMate',
    description: 'Schedule Twitch clips to every platform in seconds. Free on all plans.',
    images: ['https://socialmate.studio/og-image.png'],
  },
  alternates: { canonical: 'https://socialmate.studio/for/streamers' },
}

export default function StreamersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
