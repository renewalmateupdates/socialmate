import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Social Media for Bloggers — SocialMate',
  description: 'You wrote the post. Now promote it on 7 platforms without the manual work. RSS import turns your blog into scheduled social posts automatically. Free forever or $5/month.',
  openGraph: {
    title: 'Social Media for Bloggers — SocialMate',
    description: 'RSS import turns your blog into social media posts automatically. Schedule promotion across Bluesky, X, LinkedIn, TikTok, Discord, Telegram, and Mastodon in one click.',
    url: 'https://socialmate.studio/for/bloggers',
    images: [{ url: 'https://socialmate.studio/og-image.png', width: 1270, height: 760, alt: 'SocialMate for Bloggers' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Social Media for Bloggers — SocialMate',
    description: 'Paste your blog RSS feed. Get your posts scheduled to 7 platforms automatically.',
    images: ['https://socialmate.studio/og-image.png'],
  },
  alternates: { canonical: 'https://socialmate.studio/for/bloggers' },
}

export default function BloggersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
