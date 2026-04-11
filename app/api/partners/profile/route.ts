export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

function getAdminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

async function getAuthedUser() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
  return supabase.auth.getUser()
}

// ── PATCH — affiliate updates their own profile preferences ───────────────

export async function PATCH(req: NextRequest) {
  const { data: { user } } = await getAuthedUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = getAdminSupabase()

  const { data: profile } = await db
    .from('affiliate_profiles')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

  const body = await req.json()
  const ALLOWED = ['tour_completed', 'leaderboard_opt_in', 'leaderboard_anonymous']
  const updates: Record<string, unknown> = {}

  for (const key of ALLOWED) {
    if (key in body) updates[key] = body[key]
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid fields provided' }, { status: 400 })
  }

  updates.updated_at = new Date().toISOString()

  const { error } = await db
    .from('affiliate_profiles')
    .update(updates)
    .eq('id', profile.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
