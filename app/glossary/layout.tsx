import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Social Media Glossary',
  description: 'Plain-language definitions of the social media terms creators and marketers run into, from algorithm and engagement rate to webhooks.',
  openGraph: {
    title:       'Social Media Glossary',
    description: 'Plain-language definitions of the social media terms creators and marketers run into, from algorithm and engagement rate to webhooks.',
    url:         'https://socialmate.studio/glossary',
  },
  alternates: { canonical: 'https://socialmate.studio/glossary' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
