import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Free LinkedIn Post Scheduler — Schedule LinkedIn Posts Automatically | SocialMate',
  description: "Schedule LinkedIn posts in advance, free. Write once, publish automatically at the best time. No $99/month tool required. SocialMate's LinkedIn scheduler is free on all plans.",
  openGraph: {
    title: 'Free LinkedIn Post Scheduler — SocialMate',
    description: 'Schedule LinkedIn posts automatically. Write once, publish at the right time. Free on every SocialMate plan — no credit card required.',
    url: 'https://socialmate.studio/for/linkedin-creators',
    images: [{ url: 'https://socialmate.studio/og-image.png', width: 1270, height: 760, alt: 'SocialMate LinkedIn Scheduler' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free LinkedIn Post Scheduler — SocialMate',
    description: 'Schedule LinkedIn posts automatically. Free on all plans — no per-post charges.',
    images: ['https://socialmate.studio/og-image.png'],
  },
  alternates: { canonical: 'https://socialmate.studio/for/linkedin-creators' },
}

export default function LinkedInCreatorsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
