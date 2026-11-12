import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SocialMate vs Mixpost (2026): Self-Hosted vs Hosted',
  description: 'Mixpost is self-hosted: free Lite, Pro $299 one-time, or Cloud from $29/month. SocialMate is hosted and free for 250 posts a month on 7 platforms; Pro is $8.',
  openGraph: {
    title:       'SocialMate vs Mixpost (2026)',
    description: 'Own the software with Mixpost, or start free on SocialMate with no server to run.',
    url:         'https://socialmate.studio/vs/mixpost',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/mixpost' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
