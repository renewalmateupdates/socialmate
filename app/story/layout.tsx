import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Our Story — Built for Everyone',
  description: 'SocialMate was built by Joshua Bostic to give creators and small businesses access to professional social media tools without the $99/month price tag. The full story.',
  openGraph: {
    title: 'The Story Behind SocialMate',
    description: 'Built bootstrapped by a solo founder to tear down the price walls around professional social media tools. Power to the people.',
    url: 'https://socialmate.studio/story',
    images: [{ url: 'https://socialmate.studio/og-image.png', width: 1270, height: 760, alt: 'SocialMate Story' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Story Behind SocialMate',
    description: 'Built bootstrapped to tear down price walls around social media tools. Power to the people.',
    images: ['https://socialmate.studio/og-image.png'],
  },
  alternates: { canonical: 'https://socialmate.studio/story' },
}

export default function StoryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
