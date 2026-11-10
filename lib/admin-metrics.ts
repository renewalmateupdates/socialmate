import type { SupabaseClient, User } from '@supabase/supabase-js'
import { internalIdsFrom } from '@/lib/internal-accounts'

/**
 * How the /admin pages read and count, in one place.
 *
 * Why this exists (Nov 10, 2026): /admin/users said 4 accounts had ever
 * published. The real number was 7, five of them customers. PostgREST returns
 * at most 1,000 rows per request on this project, whatever `.limit()` asks
 * for, and `posts` passed 1,000 rows months ago. The route asked for 20,000,
 * got the first 1,000, and every customer whose posts sat past that row read
 * as "0 pub". Its own truncation warning only fired at 20,000, so it never
 * fired. The same cap was cutting /admin/funnel's 30 and 90-day history, and
 * the pages also disagreed about what an account, a connection and a
 * publisher were (profiles vs auth, now vs ever, published vs partial).
 *
 * Read through `selectAll` and count with the definitions below, and two pages
 * can't quietly disagree again.
 */

/** PostgREST's max_rows on this project. One request never returns more. */
export const PAGE_SIZE = 1000

type PageResult<T> = { data: T[] | null; error: { message: string } | null }
type Rangeable<T> = { range(from: number, to: number): PromiseLike<PageResult<T>> }

/**
 * Every row a query matches, 1,000 at a time.
 *
 * `make` builds a fresh query per page and must order by something unique
 * (end with `id`), or pages can overlap or skip rows. Throws on any error: a
 * failed read must never render as a zero.
 */
export async function selectAll<T>(label: string, make: () => Rangeable<T>, maxRows = 500_000): Promise<T[]> {
  const rows: T[] = []
  for (let from = 0; from < maxRows; from += PAGE_SIZE) {
    const { data, error } = await make().range(from, from + PAGE_SIZE - 1)
    if (error) throw new Error(`${label}: ${error.message}`)
    const page = data ?? []
    for (const row of page) rows.push(row)
    if (page.length < PAGE_SIZE) return rows
  }
  throw new Error(`${label}: more than ${maxRows} rows, narrow the query`)
}

/**
 * Oldest first, ties broken by id: a stable order for paging. New rows land on
 * the last page, so they can't shift a page that was already read.
 */
export function oldestFirst<Q extends { order(column: string, options?: { ascending?: boolean; nullsFirst?: boolean }): Q }>(q: Q): Q {
  return q.order('created_at', { ascending: true, nullsFirst: true }).order('id', { ascending: true })
}

/**
 * Every account, from auth.
 *
 * Auth is the only place every account is guaranteed to exist: on Nov 10, 2026
 * two real accounts had no `profiles` or `user_settings` row, so pages counting
 * those tables showed 259 accounts while /admin/users showed 261. Pages until
 * one comes back empty, so a server-side cap on `perPage` can't cut it short.
 */
export async function listAllAuthUsers(db: SupabaseClient): Promise<User[]> {
  const users: User[] = []
  for (let page = 1; page <= 1000; page++) {
    const { data, error } = await db.auth.admin.listUsers({ page, perPage: PAGE_SIZE })
    if (error) throw new Error(`auth users: ${error.message}`)
    const batch = data?.users ?? []
    if (batch.length === 0) return users
    for (const u of batch) users.push(u)
  }
  return users
}

/** Ids of our own accounts (lib/internal-accounts.ts) among these users. */
export function internalIdsOf(users: { id: string; email?: string | null }[]): Set<string> {
  return internalIdsFrom(users.map(u => ({ id: u.id, email: u.email ?? null })))
}

export type PostOutcomeFields = { status?: string | null; published_at?: string | null }

/**
 * A post that reached at least one platform. 'partial' counts: it went out,
 * just not everywhere. Every page uses this, so "published" means one thing.
 */
export function postWentOut(p: PostOutcomeFields): boolean {
  return !!p.published_at || p.status === 'published' || p.status === 'partial'
}

/** Went out at or after `sinceIso`. */
export function postWentOutSince(p: PostOutcomeFields, sinceIso: string): boolean {
  return postWentOut(p) && !!p.published_at && p.published_at >= sinceIso
}

/**
 * What happened on one platform. A partial post reached only the platforms it
 * has a platform post id for; counting all of them as failed (or all as
 * published) misreports the ones that went the other way.
 */
export function platformOutcome(
  p: { status?: string | null; platform_post_ids?: Record<string, unknown> | null },
  platform: string,
): 'published' | 'failed' | 'other' {
  if (p.status === 'published') return 'published'
  if (p.status === 'failed') return 'failed'
  if (p.status === 'partial') return p.platform_post_ids?.[platform] ? 'published' : 'failed'
  return 'other'
}

/**
 * Recorded after a publish succeeds (Post Now, the scheduler, TikTok sync). It
 * outlives the post: someone who published and then deleted the post still
 * published. One customer did exactly that on Oct 24, 2026.
 */
