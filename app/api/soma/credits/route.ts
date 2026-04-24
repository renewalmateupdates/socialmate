export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { SOMA_COSTS } from '@/lib/soma-costs'

export { SOMA_COSTS }

// GET /api/soma/credits — returns current SOMA credit state for user's personal workspace
export async function GET() {
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

    const { data: workspace, error } = await supabase
      .from('workspaces')
      .select('id, plan, soma_credits_monthly, soma_credits_used, soma_credits_purchased, soma_mode, soma_autopilot_enabled')
      .eq('owner_id', user.id)
      .eq('is_personal', true)
      .single()

    if (error || !workspace) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 })
    }

    // Auto-provision SOMA credits if Pro/Agency workspace has never had them set
    const SOMA_MONTHLY: Record<string, number> = { pro: 500, pro_annual: 500, agency: 2000, agency_annual: 2000 }
    let monthly = workspace.soma_credits_monthly ?? 0
    const plan = workspace.plan ?? 'free'

    if (monthly === 0 && SOMA_MONTHLY[plan]) {
      const admin = getSupabaseAdmin()
      monthly = SOMA_MONTHLY[plan]
      await admin.from('workspaces').update({ soma_credits_monthly: monthly }).eq('id', workspace.id)
    }

    const used      = workspace.soma_credits_used ?? 0
    const purchased = workspace.soma_credits_purchased ?? 0
    const remaining = Math.max(0, monthly - used) + purchased

    return NextResponse.json({
      monthly,
      used,
      purchased,
      remaining,
      plan,
      mode:              workspace.soma_mode ?? 'safe',
      autopilot_enabled: workspace.soma_autopilot_enabled ?? false,
    })
  } catch (err) {
    console.error('[SOMA Credits GET]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/soma/credits — deduct credits (internal use)
// Body: { action_type: string, credits_used: number, metadata?: object }
export async function PATCH(req: NextRequest) {
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

    const body = await req.json()
    const { action_type, credits_used, metadata } = body

    if (!action_type || typeof credits_used !== 'number' || credits_used <= 0) {
      return NextResponse.json({ error: 'Missing or invalid action_type / credits_used' }, { status: 400 })
    }

    // Get current workspace state
    const { data: workspace, error: wsError } = await supabase
      .from('workspaces')
      .select('id, soma_credits_monthly, soma_credits_used, soma_credits_purchased')
      .eq('owner_id', user.id)
      .eq('is_personal', true)
      .single()

    if (wsError || !workspace) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 })
    }

    const monthly   = workspace.soma_credits_monthly ?? 0
    const used      = workspace.soma_credits_used ?? 0
    const purchased = workspace.soma_credits_purchased ?? 0
    const remaining = Math.max(0, monthly - used) + purchased

    if (remaining < credits_used) {
      return NextResponse.json({
        error: `Not enough SOMA credits. Need ${credits_used}, have ${remaining}.`,
        credits_required: credits_used,
        credits_remaining: remaining,
      }, { status: 402 })
    }

    const admin = getSupabaseAdmin()

    // Deduct first from monthly pool, then purchased
    const monthlyAvailable = Math.max(0, monthly - used)
    let newUsed      = used
    let newPurchased = purchased

    if (monthlyAvailable >= credits_used) {
      newUsed = used + credits_used
    } else {
      // Use all remaining monthly, rest from purchased
      newUsed = monthly
      newPurchased = purchased - (credits_used - monthlyAvailable)
    }

    const newRemaining = Math.max(0, monthly - newUsed) + newPurchased

    // Update workspace
    const { error: updateError } = await admin
      .from('workspaces')
      .update({ soma_credits_used: newUsed, soma_credits_purchased: newPurchased })
      .eq('id', workspace.id)

    if (updateError) {
      return NextResponse.json({ error: 'Failed to deduct credits' }, { status: 500 })
    }

    // Insert ledger entry
    await admin.from('soma_credit_ledger').insert({
      workspace_id: workspace.id,
      user_id:      user.id,
      action_type,
      credits_used,
      balance_after: newRemaining,
      metadata: metadata ?? {},
    })

    return NextResponse.json({
      success:     true,
      credits_used,
      balance_after: newRemaining,
    })
  } catch (err) {
    console.error('[SOMA Credits PATCH]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
