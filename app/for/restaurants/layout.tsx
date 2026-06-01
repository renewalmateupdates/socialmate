import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Social Media for Restaurants & Food Businesses — SocialMate',
  description: 'Free social media scheduling for restaurants, cafes, and food businesses. Schedule daily menu posts, generate food captions with AI, and reach hungry customers on TikTok and 7 platforms — free forever.',
  openGraph: {
    title: 'Social Media for Restaurants & Food Businesses — SocialMate',
    description: 'Schedule your daily specials, menu drops, and behind-the-kitchen content across 7 platforms without leaving the kitchen. Free forever.',
    url: 'https://socialmate.studio/for/restaurants',
    images: [{ url: 'https://socialmate.studio/og-image.png', width: 1270, height: 760, alt: 'SocialMate for Restaurants' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Social Media for Restaurants & Food Businesses — SocialMate',
    description: 'Restaurant social media scheduling. Free forever or $5/month.',
    images: ['https://socialmate.studio/og-image.png'],
  },
  alternates: { canonical: 'https://socialmate.studio/for/restaurants' },
}

export default function RestaurantsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
