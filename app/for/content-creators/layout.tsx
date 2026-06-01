import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Social Media for Content Creators — SocialMate',
  description: 'Manage all your social media from one place. Post to 7 platforms at once, use AI to write content faster, and never burn out from daily posting pressure — free forever or $5/month.',
  openGraph: {
    title: 'Social Media for Content Creators — SocialMate',
    description: 'One dashboard for Bluesky, X, TikTok, LinkedIn, Discord, Telegram, and Mastodon. SOMA generates a week of content from your ideas automatically.',
    url: 'https://socialmate.studio/for/content-creators',
    images: [{ url: 'https://socialmate.studio/og-image.png', width: 1270, height: 760, alt: 'SocialMate for Content Creators' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Social Media for Content Creators — SocialMate',
    description: 'Manage 7 platforms from one dashboard. AI writes content in your voice. Free to start.',
    images: ['https://socialmate.studio/og-image.png'],
  },
  alternates: { canonical: 'https://socialmate.studio/for/content-creators' },
}

export default function ContentCreatorsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
