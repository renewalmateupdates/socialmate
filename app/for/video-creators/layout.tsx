import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Free Social Media Tools for Video Creators — SocialMate',
  description: 'Schedule TikTok videos, repurpose YouTube clips, share Twitch highlights — all from one free dashboard. GIF export, script generator, and 7 live platforms.',
  openGraph: {
    title: 'Free Social Media Tools for Video Creators — SocialMate',
    description: 'Schedule TikTok videos, repurpose YouTube clips, share Twitch highlights — all from one free dashboard. GIF export, AI script generator, and 7 live platforms.',
    url: 'https://socialmate.studio/for/video-creators',
    images: [{ url: 'https://socialmate.studio/og-image.png', width: 1270, height: 760, alt: 'SocialMate for Video Creators' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Social Media Tools for Video Creators — SocialMate',
    description: 'Schedule TikTok videos, repurpose YouTube clips, share Twitch highlights — free.',
    images: ['https://socialmate.studio/og-image.png'],
  },
  alternates: { canonical: 'https://socialmate.studio/for/video-creators' },
}

export default function VideoCreatorsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
