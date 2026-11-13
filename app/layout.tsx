import { AI_TOOLS, BRAND, FEATURES, LIVE_PLATFORM_NAMES, PLANS, SENTENCES, listWords } from '@/lib/site-facts'
import type { Metadata, Viewport } from 'next'
import { fontVars } from './fonts'
import './globals.css'
import { WorkspaceProvider } from '@/contexts/WorkspaceContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { I18nProvider } from '@/contexts/I18nContext'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import GoogleAnalytics from '@/components/GoogleAnalytics'
// ssr:false dynamic imports must live in a 'use client' module — see LazyClientComponents
import LazyClientComponents from '@/components/LazyClientComponents'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || BRAND.url

// Every fact below is read from lib/site-facts.ts. Until Nov 12, 2026 this
// file typed its own: the JSON-LD on every page still offered Pro at $5 and
// Agency at $20 three months after the repricing, said the free plan covered
// all 7 platforms, and linked a Bluesky profile that does not exist.
const PLATFORM_LIST = listWords(LIVE_PLATFORM_NAMES)
const SHORT_DESCRIPTION = `Schedule posts to ${PLATFORM_LIST}. Free plan, ${AI_TOOLS.length} AI tools, no credit card required.`

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: `SocialMate: Free Social Media Scheduler for ${LIVE_PLATFORM_NAMES.length} Platforms`,
    template: '%s | SocialMate',
  },
  description: SENTENCES.metaDescription,
  keywords: [
    'social media scheduler',
    'free buffer alternative',
    'free hootsuite alternative',
    'social media management',
    'tiktok scheduler',
    'linkedin scheduler',
    'discord scheduler',
    'telegram scheduler',
    'bluesky scheduler',
    'mastodon scheduler',
    'bulk scheduler',
    'link in bio',
    'ai social media',
    'free social media tool',
    'content scheduler',
    'post scheduler',
  ],
  authors: [{ name: 'SocialMate', url: APP_URL }],
  creator: BRAND.legalEntity,
  publisher: BRAND.legalEntity,
  category: 'productivity',
  applicationName: 'SocialMate',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: APP_URL,
    siteName: 'SocialMate',
    title: 'SocialMate: Free Social Media Scheduler',
    description: SHORT_DESCRIPTION,
    images: [{ url: '/og-image.png', width: 1270, height: 760, alt: 'SocialMate. Schedule smarter. Start free.' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SocialMate: Free Social Media Scheduler',
    description: SHORT_DESCRIPTION,
    images: ['/og-image.png'],
    creator: BRAND.xHandle,
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
  // No `icons` here. It used to name /favicon.ico and /apple-touch-icon.png,
  // neither of which exists, so every page linked two 404s. Next adds the
  // right tags itself from app/icon.png and app/apple-icon.png.
  manifest: '/manifest.json',
  // No canonical here. Metadata set on the root layout is inherited by every
  // page that does not set its own, so a canonical of the home page told
  // search engines that all 14 guides, /about, /faq, /changelog, /soma and
  // some 200 other pages were duplicates of the home page. The landing sets
  // its own in generateLocaleMetadata.
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#000000',
}

const SOCIAL_PROFILES = Object.values(BRAND.social)

const organizationLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${APP_URL}/#organization`,
  name: BRAND.legalEntity,
  alternateName: BRAND.name,
  url: APP_URL,
  logo: {
    '@type': 'ImageObject',
    url: `${APP_URL}/logo.png`,
    width: 1024,
    height: 1024,
  },
  foundingDate: BRAND.launched,
  founder: {
    '@type': 'Person',
    name: BRAND.founder,
    jobTitle: 'Founder & CEO',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    email: BRAND.supportEmail,
    contactType: 'customer support',
  },
  sameAs: SOCIAL_PROFILES,
  address: {
    '@type': 'PostalAddress',
    addressRegion: 'IN',
    addressCountry: 'US',
  },
}

// No SearchAction. It pointed at /blog?q=..., and the blog index does not read
// a query, so the markup promised a site search that is not there.
const websiteLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${APP_URL}/#website`,
  name: BRAND.name,
  url: APP_URL,
  description: SHORT_DESCRIPTION,
  publisher: {
    '@id': `${APP_URL}/#organization`,
  },
  inLanguage: BRAND.languages,
}

function offer(tier: 'free' | 'pro' | 'agency') {
  const p = PLANS[tier]
  const workspaces = p.clientWorkspaces > 0
    ? `, ${p.clientWorkspaces} client workspace${p.clientWorkspaces === 1 ? '' : 's'}`
    : ''
  return {
    '@type': 'Offer',
    name: `${p.name} Plan`,
    price: String(p.monthly),
    priceCurrency: 'USD',
    url: `${APP_URL}/pricing`,
    availability: 'https://schema.org/InStock',
    description: `${p.postsPerMonth.toLocaleString('en-US')} posts and ${p.aiCreditsPerMonth.toLocaleString('en-US')} AI credits a month, ${p.seats} seats${workspaces}${tier === 'free' ? ', no credit card required' : ''}`,
    ...(tier === 'free' ? {} : {
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price: String(p.monthly),
        priceCurrency: 'USD',
        billingDuration: 'P1M',
      },
    }),
  }
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  '@id': `${APP_URL}/#software`,
  name: BRAND.name,
  applicationCategory: 'BusinessApplication',
  applicationSubCategory: 'Social Media Management',
  operatingSystem: 'Web',
  url: APP_URL,
  description: BRAND.summary,
  screenshot: `${APP_URL}/og-image.png`,
  datePublished: BRAND.launched,
  offers: [offer('free'), offer('pro'), offer('agency')],
  author: {
    '@id': `${APP_URL}/#organization`,
  },
  publisher: {
    '@id': `${APP_URL}/#organization`,
  },
  // Live features only: nothing marked beta in site-facts is advertised here.
  featureList: [
    `Schedule posts to ${PLATFORM_LIST}`,
    ...FEATURES.filter(f => f.status === 'live').map(f => `${f.name}: ${f.what}`),
  ],
  // No aggregateRating. We do not have a review system, so any rating here would be
  // invented — and Google treats fabricated review markup as a structured-data violation.
  // It goes back in when there are real reviews to count.
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
    // suppressHydrationWarning is correct here, not a papering-over: the
    // anti-flash script below deliberately sets class/data-theme on <html>
    // before React hydrates, so the server and client markup are *supposed*
    // to differ on this one element.
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Fonts are self-hosted via next/font/local (app/fonts.ts) — no font CDN to
            preconnect to, and next/font emits its own <link rel=preload> for each face. */}
        <link rel="dns-prefetch" href="https://vercel-insights-api.vercel.sh" />
        <link rel="dns-prefetch" href="https://vitals.vercel-analytics.com" />
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
      <body className={fontVars}>
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