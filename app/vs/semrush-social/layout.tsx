import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SocialMate vs SEMrush Social (2026) — Full Comparison',
  description: 'SEMrush Social is an expensive add-on to an already costly SEO platform. SocialMate is a standalone social scheduler for 7 platforms — free to start.',
  openGraph: {
    title:       'SocialMate vs SEMrush Social (2026)',
    description: 'SEMrush Social requires paying for SEMrush first. SocialMate is standalone social scheduling for 7 platforms — free to start.',
    url:         'https://socialmate.studio/vs/semrush-social',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/semrush-social' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
