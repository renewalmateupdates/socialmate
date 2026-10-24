export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { SOMA_MODE_LIMITS, SOMA_PROJECT_LIMITS, capSchedule, effectiveSomaMode, isSomaMode, isSomaPlatform } from '@/lib/soma-mode'
import { resolveWorkspacePlan } from '@/lib/plan'

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

// GET /api/soma/projects — list user's projects
export async function GET() {
  try {
    const user = await getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const admin = getSupabaseAdmin()

    const { data: workspace } = await admin
      .from('workspaces')
      .select('id, plan')
      .eq('owner_id', user.id)
      .eq('is_personal', true)
      .maybeSingle()

    if (!workspace) return NextResponse.json({ error: 'Workspace not found' }, { status: 404 })

    const { data: projects, error } = await admin
      .from('soma_projects')
      .select('id, name, description, platforms, posts_per_day, content_window_days, mode, platform_schedule, paused, auto_collect_enabled, auto_collect_url, runs_this_month, last_generated_at, created_at')
      .eq('workspace_id', workspace.id)
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)

    // What the dashboard shows per project: its latest master doc, and how many
    // posts it has in the next seven days (drafts included). Two batched reads.
    const ids = (projects ?? []).map(p => p.id as string)
    const lastDoc = new Map<string, { version: number; created_at: string }>()
    const upcoming = new Map<string, number>()
    if (ids.length) {
      const now = new Date()
      const [{ data: docs, error: docErr }, { data: soon, error: soonErr }] = await Promise.all([
        admin.from('soma_master_docs')
          .select('project_id, version, created_at')
          .in('project_id', ids)
          .order('version', { ascending: false }),
        admin.from('posts')
          .select('metadata')
          .eq('workspace_id', workspace.id)
          .in('status', ['draft', 'scheduled'])
          .gte('scheduled_at', now.toISOString())
          .lt('scheduled_at', new Date(now.getTime() + 7 * 86_400_000).toISOString())
          .in('metadata->>soma_project_id', ids)
          .limit(5000),
      ])
      if (docErr) console.warn('[SOMA Projects GET] doc lookup failed:', docErr.message)
      if (soonErr) console.warn('[SOMA Projects GET] upcoming posts lookup failed:', soonErr.message)
      for (const d of docs ?? []) {
        if (!lastDoc.has(d.project_id)) lastDoc.set(d.project_id, { version: d.version, created_at: d.created_at })
      }
      for (const p of soon ?? []) {
        const id = (p.metadata as { soma_project_id?: string } | null)?.soma_project_id
        if (id) upcoming.set(id, (upcoming.get(id) ?? 0) + 1)
      }
    }

    const plan = await resolveWorkspacePlan(admin, user.id, workspace.id)
    return NextResponse.json({
      projects: (projects ?? []).map(p => ({
        ...p,
        last_doc:       lastDoc.get(p.id) ?? null,
        upcoming_posts: upcoming.get(p.id) ?? 0,
      })),
      limit: SOMA_PROJECT_LIMITS[plan],
      plan,
    })
  } catch (err) {
    console.error('[SOMA Projects GET]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/soma/projects — create a project
export async function POST(req: NextRequest) {
  try {
    const user = await getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { name, description, platforms, posts_per_day, content_window_days, mode, auto_collect_enabled, auto_collect_url, platform_schedule } = body as {
      name: string
      description?: string
      platforms: string[]
      posts_per_day: number
      content_window_days: number
      mode: 'safe' | 'autopilot' | 'full_send'
      auto_collect_enabled?: boolean
      auto_collect_url?: string
      platform_schedule?: Record<string, { posts_per_day: number; days: number[] }>
    }

    if (!name?.trim()) return NextResponse.json({ error: 'name is required' }, { status: 400 })
    if (!isSomaMode(mode)) return NextResponse.json({ error: 'invalid mode' }, { status: 400 })
    // SOMA writes text. TikTok takes video only, so it is dropped here.
    const somaPlatforms = Array.isArray(platforms) ? platforms.filter(isSomaPlatform) : []
    if (somaPlatforms.length === 0) {
      return NextResponse.json({ error: 'Pick at least one platform SOMA can write for: Bluesky, X, Mastodon, Discord, Telegram or LinkedIn.' }, { status: 400 })
    }

    const admin = getSupabaseAdmin()

    const { data: workspace } = await admin
      .from('workspaces')
      .select('id, plan, soma_autopilot_enabled, soma_full_send_enabled')
      .eq('owner_id', user.id)
      .eq('is_personal', true)
      .maybeSingle()

    if (!workspace) return NextResponse.json({ error: 'Workspace not found' }, { status: 404 })

    // Check project limit
    const limit = SOMA_PROJECT_LIMITS[await resolveWorkspacePlan(admin, user.id, workspace.id)]
    const { count } = await admin
      .from('soma_projects')
      .select('id', { count: 'exact', head: true })
      .eq('workspace_id', workspace.id)

    if ((count ?? 0) >= limit) {
      return NextResponse.json({ error: 'project_limit_reached', limit }, { status: 403 })
    }

    // Only a paid mode may be picked. Full Send needs its own add-on, not just
    // Autopilot's: this route used to check the Autopilot flag for both.
    if (effectiveSomaMode(mode, workspace) !== mode) {
      return NextResponse.json({ error: mode === 'full_send' ? 'full_send_not_enabled' : 'autopilot_not_enabled' }, { status: 403 })
    }

    const limits = SOMA_MODE_LIMITS[mode]
    const cappedWindow = Math.min(Math.max(Number(content_window_days) || 7, 1), limits.windowDays)
    const { schedule: cappedSchedule, postsPerDay: globalPostsPerDay } = capSchedule(
      somaPlatforms, platform_schedule, mode, Number(posts_per_day) || 1,
    )

    const { data: project, error } = await admin
      .from('soma_projects')
      .insert({
        workspace_id:         workspace.id,
        user_id:              user.id,
        name:                 name.trim(),
        description:          description?.trim() ?? null,
        platforms:            somaPlatforms,
        posts_per_day:        globalPostsPerDay,
        content_window_days:  cappedWindow,
        mode,
        auto_collect_enabled: auto_collect_enabled ?? false,
        auto_collect_url:     auto_collect_url?.trim() ?? null,
        platform_schedule:    cappedSchedule,
        runs_this_month:      0,
      })
      .select('id, name, platforms, mode, posts_per_day, content_window_days, platform_schedule')
      .single()

    if (error) throw new Error(error.message)

    return NextResponse.json({ project }, { status: 201 })
  } catch (err) {
    console.error('[SOMA Projects POST]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
