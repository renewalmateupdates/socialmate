'use client'
// ssr:false dynamic imports must live inside a 'use client' module.
// Root layout is a Server Component, so we wrap the non-critical
// client-only widgets here and render this single component from layout.
import dynamic from 'next/dynamic'

const FeedbackWidget = dynamic(() => import('@/components/FeedbackWidget'), { ssr: false })
const CookieBanner   = dynamic(() => import('@/components/CookieBanner'),   { ssr: false })
const InstallPrompt  = dynamic(() => import('@/components/InstallPrompt'),  { ssr: false })

export default function LazyClientComponents() {
  // Wrapped with an id so the hero recorder can remove all three in one call —
  // marketing clips shouldn't ship with a cookie banner across the bottom.
  // A plain div doesn't disturb the children's fixed positioning.
  return (
    <div id="app-widgets">
      <FeedbackWidget />
      <CookieBanner />
      <InstallPrompt />
    </div>
  )
}
