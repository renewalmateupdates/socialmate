import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SocialMate vs Klaviyo (2026) — Full Comparison',
  description: "Klaviyo is an email marketing platform starting at $45/month. SocialMate is a social media scheduler with AI tools across 7 platforms, 6 of them free.",
  openGraph: {
    title:       'SocialMate vs Klaviyo (2026)',
    description: "Klaviyo = email-first, $45+/month. SocialMate = social-first, 7 platforms (6 free), 15+ AI tools.",
    url:         'https://socialmate.studio/vs/klaviyo',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/klaviyo' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
