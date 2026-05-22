export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { randomBytes } from 'crypto'

const ALLOWED_EVENTS = ['post.published', 'post.failed'] as const

function makeSupabase() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => (cookieStore as any).getAll(),
        setAll: (s: any[]) =>
          s.forEach(({ name, value, options }: any) =>
            (cookieStore as any).set(name, value, options)
          ),
      },
    }
  )
}

function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'https:' || parsed.protocol === 'http:'
  } catch {
    return false
  }
}

export async function GET() {
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

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('user_webhooks')
    .select('id, url, events, active, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ webhooks: data ?? [] })
}

export async function POST(request: NextRequest) {
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

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => null)
  if (!body || typeof body.url !== 'string') {
    return NextResponse.json({ error: 'url (string) is required' }, { status: 400 })
  }

  const url: string = body.url.trim()
  if (!isValidUrl(url)) {
    return NextResponse.json({ error: 'Invalid URL — must be a valid http:// or https:// URL' }, { status: 400 })
  }

  // Validate and default events
  const rawEvents: string[] = Array.isArray(body.events) ? body.events : ['post.published', 'post.failed']
  const events = rawEvents.filter(e => ALLOWED_EVENTS.includes(e as any))
  if (events.length === 0) {
    return NextResponse.json({ error: 'At least one valid event is required (post.published, post.failed)' }, { status: 400 })
  }

  const secret = randomBytes(16).toString('hex')

  const { data, error } = await supabase
    .from('user_webhooks')
    .insert({ user_id: user.id, url, events, secret, active: true })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Return the secret ONCE — it will not be shown again
  return NextResponse.json({ webhook: data }, { status: 201 })
}
