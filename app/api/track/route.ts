export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { FUNNEL_EVENTS, type FunnelEvent } from '@/lib/analytics'

/**
 * First-party funnel sink.
 *
 * GA4 alone was never going to answer the activation questions: a meaningful
 * share of this audience blocks it, and the numbers that matter (how many
 * accounts reached the connect screen, which platform they clicked, where they
 * dropped) need to join against our own tables to be useful at all.
 *
 * Writes land in usage_events, which already exists with exactly the right
 * shape — user_id / event_type / metadata / created_at, indexed on
 * (user_id, event_type, created_at). Reusing it means no migration and no new
 * table to keep in sync.
 *
 * Anonymous callers get a 204, not a 401. The client fires this from a
 * sendBeacon that nobody is waiting on, and a logged-out visitor hitting
 * /signup is a legitimate, expected case — their step is recorded in GA4
 * instead, because there is no user_id to attach it to here.
 */

const VALID = new Set<string>(FUNNEL_EVENTS)

/** Keep metadata small and flat. This is analytics, not a document store. */
function sanitize(params: unknown): Record<string, string | number | boolean> {
  if (!params || typeof params !== 'object') return {}
  const out: Record<string, string | number | boolean> = {}
  let n = 0
  for (const [k, v] of Object.entries(params as Record<string, unknown>)) {
    if (n >= 12) break
    if (typeof k !== 'string' || k.length > 40) continue
    if (typeof v === 'number' || typeof v === 'boolean') { out[k] = v; n++ }
    else if (typeof v === 'string') { out[k] = v.slice(0, 200); n++ }
  }
  return out
}

export async function POST(req: NextRequest) {
  let body: { event?: string; params?: unknown }
  try {
    body = await req.json()
  } catch {
    return new NextResponse(null, { status: 204 })
  }

  const event = body?.event
  if (typeof event !== 'string' || !VALID.has(event)) {
    // An unknown step is a bug in the caller, not something to record. Fail
    // visibly in the log rather than writing an event nobody will query.
    console.warn('[track] unknown funnel event rejected:', event)
    return new NextResponse(null, { status: 204 })
  }

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        // Read-only request. Writing cookies from a beacon handler would race
        // with whatever navigation triggered it.
        setAll: () => {},
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new NextResponse(null, { status: 204 })

  const { error } = await getSupabaseAdmin()
    .from('usage_events')
    .insert({
      user_id: user.id,
      event_type: `funnel_${event as FunnelEvent}`,
      metadata: sanitize(body.params),
    })

  // Never discard a Supabase error, even on a fire-and-forget path. Nine
  // shipped features silently did nothing for months because of exactly this.
  if (error) console.warn(`[track] ${event} insert failed (non-fatal):`, error.message)

  return new NextResponse(null, { status: 204 })
}
