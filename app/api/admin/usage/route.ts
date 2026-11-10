export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { requireAdmin } from '@/lib/admin-auth'
import { internalIdsOf, listAllAuthUsers, oldestFirst, selectAll } from '@/lib/admin-metrics'

// Which AI tools and agents people actually use.
//
// Until now nothing recorded this: usage_events existed and anticipated an
// 'ai_credit' type in its own schema comment, but only the Twitch clip lookup
// ever wrote to it. Every AI tool now logs through the single chokepoint in
// lib/ai-credits.ts, so this reads real data rather than guesses.
//
// Reads with the service-role client on purpose: usage_events RLS scopes SELECT
// to the row's own user, which is right for users and useless for an admin view.
//
// Customers only, like every other admin page; our own runs are counted apart.
// Until Nov 10, 2026 failed posts were windowed on published_at, which a post
// that failed everywhere never gets, so the count only ever held partial posts.

const WINDOW_DAYS = 30

type ToolRow = { tool: string; runs: number; credits: number; users: number }
type EventRow = { user_id: string; metadata: Record<string, unknown> | null }
type FailedRow = { user_id: string; platform_errors: Record<string, string> | null; status: string }

export async function GET() {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const db = getSupabaseAdmin()
  const since = new Date(Date.now() - WINDOW_DAYS * 24 * 60 * 60 * 1000).toISOString()

  const loaded = await Promise.all([
    listAllAuthUsers(db),
    selectAll<EventRow>('usage_events (ai_credit)', () => oldestFirst(db.from('usage_events')
      .select('user_id, metadata')
      .eq('event_type', 'ai_credit')
      .gte('created_at', since))),
    selectAll<EventRow>('usage_events (agent_run)', () => oldestFirst(db.from('usage_events')
      .select('user_id, metadata')
      .eq('event_type', 'agent_run')
      .gte('created_at', since))),
    // When the post failed, not when it published: a failed post has no
    // published_at at all.
    selectAll<FailedRow>('posts (failed)', () => oldestFirst(db.from('posts')
      .select('user_id, platform_errors, status')
      .in('status', ['failed', 'partial'])
      .gte('updated_at', since))),
    db.from('feedback')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', since)
      .then(({ count, error }) => {
        if (error) throw new Error(`feedback: ${error.message}`)
        return count ?? 0
      }),
  ]).catch((e: unknown) => (e instanceof Error ? e : new Error(String(e))))
  if (loaded instanceof Error) {
    console.error('[admin/usage]', loaded.message)
    return NextResponse.json({ error: loaded.message }, { status: 500 })
  }
  const [users, allAi, allAgents, allFailed, feedback] = loaded

  const internalIds = internalIdsOf(users)
  internalIds.add(user.id)
  const ours = <T extends { user_id: string }>(rows: T[]) => rows.filter(r => internalIds.has(r.user_id))
  const theirs = <T extends { user_id: string }>(rows: T[]) => rows.filter(r => !internalIds.has(r.user_id))

  // Aggregate in JS rather than SQL: the volume is small, and it keeps this
  // endpoint working without adding a view or an RPC that has to be migrated.
  const tally = (events: EventRow[], key: string): ToolRow[] => {
    const map = new Map<string, { runs: number; credits: number; users: Set<string> }>()
    for (const e of events) {
      const name = String(e.metadata?.[key] ?? 'unknown')
      const cost = Number(e.metadata?.cost ?? 0)
      const cur = map.get(name) ?? { runs: 0, credits: 0, users: new Set<string>() }
      cur.runs += 1
      cur.credits += Number.isFinite(cost) ? cost : 0
      cur.users.add(e.user_id)
      map.set(name, cur)
    }
    return Array.from(map.entries())
      .map(([tool, v]) => ({ tool, runs: v.runs, credits: v.credits, users: v.users.size }))
      .sort((a, b) => b.runs - a.runs)
  }
  const credits = (events: EventRow[]) => events.reduce((s, e) => {
    const cost = Number(e.metadata?.cost ?? 0)
    return s + (Number.isFinite(cost) ? cost : 0)
  }, 0)

  const aiEvents    = theirs(allAi)
  const agentEvents = theirs(allAgents)
  const failed      = theirs(allFailed)

  // Group failures by the error text platforms actually returned, so the top
  // row is the thing worth fixing rather than a count of sad posts.
  const errorMap = new Map<string, { platform: string; message: string; count: number }>()
  for (const p of failed) {
    const errs = p.platform_errors ?? {}
    for (const [platform, message] of Object.entries(errs)) {
      const short = String(message).slice(0, 140)
      const k = `${platform}::${short}`
      const cur = errorMap.get(k) ?? { platform, message: short, count: 0 }
      cur.count += 1
      errorMap.set(k, cur)
    }
  }

  return NextResponse.json({
    windowDays: WINDOW_DAYS,
    aiTools:    tally(aiEvents, 'tool'),
    agents:     tally(agentEvents, 'agent'),
    totals: {
      aiRuns:      aiEvents.length,
      aiCredits:   credits(aiEvents),
      agentRuns:   agentEvents.length,
      failedPosts: failed.length,
      feedback,
    },
    // Our own accounts' activity in the same window, never mixed in above.
    ours: {
      aiRuns:      ours(allAi).length,
      agentRuns:   ours(allAgents).length,
      failedPosts: ours(allFailed).length,
    },
    topErrors: Array.from(errorMap.values()).sort((a, b) => b.count - a.count).slice(0, 15),
  })
}
