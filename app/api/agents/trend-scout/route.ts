export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { resolveWorkspacePlan } from '@/lib/plan'

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
    .from('trend_scout_settings')
    .select('*')
    .eq('workspace_id', workspaceId)
    .eq('user_id', user.id)
    .maybeSingle()

  const { data: results } = await admin
    .from('trend_scout_results')
    .select('trends, generated_at')
    .eq('workspace_id', workspaceId)
    .eq('user_id', user.id)
    .order('generated_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  return NextResponse.json({ settings, results })
}

export async function POST(req: NextRequest) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { workspace_id, enabled } = body
  if (!workspace_id) return NextResponse.json({ error: 'workspace_id required' }, { status: 400 })

  const admin = getSupabaseAdmin()

  // Verify Pro+ plan. workspaces.plan is NULL by default for any workspace
  // that has never itself been through Stripe checkout -- true for most
  // workspaces today -- and `null === 'free'` is false, so a bare equality
  // check here fails OPEN: a free user could enable this and the cron below
  // would run real Gemini calls for them indefinitely. resolveWorkspacePlan
  // falls back through the workspace's owner's plan and normalizes NULL to
  // the 'free' tier explicitly.
  const plan = await resolveWorkspacePlan(admin, user.id, workspace_id)
  if (plan === 'free') {
    return NextResponse.json({ error: 'Pro plan required' }, { status: 403 })
  }

  const { data, error } = await admin
    .from('trend_scout_settings')
    .upsert({
      workspace_id,
      user_id: user.id,
      enabled: enabled ?? false,
    }, { onConflict: 'workspace_id' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ settings: data })
}
