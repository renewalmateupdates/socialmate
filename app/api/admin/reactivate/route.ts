import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { requireAdmin } from '@/lib/admin-auth'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { lifecycleEmail } from '@/lib/lifecycle-emails'
import { isInternalEmail } from '@/lib/internal-accounts'

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

// Sixty-one sequential Resend round trips do not fit in Vercel's default 10s
// route budget. Without this the send truncates partway through with no error
// the caller ever sees — it just returns fewer than it should, or nothing.
// 60 is the ceiling on Hobby and well within Pro's, so it is safe either way.
export const maxDuration = 60

// Resend's free tier allows 2 requests/second. A tight await loop clears that
// easily and starts collecting 429s, which land in `failed` rather than being
// sent. 400ms keeps us under the limit with room, and 61 sends still finish in
// well under the budget above.
const SEND_INTERVAL_MS = 400
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

const EVENT = 'reactivation_email'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://socialmate.studio'
// Below this, the signup drip still owns them and is now working.
const MIN_AGE_DAYS = 14

interface Target { id: string; email: string; name: string; ageDays: number }

// The honest version of this email is also the strongest one.
//
// This copy was rewritten on Aug 30 because the previous version described the
// wrong bug. It blamed the 90-second connect poll (PR #558) and told people to
// go connect Bluesky, Mastodon, Discord or Telegram because those "take about
// thirty seconds".
//
// The funnel then recorded what actually happens. People do not time out at the
// connect step — they never click connect at all. One signup visited the connect
// screen three separate times across 25 minutes and clicked nothing. And those
// four platforms are the *hardest* four: they need an app password from another
// website, an instance address, a bot token, or a Discord server you administer.
// The only two that connect in a couple of clicks, TikTok and LinkedIn, were not
// even offered in onboarding (PR #587).
//
// So the old copy pointed a one-shot cold list at the worst possible path while
// apologising for something that was not the problem. There is exactly one
// attempt at this audience; it has to describe the real thing.
//
// Extracted so the ?to= dry run renders exactly what the real send renders. Two
// copies of this string would diverge the first time one of them was edited.
function reactivationHtml(name: string): string {
  return lifecycleEmail({
    // Reads fine either way; the nameless version is the stronger opener.
    headline: name ? `${name}, that was our fault.` : 'That was our fault.',
    paragraphs: [
      'You signed up for SocialMate and never got a platform connected. I went looking for why, and the setup step was the problem, not you.',
      'Two things were wrong with it. It sent you off to a separate page that listed every platform and had no memory of the one you had just picked, so you had to find it again yourself. And the two platforms that connect in a couple of clicks, TikTok and LinkedIn, were not even on the list you chose from.',
      'Both are fixed. Connecting now happens on the same screen instead of shipping you somewhere else, and the quick options are actually offered. Bluesky, Mastodon, Telegram and Discord are all still there, and setup now tells you up front what each one needs rather than letting you find out halfway through.',
      'If you would rather just tell me what else was wrong with it, reply to this. It comes straight to me and I read all of them.',
    ],
    ctaLabel: 'Pick up where you left off',
    // Onboarding, not /accounts. The fix is in the onboarding connect step;
    // /accounts is the page that was never the problem, and dropping someone
    // there is the exact handoff this email is apologising for.
    ctaHref: `${APP_URL}/onboarding`,
    footnote: 'One-off note about a bug that affected your account. You will not get a series of these.',
  })
}

async function audience(): Promise<{ targets: Target[]; alreadySent: number; tooNew: number }> {
  const admin = getSupabaseAdmin()

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
    // All five of our own accounts, not just the admin one. Three of them have
    // never connected a platform, so filtering on ADMIN_EMAIL alone meant this
    // one-shot send would have gone to Joshua three times.
    if (!u.email || isInternalEmail(u.email)) continue
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

  // Indexed loop, not `.entries()` — that returns an iterator, and this repo
  // compiles below es2015 downlevel, so for..of over it fails the build.
  for (let i = 0; i < targets.length; i++) {
    const t = targets[i]
    if (i > 0) await sleep(SEND_INTERVAL_MS)
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

  // Say what is left. Anyone who failed, or who never got reached because the
  // function ran out of budget, was never recorded and is still eligible — so
  // a plain re-POST picks up exactly the remainder and re-sends to nobody.
  const remaining = targets.length - sent
  return NextResponse.json({
    sent,
    failed: failed.length,
    failedEmails: failed.slice(0, 10),
    remaining,
    note: remaining > 0
      ? `${remaining} not sent. They were not recorded, so POST again to retry only those.`
      : 'All eligible targets sent.',
  })
}
