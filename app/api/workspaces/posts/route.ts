export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import type { SupabaseClient, User } from '@supabase/supabase-js'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { canManagePost, managesTeamPosts, realWorkspaceId, resolveWorkspaceAccess, type TeamRole } from '@/lib/team-workspaces'

/**
 * /api/workspaces/posts — the posts in a workspace, whoever wrote them.
 *
 * Queue, Calendar and Drafts used to read posts from the browser with
 * `user_id = me`. A team member's posts publish to the owner's accounts
 * (#767), but the owner never saw them: not in the queue, not on the calendar,
 * and RLS stopped her from moving, cancelling or deleting them. Reported
 * 1 Nov 2026 by a free-plan owner whose assistant schedules for her.
 *
 *   GET    ?workspaceId=&view=queue|partial|failed|calendar|drafts|draft-count|one&id=
 *   PATCH  { ids, action: 'unschedule' } | { ids: [id], action: 'edit', content, platforms }
 *   DELETE { ids }
 *
 * Writes go through canManagePost: the author, or the workspace owner/admin.
 */

async function currentUser(): Promise<User | null> {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } },
  )
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

type Scope = { filter: string; role: TeamRole; ownerId: string }

/**
 * Which posts a workspace holds, as a PostgREST or() filter.
 * Personal workspace: everything its owner wrote (as before) plus what their
 * team wrote in it. Client workspace: everything written in it.
 */
async function scopeFor(admin: SupabaseClient, user: User, requested: string | null): Promise<Scope | null> {
  if (requested) {
    const access = await resolveWorkspaceAccess(admin, user, requested)
    if (!access) return null
    return access.isPersonal
      ? { filter: `user_id.eq.${access.ownerId},workspace_id.eq.${access.workspaceId}`, role: access.role, ownerId: access.ownerId }
      : { filter: `workspace_id.eq.${access.workspaceId}`, role: access.role, ownerId: access.ownerId }
  }
  // No workspace selected yet: the caller's own personal workspace.
  const { data: ws, error } = await admin
    .from('workspaces')
    .select('id')
    .eq('owner_id', user.id)
    .eq('is_personal', true)
    .maybeSingle()
  if (error) console.warn('[workspaces/posts] personal workspace lookup failed:', error.message)
  return {
    filter: ws ? `user_id.eq.${user.id},workspace_id.eq.${ws.id}` : `user_id.eq.${user.id}`,
    role: 'owner',
    ownerId: user.id,
  }
}

export async function GET(request: NextRequest) {
  const user = await currentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = getSupabaseAdmin()
  const params = request.nextUrl.searchParams
  const scope = await scopeFor(admin, user, realWorkspaceId(params.get('workspaceId')))
  if (!scope) return NextResponse.json({ error: "You don't have access to this workspace." }, { status: 403 })

  const view = params.get('view') ?? 'calendar'
  const base = () => admin.from('posts').select('*').or(scope.filter)

  if (view === 'draft-count') {
    const { count, error } = await admin
      .from('posts')
      .select('id', { count: 'exact', head: true })
      .or(scope.filter)
      .eq('status', 'draft')
    if (error) console.warn('[workspaces/posts] draft count failed:', error.message)
    return NextResponse.json({ count: count ?? 0 })
  }

  let query
  switch (view) {
    case 'queue':
      query = base().eq('status', 'scheduled').gte('scheduled_at', new Date().toISOString()).order('scheduled_at', { ascending: true }).limit(1000)
      break
    case 'partial': {
      const since = new Date(Date.now() - 30 * 86_400_000).toISOString()
      query = base().eq('status', 'partial').gte('created_at', since).order('published_at', { ascending: false }).limit(10)
      break
    }
    case 'failed': {
      // Queue shows these in red with a Retry button. Before, a failed post
      // simply left the Queue and was only findable in Drafts or the Calendar.
      const since = new Date(Date.now() - 30 * 86_400_000).toISOString()
      query = base().eq('status', 'failed').gte('created_at', since).order('created_at', { ascending: false }).limit(20)
      break
    }
    case 'drafts':
      query = base().in('status', ['draft', 'scheduled', 'published', 'partial', 'failed']).order('created_at', { ascending: false }).limit(1000)
      break
    case 'one': {
      const id = params.get('id')
      if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
      query = base().eq('id', id).limit(1)
      break
    }
    default:
      // Calendar: no date filter. SOMA posts can have no created_at, and a
      // range filter silently dropped them (see CLAUDE.md, May 16–17).
      query = base().order('scheduled_at', { ascending: false, nullsFirst: false }).limit(1000)
  }

  const { data, error } = await query
  if (error) {
    console.error(`[workspaces/posts] ${view} query failed:`, error.message)
    return NextResponse.json({ error: 'Could not load posts' }, { status: 500 })
  }

  // Tell the UI which posts the viewer wrote and which they may manage.
  const canManageOthers = managesTeamPosts(scope.role)
  const posts = (data ?? []).map((p) => ({
    ...p,
    mine: p.user_id === user.id,
    can_manage: p.user_id === user.id || canManageOthers,
  }))
  return NextResponse.json({ posts, role: scope.role })
}

