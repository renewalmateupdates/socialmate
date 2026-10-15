import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SM-Give: How SocialMate Gives Back',
  description: 'A share of SocialMate subscriptions, donations and merch funds school supplies, baby essentials and care packages for people who need them. See the live fund.',
  openGraph: {
    title:       'SM-Give: How SocialMate Gives Back',
    description: 'A share of SocialMate subscriptions, donations and merch funds school supplies, baby essentials and care packages for people who need them. See the live fund.',
    url:         'https://socialmate.studio/give',
  },
  alternates: { canonical: 'https://socialmate.studio/give' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
