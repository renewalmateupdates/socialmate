'use client'
// ssr:false dynamic imports must live inside a 'use client' module.
// Root layout is a Server Component, so we wrap the non-critical
// client-only widgets here and render this single component from layout.
import dynamic from 'next/dynamic'

const FeedbackWidget = dynamic(() => import('@/components/FeedbackWidget'), { ssr: false })
const CookieBanner   = dynamic(() => import('@/components/CookieBanner'),   { ssr: false })
const InstallPrompt  = dynamic(() => import('@/components/InstallPrompt'),  { ssr: false })

export default function LazyClientComponents() {
  return (
    <>
      <FeedbackWidget />
      <CookieBanner />
      <InstallPrompt />
    </>
  )
}
