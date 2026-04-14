import type { Metadata } from 'next'
import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import ClipsPageClient from './ClipsPageClient'

export const metadata: Metadata = {
  title: 'Clips Studio — Schedule Twitch & YouTube Clips',
  description: 'Browse your Twitch clips or YouTube videos and schedule them to 5 social platforms in one click. No extra tabs, no copy-pasting. Free on all SocialMate plans.',
  openGraph: {
    title: 'SocialMate Clips Studio — Schedule Twitch & YouTube Content',
    description: 'Browse your Twitch clips or YouTube videos and schedule them to Bluesky, Discord, Telegram, Mastodon, and X/Twitter in one click.',
    url: 'https://socialmate.studio/clips',
    images: [{ url: 'https://socialmate.studio/og-image.png', width: 1270, height: 760, alt: 'SocialMate Clips Studio' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SocialMate Clips Studio — Schedule Twitch & YouTube Content',
    description: 'Browse clips, schedule to 5 platforms in one click. Free on all plans.',
    images: ['https://socialmate.studio/og-image.png'],
  },
  alternates: { canonical: 'https://socialmate.studio/clips' },
}

export default async function Page() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-sm" style={{ color: 'var(--text-faint)' }}>Loading…</div>
      </div>
    }>
      <ClipsPageClient />
    </Suspense>
  )
}
