import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SocialMate vs AuthoredUp (2026): LinkedIn Scheduling Compared',
  description: 'AuthoredUp is a LinkedIn editor at $19.95/month per profile that schedules through a Chrome extension. SocialMate schedules LinkedIn and 6 more platforms from the web, free to start.',
  openGraph: {
    title:       'SocialMate vs AuthoredUp (2026)',
    description: 'AuthoredUp is $19.95/month for one LinkedIn profile. SocialMate is free to start, Pro $8.',
    url:         'https://socialmate.studio/vs/authoredup',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/authoredup' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
