import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SocialMate vs Preview App (2026) — Full Comparison',
  description: "Preview App is Instagram/Pinterest focused at $8/mo+. SocialMate covers 7 platforms including Discord and Telegram, has 20+ AI tools, SOMA autonomous content, and a free plan.",
  openGraph: {
    title:       'SocialMate vs Preview App (2026)',
    description: "Preview App: Instagram/Pinterest only, $8/mo+. SocialMate: 7 platforms, 20+ AI tools, SOMA, Enki, free plan — $5/mo Pro.",
    url:         'https://socialmate.studio/vs/preview-app',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/preview-app' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
