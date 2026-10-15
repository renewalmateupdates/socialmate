import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Agents for Social Media',
  description: 'Agents that draft outreach emails, watch competitors, turn your week into a newsletter, send client reports and repurpose your best posts for you.',
  openGraph: {
    title:       'AI Agents for Social Media',
    description: 'Agents that draft outreach emails, watch competitors, turn your week into a newsletter, send client reports and repurpose your best posts for you.',
    url:         'https://socialmate.studio/agents',
  },
  alternates: { canonical: 'https://socialmate.studio/agents' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
