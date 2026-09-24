export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { postLimitFor, postsUsedThisMonth, postLimitReachedBody } from '@/lib/post-limits'
import { resolveWorkspacePlan } from '@/lib/plan'
import { recordFunnel } from '@/lib/usage'
import { handleFirstPostCredits, updateStreak } from '@/lib/post-activation'
import { publishToBluesky, type BlueskyPostRef } from '@/lib/publish/bluesky'
import { publishToMastodon } from '@/lib/publish/mastodon'
import { publishToTwitter } from '@/lib/publish/twitter'

// Real sequential thread publishing -- Post Now only. Thread Builder used to
// submit each part as an independent scheduled post 30 seconds apart via
// /api/posts/create, with no reply-chain linkage on any platform: what shipped
// was N disconnected standalone posts, not a thread. True reply-chaining needs
// part 2 to know part 1's REAL platform post id before it can be sent, which
// only works as a synchronous, sequential loop in one request -- not a fit for
// the independent per-part Inngest scheduler, so scheduling a thread for later
// isn't supported here; only Post Now.
//
// Only Bluesky, Mastodon, and Twitter/X have a real reply-chain concept this
// app can use. Other platforms have no such primitive (Discord/Telegram
// messages aren't threaded the same way; LinkedIn UGC posts don't reply to
// each other) -- the client restricts Thread Mode's platform picker to these
// three for that reason, and this route re-validates it server-side too.
const THREADABLE_PLATFORMS = ['bluesky', 'mastodon', 'twitter']

type ChainState = {
  broken: boolean
  // Bluesky's reply record needs both a fixed root (the thread's first post,
  // unchanged for the rest of the chain) and the immediate parent (the post
  // being replied to, which advances every part) -- using root for both
  // would make every reply point at part 1 instead of the part before it,
  // which is not a linear thread on Bluesky's own reply-chain UI.
  blueskyRoot?:   BlueskyPostRef
  blueskyParent?: BlueskyPostRef
  // Mastodon/Twitter only need the immediate parent's id.
  parentId?: string
}

