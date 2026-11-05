export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

// Saves the Settings > Profile tab for the signed-in user.
//
// The display name lives in two tables: profiles.display_name (the dashboard,
// community posts) and user_settings.display_name (the workspace label a
// teammate sees, team invite emails, Zenith). Settings used to write only
// profiles, straight from the browser, and showed "Saved" without checking the
// result, so a failed write looked like a success (Nov 4 feedback: the name
// "says saved" but neither the dashboard nor the VA's shared-workspace label
// changed). This route writes both, for the caller's own rows only, and returns
// the real outcome.

const MAX_NAME = 60
const MAX_USERNAME = 30
const MAX_BIO = 300

function clean(value: unknown, max: number): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

export async function POST(request: NextRequest) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } },
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: Record<string, unknown>
  try { body = await request.json() } catch { return NextResponse.json({ error: 'Bad request' }, { status: 400 }) }

  const displayName = clean(body.displayName, MAX_NAME)
  // An empty handle is stored as null, never ''. A blank string is a real value
  // to a unique index, so a second blank handle would make the whole save fail.
  const username = clean(body.username, MAX_USERNAME + 1).replace(/^@+/, '').slice(0, MAX_USERNAME) || null
  const bio = clean(body.bio, MAX_BIO)

  if (!displayName) return NextResponse.json({ error: 'empty_name' }, { status: 400 })

  const admin = getSupabaseAdmin()
  const fields = { display_name: displayName, username, bio: bio || null }

  const { data: updated, error: profileError } = await admin
    .from('profiles').update(fields).eq('id', user.id).select('id')
  if (profileError) {
    console.warn('[user/profile] profiles update failed:', profileError.code, profileError.message)
    const taken = profileError.code === '23505'
    return NextResponse.json({ error: taken ? 'username_taken' : 'save_failed' }, { status: taken ? 409 : 500 })
  }
  if (!updated || updated.length === 0) {
    const { error: insertError } = await admin.from('profiles').insert({ id: user.id, ...fields })
    if (insertError) {
      console.warn('[user/profile] profiles insert failed:', insertError.code, insertError.message)
      const taken = insertError.code === '23505'
      return NextResponse.json({ error: taken ? 'username_taken' : 'save_failed' }, { status: taken ? 409 : 500 })
    }
  }

  const { error: settingsError } = await admin
    .from('user_settings').update({ display_name: displayName }).eq('user_id', user.id)
  if (settingsError) {
    console.warn('[user/profile] user_settings display_name update failed:', settingsError.code, settingsError.message)
    return NextResponse.json({ error: 'save_failed' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, displayName, username, bio })
}
