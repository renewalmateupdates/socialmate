import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Free Grants Finder',
  description: 'Search live U.S. federal grant opportunities from grants.gov. Free for creators, small businesses, nonprofits and individuals, with no account needed.',
  openGraph: {
    title:       'Free Grants Finder',
    description: 'Search live U.S. federal grant opportunities from grants.gov. Free for creators, small businesses, nonprofits and individuals, with no account needed.',
    url:         'https://socialmate.studio/grants',
  },
  alternates: { canonical: 'https://socialmate.studio/grants' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
