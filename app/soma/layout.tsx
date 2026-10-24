import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SOMA — AI Marketing Agent',
  description:
    'SOMA, included with SocialMate Pro and Agency, reads what changed in your weekly master doc and writes platform-native posts for X, LinkedIn, Bluesky, Mastodon, Discord and Telegram. Safe Mode, Autopilot, Full Send.',
}

export default function SomaLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
