import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pricing — Free, Pro & Agency Plans',
  description: 'SocialMate starts free forever. Pro is $8/month. Agency is $29/month. No hidden fees, no per-channel pricing. Includes AI tools, bulk scheduling, and multi-platform support.',
  openGraph: {
    title: 'SocialMate Pricing — Free Social Media Scheduler',
    description: 'Free forever. Pro at $8/mo. Agency at $29/mo. 15+ AI tools, 7 live platforms, bulk scheduling — no credit card required to start.',
    url: 'https://socialmate.studio/pricing',
    images: [{ url: 'https://socialmate.studio/og-image.png', width: 1270, height: 760, alt: 'SocialMate Pricing' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SocialMate Pricing — Free Social Media Scheduler',
    description: 'Free forever. Pro at $8/mo. Agency at $29/mo. 15+ AI tools, 7 live platforms.',
    images: ['https://socialmate.studio/og-image.png'],
  },
  alternates: { canonical: 'https://socialmate.studio/pricing' },
}

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
