import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { sendMail, REPLY_TO } from '@/lib/mail'
import { isInternalEmail } from '@/lib/internal-accounts'
import { unblockedHtml, UNBLOCKED_SUBJECT } from '@/lib/emails/unblocked'

// One-shot note to the accounts that PR #610 unblocked.
//
// These twelve are a different cohort from the reactivation send of Aug 30, and
// the difference is the whole reason this exists. That list had never connected
// anything. These people did connect, successfully, and were then held on the
// onboarding screen forever because connecting an account did not set
// `profiles.onboarding_completed` and the dashboard gates on exactly that. The
// oldest had a working Discord connection sitting in the database since 17
// April and no way to reach it.
//
// So this is not "come back and try again". It is "the thing you did worked,
// and we hid the result from you". They are the highest-intent audience this
// product has, because they already got past the step that stops everyone else.
//
// GET previews. POST sends. ?to= sends one test copy and records nothing.

export const maxDuration = 60

// Resend's free tier allows 2 requests/second. Twelve sends at this interval
// finish in about five seconds, well inside the budget above.
const SEND_INTERVAL_MS = 400
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

// Written by the backfill that recorded who #610 released, so the audience is a
// recorded fact rather than a list of addresses pasted into a source file.
const COHORT = 'activation_unblocked'
const EVENT = 'unblocked_email'

interface Target { id: string; email: string; name: string; platform: string; since: string }

async function audience(): Promise<{ targets: Target[]; alreadySent: number }> {
  const admin = getSupabaseAdmin()

  const [cohort, sent, profiles] = await Promise.all([
    admin.from('usage_events').select('user_id, metadata').eq('event_type', COHORT),
    admin.from('usage_events').select('user_id').eq('event_type', EVENT),
    admin.from('profiles').select('id, email, full_name'),
  ])

  // A query naming a column that does not exist returns an error and null data.
  // Failing loudly beats sending to nobody and reporting success.
  if (cohort.error) throw new Error('cohort: ' + cohort.error.message)
  if (sent.error) throw new Error('sent: ' + sent.error.message)
  if (profiles.error) throw new Error('profiles: ' + profiles.error.message)

  const hasBeenSent = new Set((sent.data ?? []).map(r => r.user_id))
  const byId = new Map((profiles.data ?? []).map(p => [p.id, p]))

  const targets: Target[] = []
  let alreadySent = 0
  const seen = new Set<string>()

  for (const row of cohort.data ?? []) {
    if (seen.has(row.user_id)) continue
    seen.add(row.user_id)

    const p = byId.get(row.user_id)
    if (!p?.email || isInternalEmail(p.email)) continue
    if (hasBeenSent.has(row.user_id)) { alreadySent++; continue }

    const md = (row.metadata ?? {}) as { platforms?: string[]; signed_up?: string }
    targets.push({
      id: row.user_id,
      email: p.email,
      // Blank rather than an email prefix. "hadyusa1, that one was on us"
      // reads as a merge field and undercuts an email whose premise is care.
      name: (p.full_name as string | null)?.split(' ')[0]?.trim() || '',
      platform: md.platforms?.[0] ?? '',
      since: md.signed_up ?? '',
    })
  }
  return { targets, alreadySent }
}

export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  try {
    const { targets, alreadySent } = await audience()
    return NextResponse.json({
      wouldSend: targets.length,
      alreadySent,
      replyTo: REPLY_TO,
      preview: targets.map(t => ({ email: t.email, name: t.name, platform: t.platform, since: t.since })),
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'preview failed'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function POST(req: Request) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  // ?to=you@example.com renders the real thing for one address and records
  // nothing. There is no second attempt at the real send.
  const testTo = new URL(req.url).searchParams.get('to')
  if (testTo) {
    try {
      await sendMail({
        to: testTo,
        subject: '[TEST] That one was on us, and it is fixed',
        html: unblockedHtml({ name: 'Joshua', platform: 'discord', since: '2026-04-17' }),
      })
      return NextResponse.json({ test: true, sentTo: testTo, recorded: false, replyTo: REPLY_TO })
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'send failed'
      return NextResponse.json({ test: true, error: msg }, { status: 500 })
    }
  }

  const { targets } = await audience()
  if (targets.length === 0) return NextResponse.json({ sent: 0, note: 'nobody eligible' })

  const admin = getSupabaseAdmin()
  let sent = 0
  const failed: string[] = []

  for (let i = 0; i < targets.length; i++) {
    const t = targets[i]
    if (i > 0) await sleep(SEND_INTERVAL_MS)
    try {
      await sendMail({
        to: t.email,
        subject: UNBLOCKED_SUBJECT,
        html: unblockedHtml(t),
      })
      // Recorded only after the send succeeded, so a failure leaves them
      // eligible for a retry rather than burning their one shot silently.
      await admin.from('usage_events').insert({
        user_id: t.id,
        event_type: EVENT,
        metadata: { platform: t.platform },
      })
      sent++
    } catch (e: unknown) {
      failed.push(t.email)
      console.error('[unblocked] send failed:', t.email, e instanceof Error ? e.message : e)
    }
  }

  const remaining = targets.length - sent
  return NextResponse.json({
    sent,
    failed: failed.length,
    failedEmails: failed.slice(0, 10),
    remaining,
    note: remaining > 0
      ? remaining + ' not sent, and not recorded. POST again to retry only those.'
      : 'All eligible targets sent.',
  })
}
