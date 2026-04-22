export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { SOMA_COSTS } from '@/lib/soma-costs'

// GET /api/soma/identity — returns the workspace's soma_identity_profiles row (or null)
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

    // Get personal workspace ID
    const { data: workspace, error: wsError } = await supabase
      .from('workspaces')
      .select('id')
      .eq('owner_id', user.id)
      .eq('is_personal', true)
      .single()

    if (wsError || !workspace) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 })
    }

    const { data: profile } = await supabase
      .from('soma_identity_profiles')
      .select('*')
      .eq('workspace_id', workspace.id)
      .maybeSingle()

    return NextResponse.json({ profile: profile ?? null })
  } catch (err) {
    console.error('[SOMA Identity GET]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/soma/identity — create or update the identity profile
// Body: { tone_profile, writing_style_rules, behavioral_traits, voice_examples, interview_completed }
export async function POST(req: NextRequest) {
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
    const { tone_profile, writing_style_rules, behavioral_traits, voice_examples, interview_completed } = body

    // Get personal workspace
    const { data: workspace, error: wsError } = await supabase
      .from('workspaces')
      .select('id, soma_credits_monthly, soma_credits_used, soma_credits_purchased')
      .eq('owner_id', user.id)
      .eq('is_personal', true)
      .single()

    if (wsError || !workspace) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 })
    }

    const admin = getSupabaseAdmin()

    // Check if this is the first time interview_completed is being set to true
    let chargeCredits = false
    if (interview_completed === true) {
      const { data: existing } = await admin
        .from('soma_identity_profiles')
        .select('interview_completed')
        .eq('workspace_id', workspace.id)
        .maybeSingle()

      // Only charge if it wasn't already completed
      if (!existing?.interview_completed) {
        const monthly   = workspace.soma_credits_monthly ?? 0
        const used      = workspace.soma_credits_used ?? 0
        const purchased = workspace.soma_credits_purchased ?? 0
        const remaining = Math.max(0, monthly - used) + purchased
        const cost      = SOMA_COSTS.identity_update

        if (remaining < cost) {
          return NextResponse.json({
            error: `Not enough SOMA credits. Identity update costs ${cost}, you have ${remaining}.`,
            credits_required: cost,
            credits_remaining: remaining,
          }, { status: 402 })
        }
        chargeCredits = true
      }
    }

    // Upsert the identity profile
    const { data: profile, error: upsertError } = await admin
      .from('soma_identity_profiles')
      .upsert(
        {
          workspace_id:        workspace.id,
          user_id:             user.id,
          tone_profile:        tone_profile ?? {},
          writing_style_rules: writing_style_rules ?? {},
          behavioral_traits:   behavioral_traits ?? {},
          voice_examples:      voice_examples ?? [],
          interview_completed: interview_completed ?? false,
          last_updated:        new Date().toISOString(),
        },
        { onConflict: 'workspace_id' }
      )
      .select()
      .single()

    if (upsertError) {
      console.error('[SOMA Identity POST] upsert error:', upsertError)
      return NextResponse.json({ error: 'Failed to save identity profile' }, { status: 500 })
    }

    // Deduct credits if needed
    if (chargeCredits) {
      const cost          = SOMA_COSTS.identity_update
      const monthly       = workspace.soma_credits_monthly ?? 0
      const used          = workspace.soma_credits_used ?? 0
      const purchased     = workspace.soma_credits_purchased ?? 0
      const monthlyLeft   = Math.max(0, monthly - used)

      let newUsed      = used
      let newPurchased = purchased

      if (monthlyLeft >= cost) {
        newUsed = used + cost
      } else {
        newUsed      = monthly
        newPurchased = purchased - (cost - monthlyLeft)
      }

      const newRemaining = Math.max(0, monthly - newUsed) + newPurchased

      await admin
        .from('workspaces')
        .update({ soma_credits_used: newUsed, soma_credits_purchased: newPurchased })
        .eq('id', workspace.id)

      await admin.from('soma_credit_ledger').insert({
        workspace_id:  workspace.id,
        user_id:       user.id,
        action_type:   'identity_update',
        credits_used:  cost,
        balance_after: newRemaining,
        metadata:      { interview_completed: true },
      })
    }

    return NextResponse.json({ profile, credits_charged: chargeCredits ? SOMA_COSTS.identity_update : 0 })
  } catch (err) {
    console.error('[SOMA Identity POST]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
