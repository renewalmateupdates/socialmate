import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { listAllAuthUsers, oldestFirst, selectAll } from '@/lib/admin-metrics'
import { sendMail, REPLY_TO } from '@/lib/mail'
import {
  UNSUBSCRIBED_EVENT, UPDATE_CONFIRM, UPDATE_EVENT, UPDATE_SUBJECT,
  updateAudience, updateEmailHtml,
} from '@/lib/emails/product-update-nov2026'

// The November 2026 update to everyone with an account. Who gets it and what it
// says live in lib/emails/product-update-nov2026.ts.
//
// It sends nothing on its own: no cron, no trigger. Same steps as the TikTok
// emails, plus a way to honour "unsubscribe" replies first:
//   GET                                   previews the audience
//   POST ?to=you@example.com              sends one test copy, records nothing
//   POST { unsubscribe: ["a@b.com"] }     records those people as unsubscribed
//   POST { confirm: CONFIRM }             sends the next batch of BATCH_SIZE
// Each send is recorded in usage_events after Resend accepts it, so POSTing
// again reaches only people not yet sent, and a failure stays eligible.

export const maxDuration = 60

// Resend's free tier allows 2 requests/second. A batch of 50 at ~0.7s per
// round trip finishes well inside maxDuration, so a timeout can never land
// between a send and its record and email someone twice.
const SEND_INTERVAL_MS = 400
const BATCH_SIZE = 50
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://socialmate.studio'

const errMsg = (e: unknown) => (e instanceof Error ? e.message : String(e))

async function audience() {
  const db = getSupabaseAdmin()
  // Every read pages past PostgREST's 1,000-row cap and throws on error, so a
  // failed read can never shrink "already sent" or "unsubscribed".
  const [users, sent, unsub] = await Promise.all([
    listAllAuthUsers(db),
    selectAll<{ user_id: string }>('update emails sent', () =>
      oldestFirst(db.from('usage_events').select('id, user_id, created_at').eq('event_type', UPDATE_EVENT))),
    selectAll<{ user_id: string }>('unsubscribed', () =>
      oldestFirst(db.from('usage_events').select('id, user_id, created_at').eq('event_type', UNSUBSCRIBED_EVENT))),
  ])
  return {
    users,
    ...updateAudience({
      users,
      alreadySentIds: sent.map(r => r.user_id),
      unsubscribedIds: unsub.map(r => r.user_id),
    }),
  }
}

// Resend reports a rejected send in its return value and does not throw, so
// a bare `await sendMail()` counts a failure as sent. Turn it into a throw.
async function send(to: string, subject: string, html: string) {
  const { error } = await sendMail({ to, subject, html })
  if (error) throw new Error(error.message || 'Resend rejected the send')
}

export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  try {
    const { targets, signups, alreadySent, unsubscribed, unconfirmed } = await audience()
    return NextResponse.json({
      wouldSend: targets.length,
      signups,
      alreadySent,
      unsubscribed,
      unconfirmed,
      batchSize: BATCH_SIZE,
      confirmWith: UPDATE_CONFIRM,
      replyTo: REPLY_TO,
      preview: targets.slice(0, 20).map(t => ({ email: t.email, name: t.name })),
    })
  } catch (e) {
    console.error('[update-email] audience failed:', errMsg(e))
    return NextResponse.json({ error: errMsg(e) || 'audience read failed' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  let aud
  try {
    aud = await audience()
  } catch (e) {
    console.error('[update-email] audience failed:', errMsg(e))
    return NextResponse.json({ error: errMsg(e) || 'audience read failed', sent: 0 }, { status: 500 })
  }

  const testTo = new URL(req.url).searchParams.get('to')
  if (testTo) {
    try {
      await send(testTo, `[TEST] ${UPDATE_SUBJECT}`, updateEmailHtml('', aud.signups, APP_URL))
      return NextResponse.json({ test: true, sentTo: testTo, recorded: false, replyTo: REPLY_TO, wouldSend: aud.targets.length })
    } catch (e) {
      return NextResponse.json({ test: true, error: errMsg(e) || 'send failed' }, { status: 500 })
    }
  }

  const body = await req.json().catch(() => ({}))
  const db = getSupabaseAdmin()

  if (Array.isArray(body?.unsubscribe)) {
    const wanted = new Set<string>(
      body.unsubscribe.filter((x: unknown): x is string => typeof x === 'string').map((x: string) => x.trim().toLowerCase()))
    const matched = aud.users.filter(u => u.email && wanted.has(u.email.toLowerCase()))
    const matchedEmails = new Set(matched.map(u => (u.email || '').toLowerCase()))
    const notFound = Array.from(wanted).filter(e => !matchedEmails.has(e))
    let recorded = 0
    for (let i = 0; i < matched.length; i++) {
      const { error } = await db.from('usage_events').insert({
        user_id: matched[i].id,
        event_type: UNSUBSCRIBED_EVENT,
        metadata: { source: 'reply', recorded_by: 'update-email' },
      })
      if (error) console.warn('[update-email] unsubscribe insert failed:', matched[i].email, error.message)
      else recorded++
    }
    return NextResponse.json({ recorded, notFound })
  }

  if (body?.confirm !== UPDATE_CONFIRM) {
    return NextResponse.json({ error: `Refused. Send with { "confirm": "${UPDATE_CONFIRM}" }.` }, { status: 400 })
  }

  const batch = aud.targets.slice(0, BATCH_SIZE)
  if (batch.length === 0) return NextResponse.json({ sent: 0, remaining: 0, note: 'nobody eligible' })

  let sent = 0
  const failed: string[] = []

  // Indexed loop: this repo compiles below es2015, so no for..of over iterators.
  for (let i = 0; i < batch.length; i++) {
    const t = batch[i]
    if (i > 0) await sleep(SEND_INTERVAL_MS)
    try {
      await send(t.email, UPDATE_SUBJECT, updateEmailHtml(t.name, aud.signups, APP_URL))
      // Recorded only after Resend accepts it, so a failure stays eligible.
      const { error } = await db.from('usage_events').insert({
        user_id: t.id,
        event_type: UPDATE_EVENT,
        metadata: { signups_shown: aud.signups },
      })
      if (error) console.warn('[update-email] usage_events insert failed:', t.email, error.message)
      sent++
    } catch (e) {
      failed.push(t.email)
      console.error('[update-email] send failed:', t.email, errMsg(e))
    }
  }

  const remaining = aud.targets.length - sent
  return NextResponse.json({
    sent,
    failed: failed.length,
    failedEmails: failed.slice(0, 10),
    remaining,
    note: remaining > 0 ? 'POST again with the same confirm for the next batch; nobody already sent is re-sent.' : 'done',
  })
}
