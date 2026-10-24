export const dynamic = 'force-dynamic'
// 60 is the Hobby ceiling. Generation stops starting new Gemini calls at 35s
// (lib/soma-generate.ts) so the saves and the response fit inside it; whatever
// it did not reach stays open for the next run.
export const maxDuration = 60
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { inngest } from '@/lib/inngest'
import { sendMail } from '@/lib/mail'
import { runCapForMode, runCapReached } from '@/lib/soma-runs'
import { effectiveSomaMode } from '@/lib/soma-mode'
import { GENERATE_COST, SomaRunError, runSomaGeneration, type SomaInsights } from '@/lib/soma-generate'

async function getUser() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cs) => cs.forEach(({ name, value, options }) => cookieStore.set(name, value, options)),
      },
    }
  )
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// POST /api/soma/projects/[id]/generate
// Fills the project's open slots from the ingestion the user just ran. The
// generation itself lives in lib/soma-generate.ts, shared with the Monday run
// and Full Send's daily run.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { id: projectId } = await params

    const { ingestion_id, start_date } = await req.json() as { ingestion_id: string; start_date?: string }
    if (!ingestion_id) return NextResponse.json({ error: 'ingestion_id is required' }, { status: 400 })

    const admin = getSupabaseAdmin()
    // Prefer GEMINI_API_KEY (the key the rest of the app uses and known good);
    // GOOGLE_AI_API_KEY is only a fallback.
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY
    if (!apiKey) return NextResponse.json({ error: 'AI service not configured' }, { status: 500 })

    const { data: project, error: projectErr } = await admin
      .from('soma_projects')
      .select('*')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .maybeSingle()
    if (projectErr) console.error('[SOMA Generate] project lookup failed:', projectErr.message)
    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 })

    const { data: workspace, error: wsErr } = await admin
      .from('workspaces')
      .select('id, soma_credits_monthly, soma_credits_used, soma_credits_purchased, soma_autopilot_enabled, soma_full_send_enabled')
      .eq('id', project.workspace_id)
      .maybeSingle()
    if (wsErr) console.error('[SOMA Generate] workspace lookup failed:', wsErr.message)
    if (!workspace) return NextResponse.json({ error: 'Workspace not found' }, { status: 404 })

    // The mode the workspace pays for right now, not the one saved on the
    // project. A cancelled add-on falls back to Safe.
    const mode = effectiveSomaMode(project.mode, workspace)
    const remaining = Math.max(0, (workspace.soma_credits_monthly ?? 0) - (workspace.soma_credits_used ?? 0)) + (workspace.soma_credits_purchased ?? 0)
    if (remaining < GENERATE_COST) return NextResponse.json({ error: 'insufficient_soma_credits' }, { status: 402 })

    const runCap = runCapForMode(mode)
    if (runCapReached(project, runCap)) {
      return NextResponse.json({ error: 'monthly_run_cap_reached', cap: runCap }, { status: 429 })
    }

    const { data: ingestion, error: ingErr } = await admin
      .from('soma_weekly_ingestion')
      .select('id, extracted_insights')
      .eq('id', ingestion_id)
      .eq('user_id', user.id)
      .maybeSingle()
    if (ingErr) console.error('[SOMA Generate] ingestion lookup failed:', ingErr.message)
    if (!ingestion) return NextResponse.json({ error: 'Ingestion not found' }, { status: 404 })

    let result
    try {
      result = await runSomaGeneration({
        admin,
        project,
        workspace,
        trigger:     'manual',
        insights:    (ingestion.extracted_insights ?? null) as SomaInsights | null,
        ingestionId: ingestion.id,
        actorUserId: user.id,
        startDate:   start_date ?? null,
        apiKey,
        enqueue: async (posts) => {
          await inngest.send(posts.map(p => ({ name: 'post/scheduled', data: p })))
        },
      })
    } catch (err) {
      if (err instanceof SomaRunError) {
        console.error(`[SOMA Generate] ${err.code} for project ${projectId}:`, err.message)
        return NextResponse.json({
          error: err.code === 'generation_failed'
            ? 'SOMA could not write posts right now. Nothing was charged. Try again in a few minutes.'
            : 'SOMA could not check what is already scheduled, so it did not generate. Nothing was charged. Try again in a minute.',
        }, { status: 502 })
      }
      throw err
    }

    if (result.openSlots === 0) {
      return NextResponse.json({
        success: true,
        nothing_to_fill: true,
        posts_created: 0,
        post_ids: [],
        mode: result.mode,
        window_days: result.windowDays,
        charged: 0,
      })
    }

    if (user.email && process.env.RESEND_API_KEY) {
      try {
        const automated = result.mode !== 'safe'
        await sendMail({
          from:    'SOMA <soma@socialmate.studio>',
          to:      user.email,
          subject: automated
            ? `SOMA scheduled ${result.postsCreated} posts across ${Object.keys(result.platformCounts).join(', ')}`
            : 'Your SOMA drafts are ready to review',
          html: `<p style="font-family:sans-serif;color:#e5e7eb;background:#0f0f0f;padding:32px;border-radius:8px;">
            <strong style="color:#f59e0b;font-size:18px;">SOMA</strong><br/><br/>
            ${automated
              ? `<strong>${result.postsCreated} posts scheduled</strong> across <strong>${Object.keys(result.platformCounts).join(', ')}</strong> for the next ${result.windowDays} days.`
              : `<strong>${result.postsCreated} drafts</strong> are ready for your review.`}
            <br/><br/>
            <a href="https://socialmate.studio/${automated ? 'queue' : 'soma/dashboard'}"
               style="background:#f59e0b;color:#000;font-weight:700;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;margin-top:8px;">
              ${automated ? 'View schedule' : 'Review drafts'}
            </a>
          </p>`,
        })
      } catch (emailErr) {
        console.error('[SOMA Generate] email failed (non-fatal):', emailErr)
      }
    }

    return NextResponse.json({
      success:         true,
      posts_created:   result.postsCreated,
      post_ids:        result.postIds,
      mode:            result.mode,
      window_days:     result.windowDays,
      open_slots:      result.openSlots,
      unfilled:        result.unfilled,
      charged:         result.charged,
      platform_counts: result.platformCounts,
      platform_errors: Object.keys(result.platformErrors).length > 0 ? result.platformErrors : undefined,
    })
  } catch (err) {
    console.error('[SOMA Project Generate POST]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
