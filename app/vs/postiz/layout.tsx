import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SocialMate vs Postiz (2026): Hosted Free Plan vs Open Source',
  description: 'Postiz is free to self-host or $29/month hosted, with 30+ channels including Instagram. SocialMate is hosted and free to start: 250 posts a month on 7 platforms, Pro $8.',
  openGraph: {
    title:       'SocialMate vs Postiz (2026)',
    description: 'Self-host Postiz for free, pay $29+/month for hosted, or start SocialMate free with nothing to install.',
    url:         'https://socialmate.studio/vs/postiz',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/postiz' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
