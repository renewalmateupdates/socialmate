import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SocialMate vs beehiiv (2026) — Full Comparison',
  description: "beehiiv is a newsletter platform starting at $42/month. SocialMate is a 7-platform social media scheduler with 15+ AI tools — free to start. Different tools, clear comparison.",
  openGraph: {
    title:       'SocialMate vs beehiiv (2026)',
    description: "beehiiv = newsletter platform, $42+/month. SocialMate = social scheduler, 7 platforms, 15+ AI tools, free.",
    url:         'https://socialmate.studio/vs/beehiiv',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/beehiiv' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
