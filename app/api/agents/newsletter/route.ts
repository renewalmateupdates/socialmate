export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

async function getUser() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function GET(req: NextRequest) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const workspaceId = searchParams.get('workspace_id')
  if (!workspaceId) return NextResponse.json({ error: 'workspace_id required' }, { status: 400 })

  const admin = getSupabaseAdmin()

  const { data: settings } = await admin
    .from('newsletter_settings')
    .select('*')
    .eq('workspace_id', workspaceId)
    .eq('user_id', user.id)
    .maybeSingle()

  const { data: sends } = await admin
    .from('newsletter_sends')
    .select('id, subject, subscriber_count, mode, sent_at')
    .eq('workspace_id', workspaceId)
    .order('sent_at', { ascending: false })
    .limit(10)

  return NextResponse.json({ settings, sends: sends ?? [] })
}

export async function POST(req: NextRequest) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { workspace_id, enabled, mode, subscriber_emails, subject_prefix, custom_intro } = body
  if (!workspace_id) return NextResponse.json({ error: 'workspace_id required' }, { status: 400 })

  const admin = getSupabaseAdmin()

  const { data, error } = await admin
    .from('newsletter_settings')
    .upsert({
      workspace_id,
      user_id:           user.id,
      enabled:           enabled ?? false,
      mode:              mode ?? 'draft',
      subscriber_emails: subscriber_emails ?? [],
      subject_prefix:    subject_prefix ?? '',
      custom_intro:      custom_intro ?? '',
    }, { onConflict: 'workspace_id' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ settings: data })
}
