import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Partner Program: Earn 30% Recurring',
  description: 'Earn 30% of every payment your referrals make for as long as they stay subscribed, rising to 40% at 100 active referrals. Free to apply.',
  openGraph: {
    title:       'Partner Program: Earn 30% Recurring',
    description: 'Earn 30% of every payment your referrals make for as long as they stay subscribed, rising to 40% at 100 active referrals. Free to apply.',
    url:         'https://socialmate.studio/affiliates',
  },
  alternates: { canonical: 'https://socialmate.studio/affiliates' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
