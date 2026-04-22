export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

// PATCH /api/soma/mode
// body: { mode: 'safe' | 'autopilot' }
// Updates workspaces.soma_mode
// Returns 403 if mode='autopilot' and soma_autopilot_enabled=false
export async function PATCH(req: NextRequest) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { mode?: string } = {}
  try { body = await req.json() } catch {}

  const { mode } = body
  if (mode !== 'safe' && mode !== 'autopilot') {
    return NextResponse.json({ error: 'Invalid mode. Must be "safe" or "autopilot".' }, { status: 400 })
  }

  const admin = getSupabaseAdmin()

  // Check if autopilot is enabled for this user's workspace
  if (mode === 'autopilot') {
    const { data: ws } = await admin
      .from('workspaces')
      .select('soma_autopilot_enabled')
      .eq('owner_id', user.id)
      .eq('is_personal', true)
      .maybeSingle()

    if (!ws?.soma_autopilot_enabled) {
      return NextResponse.json(
        { error: 'Autopilot not enabled. Upgrade required.', upgrade_required: true },
        { status: 403 }
      )
    }
  }

  const { error } = await admin
    .from('workspaces')
    .update({ soma_mode: mode })
    .eq('owner_id', user.id)
    .eq('is_personal', true)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true, mode })
}
