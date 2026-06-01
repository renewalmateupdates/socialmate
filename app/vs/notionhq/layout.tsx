import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SocialMate vs Notion (2026) — Full Comparison',
  description: "Notion is a productivity tool, not a social media scheduler. It cannot post to Bluesky, Discord, TikTok, or LinkedIn. SocialMate is built for scheduling — free to start.",
  openGraph: {
    title:       'SocialMate vs Notion (2026)',
    description: "Notion = productivity & docs. SocialMate = social media scheduler. 7 platforms, 15+ AI tools, free.",
    url:         'https://socialmate.studio/vs/notionhq',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/notionhq' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
