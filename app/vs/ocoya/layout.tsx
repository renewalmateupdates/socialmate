import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SocialMate vs Ocoya (2026): Full Comparison',
  description: 'Ocoya is an AI content suite with 18+ networks and a design studio, from $29/month after a card-required trial. SocialMate is free for 250 posts a month on 7 platforms; Pro is $8.',
  openGraph: {
    title:       'SocialMate vs Ocoya (2026)',
    description: 'Ocoya: a big AI suite from $29/month. SocialMate: a free-to-start scheduler, Pro $8.',
    url:         'https://socialmate.studio/vs/ocoya',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/ocoya' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
