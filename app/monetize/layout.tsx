import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Creator Monetization: Tips, Fan Subscriptions and Paywalls',
  description: 'Accept tips, run fan subscriptions and paywall posts from your SocialMate creator page, paid through Stripe with no platform cut. Included with Pro and Agency.',
  openGraph: {
    title:       'Creator Monetization: Tips, Fan Subscriptions and Paywalls',
    description: 'Accept tips, run fan subscriptions and paywall posts from your SocialMate creator page, paid through Stripe with no platform cut. Included with Pro and Agency.',
    url:         'https://socialmate.studio/monetize',
  },
  alternates: { canonical: 'https://socialmate.studio/monetize' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
