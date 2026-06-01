import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SocialMate vs NapoleonCat (2026) — Full Comparison',
  description: 'NapoleonCat starts at $32/month for 1 user and 3 profiles. SocialMate starts at $0. See the full feature and pricing comparison.',
  openGraph: {
    title:       'SocialMate vs NapoleonCat (2026)',
    description: 'NapoleonCat charges $32–$76+/month. SocialMate is free with 7 platforms and 15+ AI tools.',
    url:         'https://socialmate.studio/vs/napoleon-cat',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/napoleon-cat' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
