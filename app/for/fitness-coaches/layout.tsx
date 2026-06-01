import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Social Media for Fitness Coaches & Personal Trainers — SocialMate',
  description: 'Free social media scheduler built for personal trainers and fitness coaches. Schedule a week of posts in 30 minutes, let AI write your content, and grow on TikTok, Instagram, and 7 platforms — free forever.',
  openGraph: {
    title: 'Social Media for Fitness Coaches & Personal Trainers — SocialMate',
    description: 'Stop spending your rest days on social media. Schedule a week of fitness content in 30 minutes and let AI do the writing.',
    url: 'https://socialmate.studio/for/fitness-coaches',
    images: [{ url: 'https://socialmate.studio/og-image.png', width: 1270, height: 760, alt: 'SocialMate for Fitness Coaches' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Social Media for Fitness Coaches & Personal Trainers — SocialMate',
    description: 'Schedule fitness content to 7 platforms. Free forever or $5/month.',
    images: ['https://socialmate.studio/og-image.png'],
  },
  alternates: { canonical: 'https://socialmate.studio/for/fitness-coaches' },
}

export default function FitnessCoachesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
