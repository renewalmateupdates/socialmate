import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { WorkspaceProvider } from '@/contexts/WorkspaceContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { I18nProvider } from '@/contexts/I18nContext'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import GoogleAnalytics from '@/components/GoogleAnalytics'
// ssr:false dynamic imports must live in a 'use client' module — see LazyClientComponents
import LazyClientComponents from '@/components/LazyClientComponents'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://socialmate.studio'

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: 'SocialMate — Free Social Media Scheduler — 7 Platforms Live',
    template: '%s | SocialMate',
  },
  description: 'Schedule posts to Bluesky, Discord, Telegram, Mastodon, X/Twitter, and TikTok for free. AI content tools, Twitch & YouTube clip scheduling, bulk scheduling, and more. No credit card required.',
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
    title: 'SocialMate — Free Social Media Scheduler',
    description: 'Schedule posts to Bluesky, Discord, Telegram, Mastodon, X/Twitter, TikTok, and LinkedIn for free. 15+ AI tools included. No credit card required.',
    images: [{ url: '/og-image.png', width: 1270, height: 760, alt: 'SocialMate — Schedule smarter. Start free.' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SocialMate — Free Social Media Scheduler',
    description: 'Schedule posts to Bluesky, Discord, Telegram, Mastodon, X/Twitter, TikTok, and LinkedIn for free. 15+ AI tools included. No credit card required.',
    images: ['/og-image.png'],
    creator: '@socialmatehq',
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

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#000000',
}

const organizationLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${APP_URL}/#organization`,
  name: 'Gilgamesh Enterprise LLC',
  alternateName: 'SocialMate',
  url: APP_URL,
  logo: {
    '@type': 'ImageObject',
    url: `${APP_URL}/logo.png`,
    width: 512,
    height: 512,
  },
  foundingDate: '2026-03-26',
  founder: {
    '@type': 'Person',
    name: 'Joshua Bostic',
    jobTitle: 'Founder & CEO',
    sameAs: ['https://twitter.com/socialmatehq'],
  },
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'socialmate.updates@gmail.com',
    contactType: 'customer support',
  },
  sameAs: [
    'https://twitter.com/socialmatehq',
    'https://bsky.app/profile/socialmate.studio',
  ],
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Indiana',
    addressCountry: 'US',
  },
}

const websiteLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${APP_URL}/#website`,
  name: 'SocialMate',
  url: APP_URL,
  description: 'Free social media scheduler for Bluesky, Discord, Telegram, Mastodon, X/Twitter, TikTok, and LinkedIn. 15+ AI tools. No credit card required.',
  publisher: {
    '@id': `${APP_URL}/#organization`,
  },
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${APP_URL}/blog?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
  inLanguage: ['en', 'es', 'de', 'fr', 'pt', 'ru', 'zh', 'ja', 'ko'],
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  '@id': `${APP_URL}/#software`,
  name: 'SocialMate',
  applicationCategory: 'BusinessApplication',
  applicationSubCategory: 'Social Media Management',
  operatingSystem: 'Web, Android',
  url: APP_URL,
  description: 'Free social media scheduling platform for Bluesky, Discord, Telegram, Mastodon, X/Twitter, TikTok, and LinkedIn. 15+ AI-powered content tools, 8 autonomous agents, SOMA AI content OS, team collaboration, analytics, and creator monetization.',
  screenshot: `${APP_URL}/og-image.png`,
  softwareVersion: '1.0',
  datePublished: '2026-03-26',
  offers: [
    {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      name: 'Free Plan',
      description: '50 AI credits/month, 2 seats, all 7 platforms, no credit card required',
    },
    {
      '@type': 'Offer',
      price: '5',
      priceCurrency: 'USD',
      name: 'Pro Plan',
      description: '500 AI credits/month, 5 seats, Smart Queue, Brand Voice, A/B testing',
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price: '5',
        priceCurrency: 'USD',
        billingIncrement: 'P1M',
      },
    },
    {
      '@type': 'Offer',
      price: '20',
      priceCurrency: 'USD',
      name: 'Agency Plan',
      description: '2,000 AI credits/month, 15 seats, 5 client workspaces',
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price: '20',
        priceCurrency: 'USD',
        billingIncrement: 'P1M',
      },
    },
  ],
  author: {
    '@id': `${APP_URL}/#organization`,
  },
  publisher: {
    '@id': `${APP_URL}/#organization`,
  },
  featureList: [
    'Schedule posts to Bluesky, Discord, Telegram, Mastodon, X/Twitter, TikTok, and LinkedIn',
    '15+ AI-powered content tools (caption, hashtags, hook, thread, repurpose, post score)',
    'SOMA — autonomous AI content OS with voice learning and project memory',
    'Enki — AI quantitative trading bot with paper and live trading',
    '8 autonomous AI agents (newsletter, client reports, trend scout, inbox agent, and more)',
    'SIGIL Link in Bio page builder — free on all plans',
    'Team collaboration with role-based access and content approval workflows',
    'Bulk scheduler with per-platform character limit enforcement',
    'Smart Queue — auto-schedule drafts at platform-optimal times',
    'Recurring posts (daily/weekly/bi-weekly/monthly)',
    'Social inbox — unified Bluesky, Mastodon, Telegram, Discord mentions',
    'Analytics dashboard — posting streaks, content DNA, best times heatmap',
    'A/B post variant testing',
    'Creator monetization via Stripe Connect — 0% platform cut',
    'Clips Studio — schedule Twitch and YouTube clips',
    'Creator Studio — video editor with trim, filters, captions, GIF export',
    'Competitor tracking with engagement alerts',
    'Evergreen recycling — auto-requeue evergreen content',
    'RSS/blog import',
    'Multi-workspace support (client isolation)',
    'Browser push notifications',
    'SM-Give — 2% of subscriptions to charitable causes',
    '9-language internationalization (en, es, de, fr, pt, ru, zh, ja, ko)',
  ],
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    ratingCount: '30',
    bestRating: '5',
    worstRating: '1',
  },
}

// Anti-flash: apply theme before React hydrates to prevent FOUC
const antiFlashScript = `
(function(){try{
  var m=localStorage.getItem('sm-theme-mode')||'light';
  var a=localStorage.getItem('sm-theme-accent')||'default';
  var h=document.documentElement;
  if(m==='dark'){h.classList.add('dark');h.setAttribute('data-theme','dark');}
  else{h.classList.remove('dark');h.setAttribute('data-theme','light');}
  if(a&&a!=='default'){h.setAttribute('data-accent',a);}else{h.removeAttribute('data-accent');}
}catch(e){}
})();
`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Anti-flash: must be first script to prevent white flash on dark mode */}
        <script dangerouslySetInnerHTML={{ __html: antiFlashScript }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="SocialMate" />
        {/* Pinterest domain verification */}
        <meta name="p:domain_verify" content="36117bcd9adbfb7d01695c4aa0266d3c" />
      </head>
      <body className={`${inter.variable} ${inter.className}`}>
        <ThemeProvider>
          <WorkspaceProvider>
            <I18nProvider>
              {children}
            </I18nProvider>
          </WorkspaceProvider>
        </ThemeProvider>
        <LazyClientComponents />
        <Analytics />
        <SpeedInsights />
        <GoogleAnalytics />
      </body>
    </html>
  )
}