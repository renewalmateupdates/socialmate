import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SocialMate vs Meta Creator Studio (2026) — Full Comparison',
  description: "Meta Creator Studio is free but limited to Instagram and Facebook only. SocialMate covers 7 platforms including Discord, TikTok, Bluesky, and LinkedIn, all free except X.",
  openGraph: {
    title:       'SocialMate vs Meta Creator Studio (2026)',
    description: "Creator Studio = Instagram + Facebook only. SocialMate = 7 platforms (6 free), 15+ AI tools, Discord/TikTok/Bluesky.",
    url:         'https://socialmate.studio/vs/creatorstudio',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/creatorstudio' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
