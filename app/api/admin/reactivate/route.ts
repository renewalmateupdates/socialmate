import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { requireAdmin } from '@/lib/admin-auth'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { lifecycleEmail } from '@/lib/lifecycle-emails'

// One-shot reactivation for accounts that signed up and never connected a
// platform.
//
// These people are unreachable by anything else we have. onboardingSequence is
// triggered by the signup *event* and stops at day 7; comebackEmails watches
// login recency. The never-connected cohort has a median age of 63 days — they
// are long past both, and the day 1 nudge that should have caught them was
// itself broken (PR #554).
//
// GET  previews the audience. POST sends.
//
// Idempotency rides on usage_events, which already exists and takes a free-text
// event_type. Anyone with a 'reactivation_email' row is skipped, so a double
// POST cannot double-send. There is exactly one shot at a cold list; spending it
// twice would spend it badly.

const EVENT = 'reactivation_email'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://socialmate.studio'
// Below this, the signup drip still owns them and is now working.
const MIN_AGE_DAYS = 14

interface Target { id: string; email: string; name: string; ageDays: number }

// The honest version of this email is also the strongest one. They did not fail
// to set it up; the setup step gave up on them after 90 seconds while they were
// still in the other tab finishing.
//
// Extracted so the ?to= dry run renders exactly what the real send renders. Two
// copies of this string would diverge the first time one of them was edited.
function reactivationHtml(name: string): string {
  return lifecycleEmail({
    // Reads fine either way; the nameless version is the stronger opener.
    headline: name ? `${name}, that was our fault.` : 'That was our fault.',
    paragraphs: [
      'You signed up for SocialMate and never got a platform connected. I went looking for why, and it turns out the setup step was broken.',
      'It sent you off to another tab to connect your account, then stopped listening after ninety seconds. If you took longer than that, and almost everyone does, you came back to a page that had quietly given up, with no way to tell it you were done.',
      'That is fixed now. It waits properly, notices the moment you come back, and there is a button to make it check. Connecting takes about thirty seconds on Bluesky, Mastodon, Discord or Telegram, none of which need approval or a card.',
      'If you would rather tell me what else was wrong, reply to this. It goes to me and I read all of them.',
    ],
    ctaLabel: 'Connect a platform',
    ctaHref: `${APP_URL}/accounts`,
    footnote: 'One-off note about a bug that affected your account. You will not get a series of these.',
  })
}

async function audience(): Promise<{ targets: Target[]; alreadySent: number; tooNew: number }> {
  const admin = getSupabaseAdmin()
  const adminEmail = (process.env.ADMIN_EMAIL || 'socialmatehq@gmail.com').toLowerCase()

  const [{ data: authData }, connected, published, sent] = await Promise.all([
    admin.auth.admin.listUsers({ perPage: 1000 }),
    admin.from('connected_accounts').select('user_id'),
    admin.from('posts').select('user_id').eq('status', 'published'),
    admin.from('usage_events').select('user_id').eq('event_type', EVENT),
  ])

  const hasConnected = new Set((connected.data ?? []).map(r => r.user_id))
  const hasPublished = new Set((published.data ?? []).map(r => r.user_id))
  const hasBeenSent  = new Set((sent.data ?? []).map(r => r.user_id))

  const now = Date.now()
  const targets: Target[] = []
  let alreadySent = 0, tooNew = 0

  for (const u of authData?.users ?? []) {
    if (!u.email || u.email.toLowerCase() === adminEmail) continue
    if (hasConnected.has(u.id) || hasPublished.has(u.id)) continue
    if (hasBeenSent.has(u.id)) { alreadySent++; continue }

    const ageDays = Math.floor((now - new Date(u.created_at).getTime()) / 86_400_000)
    if (ageDays < MIN_AGE_DAYS) { tooNew++; continue }

    targets.push({
      id: u.id,
      email: u.email,
      // Deliberately blank rather than falling back to the email prefix.
      // 18 of the 60 have no full_name, and prefixes like "hajero1488" or
      // "sdknight2019" in the headline read as an obvious mail merge — which
      // undercuts an email whose whole premise is that someone looked into it.
      name: (u.user_metadata?.full_name as string | undefined)?.split(' ')[0]?.trim() || '',
      ageDays,
    })
  }
  return { targets, alreadySent, tooNew }
}

export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { targets, alreadySent, tooNew } = await audience()
  return NextResponse.json({
    wouldSend:  targets.length,
    alreadySent,
    tooNew,
    minAgeDays: MIN_AGE_DAYS,
    preview:    targets.slice(0, 20).map(t => ({ email: t.email, ageDays: t.ageDays })),
  })
}

export async function POST(req: Request) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const resendClient = new Resend(process.env.RESEND_API_KEY)

  // ── Dry run ───────────────────────────────────────────────────────────────
  // ?to=you@example.com sends one copy and records nothing. Use this before the
  // real send; there is no second attempt at the real one.
  const testTo = new URL(req.url).searchParams.get('to')
  if (testTo) {
    try {
      await resendClient.emails.send({
        from: 'Joshua @ SocialMate <joshua@socialmate.studio>',
        to: testTo,
        subject: '[TEST] That was our fault, and it is fixed',
        html: reactivationHtml(testTo.split('@')[0]),
      })
      return NextResponse.json({ test: true, sentTo: testTo, recorded: false })
    } catch (e: any) {
      return NextResponse.json({ test: true, error: e?.message ?? 'send failed' }, { status: 500 })
    }
  }

  const { targets } = await audience()
  if (targets.length === 0) return NextResponse.json({ sent: 0, note: 'nobody eligible' })

  const admin  = getSupabaseAdmin()
  const resend = resendClient
  let sent = 0
  const failed: string[] = []

  for (const t of targets) {
    const html = reactivationHtml(t.name)

    try {
      await resend.emails.send({
        from: 'Joshua @ SocialMate <joshua@socialmate.studio>',
        to: t.email,
        subject: 'That was our fault, and it is fixed',
        html,
      })
      // Record only after the send actually succeeded, so a failure leaves them
      // eligible for a retry rather than silently burning their one shot.
      await admin.from('usage_events').insert({
        user_id: t.id,
        event_type: EVENT,
        metadata: { age_days: t.ageDays },
      })
      sent++
    } catch (e: any) {
      failed.push(t.email)
      console.error('[reactivate] send failed:', t.email, e?.message)
    }
  }

  return NextResponse.json({ sent, failed: failed.length, failedEmails: failed.slice(0, 10) })
}
