import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SocialMate vs Linktree (2026) — Full Comparison',
  description: "Linktree charges $5-9/month for a link in bio page. SocialMate's SIGIL link in bio is completely free — plus you get a full social media scheduler and 15+ AI tools.",
  openGraph: {
    title:       'SocialMate vs Linktree (2026)',
    description: "Linktree = $5-9/month for one page. SocialMate SIGIL = free link in bio + full social scheduler + 15+ AI tools.",
    url:         'https://socialmate.studio/vs/linktree',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/linktree' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
