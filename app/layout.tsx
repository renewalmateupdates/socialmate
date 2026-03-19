import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import CookieBanner from '@/components/CookieBanner'
import { WorkspaceProvider } from '@/contexts/WorkspaceContext'
import { ThemeProvider } from '@/contexts/ThemeContext'

const inter = Inter({ subsets: ['latin'] })

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://socialmate.studio'

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: 'SocialMate — Free Social Media Scheduler for 16 Platforms',
    template: '%s | SocialMate',
  },
  description: 'Schedule posts to 16 social platforms for free. No per-channel fees, no post limits, no catch. The free-first alternative to Buffer and Hootsuite.',
  keywords: [
    'social media scheduler',
    'free buffer alternative',
    'free hootsuite alternative',
    'social media management',
    'instagram scheduler',
    'discord scheduler',
    'bluesky scheduler',
    'mastodon scheduler',
    'bulk scheduler',
    'link in bio',
    'ai social media',
    'free social media tool',
    'social media automation',
    'content scheduler',
    'post scheduler',
  ],
  authors: [{ name: 'SocialMate', url: APP_URL }],
  creator: 'Gilgamesh Enterprise LLC',
  publisher: 'Gilgamesh Enterprise LLC',
  category: 'productivity',
  applicationName: 'SocialMate',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: APP_URL,
    siteName: 'SocialMate',
    title: 'SocialMate — Free Social Media Scheduler for 16 Platforms',
    description: 'Schedule posts to 16 social platforms for free. No per-channel fees. No post limits. Better than Buffer at zero cost.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'SocialMate — Free Social Media Scheduler' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SocialMate — Free Social Media Scheduler for 16 Platforms',
    description: 'Schedule posts to 16 social platforms for free. No per-channel fees. No post limits. Better than Buffer at zero cost.',
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
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
  alternates: { canonical: APP_URL },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'SocialMate',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  url: APP_URL,
  description: 'Free social media scheduling platform supporting 16+ platforms with AI content tools, analytics, and team collaboration.',
  offers: [
    { '@type': 'Offer', price: '0',  priceCurrency: 'USD', name: 'Free Plan' },
    { '@type': 'Offer', price: '5',  priceCurrency: 'USD', name: 'Pro Plan',    billingIncrement: 'P1M' },
    { '@type': 'Offer', price: '20', priceCurrency: 'USD', name: 'Agency Plan', billingIncrement: 'P1M' },
  ],
  author: {
    '@type': 'Organization',
    name: 'Gilgamesh Enterprise LLC',
    email: 'socialmate.updates@gmail.com',
  },
  featureList: [
    'Schedule posts to 16+ social platforms',
    'AI-powered caption and hashtag generation',
    'Link in Bio page builder',
    'Team collaboration',
    'Bulk scheduler',
    'Analytics dashboard',
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <meta name="theme-color" content="#000000" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="SocialMate" />
      </head>
      <body className={inter.className}>
        <ThemeProvider>
          <WorkspaceProvider>
            {children}
          </WorkspaceProvider>
        </ThemeProvider>
        <CookieBanner />
      </body>
    </html>
  )
}