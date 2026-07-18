import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SocialMate vs Planable (2026) — Full Comparison',
  description: "Planable's free plan is a 50-post lifetime cap — not monthly. Once you hit 50, you must pay. SocialMate gives you 100 posts/month, free forever.",
  openGraph: {
    title:       'SocialMate vs Planable (2026)',
    description: "Planable gives you 50 posts total on the free plan — ever. SocialMate has no post limits and no credit card required.",
    url:         'https://socialmate.studio/vs/planable',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/planable' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
