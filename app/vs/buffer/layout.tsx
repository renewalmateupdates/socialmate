import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SocialMate vs Buffer (2026): Pricing, Platforms, Free Plan',
  description: "Buffer bills $6 a month per channel and doesn't post to Discord or Telegram. SocialMate Pro is $8 a month flat, and the free plan includes 250 posts a month and 15+ AI tools.",
  openGraph: {
    title:       'SocialMate vs Buffer (2026)',
    description: "Buffer bills per channel and skips Discord and Telegram. SocialMate Pro is $8 a month flat, with a free plan of 250 posts a month.",
    url:         'https://socialmate.studio/vs/buffer',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/buffer' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
