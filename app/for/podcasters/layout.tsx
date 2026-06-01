import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Social Media for Podcasters — SocialMate',
  description: 'Stop promoting your podcast across 5 different apps. Schedule episode drops to all 7 platforms at once, generate AI captions for audiogram posts, and grow your listener community — free forever or $5/month.',
  openGraph: {
    title: 'Social Media for Podcasters — SocialMate',
    description: 'Schedule podcast episode announcements to Bluesky, X, LinkedIn, Discord, Telegram, TikTok, and Mastodon in one click. SOMA generates your episode promos automatically.',
    url: 'https://socialmate.studio/for/podcasters',
    images: [{ url: 'https://socialmate.studio/og-image.png', width: 1270, height: 760, alt: 'SocialMate for Podcasters' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Social Media for Podcasters — SocialMate',
    description: 'Promote your podcast on 7 platforms at once. Free tools built for podcasters.',
    images: ['https://socialmate.studio/og-image.png'],
  },
  alternates: { canonical: 'https://socialmate.studio/for/podcasters' },
}

export default function PodcastersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
