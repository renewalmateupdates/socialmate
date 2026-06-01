import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SocialMate vs Kontentino (2026) — Full Comparison',
  description: "Kontentino is an enterprise content collaboration tool at $99/mo+. SocialMate Agency is $20/mo — 5x cheaper — with Discord, Telegram, Bluesky, 20+ AI tools, and SOMA.",
  openGraph: {
    title:       'SocialMate vs Kontentino (2026)',
    description: "Kontentino: $99/mo+ enterprise tool, no Discord/Telegram/Bluesky. SocialMate Agency: $20/mo — 7 platforms, 20+ AI tools, SOMA, client workspaces included.",
    url:         'https://socialmate.studio/vs/kontentino',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/kontentino' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
