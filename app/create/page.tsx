import type { Metadata } from 'next'
import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import CreatePageClient from './CreatePageClient'

export const metadata: Metadata = {
  title: 'Creator Studio — SocialMate',
  description: 'Edit videos and images for every platform, then schedule or download. All in one place.',
  openGraph: {
    title: 'Creator Studio — SocialMate',
    description: 'Edit videos and images for every platform, then schedule or download. All in one place.',
    url: 'https://socialmate.studio/create',
    images: [{ url: 'https://socialmate.studio/og-image.png', width: 1270, height: 760, alt: 'SocialMate Creator Studio' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Creator Studio — SocialMate',
    description: 'Edit videos and images for every platform, then schedule or download.',
    images: ['https://socialmate.studio/og-image.png'],
  },
  alternates: { canonical: 'https://socialmate.studio/create' },
}

export default async function Page() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/create')

  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-sm text-gray-500">Loading Creator Studio…</div>
      </div>
    }>
      <CreatePageClient />
    </Suspense>
  )
}
