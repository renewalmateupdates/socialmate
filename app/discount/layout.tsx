import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Nonprofit and Student Discounts',
  description: '50% off Pro for nonprofits and 25% off Pro for students with a .edu email. Honor system, no paperwork.',
  openGraph: {
    title:       'Nonprofit and Student Discounts',
    description: '50% off Pro for nonprofits and 25% off Pro for students with a .edu email. Honor system, no paperwork.',
    url:         'https://socialmate.studio/discount',
  },
  alternates: { canonical: 'https://socialmate.studio/discount' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
