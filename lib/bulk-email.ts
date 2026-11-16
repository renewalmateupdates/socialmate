import type { SupabaseClient } from '@supabase/supabase-js'
import { MailError, sendMailOrThrow, type SendMailOpts } from '@/lib/mail'

/**
 * The one way the admin one-shot emails (update, reactivation, TikTok,
 * unblocked) send to many people.
 *
 * Two things went wrong on Nov 16, 2026, and this file exists so neither can
 * happen again:
 *
 * 1. Resend reports a rejected send in its return value ({ data, error }) and
 *    does not throw. Four of these routes did `await sendMail(...)` and then
 *    recorded the person as sent, so a rejected email burned their one shot.
 *    `sendOrThrow` turns the error into a throw.
 *
 * 2. The update email went to 184 people in three minutes and then hit
 *    Resend's daily quota. While the quota is spent, every email the app sends
 *    fails too (welcome emails, notifications, maybe signup confirmations).
 *    `runBulkSend` caps all bulk sends at BULK_DAILY_CAP per rolling 24 hours,
 *    counted from the usage_events these routes write, and stops the batch at
 *    the first quota error instead of failing through everyone left.
 */

/** usage_events types the bulk routes write, one row per person emailed. */
export const BULK_EMAIL_EVENTS: string[] = [
  'product_update_nov2026_email',
  'tiktok_first_post_email',
  'tiktok_live_email',
  'reactivation_email',
  'unblocked_email',
]

export function positiveInt(raw: string | undefined, fallback: number): number {
  const n = Number(raw)
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback
}

/**
 * Most sends one POST makes. At ~0.7s per send (400ms spacing plus the round
 * trip) 50 finish well inside a route's 60s maxDuration, so a timeout can
 * never land between a send and its record and email someone twice.
 */
export const BULK_BATCH_SIZE = 50

/** Bulk sends allowed per rolling 24 hours, leaving the rest of Resend's quota for app mail. */
export const BULK_DAILY_CAP = positiveInt(process.env.BULK_EMAIL_DAILY_CAP, 100)

export class QuotaError extends Error {
  constructor(message: string) {
    super(message)
    // Keeps `instanceof QuotaError` true where classes compile down to ES5.
    Object.setPrototypeOf(this, QuotaError.prototype)
    this.name = 'QuotaError'
  }
}

/** Resend's 429s for this are daily_quota_exceeded and monthly_quota_exceeded. */
export function isQuotaError(err: { message?: string; name?: string; code?: string } | null | undefined): boolean {
  if (!err) return false
  return /quota/i.test(err.code || '') || /quota/i.test(err.name || '') || /quota/i.test(err.message || '')
}

/** Send one email; throw if Resend rejected it, as a QuotaError when the quota is spent. */
export async function sendOrThrow(opts: SendMailOpts): Promise<void> {
  try {
    await sendMailOrThrow(opts)
  } catch (e) {
    if ((e instanceof MailError || (e as Error)?.name === 'MailError') && isQuotaError(e as MailError)) {
      throw new QuotaError((e as MailError).message)
    }
    throw e
  }
}

/** How many bulk emails went out in the last 24 hours, across every bulk route. */
export async function bulkSentLast24h(db: SupabaseClient, now: number = Date.now()): Promise<number> {
  const since = new Date(now - 24 * 60 * 60 * 1000).toISOString()
  const { count, error } = await db
    .from('usage_events')
    .select('id', { count: 'exact', head: true })
    .in('event_type', BULK_EMAIL_EVENTS)
    .gte('created_at', since)
  // Throw rather than guess 0: an unknown count must not lift the cap.
  if (error) throw new Error('bulk send count failed: ' + error.message)
  return count ?? 0
}

export interface BulkResult {
  sent: number
  failed: number
  failedEmails: string[]
  /** Eligible people still not sent after this run. */
  remaining: number
  /** Why the run sent fewer than it could have, if it did. */
  stopped?: 'daily_cap' | 'quota'
  note: string
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))
const errMsg = (e: unknown) => (e instanceof Error ? e.message : String(e))

/**
 * Sends to targets in order, at most `batchSize` and never past the daily cap.
 * `send` must throw on failure (use sendOrThrow); `record` runs only after a
 * send succeeds, so anyone who failed or was not reached stays eligible and a
 * plain re-POST picks up exactly the rest.
 */
export async function runBulkSend<T extends { email: string }>(opts: {
  label: string
  targets: T[]
  sentLast24h: number
  send: (t: T) => Promise<void>
  record: (t: T) => Promise<void>
  batchSize?: number
  cap?: number
  intervalMs?: number
}): Promise<BulkResult> {
  const cap = opts.cap ?? BULK_DAILY_CAP
  const room = Math.max(0, cap - opts.sentLast24h)
  const limit = Math.min(opts.targets.length, opts.batchSize ?? opts.targets.length, room)
  const intervalMs = opts.intervalMs ?? 400

  let sent = 0
  let stopped: BulkResult['stopped'] = limit < Math.min(opts.targets.length, opts.batchSize ?? Infinity) ? 'daily_cap' : undefined
  const failedEmails: string[] = []

  // Indexed loop: this repo compiles below es2015, so no for..of over iterators.
  for (let i = 0; i < limit; i++) {
    const t = opts.targets[i]
    if (i > 0 && intervalMs > 0) await sleep(intervalMs)
    try {
      await opts.send(t)
    } catch (e) {
      failedEmails.push(t.email)
      console.error(`[${opts.label}] send failed:`, t.email, errMsg(e))
      if (e instanceof QuotaError || (e as Error)?.name === 'QuotaError') { stopped = 'quota'; break }
      continue
    }
    sent++
    try {
      await opts.record(t)
    } catch (e) {
      // The email went out; a missing record only risks a repeat on a re-POST.
      console.warn(`[${opts.label}] record failed after a successful send:`, t.email, errMsg(e))
    }
  }

  const remaining = opts.targets.length - sent
  let note: string
  if (stopped === 'quota') {
    note = `Resend's sending quota is spent, so the batch stopped after ${sent}. App emails fail until it resets; POST again tomorrow for the other ${remaining}.`
  } else if (stopped === 'daily_cap') {
    note = room === 0
      ? `Daily bulk cap of ${cap} reached (${opts.sentLast24h} sent in the last 24 hours). POST again tomorrow for the ${remaining} left.`
      : `Stopped at the daily bulk cap of ${cap} (${opts.sentLast24h + sent} in the last 24 hours). POST again tomorrow for the ${remaining} left.`
  } else if (remaining > 0) {
    note = `${remaining} not sent yet. They were not recorded, so POST again with the same confirm to reach only them.`
  } else {
    note = 'done'
  }
  return { sent, failed: failedEmails.length, failedEmails: failedEmails.slice(0, 10), remaining, stopped, note }
}
