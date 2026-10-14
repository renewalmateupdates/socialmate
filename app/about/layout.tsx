import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About',
  description: 'SocialMate is a social media scheduler built by one bootstrapped founder. The origin story, the mission, and who is behind it.',
  alternates: { canonical: 'https://socialmate.studio/about' },
}

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
