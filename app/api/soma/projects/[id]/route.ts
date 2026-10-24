export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { SOMA_MODE_LIMITS, capSchedule, effectiveSomaMode, isSomaMode, isSomaPlatform, type PlatformSchedule } from '@/lib/soma-mode'

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

// GET /api/soma/projects/[id]
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { id } = await params
    const admin = getSupabaseAdmin()

    const { data: project, error } = await admin
      .from('soma_projects')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error || !project) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // Fetch workspace to get Full Send enabled flag
    const { data: workspace } = await admin
      .from('workspaces')
      .select('soma_full_send_enabled')
      .eq('id', project.workspace_id)
      .maybeSingle()

    const fullSendEnabled = workspace?.soma_full_send_enabled ?? false

    // Fetch last 2 master docs for diff display
    const { data: docs } = await admin
      .from('soma_master_docs')
      .select('id, version, filename, input_method, created_at, content')
      .eq('project_id', id)
      .order('version', { ascending: false })
      .limit(2)

    return NextResponse.json({ project: { ...project, full_send_enabled: fullSendEnabled }, docs: docs ?? [] })
  } catch (err) {
    console.error('[SOMA Project GET]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/soma/projects/[id] — update settings
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { id } = await params
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>
    const admin = getSupabaseAdmin()

    // This used to write the request body straight into the row, so anyone
    // could switch a project to Full Send, lift its posts-per-day cap or reset
    // runs_this_month from the browser. Only these fields are editable, and
    // mode and schedule go through the same paid-mode rule and caps as create.
    const { data: project, error: projectError } = await admin
      .from('soma_projects')
      .select('id, workspace_id, platforms, mode, platform_schedule, posts_per_day, content_window_days')
      .eq('id', id)
      .eq('user_id', user.id)
      .maybeSingle()
    if (projectError) console.warn('[SOMA Project PATCH] project read failed:', projectError.message)
    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 })

    const { data: workspace, error: wsError } = await admin
      .from('workspaces')
      .select('soma_autopilot_enabled, soma_full_send_enabled')
      .eq('id', project.workspace_id)
      .maybeSingle()
    if (wsError) console.warn('[SOMA Project PATCH] workspace read failed:', wsError.message)

    const update: Record<string, unknown> = { updated_at: new Date().toISOString() }

    if ('mode' in body) {
      if (!isSomaMode(body.mode)) return NextResponse.json({ error: 'invalid mode' }, { status: 400 })
      if (effectiveSomaMode(body.mode, workspace) !== body.mode) {
        return NextResponse.json({ error: body.mode === 'full_send' ? 'full_send_not_enabled' : 'autopilot_not_enabled' }, { status: 403 })
      }
      update.mode = body.mode
    }
    const mode = isSomaMode(update.mode) ? update.mode : effectiveSomaMode(project.mode, workspace)

    if ('platforms' in body || 'platform_schedule' in body || 'mode' in body) {
      const platforms = Array.isArray(body.platforms)
        ? (body.platforms as unknown[]).filter((p): p is string => typeof p === 'string' && isSomaPlatform(p))
        : ((project.platforms ?? []) as string[]).filter(isSomaPlatform)
      if (platforms.length === 0) {
        return NextResponse.json({ error: 'Pick at least one platform SOMA can write for: Bluesky, X, Mastodon, Discord, Telegram or LinkedIn.' }, { status: 400 })
      }
      const incoming = (body.platform_schedule ?? project.platform_schedule) as PlatformSchedule | null
      const capped = capSchedule(platforms, incoming, mode, project.posts_per_day ?? 1)
      update.platforms = platforms
      update.platform_schedule = capped.schedule
      update.posts_per_day = capped.postsPerDay
      update.content_window_days = Math.min(project.content_window_days ?? 7, SOMA_MODE_LIMITS[mode].windowDays)
    }

    if ('paused' in body) update.paused = body.paused === true
    if ('include_media' in body) update.include_media = body.include_media === true
    if ('include_video_url' in body) {
      const url = typeof body.include_video_url === 'string' ? body.include_video_url.trim() : ''
      if (url && !/^https?:\/\/\S+$/i.test(url)) return NextResponse.json({ error: 'The video link must start with http:// or https://' }, { status: 400 })
      update.include_video_url = url ? url.slice(0, 500) : null
    }
    if ('campaign_theme' in body) {
      const theme = typeof body.campaign_theme === 'string' ? body.campaign_theme.trim().slice(0, 300) : ''
      update.campaign_theme = theme || null
    }
    for (const key of ['campaign_start', 'campaign_end'] as const) {
      if (key in body) {
        const v = typeof body[key] === 'string' ? (body[key] as string) : ''
        update[key] = /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : null
      }
    }
    if ('name' in body && typeof body.name === 'string' && body.name.trim()) update.name = body.name.trim().slice(0, 120)
    if ('description' in body) update.description = typeof body.description === 'string' ? body.description.trim().slice(0, 1000) || null : null

    const { data, error } = await admin
      .from('soma_projects')
      .update(update)
      .eq('id', id)
      .eq('user_id', user.id)
      .select('id')
      .single()

    if (error) console.warn('[SOMA Project PATCH] update failed:', error.message)
    if (error || !data) return NextResponse.json({ error: 'Update failed' }, { status: 400 })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[SOMA Project PATCH]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/soma/projects/[id]
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { id } = await params
    const admin = getSupabaseAdmin()

    const { error } = await admin
      .from('soma_projects')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) return NextResponse.json({ error: 'Delete failed' }, { status: 400 })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[SOMA Project DELETE]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
