export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

// Competitor tracking's 3-per-user cap was enforced only in the client's
// handleAdd() click handler — a `competitors.length >= MAX_COMPETITORS`
// check before a direct Supabase insert. Same class of bug the
// connected-accounts cap had before lib/account-limits.ts: anyone hitting
// this insert directly (devtools, a stale page, a second tab) bypasses it
// entirely. Each row here gets scraped nightly by competitorAlerts and read
// by Growth Scout / Trend Scout, so an uncapped count is a real, ongoing
// cost, not just a UI nicety.
const MAX_COMPETITORS = 3

function getClient() {
  return cookies().then(cookieStore =>
    createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (s) => s.forEach(({ name, value, options }) => cookieStore.set(name, value, options)),
        },
      }
    )
  )
}

export async function POST(request: NextRequest) {
  const supabase = await getClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => null)
  const name = typeof body?.name === 'string' ? body.name.trim() : ''
  const handle = typeof body?.handle === 'string' ? body.handle.trim() : ''
  const platform = typeof body?.platform === 'string' ? body.platform.trim() : ''
  const notes = typeof body?.notes === 'string' ? body.notes : ''

  if (!name || !handle || !platform) {
    return NextResponse.json({ error: 'name, handle, and platform are required' }, { status: 400 })
  }

  const { count, error: countError } = await supabase
    .from('competitor_accounts')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)

  if (countError) return NextResponse.json({ error: countError.message }, { status: 500 })

  if ((count ?? 0) >= MAX_COMPETITORS) {
    return NextResponse.json({ error: `Limited to ${MAX_COMPETITORS} competitors` }, { status: 403 })
  }

  const { data, error } = await supabase
    .from('competitor_accounts')
    .insert({ user_id: user.id, name, platform, handle, notes })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ competitor: data }, { status: 201 })
}
