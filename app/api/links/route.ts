export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

function generateSlug(): string {
  return Math.random().toString(36).slice(2, 8)
}

export async function GET(_req: NextRequest) {
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

  const admin = getSupabaseAdmin()
  const { data: links, error } = await admin
    .from('short_links')
    .select('id, slug, original_url, title, clicks, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ links: links ?? [] })
}

export async function POST(req: NextRequest) {
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

  let body: { url?: string; title?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { url, title } = body
  if (!url?.trim()) return NextResponse.json({ error: 'URL is required' }, { status: 400 })

  // Basic URL validation
  let parsedUrl: URL
  try {
    parsedUrl = new URL(url.trim())
  } catch {
    return NextResponse.json({ error: 'Invalid URL — must start with http:// or https://' }, { status: 400 })
  }

  const admin = getSupabaseAdmin()

  // Generate a unique slug (retry up to 5 times on collision)
  let slug = ''
  for (let i = 0; i < 5; i++) {
    const candidate = generateSlug()
    const { data: existing } = await admin
      .from('short_links')
      .select('id')
      .eq('slug', candidate)
      .single()
    if (!existing) { slug = candidate; break }
  }
  if (!slug) return NextResponse.json({ error: 'Could not generate unique slug — please try again' }, { status: 500 })

  const { data: link, error } = await admin
    .from('short_links')
    .insert({
      user_id: user.id,
      slug,
      original_url: parsedUrl.toString(),
      title: title?.trim() || null,
    })
    .select('id, slug, original_url, title, clicks, created_at')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const short_url = `https://socialmate.studio/go/${slug}`
  return NextResponse.json({ link, slug, short_url }, { status: 201 })
}
