import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Social Media for Coaches & Consultants — SocialMate',
  description: 'Stop losing clients to coaches with worse credentials but better social media. Schedule a week of posts in 30 minutes, let AI write thought leadership content, and stay visible on LinkedIn — free or $5/month.',
  openGraph: {
    title: 'Social Media for Coaches & Consultants — SocialMate',
    description: 'Schedule posts to LinkedIn, X, Bluesky, Discord, and more in 30 minutes a week. SOMA generates coaching content in your voice automatically.',
    url: 'https://socialmate.studio/for/coaches',
    images: [{ url: 'https://socialmate.studio/og-image.png', width: 1270, height: 760, alt: 'SocialMate for Coaches' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Social Media for Coaches & Consultants — SocialMate',
    description: 'Schedule a week of coaching content in 30 minutes. AI writes thought leadership in your voice.',
    images: ['https://socialmate.studio/og-image.png'],
  },
  alternates: { canonical: 'https://socialmate.studio/for/coaches' },
}

export default function CoachesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
