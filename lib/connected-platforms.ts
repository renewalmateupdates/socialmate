import type { SupabaseClient } from '@supabase/supabase-js'
import type { AccountScope } from '@/lib/team-workspaces'

/**
 * Can this post actually go out? One answer for every place that asks.
 *
 * Compose let people pick a platform they had never connected and press
 * Schedule. The post saved, the Queue and the Dashboard called it Scheduled,
 * the streak counted it, and it failed at its time with "No Bluesky account
 * connected". An outside tester walked into exactly that on Nov 21, 2026, and
 * /admin/failure-log showed both of his posts failing that way.
 *
 * A platform counts as connected when the account owner has a
 * connected_accounts row for it in the post's account scope, or a Discord or
 * Telegram destination there (those connect through post_destinations). The
 * scope is lib/team-workspaces.ts's: the owner's rows, workspace_id null for a
 * personal workspace and the workspace id otherwise.
 *
 * The pure functions below are shared by /api/posts/create, the thread route,
 * Compose and the Dashboard. scripts/test-connected-platforms.mjs covers them.
 */

// Platform ids as posts store them, and the name people know.
const NAMES: Record<string, string> = {
  twitter:   'X',
  bluesky:   'Bluesky',
  mastodon:  'Mastodon',
  discord:   'Discord',
  telegram:  'Telegram',
  linkedin:  'LinkedIn',
  tiktok:    'TikTok',
  instagram: 'Instagram',
  facebook:  'Facebook',
  threads:   'Threads',
  youtube:   'YouTube',
  pinterest: 'Pinterest',
}

export function platformDisplayName(id: string): string {
  return NAMES[id] ?? (id ? id.charAt(0).toUpperCase() + id.slice(1) : id)
}

/** "Bluesky", "Bluesky and X", "Bluesky, Mastodon and X". */
export function listPlatformNames(ids: string[]): string {
  const names = ids.map(platformDisplayName)
  if (names.length <= 1) return names.join('')
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`
}

/** The selected platforms that have no connection, in the order they were picked. */
export function missingConnections(selected: string[], connected: Set<string> | string[]): string[] {
  const has = connected instanceof Set ? connected : new Set(connected)
  return (selected ?? []).filter(p => !has.has(p))
}

/** What the API says when a post names a platform nothing is connected to. */
export function notConnectedMessage(missing: string[]): string {
  const one = missing.length === 1
  return `No ${listPlatformNames(missing)} account connected, so this can't go out. ` +
    `Connect ${one ? 'it' : 'them'} in Accounts, or untick ${one ? 'it' : 'them'}.`
}

export type ConnectionRow = { platform: string; workspace_id: string | null }

/** Platforms connected in one account scope (null = a personal workspace). */
export function connectedInScope(rows: ConnectionRow[], accountWorkspaceId: string | null): Set<string> {
  const out = new Set<string>()
  for (const r of rows ?? []) {
    if ((r.workspace_id ?? null) === (accountWorkspaceId ?? null)) out.add(r.platform)
  }
  return out
}

export type ScopeWorkspace = { id: string; is_personal: boolean }

/**
 * The platforms a saved post names that nothing is connected to, in the scope
 * it will post from. [] when it can go out, and also when we can't tell: a
 * post in a workspace this person doesn't own posts from the owner's accounts,
 * which they can't read, so it is never flagged from here.
 */
export function unconnectedForPost(
  post: { platforms?: string[] | null; workspace_id?: string | null },
  rows: ConnectionRow[],
  ownedWorkspaces: ScopeWorkspace[],
): string[] {
  const ws = post.workspace_id ? ownedWorkspaces.find(w => w.id === post.workspace_id) : undefined
  if (post.workspace_id && !ws) return []
  const scope = !ws || ws.is_personal ? null : ws.id
  return missingConnections(post.platforms ?? [], connectedInScope(rows, scope))
}

/**
 * When a post counts toward the posting streak, or null when it doesn't: the
 * time it went out, or for a scheduled post the time it is due, as long as it
 * can go out. Drafts, failed posts and posts waiting on approval never count.
 * Same statuses and anchor as /api/streak, which counts scheduled posts on the
 * day they are due so scheduling a week ahead keeps the streak (June 2026).
 */
export function streakTimeOf(
  post: { status: string; published_at?: string | null; scheduled_at?: string | null; created_at?: string | null },
  canGoOut: boolean,
): string | null {
  if (post.status === 'published' || post.status === 'partial') {
    return post.published_at || post.scheduled_at || post.created_at || null
  }
  if (post.status === 'scheduled' && canGoOut) return post.scheduled_at || null
  return null
}

/**
 * The platforms a workspace can post to, read server-side for its account
 * owner. null when either lookup failed: callers then skip the check rather
 * than refuse every post because the database hiccuped. The publisher still
 * refuses a platform with no account, as it always has.
 */
export async function connectedPlatformsFor(admin: SupabaseClient, scope: AccountScope): Promise<Set<string> | null> {
  let accounts = admin.from('connected_accounts').select('platform').eq('user_id', scope.ownerId)
  accounts = scope.accountWorkspaceId ? accounts.eq('workspace_id', scope.accountWorkspaceId) : accounts.is('workspace_id', null)

  let destinations = admin.from('post_destinations').select('platform').eq('user_id', scope.ownerId)
  destinations = scope.accountWorkspaceId ? destinations.eq('workspace_id', scope.accountWorkspaceId) : destinations.is('workspace_id', null)

  const [a, d] = await Promise.all([accounts, destinations])
  if (a.error || d.error) {
    console.warn('[connected-platforms] lookup failed:', a.error?.message ?? d.error?.message)
    return null
  }
  const rows = (a.data ?? []).concat(d.data ?? []) as { platform: string }[]
  return new Set(rows.map(r => r.platform))
}
