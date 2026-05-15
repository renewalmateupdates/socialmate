import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import CookieBanner from '@/components/CookieBanner'
import FeedbackWidget from '@/components/FeedbackWidget'
import { WorkspaceProvider } from '@/contexts/WorkspaceContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { Analytics } from '@vercel/analytics/next'
import InstallPrompt from '@/components/InstallPrompt'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://socialmate.studio'

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: 'SocialMate — Free Social Media Scheduler',
    template: '%s | SocialMate',
  },
  description: 'Schedule posts to Bluesky, Discord, Telegram, Mastodon, and X/Twitter for free. AI content tools, analytics, and more.',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
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

export function generateStaticParams() {
  // Exclude default locale ('en') since it uses the root layout
  return routing.locales
    .filter(locale => locale !== routing.defaultLocale)
    .map(locale => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  // Validate locale — must be one of the supported locales
  if (!(routing.locales as readonly string[]).includes(locale)) {
    notFound()
  }

  // Providing all messages to the client
  const messages = await getMessages()

  return (
    <html lang={locale}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: antiFlashScript }} />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="SocialMate" />
        <meta name="p:domain_verify" content="36117bcd9adbfb7d01695c4aa0266d3c" />
      </head>
      <body className={`${inter.variable} ${inter.className}`}>
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider>
            <WorkspaceProvider>
              {children}
            </WorkspaceProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
        <FeedbackWidget />
        <CookieBanner />
        <InstallPrompt />
        <Analytics />
      </body>
    </html>
  )
}
