import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SocialMate vs Post Planner (2026) — Full Comparison',
  description: 'Post Planner starts at $9/month but its free plan caps at 10 posts/month — nearly useless. SocialMate is free forever with 100 posts a month, AI tools, and Discord/Bluesky included.',
  openGraph: {
    title:       'SocialMate vs Post Planner (2026)',
    description: "Post Planner's free plan limits you to 10 posts/month — barely enough to stay active. SocialMate is free forever with no post caps.",
    url:         'https://socialmate.studio/vs/postplanner',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/postplanner' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
