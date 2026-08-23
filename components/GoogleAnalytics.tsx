'use client'
import Script from 'next/script'

export default function GoogleAnalytics() {
  // Two names on purpose. This component has always read
  // NEXT_PUBLIC_GA_MEASUREMENT_ID, but CLAUDE.md has documented the variable as
  // NEXT_PUBLIC_GA4_ID since May — so if Vercel was set from the docs, GA has
  // been returning null and sending nothing for three months. Accepting either
  // spelling removes the guess; both are inlined at build time.
  const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? process.env.NEXT_PUBLIC_GA4_ID
  if (!GA_ID) return null
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');`}
      </Script>
    </>
  )
}
