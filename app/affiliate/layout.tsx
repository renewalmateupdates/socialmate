import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Affiliate Program — Earn 30% Recurring Commission',
  description: 'Join the SocialMate affiliate program and earn 30% recurring commission on every paying referral. Hit 100 active referrals and earn 40% forever. Free to join.',
  openGraph: {
    title: 'SocialMate Affiliate Program — 30% Recurring Commission',
    description: 'Earn 30% recurring commission for every paying SocialMate referral. Scale to 40% at 100 active referrals. Free to join, no approval required.',
    url: 'https://socialmate.studio/affiliate',
    images: [{ url: 'https://socialmate.studio/og-image.png', width: 1270, height: 760, alt: 'SocialMate Affiliate Program' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SocialMate Affiliate Program — 30% Recurring Commission',
    description: 'Earn 30% recurring commission per paying referral. Scale to 40% at 100 referrals.',
    images: ['https://socialmate.studio/og-image.png'],
  },
  alternates: { canonical: 'https://socialmate.studio/affiliate' },
}

export default function AffiliateLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
