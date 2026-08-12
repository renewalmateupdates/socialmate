export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { requireAdmin } from '@/lib/admin-auth'

// Which AI tools and agents people actually use.
//
// Until now nothing recorded this: usage_events existed and anticipated an
// 'ai_credit' type in its own schema comment, but only the Twitch clip lookup
// ever wrote to it. Every AI tool now logs through the single chokepoint in
// lib/ai-credits.ts, so this reads real data rather than guesses.
//
// Reads with the service-role client on purpose: usage_events RLS scopes SELECT
// to the row's own user, which is right for users and useless for an admin view.

const WINDOW_DAYS = 30

type ToolRow = { tool: string; runs: number; credits: number; users: number }

export async function GET() {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const db = getSupabaseAdmin()
  const since = new Date(Date.now() - WINDOW_DAYS * 24 * 60 * 60 * 1000).toISOString()

  const [aiRes, agentRes, failRes, feedbackRes] = await Promise.allSettled([
    db.from('usage_events')
      .select('user_id, metadata, created_at')
      .eq('event_type', 'ai_credit')
      .gte('created_at', since)
      .limit(10000),
    db.from('usage_events')
      .select('user_id, metadata, created_at')
      .eq('event_type', 'agent_run')
      .gte('created_at', since)
      .limit(10000),
    db.from('posts')
      .select('id, platform_errors, status, published_at')
      .in('status', ['failed', 'partial'])
      .gte('published_at', since)
      .limit(2000),
    db.from('feedback')
      .select('id, created_at')
      .gte('created_at', since)
      .limit(2000),
  ])

  const rows = <T,>(r: PromiseSettledResult<{ data: T[] | null }>): T[] =>
    r.status === 'fulfilled' ? (r.value.data ?? []) : []

  // Aggregate in JS rather than SQL: the volume is small, and it keeps this
  // endpoint working without adding a view or an RPC that has to be migrated.
  const tally = (
    events: { user_id: string; metadata: Record<string, unknown> | null }[],
    key: string,
  ): ToolRow[] => {
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

  const aiEvents    = rows<{ user_id: string; metadata: Record<string, unknown> | null }>(aiRes as never)
  const agentEvents = rows<{ user_id: string; metadata: Record<string, unknown> | null }>(agentRes as never)
  const failed      = rows<{ id: string; platform_errors: Record<string, string> | null; status: string }>(failRes as never)

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
      aiCredits:   aiEvents.reduce((s, e) => s + Number(e.metadata?.cost ?? 0), 0),
      agentRuns:   agentEvents.length,
      failedPosts: failed.length,
      feedback:    rows<{ id: string }>(feedbackRes as never).length,
    },
    topErrors: Array.from(errorMap.values()).sort((a, b) => b.count - a.count).slice(0, 15),
  })
}
