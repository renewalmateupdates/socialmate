import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { lifecycleEmail } from '@/lib/lifecycle-emails'
import { sendMail, REPLY_TO } from '@/lib/mail'
import { isInternalEmail } from '@/lib/internal-accounts'

// One-shot announcement for the day TikTok clears SocialMate's content sharing
// audit, to everyone outside the team who has connected TikTok.
//
// Why it exists: on Oct 21, 2026, 43 of the 65 people who had ever connected a
// platform had connected only TikTok, and most new signups were arriving from
// ChatGPT on /for/tiktok-creators. Until the audit clears, a public account's
// scheduled video lands in TikTok drafts (lib/tiktok-scheduled.ts), so these
// people have been waiting on exactly this. Telling them once, the day it is
// true, is the largest activation moment available.
//
// It sends nothing on its own. There is no cron and no trigger; only an admin
// POST that names the confirmation phrase below sends the real thing, so an
// accidental POST before the audit clears is refused.
//
// GET previews the audience. POST ?to=you@example.com sends one test copy and
// records nothing. POST with { confirm: CONFIRM } sends to everyone eligible.
//
// Idempotency rides on usage_events, like /api/admin/reactivate: anyone with a
// row for EVENT is skipped, so a re-POST only reaches people not yet sent.

// Resend round trips at SEND_INTERVAL_MS each; 60s covers well over 100 sends.
export const maxDuration = 60

// Resend's free tier allows 2 requests/second.
const SEND_INTERVAL_MS = 400
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

const EVENT = 'tiktok_live_email'
const CONFIRM = 'tiktok public posting is live'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://socialmate.studio'
const SUBJECT = 'TikTok public posting is live on SocialMate'

interface Target { id: string; email: string; name: string; tiktokOnly: boolean }

// One function, so the ?to= test renders exactly what the real send renders.
function tiktokLiveHtml(name: string, tiktokOnly: boolean): string {
  return lifecycleEmail({
    headline: name ? `${name}, your TikTok videos can go public now.` : 'Your TikTok videos can go public now.',
    paragraphs: [
      'When you connected TikTok to SocialMate, TikTok was still reviewing our app, so videos could only go to your TikTok drafts or to a private account.',
      'That review is done. Videos you post or schedule from TikTok Studio now go straight to your public profile at the time you pick.',
      tiktokOnly
        ? 'The free plan includes 20 TikTok videos a month. Upload one, write a caption, pick a time, and it goes out on its own.'
        : 'The free plan includes 20 TikTok videos a month, alongside the other platforms you already have connected.',
      'If anything about it does not work the way you expect, reply to this. It comes straight to me and I read every one.',
    ],
    ctaLabel: 'Schedule a TikTok video',
    ctaHref: `${APP_URL}/tiktok/studio`,
    footnote: 'A one-off note because you connected TikTok to SocialMate. You will not get a series of these.',
  })
}

async function audience(): Promise<{ targets: Target[]; alreadySent: number }> {
  const admin = getSupabaseAdmin()

  const [{ data: authData, error: authError }, connected, sent] = await Promise.all([
    admin.auth.admin.listUsers({ perPage: 1000 }),
    admin.from('connected_accounts').select('user_id, platform'),
    admin.from('usage_events').select('user_id').eq('event_type', EVENT),
  ])
  if (authError) console.warn('[tiktok-live-email] listUsers failed:', authError.message)
  if (connected.error) console.warn('[tiktok-live-email] connected_accounts read failed:', connected.error.message)
  if (sent.error) console.warn('[tiktok-live-email] usage_events read failed:', sent.error.message)

  const platformsByUser = new Map<string, Set<string>>()
  for (const r of connected.data ?? []) {
    const set = platformsByUser.get(r.user_id) ?? new Set<string>()
    set.add(r.platform)
    platformsByUser.set(r.user_id, set)
  }
  const hasBeenSent = new Set((sent.data ?? []).map(r => r.user_id))

  const targets: Target[] = []
  let alreadySent = 0
  for (const u of authData?.users ?? []) {
    if (!u.email || isInternalEmail(u.email)) continue
    const platforms = platformsByUser.get(u.id)
    if (!platforms?.has('tiktok')) continue
    if (hasBeenSent.has(u.id)) { alreadySent++; continue }
    targets.push({
      id: u.id,
      email: u.email,
      // Blank rather than the email prefix, for the same reason as reactivate:
      // a handle like "sdknight2019" in the headline reads as a mail merge.
      name: (u.user_metadata?.full_name as string | undefined)?.split(' ')[0]?.trim() || '',
      tiktokOnly: platforms.size === 1,
    })
  }
  return { targets, alreadySent }
}

export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { targets, alreadySent } = await audience()
  return NextResponse.json({
    wouldSend:  targets.length,
    tiktokOnly: targets.filter(t => t.tiktokOnly).length,
    alreadySent,
    confirmWith: CONFIRM,
    preview:    targets.slice(0, 20).map(t => ({ email: t.email, tiktokOnly: t.tiktokOnly })),
  })
}

export async function POST(req: Request) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const testTo = new URL(req.url).searchParams.get('to')
  if (testTo) {
    try {
      await sendMail({ to: testTo, subject: `[TEST] ${SUBJECT}`, html: tiktokLiveHtml(testTo.split('@')[0], true) })
      return NextResponse.json({ test: true, sentTo: testTo, recorded: false, replyTo: REPLY_TO })
    } catch (e: any) {
      return NextResponse.json({ test: true, error: e?.message ?? 'send failed' }, { status: 500 })
    }
  }

  const body = await req.json().catch(() => ({}))
  if (body?.confirm !== CONFIRM) {
    return NextResponse.json({
      error: `Refused. Send only after TikTok approves the content sharing audit, with { "confirm": "${CONFIRM}" }.`,
    }, { status: 400 })
  }

  const { targets } = await audience()
  if (targets.length === 0) return NextResponse.json({ sent: 0, note: 'nobody eligible' })

  const admin = getSupabaseAdmin()
  let sent = 0
  const failed: string[] = []

  // Indexed loop: this repo compiles below es2015, so no for..of over iterators.
  for (let i = 0; i < targets.length; i++) {
    const t = targets[i]
    if (i > 0) await sleep(SEND_INTERVAL_MS)
    try {
      await sendMail({ to: t.email, subject: SUBJECT, html: tiktokLiveHtml(t.name, t.tiktokOnly) })
      // Recorded only after a successful send, so a failure stays eligible.
      const { error } = await admin.from('usage_events').insert({
        user_id: t.id,
        event_type: EVENT,
        metadata: { tiktok_only: t.tiktokOnly },
      })
      if (error) console.warn('[tiktok-live-email] usage_events insert failed:', t.email, error.message)
      sent++
    } catch (e: any) {
      failed.push(t.email)
      console.error('[tiktok-live-email] send failed:', t.email, e?.message)
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
