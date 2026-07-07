import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SocialMate vs Discord Bots for Scheduling (2026) — Full Comparison',
  description: "Discord bots require server admin access, API tokens, and technical setup just to post scheduled messages. SocialMate schedules Discord plus 6 other platforms — no coding required. Free.",
  openGraph: {
    title:       'SocialMate vs Discord Bots (2026)',
    description: "Discord bots = technical setup, Discord only. SocialMate = 7 platforms, no code, AI tools, free.",
    url:         'https://socialmate.studio/vs/discord-bots',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/discord-bots' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
