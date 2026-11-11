import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SocialMate vs Predis.ai (2026): Full Comparison',
  description: 'Predis.ai generates images, carousels and video from $19/month, with auto posting from $40. SocialMate posts on every plan, free for 250 posts a month on 7 platforms, with 15+ AI writing tools.',
  openGraph: {
    title:       'SocialMate vs Predis.ai (2026)',
    description: 'Predis.ai makes the visuals. SocialMate gets your posts out on 7 platforms, free to start.',
    url:         'https://socialmate.studio/vs/predis-ai',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/predis-ai' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
