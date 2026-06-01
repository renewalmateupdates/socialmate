import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Social Media for Musicians & Independent Artists — SocialMate',
  description: 'Free social media scheduler for independent musicians and artists. Schedule release campaigns, grow on Bluesky and Mastodon, post to TikTok, and let AI write your music captions — no label required.',
  openGraph: {
    title: 'Social Media for Musicians & Independent Artists — SocialMate',
    description: 'Release campaigns, fan community posting, and AI-generated captions for indie musicians — all from one free dashboard.',
    url: 'https://socialmate.studio/for/musicians',
    images: [{ url: 'https://socialmate.studio/og-image.png', width: 1270, height: 760, alt: 'SocialMate for Musicians' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Social Media for Musicians & Independent Artists — SocialMate',
    description: 'Schedule music content to 7 platforms. Free forever or $5/month.',
    images: ['https://socialmate.studio/og-image.png'],
  },
  alternates: { canonical: 'https://socialmate.studio/for/musicians' },
}

export default function MusiciansLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
