import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SocialMate vs OpusClip (2026): Clipping Tool vs Scheduler',
  description: 'OpusClip cuts long videos into clips with AI and auto-posts from $15/month. SocialMate schedules text, images and TikTok video to 7 platforms, free to start, Pro $8.',
  openGraph: {
    title:       'SocialMate vs OpusClip (2026)',
    description: 'OpusClip makes clips. SocialMate schedules every kind of post, free to start.',
    url:         'https://socialmate.studio/vs/opus-clip',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/opus-clip' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
