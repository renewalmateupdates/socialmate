import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SocialMate vs PostPickr (2026) — Full Comparison',
  description: 'PostPickr starts at €8/month and is focused on European markets with limited platform support. SocialMate covers 7 platforms including TikTok and LinkedIn — free to start.',
  openGraph: {
    title:       'SocialMate vs PostPickr (2026)',
    description: 'PostPickr charges €8+/month with no Discord, Telegram, or Bluesky support. SocialMate is free with 7 platforms and 12 AI tools.',
    url:         'https://socialmate.studio/vs/postpickr',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/postpickr' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
