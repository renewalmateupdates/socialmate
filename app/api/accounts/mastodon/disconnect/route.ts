export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { startCooling } from '@/lib/platform-jail'

export async function POST(request: NextRequest) {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { accountId } = await request.json()

  if (!accountId) {
    return NextResponse.json({ error: 'accountId is required' }, { status: 400 })
  }

  // Fetch platform_user_id BEFORE deleting
  const { data: accountRow } = await supabase
    .from('connected_accounts')
    .select('platform_user_id')
    .eq('id', accountId)
    .eq('user_id', user.id)
    .eq('platform', 'mastodon')
    .maybeSingle()
  const platformUserId = accountRow?.platform_user_id ?? null

  const { error } = await supabase
    .from('connected_accounts')
    .delete()
    .eq('id', accountId)
    .eq('user_id', user.id)
    .eq('platform', 'mastodon')

  if (error) {
    console.error('Mastodon disconnect error:', error)
    return NextResponse.json({ error: 'Failed to disconnect account' }, { status: 500 })
  }

  // Start the 45-day pause. It stops a different SocialMate user picking this
  // account up; the owner can reconnect at any time (lib/platform-jail.ts).
  if (platformUserId) await startCooling('mastodon', platformUserId)

  return NextResponse.json({ success: true })
}