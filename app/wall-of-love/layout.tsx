import type { Metadata } from 'next'

// Kept out of search until there are real testimonials to show: an empty
// wall reads as thin content. Remove robots when the first quotes go up.
export const metadata: Metadata = {
  title: 'Wall of Love',
  description: 'What creators, founders and teams say about SocialMate.',
  openGraph: {
    title:       'Wall of Love',
    description: 'What creators, founders and teams say about SocialMate.',
    url:         'https://socialmate.studio/wall-of-love',
  },
  alternates: { canonical: 'https://socialmate.studio/wall-of-love' },
  robots: { index: false, follow: true },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
