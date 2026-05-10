export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

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

  const { searchParams } = new URL(req.url)
  const firstName = searchParams.get('first_name')?.trim()
  const lastName  = searchParams.get('last_name')?.trim()
  const domain    = searchParams.get('domain')?.trim().replace(/^https?:\/\//, '').replace(/\/$/, '')

  if (!firstName || !domain) {
    return NextResponse.json({ error: 'first_name and domain are required' }, { status: 400 })
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

  if (!res.ok) {
    const msg = data?.errors?.[0]?.details || data?.error || 'Hunter lookup failed'
    return NextResponse.json({ error: msg }, { status: res.status })
  }

  const email = data?.data?.email ?? null
  const score = data?.data?.score ?? 0

  return NextResponse.json({ email, score })
}