export const PUBLISHED_EVENT = 'funnel_post_published'

/**
 * Recorded when a connect succeeds. It outlives the connection: on Nov 10, 2026
 * eight customers had connected and no longer had an account row, and the copy
 * of the reactivation email says "you never got a platform connected".
 */
export const CONNECTED_EVENT = 'funnel_connect_succeeded'

/** The funnel events the scheduler fires without the person being there. */
export const SYSTEM_FUNNEL_EVENTS: ReadonlySet<string> = new Set([
  'funnel_post_published', 'funnel_tiktok_post_done', 'funnel_tiktok_post_failed',
])

/** A funnel event the person caused by being in the app. */
export function isPersonActivity(eventType: string): boolean {
  return eventType.startsWith('funnel_') && !SYSTEM_FUNNEL_EVENTS.has(eventType)
}

/** The latest of several ISO timestamps, ignoring blanks. */
export function latestIso(...values: (string | null | undefined)[]): string | null {
  let best: string | null = null
  for (const v of values) {
    if (!v) continue
    if (best === null || Date.parse(v) > Date.parse(best)) best = v
  }
  return best
}

/**
 * Union of what the rows show now and what the events recorded, with the
 * events-only part counted apart so a page can say where a number came from.
 */
export function everDid(fromRows: Iterable<string>, fromEvents: Iterable<string>): { ids: Set<string>; eventsOnly: Set<string> } {
  const ids = new Set<string>(Array.from(fromRows))
  const eventsOnly = new Set<string>()
  for (const id of Array.from(fromEvents)) {
    if (!ids.has(id)) { ids.add(id); eventsOnly.add(id) }
  }
  return { ids, eventsOnly }
}

export interface AccountFacts {
  /** Every account, ours included. */
  users: User[]
  /** Our own accounts. */
  internalIds: Set<string>
  /** Accounts that are not ours. */
  customers: User[]
  /** Ever connected a platform: has an account row now, or a connect event. */
  connected: Set<string>
  /** Of `connected`, those with no connected account today. */
  connectedEarlier: Set<string>
  /** Created any post, drafts included, or published one. */
  posted: Set<string>
  /** Ever published: a post that went out, or a publish event for a deleted one. */
  published: Set<string>
  /** Of `published`, those whose published posts are all gone. */
  publishedDeleted: Set<string>
  /** Latest time each account's post went out (rows, then events). */
  lastPublishedAt: Map<string, string>
}

/**
 * The activation facts every funnel shows, computed one way. /admin/funnel,
 * /admin/overview and the reactivation audience all read this, so "connected"
 * and "published" can't mean different things on different pages.
 */
export async function loadAccountFacts(db: SupabaseClient): Promise<AccountFacts> {
  type PostRow = { user_id: string; status: string | null; published_at: string | null }
  type EventRow = { user_id: string; event_type: string; created_at: string }

  const [users, accounts, posts, events] = await Promise.all([
    listAllAuthUsers(db),
    selectAll<{ user_id: string }>('connected_accounts', () =>
      oldestFirst(db.from('connected_accounts').select('user_id'))),
    selectAll<PostRow>('posts', () =>
      oldestFirst(db.from('posts').select('user_id, status, published_at'))),
    selectAll<EventRow>('usage_events', () =>
      oldestFirst(db.from('usage_events').select('user_id, event_type, created_at')
        .in('event_type', [CONNECTED_EVENT, PUBLISHED_EVENT]))),
  ])

  const internalIds = internalIdsOf(users)
  const customers = users.filter(u => !internalIds.has(u.id))

  const connectedNow = new Set(accounts.map(a => a.user_id))
  const connected = everDid(connectedNow, events.filter(e => e.event_type === CONNECTED_EVENT).map(e => e.user_id))

  const lastPublishedAt = new Map<string, string>()
  const note = (id: string, at: string | null) => {
    if (!at) return
    const cur = lastPublishedAt.get(id)
    if (!cur || Date.parse(at) > Date.parse(cur)) lastPublishedAt.set(id, at)
  }
  const wentOut = posts.filter(postWentOut)
  for (const p of wentOut) note(p.user_id, p.published_at)
  const publishEvents = events.filter(e => e.event_type === PUBLISHED_EVENT)
  for (const e of publishEvents) note(e.user_id, e.created_at)
  const published = everDid(wentOut.map(p => p.user_id), publishEvents.map(e => e.user_id))

  const posted = new Set(posts.map(p => p.user_id))
  for (const id of Array.from(published.ids)) posted.add(id)

  return {
    users,
    internalIds,
    customers,
    connected: connected.ids,
    connectedEarlier: connected.eventsOnly,
    posted,
    published: published.ids,
    publishedDeleted: published.eventsOnly,
    lastPublishedAt,
  }
}
