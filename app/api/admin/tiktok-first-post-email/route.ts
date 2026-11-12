import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { listAllAuthUsers, oldestFirst, selectAll } from '@/lib/admin-metrics'
import { sendMail, REPLY_TO } from '@/lib/mail'
import {
  FIRST_POST_CONFIRM, FIRST_POST_EVENT, FIRST_POST_SUBJECT, OCT23_EVENT,
  firstPostAudience, firstPostEmailHtml,
} from '@/lib/tiktok-first-post-email'

// One-shot email to people who connected TikTok and never posted to it. Who
// gets it and what it says live in lib/tiktok-first-post-email.ts.
//
// It sends nothing on its own: no cron, no trigger. Same three steps as the
// Oct 23 send (/api/admin/tiktok-live-email):
//   GET                              previews the audience
//   POST ?to=you@example.com         sends one test copy, records nothing
//   POST { confirm: CONFIRM }        sends to everyone eligible
// Each send is recorded in usage_events after it succeeds, so a re-POST only
// reaches people not yet sent and a failure stays eligible.

// Resend round trips at SEND_INTERVAL_MS each; 60s covers well over 100 sends.
export const maxDuration = 60

// Resend's free tier allows 2 requests/second.
const SEND_INTERVAL_MS = 400
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://socialmate.studio'

const errMsg = (e: unknown) => (e instanceof Error ? e.message : String(e))

async function audience() {
  const db = getSupabaseAdmin()
  // Every read pages past PostgREST's 1,000-row cap and throws on error, so a
  // failed read can never shrink "already posted" and email someone who has.
  const [users, connected, tiktokPosts, posts, sent, oct23] = await Promise.all([
    listAllAuthUsers(db),
    selectAll<{ user_id: string }>('tiktok connections', () =>
      oldestFirst(db.from('connected_accounts').select('id, user_id, created_at').eq('platform', 'tiktok'))),
    // Anything that got as far as TikTok: published, scheduled or in drafts.
    selectAll<{ user_id: string }>('tiktok posts', () =>
      oldestFirst(db.from('tiktok_posts').select('id, user_id, created_at').neq('status', 'failed'))),
    selectAll<{ user_id: string }>('posts to tiktok', () =>
      oldestFirst(db.from('posts').select('id, user_id, created_at')
        .contains('platforms', ['tiktok'])
        .in('status', ['published', 'partial', 'scheduled']))),
    selectAll<{ user_id: string }>('first post emails', () =>
      oldestFirst(db.from('usage_events').select('id, user_id, created_at').eq('event_type', FIRST_POST_EVENT))),
    selectAll<{ user_id: string }>('oct 23 emails', () =>
      oldestFirst(db.from('usage_events').select('id, user_id, created_at').eq('event_type', OCT23_EVENT))),
  ])

  return firstPostAudience({
    users,
    tiktokConnectedIds: connected.map(r => r.user_id),
    tiktokUsedIds: tiktokPosts.map(r => r.user_id).concat(posts.map(r => r.user_id)),
    alreadySentIds: sent.map(r => r.user_id),
    oct23Ids: oct23.map(r => r.user_id),
  })
}

export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  try {
    const { targets, alreadySent, alreadyPosted } = await audience()
    return NextResponse.json({
      wouldSend: targets.length,
      gotOct23Email: targets.filter(t => t.gotOct23).length,
      alreadySent,
      alreadyPosted,
      confirmWith: FIRST_POST_CONFIRM,
      preview: targets.slice(0, 20).map(t => ({ email: t.email, gotOct23: t.gotOct23 })),
    })
  } catch (e) {
    console.error('[tiktok-first-post-email] audience failed:', errMsg(e))
    return NextResponse.json({ error: errMsg(e) || 'audience read failed' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const testTo = new URL(req.url).searchParams.get('to')
  if (testTo) {
    try {
      await sendMail({ to: testTo, subject: `[TEST] ${FIRST_POST_SUBJECT}`, html: firstPostEmailHtml('', true, APP_URL) })
      return NextResponse.json({ test: true, sentTo: testTo, recorded: false, replyTo: REPLY_TO })
    } catch (e) {
      return NextResponse.json({ test: true, error: errMsg(e) || 'send failed' }, { status: 500 })
    }
  }

  const body = await req.json().catch(() => ({}))
  if (body?.confirm !== FIRST_POST_CONFIRM) {
    return NextResponse.json({ error: `Refused. Send with { "confirm": "${FIRST_POST_CONFIRM}" }.` }, { status: 400 })
  }

  let targets
  try {
    targets = (await audience()).targets
  } catch (e) {
    console.error('[tiktok-first-post-email] audience failed:', errMsg(e))
    return NextResponse.json({ error: errMsg(e) || 'audience read failed', sent: 0 }, { status: 500 })
  }
  if (targets.length === 0) return NextResponse.json({ sent: 0, note: 'nobody eligible' })

  const db = getSupabaseAdmin()
  let sent = 0
  const failed: string[] = []

  // Indexed loop: this repo compiles below es2015, so no for..of over iterators.
  for (let i = 0; i < targets.length; i++) {
    const t = targets[i]
    if (i > 0) await sleep(SEND_INTERVAL_MS)
    try {
      await sendMail({ to: t.email, subject: FIRST_POST_SUBJECT, html: firstPostEmailHtml(t.name, t.gotOct23, APP_URL) })
      // Recorded only after a successful send, so a failure stays eligible.
      const { error } = await db.from('usage_events').insert({
        user_id: t.id,
        event_type: FIRST_POST_EVENT,
        metadata: { got_oct23: t.gotOct23 },
      })
      if (error) console.warn('[tiktok-first-post-email] usage_events insert failed:', t.email, error.message)
      sent++
    } catch (e) {
      failed.push(t.email)
      console.error('[tiktok-first-post-email] send failed:', t.email, errMsg(e))
    }
  }

  const remaining = targets.length - sent
  return NextResponse.json({
    sent,
    failed: failed.length,
    failedEmails: failed.slice(0, 10),
    remaining,
    note: remaining > 0 ? 'POST again with the same confirm to reach the rest; nobody already sent is re-sent.' : 'done',
  })
}
