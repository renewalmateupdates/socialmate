import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SocialMate vs Emplifi (2026) — Full Comparison',
  description: 'Emplifi (formerly Socialbakers) charges $200+/month for enterprise social management. SocialMate gives creators and agencies 7 platforms, 15+ AI tools, and SOMA — starting free.',
  openGraph: {
    title:       'SocialMate vs Emplifi (2026)',
    description: 'Emplifi is $200+/month enterprise pricing. SocialMate is free — 7 platforms, 15+ AI tools, and autonomous content generation.',
    url:         'https://socialmate.studio/vs/emplifi',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/emplifi' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
