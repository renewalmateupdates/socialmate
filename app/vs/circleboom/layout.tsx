import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SocialMate vs Circleboom (2026) — Full Comparison',
  description: 'Circleboom costs $24.99/month and focuses on Twitter/X tools. SocialMate covers 7 platforms including TikTok, LinkedIn, Discord, and Telegram, all free except X.',
  openGraph: {
    title:       'SocialMate vs Circleboom (2026)',
    description: 'Circleboom starts at $24.99/month. SocialMate is free on 6 of its 7 platforms, TikTok and LinkedIn included.',
    url:         'https://socialmate.studio/vs/circleboom',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/circleboom' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
