import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Apply for Studio Stax',
  description: 'Apply to list your tool in Studio Stax, the founder-reviewed directory of tools built by independent creators and small businesses. Answered within 48 hours.',
  openGraph: {
    title:       'Apply for Studio Stax',
    description: 'Apply to list your tool in Studio Stax, the founder-reviewed directory of tools built by independent creators and small businesses. Answered within 48 hours.',
    url:         'https://socialmate.studio/studio-stax/apply',
  },
  alternates: { canonical: 'https://socialmate.studio/studio-stax/apply' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
