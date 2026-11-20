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

  // Whether a TikTok connection exists, from our own table, so the first HTML
  // is the studio (or the connect screen) rather than a spinner held until
  // TikTok answers creator_info from the browser (Nov 20, 2026). TikTok still
  // has the last word once it answers. Under RLS this reads only this user's rows.
  const { data: tiktokRows, error } = await supabase
    .from('connected_accounts')
    .select('id')
    .eq('user_id', user.id)
    .eq('platform', 'tiktok')
    .limit(1)
  if (error) console.warn('[tiktok/studio] connection lookup failed:', error.message)
  // On a failed read, no hint: the page waits for TikTok's answer as it used to.
  const initialConnected = error ? undefined : (tiktokRows?.length ?? 0) > 0

  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-sm text-gray-400">Loading TikTok Studio…</div>
      </div>
    }>
      <TikTokStudioClient initialConnected={initialConnected} />
    </Suspense>
  )
}
