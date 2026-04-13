import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Features — Everything Included Free',
  description: 'SocialMate features: 5-platform scheduling, 12 AI tools, Twitch & YouTube clip studio, bulk scheduling, evergreen recycling, RSS import, competitor tracking, link in bio, and more.',
  openGraph: {
    title: 'SocialMate Features — Social Media Scheduling + AI Tools',
    description: '5-platform scheduling, 12 AI tools, Clips Studio, bulk scheduling, competitor tracking, link in bio, and more — most features free on all plans.',
    url: 'https://socialmate.studio/features',
    images: [{ url: 'https://socialmate.studio/og-image.png', width: 1270, height: 760, alt: 'SocialMate Features' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SocialMate Features — Social Media Scheduling + AI Tools',
    description: '5-platform scheduling, 12 AI tools, Clips Studio, bulk scheduling — most free on all plans.',
    images: ['https://socialmate.studio/og-image.png'],
  },
  alternates: { canonical: 'https://socialmate.studio/features' },
}

export default function FeaturesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
