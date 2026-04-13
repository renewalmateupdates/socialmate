import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Support — Help & FAQ',
  description: 'Get help with SocialMate. Browse our FAQ, learn how to connect platforms, troubleshoot scheduling issues, and contact our support team.',
  openGraph: {
    title: 'SocialMate Support — Help & FAQ',
    description: 'Get help with SocialMate. Browse our FAQ, connect platforms, troubleshoot scheduling, and contact support.',
    url: 'https://socialmate.studio/support',
    images: [{ url: 'https://socialmate.studio/og-image.png', width: 1270, height: 760, alt: 'SocialMate Support' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SocialMate Support — Help & FAQ',
    description: 'Get help with SocialMate. Browse our FAQ and contact support.',
    images: ['https://socialmate.studio/og-image.png'],
  },
  alternates: { canonical: 'https://socialmate.studio/support' },
}

export default function SupportLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
