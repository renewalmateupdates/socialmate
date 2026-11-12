import { lifecycleEmail } from '@/lib/lifecycle-emails'
import { isInternalEmail } from '@/lib/internal-accounts'

/**
 * A one-off email to people who connected TikTok and never posted a video.
 *
 * Why it exists (Nov 11, 2026): 58 people outside the team had TikTok connected
 * and 56 of them had never posted to it, 45 of those after the Oct 23 "public
 * posting is live" email. No outside Studio post had gone through since Oct 23,
 * and the Nov 9 attempts left no error to read. #784 and #785 started saving the
 * error and the device, and on Nov 11 a 7.8 MB video (the size that failed on
 * Nov 9) posted from Studio on a desktop. Phones are still unproven, so the
 * email asks people to reply if it fails and claims nothing about phones.
 *
 * The audience and the HTML live here, apart from the route, so tests can
 * check who gets it and what it says.
 */

export const FIRST_POST_EVENT = 'tiktok_first_post_email'
/** Recorded by the Oct 23 send. Its recipients were told "you will not get a series of these". */
export const OCT23_EVENT = 'tiktok_live_email'
export const FIRST_POST_CONFIRM = 'send the tiktok first post email'
export const FIRST_POST_SUBJECT = 'Your first TikTok from SocialMate takes about two minutes'

export interface FirstPostTarget {
  id: string
  email: string
  name: string
  gotOct23: boolean
}

export interface FirstPostAudienceInput {
  users: { id: string; email?: string | null; user_metadata?: Record<string, unknown> | null }[]
  /** Users with a TikTok row in connected_accounts right now. */
  tiktokConnectedIds: string[]
  /** Users with any TikTok post that didn't fail: published, scheduled or sent to drafts. */
  tiktokUsedIds: string[]
  /** Users who already got this email. */
  alreadySentIds: string[]
  /** Users who got the Oct 23 email. */
  oct23Ids: string[]
}

export interface FirstPostAudience {
  targets: FirstPostTarget[]
  alreadySent: number
  alreadyPosted: number
}

function idSet(ids: string[]): Record<string, true> {
  const s: Record<string, true> = {}
  for (let i = 0; i < ids.length; i++) s[ids[i]] = true
  return s
}

/**
 * Outside accounts with TikTok connected now that never posted to it and
 * haven't had this email. Someone who disconnected (the Nov 9 user did) is left
 * out: the email tells them their TikTok is connected.
 */
export function firstPostAudience(input: FirstPostAudienceInput): FirstPostAudience {
  const connected = idSet(input.tiktokConnectedIds)
  const used = idSet(input.tiktokUsedIds)
  const sent = idSet(input.alreadySentIds)
  const oct23 = idSet(input.oct23Ids)

  const targets: FirstPostTarget[] = []
  let alreadySent = 0
  let alreadyPosted = 0
  for (let i = 0; i < input.users.length; i++) {
    const u = input.users[i]
    if (!u.email || isInternalEmail(u.email) || !connected[u.id]) continue
    if (used[u.id]) { alreadyPosted++; continue }
    if (sent[u.id]) { alreadySent++; continue }
    const fullName = u.user_metadata?.full_name
    targets.push({
      id: u.id,
      email: u.email,
      // Blank rather than the email prefix: a handle in the headline reads as a mail merge.
      name: typeof fullName === 'string' ? (fullName.trim().split(/\s+/)[0] || '') : '',
      gotOct23: !!oct23[u.id],
    })
  }
  return { targets, alreadySent, alreadyPosted }
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

/** One function, so the ?to= test copy renders exactly what the real send renders. */
export function firstPostEmailHtml(name: string, gotOct23: boolean, appUrl: string): string {
  const first = escapeHtml(name.trim())
  return lifecycleEmail({
    headline: first ? `${first}, your TikTok is connected and ready.` : 'Your TikTok is connected and ready.',
    paragraphs: [
      "You connected TikTok to SocialMate but haven't posted a video yet, so here's the short version.",
      'Open TikTok Studio, add a video, write a caption, and press Post now or pick a time. The free plan includes 20 TikTok videos a month.',
      'If anything goes wrong, reply to this email. It comes straight to me, and SocialMate now saves the error, so I can see what happened and fix it.',
    ],
    ctaLabel: 'Post a TikTok video',
    ctaHref: `${appUrl}/tiktok/studio`,
    footnote: gotOct23
      ? "You're getting this because you connected TikTok to SocialMate and haven't posted yet. It's the only follow-up to our October note. Reply \"unsubscribe\" and you won't get notes like this."
      : "A one-off note because you connected TikTok to SocialMate and haven't posted yet. Reply \"unsubscribe\" and you won't get notes like this.",
  })
}
