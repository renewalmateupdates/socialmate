import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Free Social Media Scheduler for Small Business — SocialMate',
  description: 'Small business social media scheduling that actually fits your budget. Schedule posts to 7 platforms, use 15+ AI tools, and grow your audience — free forever or $5/month Pro.',
  openGraph: {
    title: 'Free Social Media Scheduler for Small Business — SocialMate',
    description: 'What Buffer and Hootsuite charge $99/month for, SocialMate gives for $5 — or free. Built for small business owners who wear every hat.',
    url: 'https://socialmate.studio/for/small-business',
    images: [{ url: 'https://socialmate.studio/og-image.png', width: 1270, height: 760, alt: 'SocialMate for Small Business' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Social Media Scheduler for Small Business — SocialMate',
    description: 'Schedule 7 platforms, 15+ AI tools, free forever. Built for small business.',
    images: ['https://socialmate.studio/og-image.png'],
  },
  alternates: { canonical: 'https://socialmate.studio/for/small-business' },
}

export default function SmallBusinessLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
