export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

// Curated popular sounds as fallback when Research API isn't available
const CURATED_SOUNDS = [
  { id: 'original', name: 'Original audio only', artist: '', duration: 0, is_original: true },
]

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q') || ''

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (s) => s.forEach(({ name, value, options }) =>
          cookieStore.set(name, value, options)
        ),
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ sounds: CURATED_SOUNDS, source: 'curated' })

  // Try TikTok Research API for music search (requires Production approval)
  const { data: account } = await getSupabaseAdmin()
    .from('connected_accounts')
    .select('access_token')
    .eq('user_id', user.id)
    .eq('platform', 'tiktok')
    .maybeSingle()

  if (account?.access_token && query) {
    try {
      const res = await fetch('https://open.tiktokapis.com/v2/research/music/search/', {
        method:  'POST',
        headers: {
          Authorization:  `Bearer ${account.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ keyword: query, cursor: 0, max_count: 20 }),
      })

      if (res.ok) {
        const data = await res.json()
        const sounds = (data?.data?.musics ?? []).map((m: Record<string, unknown>) => ({
          id:       m.id,
          name:     m.title,
          artist:   m.author_name,
          duration: m.duration,
          cover_url: m.cover_large_url,
        }))

        if (sounds.length > 0) {
          return NextResponse.json({ sounds, source: 'tiktok' })
        }
      }
    } catch (err) {
      console.error('[TikTok sounds] Research API unavailable (non-fatal):', err)
    }
  }

  // Fallback — Research API not available in sandbox
  return NextResponse.json({
    sounds: CURATED_SOUNDS,
    source: 'curated',
    note:   'Full sound library unlocks with Production API approval',
  })
}
