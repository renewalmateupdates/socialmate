import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Enterprise Plans for Agencies and Teams',
  description: 'Custom pricing, unlimited seats, white label, dedicated onboarding and an SLA for agencies and larger teams. Talk to the founder directly.',
  openGraph: {
    title:       'Enterprise Plans for Agencies and Teams',
    description: 'Custom pricing, unlimited seats, white label, dedicated onboarding and an SLA for agencies and larger teams. Talk to the founder directly.',
    url:         'https://socialmate.studio/enterprise',
  },
  alternates: { canonical: 'https://socialmate.studio/enterprise' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
