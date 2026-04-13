import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Referral Program — Earn Credits by Sharing SocialMate',
  description: 'Share your SocialMate referral link. Earn AI credits when your referrals publish and upgrade. No application needed — your link is ready the moment you sign up.',
  openGraph: {
    title: 'SocialMate Referral Program — Earn Credits for Sharing',
    description: 'Every SocialMate account comes with a personal referral link. Share it and earn AI credits when your referrals post and upgrade. Free, no application required.',
    url: 'https://socialmate.studio/referral',
    images: [{ url: 'https://socialmate.studio/og-image.png', width: 1270, height: 760, alt: 'SocialMate Referral Program' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SocialMate Referral Program — Earn Credits for Sharing',
    description: 'Share SocialMate and earn AI credits. No application. Starts at signup.',
    images: ['https://socialmate.studio/og-image.png'],
  },
  alternates: { canonical: 'https://socialmate.studio/referral' },
}

export default function ReferralLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
