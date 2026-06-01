import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SocialMate vs Substack (2026) — Full Comparison',
  description: "Substack is a newsletter platform. SocialMate schedules social media posts across 7 platforms — Discord, TikTok, LinkedIn, Bluesky, and more. Use both: Substack for newsletters, SocialMate for social.",
  openGraph: {
    title:       'SocialMate vs Substack (2026)',
    description: "Substack publishes newsletters. SocialMate schedules social posts across 7 platforms with AI tools and analytics. They solve different problems — use both together.",
    url:         'https://socialmate.studio/vs/substack',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/substack' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
