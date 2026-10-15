import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SocialMate Merch',
  description: 'Print-on-demand SocialMate shirts, shipped worldwide. Most of the profit goes to the SM-Give fund.',
  openGraph: {
    title:       'SocialMate Merch',
    description: 'Print-on-demand SocialMate shirts, shipped worldwide. Most of the profit goes to the SM-Give fund.',
    url:         'https://socialmate.studio/merch',
  },
  alternates: { canonical: 'https://socialmate.studio/merch' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
