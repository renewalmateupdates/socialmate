import type { Metadata } from 'next'
import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import TikTokStudioClient from './TikTokStudioClient'

export const metadata: Metadata = {
  title: 'TikTok Studio — SocialMate',
  description: 'Edit, schedule, and publish videos to TikTok — directly from SocialMate.',
}

export default async function Page() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/tiktok/studio')

  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-sm text-gray-400">Loading TikTok Studio…</div>
      </div>
    }>
      <TikTokStudioClient />
    </Suspense>
  )
}
