import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SocialMate vs PromoRepublic (2026) — Full Comparison',
  description: 'PromoRepublic costs $49/month with no TikTok or LinkedIn free tier. SocialMate covers 7 platforms including TikTok and LinkedIn — starting free.',
  openGraph: {
    title:       'SocialMate vs PromoRepublic (2026)',
    description: 'PromoRepublic is $49/month with no TikTok. SocialMate is free — 7 platforms, TikTok free, LinkedIn live.',
    url:         'https://socialmate.studio/vs/promo-republic',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/promo-republic' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
