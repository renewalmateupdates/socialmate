export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { PLAN_CLIENT_WORKSPACES, resolveWorkspacePlan } from '@/lib/plan'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (cookiesToSet) => {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { name, clientName, industry, website, notes, defaultPlatforms } = body

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Client name is required' }, { status: 400 })
    }

    // A client workspace is only creatable on a paid plan and is paid for by the
    // owner's subscription, so it inherits that plan at creation. Without this it
    // is born with plan = NULL, and the ~16 places that read workspaces.plan
    // directly would treat an Agency customer's client workspace as free — the
    // same drift that left the first paying subscriber on free-tier limits.
    const ownerPlan = await resolveWorkspacePlan(getSupabaseAdmin(), user.id, null)

    // The limit lived only in /workspaces/new, so a direct call to this route
    // could create client workspaces on any plan, free included.
    const { count: clientCount, error: countError } = await getSupabaseAdmin()
      .from('workspaces')
      .select('id', { count: 'exact', head: true })
      .eq('owner_id', user.id)
      .eq('is_personal', false)
    if (countError) {
      console.error('[workspace-create] count failed:', countError.message)
      return NextResponse.json({ error: 'Failed to create workspace' }, { status: 500 })
    }
    const limit = PLAN_CLIENT_WORKSPACES[ownerPlan]
    if ((clientCount ?? 0) >= limit) {
      return NextResponse.json({
        error: limit === 0
          ? 'Client workspaces need a Pro or Agency plan.'
          : `Your plan includes ${limit} client workspace${limit === 1 ? '' : 's'}, and you are using ${limit === 1 ? 'it' : 'all of them'}.`,
        upgrade: ownerPlan === 'agency' ? undefined : 'Upgrade for more client workspaces',
        upgradeHref: '/pricing',
      }, { status: 403 })
    }

    // Use admin client to bypass RLS for workspace creation
    console.log('[WORKSPACE-CREATE] Attempting insert:', { owner_id: user.id, name: name.trim(), is_personal: false })
    const { data, error } = await getSupabaseAdmin()
      .from('workspaces')
      .insert({
        owner_id:          user.id,
        plan:              ownerPlan,
        name:              name.trim(),
        client_name:       clientName?.trim() || name.trim(),
        industry:          industry  || null,
        website:           website   || null,
        notes:             notes     || null,
        default_platforms: defaultPlatforms || [],
        is_personal:       false,
        created_at:        new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error('[workspace-create] Supabase error:', {
        message: error?.message,
        code: error?.code,
        details: error?.details,
        hint: error?.hint,
      })
      return NextResponse.json({ error: 'Failed to create workspace', detail: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, workspace: data })

  } catch (err: any) {
    console.error('[WORKSPACE_CREATE] Unexpected error:', err)
    return NextResponse.json({ error: 'Failed to create workspace', detail: err?.message }, { status: 500 })
  }
}
