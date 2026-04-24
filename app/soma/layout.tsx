import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SOMA — AI Marketing Agent | SocialMate',
  description:
    'SOMA is your AI marketing agent. Upload your weekly master doc, SOMA reads what changed, and generates platform-native posts across your entire content calendar. Safe Mode, Autopilot, Full Send.',
}

export default function SomaLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
