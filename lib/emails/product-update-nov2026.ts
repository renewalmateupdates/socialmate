import { lifecycleEmail } from '@/lib/lifecycle-emails'
import { isInternalEmail } from '@/lib/internal-accounts'
import { PLAN_AI_CREDITS, PLAN_POST_LIMITS, PLAN_PRICES } from '@/lib/plan'

/**
 * The November 2026 update to everyone with a SocialMate account.
 *
 * Why it exists (Nov 16, 2026): 58 people outside the team signed in during the
 * last 30 days, 24 of them never connected an account and 4 published anything.
 * The two earlier emails (Oct 23, Nov 11) told people about a feature and got
 * nobody posting. This one says what changed, sets expectations, and asks one
 * question whose replies come straight to Joshua.
 *
 * Every claim in it was checked against the live app on Nov 16: the short
 * sidebar, Compose opening in Simple mode, Bulk as a Compose tab, video reaching
 * X, LinkedIn and Bluesky (four real posts that weekend), the X reconnect
 * (media.write) and the two new free tools. The plan numbers come from
 * lib/plan.ts so the email can't drift from the pricing page.
 *
 * The audience and the HTML live here, apart from the route, so tests can check
 * who gets it and what it says.
 */

export const UPDATE_EVENT = 'product_update_nov2026_email'
/** Recorded for anyone who replies "unsubscribe" to a note like this one. Every send skips them. */
export const UNSUBSCRIBED_EVENT = 'email_unsubscribed'
export const UPDATE_CONFIRM = 'send the november update email'
export const UPDATE_SUBJECT = 'What changed in SocialMate, and one question for you'

export interface UpdateTarget {
  id: string
  email: string
  name: string
}

export interface UpdateAudienceInput {
  users: {
    id: string
    email?: string | null
    email_confirmed_at?: string | null
    user_metadata?: Record<string, unknown> | null
  }[]
  /** Users who already got this email. */
  alreadySentIds: string[]
  /** Users who asked to stop getting these. */
  unsubscribedIds: string[]
}

export interface UpdateAudience {
  targets: UpdateTarget[]
  /** Outside accounts with an email, confirmed or not: the "people have signed up" number. */
  signups: number
  alreadySent: number
  unsubscribed: number
  unconfirmed: number
}

function idSet(ids: string[]): Record<string, true> {
  const s: Record<string, true> = {}
  for (let i = 0; i < ids.length; i++) s[ids[i]] = true
  return s
}

/**
 * Outside accounts with a confirmed email that haven't had this email and
 * haven't asked to stop. An unconfirmed address never proved it belongs to the
 * person who typed it, so it gets nothing.
 */
export function updateAudience(input: UpdateAudienceInput): UpdateAudience {
  const sent = idSet(input.alreadySentIds)
  const unsub = idSet(input.unsubscribedIds)

  const targets: UpdateTarget[] = []
  let signups = 0
  let alreadySent = 0
  let unsubscribed = 0
  let unconfirmed = 0
  for (let i = 0; i < input.users.length; i++) {
    const u = input.users[i]
    if (!u.email || isInternalEmail(u.email)) continue
    signups++
    if (unsub[u.id]) { unsubscribed++; continue }
    if (!u.email_confirmed_at) { unconfirmed++; continue }
    if (sent[u.id]) { alreadySent++; continue }
    const fullName = u.user_metadata?.full_name
    targets.push({
      id: u.id,
      email: u.email,
      // Blank rather than the email prefix: a handle in the headline reads as a mail merge.
      name: typeof fullName === 'string' ? (fullName.trim().split(/\s+/)[0] || '') : '',
    })
  }
  return { targets, signups, alreadySent, unsubscribed, unconfirmed }
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

/** One function, so the ?to= test copy renders exactly what the real send renders. */
export function updateEmailHtml(name: string, signups: number, appUrl: string): string {
  const first = escapeHtml(name.trim())
  const link = `color:#EAC020;text-decoration:underline;`
  return lifecycleEmail({
    headline: first ? `${first}, here's where SocialMate stands.` : "Here's where SocialMate stands.",
    paragraphs: [
      "It's Joshua, the person building SocialMate. You signed up at some point this year, so here's an honest update on where things stand.",
      `SocialMate is still just me: no investors and no ad budget, built at night after my day job in tree service. ${signups} people have signed up so far. The free plan is ${PLAN_POST_LIMITS.free} posts and ${PLAN_AI_CREDITS.free} AI credits a month, no card. Pro is $${PLAN_PRICES.pro.monthly} a month, and no price changes are planned.`,
    ],
    panel: {
      label: 'What changed',
      lines: [
        'The sidebar is short now: Dashboard, Compose, Schedule, Drafts, TikTok Studio, Accounts, Notifications and Settings. Everything else is under More tools. Press + to pin a tool, or Customize to choose your own.',
        'Schedule has the Calendar and the List in one place. The Calendar opens on today and has a week view.',
        'Compose opens in Simple mode. Switch to Full for threads, A/B tests, hashtag sets, templates and repeating posts. The AI writing tools are together in one Write with AI menu.',
        'Bulk is a tab in Compose. Download the CSV template, fill in a month of posts and upload it.',
        'Videos now post to X, LinkedIn and Bluesky, not just TikTok.',
        'If you use X, reconnect it once on the Accounts page so it can upload images and video.',
        'Two new free tools: a quote card maker and an image resizer.',
      ],
    },
    afterPanel: [
      "<strong>What's next.</strong> For the next month I'm fixing and polishing what's already here, not adding new features. YouTube is waiting on Google's review. Instagram, Facebook and Threads are not coming soon: Meta's app review is a long road for a one-person company.",
      `If you'd rather see all of this than read about it, there's a <a href="${appUrl}/#demo" style="${link}">4-minute demo</a> on the homepage.`,
      "One question, and I read every reply: <strong>what's the one thing stopping you from using SocialMate every week?</strong> Just hit reply, even if it's one line.",
    ],
    ctaLabel: 'Open SocialMate',
    ctaHref: `${appUrl}/dashboard`,
    footnote: "You're getting this because you have a SocialMate account. Reply \"unsubscribe\" and you won't get notes like this.",
  })
}
