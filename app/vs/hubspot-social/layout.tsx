import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SocialMate vs HubSpot Social (2026) — Full Comparison',
  description: 'HubSpot Marketing Hub social tools cost $800+/month. SocialMate delivers social scheduling across 7 platforms including TikTok and LinkedIn — free to start.',
  openGraph: {
    title:       'SocialMate vs HubSpot Social (2026)',
    description: 'HubSpot social is $800+/month bundled into Marketing Hub. SocialMate covers 7 platforms for $5/month — or free.',
    url:         'https://socialmate.studio/vs/hubspot-social',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/hubspot-social' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
