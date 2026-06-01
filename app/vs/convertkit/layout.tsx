import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SocialMate vs ConvertKit (2026) — Full Comparison',
  description: "ConvertKit (Kit) starts at $25+/month for creator email tools. SocialMate is a social media scheduler with 15+ AI tools across 7 platforms — free to start.",
  openGraph: {
    title:       'SocialMate vs ConvertKit (2026)',
    description: "ConvertKit = creator email platform, $25+/month. SocialMate = social scheduler, 7 platforms, AI tools, free.",
    url:         'https://socialmate.studio/vs/convertkit',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/convertkit' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
