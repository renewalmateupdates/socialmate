export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { refreshTwitterToken } from '@/lib/publish/twitter'

const ADMIN_EMAIL = 'socialmatehq@gmail.com'

export async function GET(req: NextRequest) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Grab the stored X/Twitter account
  const admin = getSupabaseAdmin()
  const { data: account } = await admin
    .from('connected_accounts')
    .select('id, access_token, refresh_token, expires_at, platform_user_id')
    .eq('platform', 'twitter')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!account) {
    return NextResponse.json({ error: 'No Twitter account connected' }, { status: 404 })
  }

  // Refresh token if expired or close to expiry
  let accessToken = account.access_token
  try {
    const expiresAt = account.expires_at ? new Date(account.expires_at).getTime() : 0
    const expiresSoon = expiresAt < Date.now() + 60_000
    if (expiresSoon && account.refresh_token) {
      accessToken = await refreshTwitterToken(account.refresh_token, account.id)
    }
  } catch (err) {
    return NextResponse.json({ error: 'Token refresh failed', detail: String(err) }, { status: 500 })
  }

  // Probe the DM events endpoint — GET only, no message sent
  // 200 or 400 = DM access unlocked. 403 = need paid plan.
  const probeRes = await fetch('https://api.twitter.com/2/dm_events', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  const probeBody = await probeRes.json().catch(() => ({}))

  return NextResponse.json({
    status: probeRes.status,
    statusText: probeRes.statusText,
    body: probeBody,
    verdict: probeRes.status === 403
      ? '❌ DM access BLOCKED — need paid Basic plan ($100/mo)'
      : probeRes.status === 200 || probeRes.status === 400
      ? '✅ DM access UNLOCKED — pay-per-use covers DMs'
      : `⚠️ Unexpected status ${probeRes.status} — check body for details`,
    twitter_user_id: account.platform_user_id,
  })
}
