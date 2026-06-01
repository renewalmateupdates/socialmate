import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Free Social Media for Nonprofits & Community Organizations — SocialMate',
  description: 'Free social media scheduling for nonprofits and community organizations. No credit card, no premium required. Post to Discord and Telegram where communities live, let AI write your cause-based content — free forever.',
  openGraph: {
    title: 'Free Social Media for Nonprofits & Community Organizations — SocialMate',
    description: 'The free social media tool built for nonprofits with no budget. Post to Discord and Telegram communities, generate cause-based content with AI, and SocialMate even donates 2% of revenue to charity.',
    url: 'https://socialmate.studio/for/nonprofits',
    images: [{ url: 'https://socialmate.studio/og-image.png', width: 1270, height: 760, alt: 'SocialMate for Nonprofits' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Social Media for Nonprofits — SocialMate',
    description: 'Free social media scheduling for nonprofits. No credit card required. SM-Give donates 2% to charity.',
    images: ['https://socialmate.studio/og-image.png'],
  },
  alternates: { canonical: 'https://socialmate.studio/for/nonprofits' },
}

export default function NonprofitsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