async function manageable(admin: SupabaseClient, user: User, ids: string[]) {
  const { data, error } = await admin.from('posts').select('id, user_id, workspace_id, status').in('id', ids)
  if (error) {
    console.error('[workspaces/posts] lookup failed:', error.message)
    return null
  }
  const allowed: { id: string; status: string }[] = []
  // A handful of workspaces at most; resolve each post (resolveWorkspaceAccess is two small reads).
  for (const p of data ?? []) {
    if (await canManagePost(admin, user, p)) allowed.push({ id: p.id, status: p.status })
  }
  return allowed
}

function idsFrom(body: unknown): string[] {
  const ids = (body as { ids?: unknown })?.ids
  return Array.isArray(ids) ? ids.filter((x): x is string => typeof x === 'string').slice(0, 500) : []
}

export async function PATCH(request: NextRequest) {
  const user = await currentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json().catch(() => null)
  const ids = idsFrom(body)
  const action = (body as { action?: string })?.action
  if (!ids.length || !['unschedule', 'edit'].includes(action ?? '')) {
    return NextResponse.json({ error: 'ids and a valid action are required' }, { status: 400 })
  }

  const admin = getSupabaseAdmin()
  const allowed = await manageable(admin, user, ids)
  if (!allowed) return NextResponse.json({ error: 'Lookup failed' }, { status: 500 })
  if (!allowed.length) return NextResponse.json({ error: 'You can’t change these posts.' }, { status: 403 })

  let update: Record<string, unknown>
  if (action === 'unschedule') {
    update = { status: 'draft', scheduled_at: null }
  } else {
    const { content, platforms } = body as { content?: unknown; platforms?: unknown }
    if (typeof content !== 'string' || !content.trim()) return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    update = { content, updated_at: new Date().toISOString() }
    if (Array.isArray(platforms)) update.platforms = platforms.filter((p) => typeof p === 'string')
  }

  const targetIds = action === 'edit' ? allowed.slice(0, 1).map((p) => p.id) : allowed.map((p) => p.id)
  const { error } = await admin.from('posts').update(update).in('id', targetIds)
  if (error) {
    console.error('[workspaces/posts] update failed:', error.message)
    return NextResponse.json({ error: 'Could not update posts' }, { status: 500 })
  }
  return NextResponse.json({ updated: targetIds, skipped: ids.length - targetIds.length })
}

export async function DELETE(request: NextRequest) {
  const user = await currentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const ids = idsFrom(await request.json().catch(() => null))
  if (!ids.length) return NextResponse.json({ error: 'ids are required' }, { status: 400 })

  const admin = getSupabaseAdmin()
  const allowed = await manageable(admin, user, ids)
  if (!allowed) return NextResponse.json({ error: 'Lookup failed' }, { status: 500 })
  if (!allowed.length) return NextResponse.json({ error: 'You can’t delete these posts.' }, { status: 403 })

  const targetIds = allowed.map((p) => p.id)
  const { error } = await admin.from('posts').delete().in('id', targetIds)
  if (error) {
    console.error('[workspaces/posts] delete failed:', error.message)
    return NextResponse.json({ error: 'Could not delete posts' }, { status: 500 })
  }
  return NextResponse.json({ deleted: targetIds, skipped: ids.length - targetIds.length })
}
