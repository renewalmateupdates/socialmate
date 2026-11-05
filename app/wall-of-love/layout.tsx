import type { Metadata } from 'next'

// Indexed since Nov 5, 2026, when the first real testimonial went up. It was
// noindex while empty, because an empty wall reads as thin content.
export const metadata: Metadata = {
  title: 'Wall of Love',
  description: 'What creators, founders and teams say about SocialMate, in their own words.',
  openGraph: {
    title:       'Wall of Love',
    description: 'What creators, founders and teams say about SocialMate, in their own words.',
    url:         'https://socialmate.studio/wall-of-love',
  },
  alternates: { canonical: 'https://socialmate.studio/wall-of-love' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
