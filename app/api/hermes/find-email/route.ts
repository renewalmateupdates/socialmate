export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { getHermesAccess, HERMES_LIMITS, hunterLookupsThisMonth } from '@/lib/hermes-access'

async function getUser() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (s) => s.forEach(({ name, value, options }) => cookieStore.set(name, value, options)),
      },
    }
  )
  return supabase.auth.getUser()
}

export async function GET(req: NextRequest) {
  const { data: { user } } = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const supabase = getSupabaseAdmin()
  const access = await getHermesAccess(supabase, user.id, user.email)
  if (!access.allowed) return NextResponse.json({ error: 'HERMES is not active on your account' }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const firstName = searchParams.get('first_name')?.trim()
  const lastName  = searchParams.get('last_name')?.trim()
  const domain    = searchParams.get('domain')?.trim().replace(/^https?:\/\//, '').replace(/\/$/, '')

  if (!firstName || !domain) {
    return NextResponse.json({ error: 'first_name and domain are required' }, { status: 400 })
  }

  // Hunter bills against one account-wide quota shared by every HERMES user —
  // check the monthly cap before spending a Hunter credit, not after.
  const limit = HERMES_LIMITS[access.tier!].hunterLookupsPerMonth
  if (limit !== Infinity) {
    const usedSoFar = await hunterLookupsThisMonth(supabase, user.id)
    if (usedSoFar >= limit) {
      return NextResponse.json({ error: `You've used your ${limit} email lookups for this month. Resets next month, or upgrade for more.` }, { status: 429 })
    }
  }

  const apiKey = process.env.HUNTER_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'Hunter API not configured' }, { status: 500 })

  const params = new URLSearchParams({
    api_key: apiKey,
    domain,
    first_name: firstName,
    ...(lastName ? { last_name: lastName } : {}),
  })

  const res = await fetch(`https://api.hunter.io/v2/email-finder?${params}`)
  const data = await res.json()

  // Logged whether or not Hunter found a match — a search consumes a Hunter
  // credit either way, so a miss still counts against the monthly cap.
  await supabase.from('hermes_discover_runs').insert({ user_id: user.id, source: 'hunter_lookup' })

  if (!res.ok) {
    const msg = data?.errors?.[0]?.details || data?.error || 'Hunter lookup failed'
    return NextResponse.json({ error: msg }, { status: res.status })
  }

  const email = data?.data?.email ?? null
  const score = data?.data?.score ?? 0

  return NextResponse.json({ email, score })
}