export async function POST(request: NextRequest) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        },
      },
    }
  )

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { parts, platforms, workspaceId, selectedAccountIds, mediaUrls } = body as {
      parts?: string[]
      platforms?: string[]
      workspaceId?: string | null
      selectedAccountIds?: Record<string, string>
      mediaUrls?: string[]
    }

    const cleanParts = (parts ?? []).map(p => p.trim()).filter(Boolean)
    if (cleanParts.length === 0) return NextResponse.json({ error: 'Thread needs at least one part' }, { status: 400 })

    const threadPlatforms = (platforms ?? []).filter(p => THREADABLE_PLATFORMS.includes(p))
    if (threadPlatforms.length === 0) {
      return NextResponse.json({
        error: 'Threads only work on Bluesky, Mastodon, and X — pick at least one.',
      }, { status: 400 })
    }

    // Resolve workspace using admin client to bypass RLS -- same pattern as
    // /api/posts/create.
    let resolvedWorkspaceId = workspaceId || null
    if (!resolvedWorkspaceId) {
      const adminSupabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )
      const { data: personalWs } = await adminSupabase
        .from('workspaces')
        .select('id')
        .eq('owner_id', user.id)
        .eq('is_personal', true)
        .single()

      if (personalWs) {
        resolvedWorkspaceId = personalWs.id
      } else {
        const { data: newWs, error: wsError } = await adminSupabase
          .from('workspaces')
          .insert({
            owner_id:    user.id,
            name:        'Personal',
            is_personal: true,
            plan:        await resolveWorkspacePlan(adminSupabase, user.id, null),
          })
          .select('id')
          .single()
        if (wsError) {
          console.error('Failed to create personal workspace:', wsError)
          return NextResponse.json({ error: 'Failed to initialize workspace', detail: wsError.message }, { status: 500 })
        }
        resolvedWorkspaceId = newWs?.id || null
      }
    }
    if (!resolvedWorkspaceId) {
      return NextResponse.json({ error: 'No workspace found. Please contact support.' }, { status: 400 })
    }

    const { data: wsInfo } = await getSupabaseAdmin()
      .from('workspaces')
      .select('is_personal, owner_id')
      .eq('id', resolvedWorkspaceId)
      .maybeSingle()
    const accountWorkspaceId: string | null = wsInfo?.is_personal ? null : resolvedWorkspaceId

    // Same approval-workflow + workspace-access check as /api/posts/create
    // (PR #667) -- a thread publishes immediately just like Post Now, so an
    // Editor/Client role must not be able to bypass approval by hitting this
    // route directly either.
    if (wsInfo?.owner_id && wsInfo.owner_id !== user.id) {
      const { data: membership } = await getSupabaseAdmin()
        .from('team_members')
        .select('role')
        .eq('email', user.email!)
        .eq('owner_id', wsInfo.owner_id)
        .eq('status', 'active')
        .maybeSingle()
      if (!membership) {
        return NextResponse.json({ error: "You don't have access to this workspace." }, { status: 403 })
      }
      if (membership.role === 'editor' || membership.role === 'client') {
        return NextResponse.json({
          error: 'Your role requires posts to be submitted for approval, not published directly. Threads always publish immediately, so this role cannot post one.',
          requiresApproval: true,
        }, { status: 403 })
      }
    }

    const plan = await resolveWorkspacePlan(getSupabaseAdmin(), user.id, resolvedWorkspaceId)

    // Whole thread, all-or-nothing on quota: check upfront that every part
    // fits, rather than letting the old per-part independent-insert approach
    // publish a few parts and then fail partway through on quota.
    const used = await postsUsedThisMonth(supabase, user.id)
    if (used + cleanParts.length > postLimitFor(plan)) {
      return NextResponse.json(postLimitReachedBody(plan), { status: 403 })
    }

    const chains: Record<string, ChainState> = {}
    for (const p of threadPlatforms) chains[p] = { broken: false }

    const partRows: Array<{ id: string; status: string }> = []
    let anyPublished = false

    for (let i = 0; i < cleanParts.length; i++) {
      const content = cleanParts[i]
      const platformPostIds: Record<string, string> = {}
      const platformErrors: Record<string, string> = {}

      for (const platform of threadPlatforms) {
        const chain = chains[platform]
        if (chain.broken) continue

        try {
          if (platform === 'bluesky') {
            const ref = await publishToBluesky(
              user.id, content, accountWorkspaceId, selectedAccountIds?.['bluesky'],
              i === 0 ? mediaUrls : undefined,
              chain.blueskyParent ? { root: chain.blueskyRoot!, parent: chain.blueskyParent } : undefined,
            )
            if (!chain.blueskyRoot) chain.blueskyRoot = ref
            chain.blueskyParent = ref
            platformPostIds.bluesky = ref.uri
          } else if (platform === 'mastodon') {
            const id = await publishToMastodon(
              user.id, content, accountWorkspaceId, selectedAccountIds?.['mastodon'],
              i === 0 ? mediaUrls : undefined,
              chain.parentId,
            )
            chain.parentId = id
            platformPostIds.mastodon = id
          } else if (platform === 'twitter') {
            const id = await publishToTwitter(
              user.id, content, accountWorkspaceId, selectedAccountIds?.['twitter'],
              i === 0 ? mediaUrls : undefined,
              chain.parentId,
            )
            chain.parentId = id
            platformPostIds.twitter = id
          }
        } catch (err) {
          chain.broken = true
          platformErrors[platform] = err instanceof Error ? err.message : 'Failed'
        }
      }

      const succeededCount = Object.keys(platformPostIds).length
      const status = succeededCount === 0 ? 'failed' : succeededCount === threadPlatforms.length ? 'published' : 'partial'
      if (succeededCount > 0) anyPublished = true

      const { data: row } = await getSupabaseAdmin()
        .from('posts')
        .insert({
          user_id:            user.id,
          workspace_id:       resolvedWorkspaceId,
          content,
          platforms:          threadPlatforms,
          status,
          published_at:       succeededCount > 0 ? new Date().toISOString() : null,
          platform_post_ids:  succeededCount > 0 ? platformPostIds : undefined,
          platform_errors:    Object.keys(platformErrors).length > 0 ? platformErrors : undefined,
          thread_index:       i,
          thread_length:      cleanParts.length,
        })
        .select('id, status')
        .single()

      if (row) partRows.push(row)
    }

    if (anyPublished) {
      recordFunnel(getSupabaseAdmin(), user.id, 'post_published', {
        platforms: threadPlatforms.join(','),
        count:     threadPlatforms.length,
        source:    'thread',
      })
      await handleFirstPostCredits(user.id)
      await updateStreak(user.id)
    }

    const allFailed = partRows.every(r => r.status === 'failed')
    return NextResponse.json({
      success: !allFailed,
      parts:   partRows,
      chains:  Object.fromEntries(threadPlatforms.map(p => [p, { broke: chains[p].broken }])),
    }, { status: allFailed ? 502 : 200 })
  } catch (err) {
    console.error('[create-thread] Unexpected error:', err)
    return NextResponse.json({ error: 'Failed to publish thread' }, { status: 500 })
  }
}
