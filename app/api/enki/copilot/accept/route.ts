export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

function getSupabase() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: async () => (await cookies()).getAll(),
        setAll: async (cookiesToSet) => {
          const store = await cookies()
          cookiesToSet.forEach(({ name, value, options }) => store.set(name, value, options))
        },
      },
    }
  )
}

// POST /api/enki/copilot/accept — accept a co-pilot invitation
// Body: { token: UUID } — the enki_copilots record ID
export async function POST(req: NextRequest) {
  const supabase = getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const { token } = body as { token?: string }
  if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 400 })

  const admin = getSupabaseAdmin()

  // Fetch the invitation
  const { data: invite, error: fetchErr } = await admin
    .from('enki_copilots')
    .select('id, owner_user_id, copilot_email, status')
    .eq('id', token)
    .maybeSingle()

  if (fetchErr || !invite) {
    return NextResponse.json({ error: 'Invitation not found' }, { status: 404 })
  }

  if (invite.status === 'removed') {
    return NextResponse.json({ error: 'This invitation has been removed' }, { status: 410 })
  }

  if (invite.status === 'active') {
    // Already accepted — idempotent success
    return NextResponse.json({ success: true })
  }

  if (invite.status !== 'pending') {
    return NextResponse.json({ error: 'Invalid invitation state' }, { status: 400 })
  }

  // Accept
  const { error: updateErr } = await admin
    .from('enki_copilots')
    .update({
      copilot_user_id: user.id,
      status: 'active',
      accepted_at: new Date().toISOString(),
    })
    .eq('id', token)

  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
