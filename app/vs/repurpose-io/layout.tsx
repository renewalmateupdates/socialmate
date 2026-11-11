import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SocialMate vs Repurpose.io (2026): Full Comparison',
  description: 'Repurpose.io copies your videos from one platform to others, from $35/month. SocialMate schedules text, images and TikTok video to 7 platforms, free for 250 posts a month.',
  openGraph: {
    title:       'SocialMate vs Repurpose.io (2026)',
    description: 'Different jobs: Repurpose.io re-posts your videos; SocialMate schedules new posts to 7 platforms, free to start.',
    url:         'https://socialmate.studio/vs/repurpose-io',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/repurpose-io' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
