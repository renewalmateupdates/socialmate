export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

const PLAN_PROJECT_LIMITS: Record<string, number> = {
  free:          0,
  pro:           1,
  pro_annual:    1,
  agency:        10,
  agency_annual: 10,
}

function planProjectLimit(plan: string | null): number {
  return PLAN_PROJECT_LIMITS[plan ?? 'free'] ?? 0
}

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
      .select('id, name, description, platforms, posts_per_day, content_window_days, mode, auto_collect_enabled, auto_collect_url, runs_this_month, last_generated_at, created_at')
      .eq('workspace_id', workspace.id)
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)

    return NextResponse.json({
      projects: projects ?? [],
      limit: planProjectLimit(workspace.plan),
      plan: workspace.plan,
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
    if (!Array.isArray(platforms) || platforms.length === 0) return NextResponse.json({ error: 'platforms must be a non-empty array' }, { status: 400 })
    if (!['safe', 'autopilot', 'full_send'].includes(mode)) return NextResponse.json({ error: 'invalid mode' }, { status: 400 })

    const admin = getSupabaseAdmin()

    const { data: workspace } = await admin
      .from('workspaces')
      .select('id, plan, soma_autopilot_enabled')
      .eq('owner_id', user.id)
      .eq('is_personal', true)
      .maybeSingle()

    if (!workspace) return NextResponse.json({ error: 'Workspace not found' }, { status: 404 })

    // Check project limit
    const limit = planProjectLimit(workspace.plan)
    const { count } = await admin
      .from('soma_projects')
      .select('id', { count: 'exact', head: true })
      .eq('workspace_id', workspace.id)

    if ((count ?? 0) >= limit) {
      return NextResponse.json({ error: 'project_limit_reached', limit }, { status: 403 })
    }

    // Gate autopilot/full_send on subscription
    if ((mode === 'autopilot' || mode === 'full_send') && !workspace.soma_autopilot_enabled) {
      return NextResponse.json({ error: 'autopilot_not_enabled' }, { status: 403 })
    }

    // Cap posts_per_day to tier max
    const maxPostsPerDay = mode === 'full_send' ? 10 : mode === 'autopilot' ? 5 : 2
    const cappedWindow = mode === 'safe' ? Math.min(content_window_days ?? 7, 7) : Math.min(content_window_days ?? 14, 14)

    // Build capped platform_schedule; derive global posts_per_day from max across platforms
    let cappedSchedule: Record<string, { posts_per_day: number; days: number[] }> | null = null
    let globalPostsPerDay = Math.min(posts_per_day ?? 2, maxPostsPerDay)

    if (platform_schedule && Object.keys(platform_schedule).length > 0) {
      cappedSchedule = {}
      let maxAcrossPlatforms = 0
      for (const [platform, cfg] of Object.entries(platform_schedule)) {
        const capped = Math.min(Math.max(cfg.posts_per_day ?? 1, 1), maxPostsPerDay)
        const days = Array.isArray(cfg.days) && cfg.days.length > 0 ? cfg.days : [0,1,2,3,4,5,6]
        cappedSchedule[platform] = { posts_per_day: capped, days }
        if (capped > maxAcrossPlatforms) maxAcrossPlatforms = capped
      }
      globalPostsPerDay = maxAcrossPlatforms
    }

    const { data: project, error } = await admin
      .from('soma_projects')
      .insert({
        workspace_id:         workspace.id,
        user_id:              user.id,
        name:                 name.trim(),
        description:          description?.trim() ?? null,
        platforms,
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
