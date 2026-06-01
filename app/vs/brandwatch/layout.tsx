import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SocialMate vs Brandwatch (2026) — Full Comparison',
  description: "Brandwatch costs $1,000+/month for enterprise social listening. SocialMate gives you competitor tracking, scheduling, 15+ AI tools, and 7 platforms — free to start.",
  openGraph: {
    title:       'SocialMate vs Brandwatch (2026)',
    description: "Brandwatch starts at $1,000+/month. SocialMate includes competitor tracking, scheduling, and AI tools — free to start.",
    url:         'https://socialmate.studio/vs/brandwatch',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/brandwatch' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
