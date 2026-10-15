import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SocialMate for Android: Join the Beta',
  description: 'SocialMate is in Google Play closed testing. Join as a tester and help ship the Android app.',
  openGraph: {
    title:       'SocialMate for Android: Join the Beta',
    description: 'SocialMate is in Google Play closed testing. Join as a tester and help ship the Android app.',
    url:         'https://socialmate.studio/beta',
  },
  alternates: { canonical: 'https://socialmate.studio/beta' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
