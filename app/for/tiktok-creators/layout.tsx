import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Free TikTok Scheduler for Creators — SocialMate',
  description: 'Schedule TikTok videos to go live automatically. Production API approved. Free for all users — no per-post charges. Plus 5 other platforms in one dashboard.',
  openGraph: {
    title: 'Free TikTok Scheduler for Creators — SocialMate',
    description: 'Schedule TikTok videos to go live automatically. Production API approved. Free for all users — no per-post charges. Plus 5 other platforms in one dashboard.',
    url: 'https://socialmate.studio/for/tiktok-creators',
    images: [{ url: 'https://socialmate.studio/og-image.png', width: 1270, height: 760, alt: 'SocialMate TikTok Scheduler' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free TikTok Scheduler for Creators — SocialMate',
    description: 'Schedule TikTok videos automatically. Production API approved. Free on all plans — no per-post charges.',
    images: ['https://socialmate.studio/og-image.png'],
  },
  alternates: { canonical: 'https://socialmate.studio/for/tiktok-creators' },
}

export default function TikTokCreatorsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
