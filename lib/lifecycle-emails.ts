import { getSupabaseAdmin } from '@/lib/supabase-admin'

// Shared pieces for behaviour-driven lifecycle email.
//
// The distinction that matters here: onboardingSequence fires off a signup
// *event* and drips on a timer, so it has never known whether the person it is
// writing to actually did the thing it is congratulating them for. That is how
// we ended up telling users who never connected an account that they "connected
// your accounts, and then... life happened".
//
// Everything in this file reads real state at send time instead.

// ── Instrument-system email shell ─────────────────────────────────────────────
// Literal hex, not tokens: email clients do not support CSS custom properties.
// Values mirror app/globals.css so mail matches the app.
const VOID  = '#0D0B0A'
const PANEL = '#161311'
const EDGE  = '#2C2622'
const INK_HIGH  = '#F7F3EF'
const INK_BODY  = '#D6CFC7'
const INK_MUTED = '#9A9089'
const INK_FAINT = '#8A7F76'
const GOLD        = '#D4A017'
const GOLD_BRIGHT = '#EAC020'

export interface EmailPanel {
  label: string
  lines: string[]
}

export function lifecycleEmail(opts: {
  headline: string
  paragraphs: string[]
  panel?: EmailPanel
  ctaLabel: string
  ctaHref: string
  signoff?: string
  footnote?: string
}): string {
  const { headline, paragraphs, panel, ctaLabel, ctaHref } = opts
  const signoff  = opts.signoff ?? 'Joshua, Founder of SocialMate'
  const footnote = opts.footnote ?? 'Reply "unsubscribe" and I will take you off these.'

  const body = paragraphs
    .map(p => `<p style="font-size:15px;color:${INK_BODY};line-height:1.7;margin:0 0 16px;">${p}</p>`)
    .join('')

  const panelHtml = panel
    ? `<div style="background:${PANEL};border:1px solid ${EDGE};border-radius:12px;padding:20px;margin:12px 0 28px;">
         <p style="font-size:12px;color:${INK_FAINT};font-weight:700;text-transform:uppercase;letter-spacing:1.4px;margin:0 0 14px;">${panel.label}</p>
         ${panel.lines.map((l, i) => `<p style="font-size:14px;color:${INK_BODY};line-height:1.5;margin:0 0 ${i === panel.lines.length - 1 ? '0' : '10'}px;"><span style="color:${GOLD};font-weight:700;">&#8250;</span> ${l}</p>`).join('')}
       </div>`
    : ''

  return `<div style="background:${VOID};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:580px;margin:0 auto;padding:40px 24px;color:${INK_HIGH};">
    <div style="margin-bottom:32px;">
      <span style="font-weight:900;font-size:18px;color:${INK_HIGH};letter-spacing:-0.5px;">SocialMate</span>
    </div>
    <h1 style="font-size:24px;font-weight:800;color:${INK_HIGH};margin:0 0 16px;letter-spacing:-0.5px;line-height:1.25;">${headline}</h1>
    ${body}
    ${panelHtml}
    <a href="${ctaHref}" style="display:inline-block;background:linear-gradient(180deg,${GOLD_BRIGHT} 0%,${GOLD} 100%);color:#1A1206;font-size:14px;font-weight:800;padding:14px 28px;border-radius:12px;text-decoration:none;margin-bottom:28px;">${ctaLabel}</a>
    <p style="font-size:13px;color:${INK_MUTED};margin:0;">${signoff}</p>
    <p style="font-size:11px;color:${INK_FAINT};margin-top:16px;">${footnote}</p>
  </div>`
}

// ── Activation state ──────────────────────────────────────────────────────────

export interface ActivationState {
  userId:       string | null
  hasConnected: boolean
  hasPublished: boolean
}

const UNKNOWN: ActivationState = { userId: null, hasConnected: false, hasPublished: false }

// Resolve a user id from an email. onboardingSequence's event payload carries
// only { email, firstName }, and runs already in flight when this deploys will
// never gain a userId — Inngest replays them with their original event data. So
// the lookup has to work from email alone.
export async function resolveUserId(email: string): Promise<string | null> {
  try {
    const admin = getSupabaseAdmin()
    const { data } = await admin.auth.admin.listUsers({ perPage: 1000 })
    const match = (data?.users ?? []).find(u => u.email?.toLowerCase() === email.toLowerCase())
    return match?.id ?? null
  } catch {
    return null
  }
}

// What has this user actually done? Used to decide which email to send, or
// whether to send one at all.
//
// Fails open to "unknown" (all false) rather than throwing. A lookup failure
// must not break a drip that is otherwise fine; callers that would send the
// wrong thing on bad data check `userId` before branching.
export async function getActivationState(email: string, knownUserId?: string): Promise<ActivationState> {
  const userId = knownUserId ?? await resolveUserId(email)
  if (!userId) return UNKNOWN

  try {
    const admin = getSupabaseAdmin()
    const [connected, published] = await Promise.all([
      admin.from('connected_accounts').select('id').eq('user_id', userId).limit(1),
      admin.from('posts').select('id').eq('user_id', userId).eq('status', 'published').limit(1),
    ])
    return {
      userId,
      hasConnected: (connected.data?.length ?? 0) > 0,
      hasPublished: (published.data?.length ?? 0) > 0,
    }
  } catch {
    return { ...UNKNOWN, userId }
  }
}
