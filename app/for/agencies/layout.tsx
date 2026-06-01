import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Social Media Management for Agencies — SocialMate',
  description: 'Manage every client from one dashboard. White label the entire platform as your own brand. SocialMate Agency plan: 2,000 AI credits, 15 seats, 5 client workspaces — $20/month.',
  openGraph: {
    title: 'Social Media Management for Agencies — SocialMate',
    description: 'Stop paying $299/month for agency tools. SocialMate gives you white label, client workspaces, team seats, and 2,000 AI credits for $20/month.',
    url: 'https://socialmate.studio/for/agencies',
    images: [{ url: 'https://socialmate.studio/og-image.png', width: 1270, height: 760, alt: 'SocialMate for Agencies' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Social Media Management for Agencies — SocialMate',
    description: 'White label social media scheduling for $20/month. Client workspaces, team seats, AI tools included.',
    images: ['https://socialmate.studio/og-image.png'],
  },
  alternates: { canonical: 'https://socialmate.studio/for/agencies' },
}

export default function AgenciesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
