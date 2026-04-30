import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

async function makeClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: (a) => a.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } }
  )
}

export async function GET(req: NextRequest) {
  const supabase = await makeClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const workspaceId = req.nextUrl.searchParams.get('workspace_id')
  if (!workspaceId) return NextResponse.json({ error: 'workspace_id required' }, { status: 400 })

  const { data } = await supabase
    .from('creator_monetization')
    .select('*')
    .eq('workspace_id', workspaceId)
    .single()

  return NextResponse.json({ settings: data })
}

export async function POST(req: NextRequest) {
  const supabase = await makeClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Pro+ gate
  const { data: ws } = await supabase
    .from('workspaces')
    .select('plan')
    .eq('owner_id', user.id)
    .eq('is_personal', true)
    .single()
  const plan = (ws?.plan ?? 'free').replace('_annual', '')
  if (plan === 'free') return NextResponse.json({ error: 'Pro plan required' }, { status: 403 })

  const body = await req.json()
  const {
    workspace_id,
    page_handle, page_title, page_bio, avatar_url, header_color,
    tip_enabled, tip_min, tip_max,
    subscription_enabled, subscription_price, subscription_name, subscription_description,
  } = body

  if (!workspace_id) return NextResponse.json({ error: 'workspace_id required' }, { status: 400 })

  if (page_handle) {
    if (!/^[a-z0-9-]{3,30}$/.test(page_handle)) {
      return NextResponse.json({ error: 'Handle must be 3–30 lowercase letters, numbers, or hyphens.' }, { status: 400 })
    }
    const { data: existing } = await supabase
      .from('creator_monetization')
      .select('workspace_id')
      .eq('page_handle', page_handle)
      .neq('workspace_id', workspace_id)
      .single()
    if (existing) return NextResponse.json({ error: 'That handle is already taken.' }, { status: 409 })
  }

  const { error } = await supabase
    .from('creator_monetization')
    .upsert({
      workspace_id,
      user_id: user.id,
      page_handle: page_handle || null,
      page_title: page_title || null,
      page_bio: page_bio || null,
      avatar_url: avatar_url || null,
      header_color: header_color || '#F59E0B',
      tip_enabled: tip_enabled ?? false,
      tip_min: tip_min ?? 100,
      tip_max: tip_max ?? 10000,
      subscription_enabled: subscription_enabled ?? false,
      subscription_price: subscription_price ?? 500,
      subscription_name: subscription_name || 'Supporter',
      subscription_description: subscription_description || 'Support my work and get access to exclusive content.',
      updated_at: new Date().toISOString(),
    }, { onConflict: 'workspace_id' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
