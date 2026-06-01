import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Social Media for Real Estate Agents — SocialMate',
  description: 'Free social media scheduler for real estate agents. Schedule listing announcements on LinkedIn, cross-post to 7 platforms, and let AI generate real estate content — free forever or $5/month.',
  openGraph: {
    title: 'Social Media for Real Estate Agents — SocialMate',
    description: 'Schedule listing announcements, market updates, and client wins across LinkedIn and 6 more platforms. Real estate social media that runs on autopilot.',
    url: 'https://socialmate.studio/for/real-estate',
    images: [{ url: 'https://socialmate.studio/og-image.png', width: 1270, height: 760, alt: 'SocialMate for Real Estate Agents' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Social Media for Real Estate Agents — SocialMate',
    description: 'Real estate social media scheduling. LinkedIn live. Free forever or $5/month.',
    images: ['https://socialmate.studio/og-image.png'],
  },
  alternates: { canonical: 'https://socialmate.studio/for/real-estate' },
}

export default function RealEstateLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
