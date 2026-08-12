import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

// Record a sign-in for the caller.
//
// Login tracking lived only in app/auth/callback, which is the OAuth callback.
// A password sign-in happens client-side via signInWithPassword and never
// touches that route, so it was never counted — 58 of 73 accounts sat at
// login_count 0, including people who had obviously signed in. Anything reading
// login_count (the Power Users panel on the Command Deck, the behaviour survey
// trigger) was working from Google sign-ins only.
//
// The caller's own session identifies them; there is no user id in the body, so
// this cannot be used to inflate someone else's count.
export async function POST() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {}, // read-only: this route never rotates the session
      },
    },
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ ok: false }, { status: 401 })

  const admin = getSupabaseAdmin()

  // Atomic where available; the RPC is a single UPDATE ... SET n = n + 1.
  const { error: rpcError } = await admin.rpc('increment_login_count', { p_user_id: user.id })
  if (!rpcError) return NextResponse.json({ ok: true })

  // .rpc() returns its error rather than throwing, so this has to be checked
  // rather than caught — the same trap PR #511 fixed in auth/callback.
  const { data: current } = await admin
    .from('user_settings')
    .select('login_count')
    .eq('user_id', user.id)
    .maybeSingle()

  const { error: upsertError } = await admin
    .from('user_settings')
    .upsert({
      user_id:     user.id,
      login_count: (current?.login_count ?? 0) + 1,
      last_active: new Date().toISOString(),
    }, { onConflict: 'user_id' })

  if (upsertError) {
    console.error('[track-login] failed:', upsertError.message)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
