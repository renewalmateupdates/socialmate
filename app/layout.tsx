import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://socialmate-six.vercel.app'),
  title: {
    default: 'SocialMate — Free Social Media Scheduler for 16 Platforms',
    template: '%s | SocialMate',
  },
  description: 'Schedule posts to 16 social platforms for free. No per-channel fees, no post limits, no catch. Better than Buffer and Hootsuite — at zero cost.',
  keywords: [
    'social media scheduler',
    'free buffer alternative',
    'hootsuite alternative',
    'instagram scheduler',
    'social media management',
    'bulk scheduler',
    'link in bio',
    'free social media tool',
  ],
  authors: [{ name: 'SocialMate' }],
  creator: 'SocialMate',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://socialmate-six.vercel.app',
    siteName: 'SocialMate',
    title: 'SocialMate — Free Social Media Scheduler for 16 Platforms',
    description: 'Schedule posts to 16 social platforms for free. No per-channel fees, no post limits. Better than Buffer at zero cost.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'SocialMate — Free Social Media Scheduler',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SocialMate — Free Social Media Scheduler for 16 Platforms',
    description: 'Schedule posts to 16 social platforms for free. No per-channel fees, no post limits. Better than Buffer at zero cost.',
    images: ['/og-image.png'],
    creator: '@socialmate',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}