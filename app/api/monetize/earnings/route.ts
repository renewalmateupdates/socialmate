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

  const [{ data: tips }, { data: subs }] = await Promise.all([
    supabase
      .from('creator_tips')
      .select('amount, created_at, supporter_name, message, status')
      .eq('workspace_id', workspaceId)
      .eq('status', 'paid')
      .order('created_at', { ascending: false })
      .limit(20),
    supabase
      .from('creator_fan_subscriptions')
      .select('id, subscriber_name, subscriber_email, status, created_at')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false }),
  ])

  const totalTips = (tips ?? []).reduce((sum, t) => sum + t.amount, 0)
  const activeSubs = (subs ?? []).filter(s => s.status === 'active').length

  return NextResponse.json({
    tips: tips ?? [],
    subscriptions: subs ?? [],
    total_tips_cents: totalTips,
    active_subscribers: activeSubs,
  })
}
