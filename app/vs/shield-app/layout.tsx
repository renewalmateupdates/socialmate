import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SocialMate vs Shield App (2026) — Full Comparison',
  description: 'Shield App is LinkedIn analytics only — no scheduling. SocialMate schedules LinkedIn posts free and includes analytics, AI tools, and 6 more platforms.',
  openGraph: {
    title:       'SocialMate vs Shield App (2026)',
    description: 'Shield App tracks LinkedIn analytics but can\'t schedule posts. SocialMate does both — and covers 7 platforms starting free.',
    url:         'https://socialmate.studio/vs/shield-app',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/shield-app' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
