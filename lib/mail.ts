import { Resend } from 'resend'

/**
 * One place that sends mail, so replies reach a human.
 *
 * socialmate.studio has no mailbox. Its MX record points at
 * `inbound-smtp.us-east-1.amazonaws.com` — Resend's inbound infrastructure —
 * and nothing in this repo handles inbound mail. So a reply to
 * `joshua@socialmate.studio` reaches nobody.
 *
 * Meanwhile 53 send sites across the codebase send *from* that address and
 * exactly two of them set `replyTo`. Several of those emails explicitly ask for
 * a reply: the reactivation letter says "reply to this, it comes straight to me
 * and I read all of them", the feedback and enterprise flows invite an answer,
 * and the lifecycle drip asks people what is not working.
 *
 * Every one of those replies has been silently discarded. It is the same shape
 * as every other bug found this month — the feature looks like it works, and
 * quietly does nothing, and nobody finds out because the failure is invisible
 * from our side.
 *
 * REPLY_TO is a real mailbox that is actually read. Use `sendMail` rather than
 * calling `resend.emails.send` directly; it applies the default while still
 * letting a caller override it (partner applications reply to the applicant).
 */
export const REPLY_TO = process.env.REPLY_TO_EMAIL || 'socialmatehq@gmail.com'

export const FROM_JOSHUA = 'Joshua @ SocialMate <joshua@socialmate.studio>'

let client: Resend | null = null
function resend(): Resend {
  // Lazy, so importing this module does not require the key at build time.
  if (!client) client = new Resend(process.env.RESEND_API_KEY)
  return client
}

export interface SendMailOpts {
  to: string | string[]
  subject: string
  html: string
  from?: string
  /** Defaults to REPLY_TO. Pass an address to override, never pass '' to skip. */
  replyTo?: string
}

export async function sendMail(opts: SendMailOpts) {
  return resend().emails.send({
    from: opts.from ?? FROM_JOSHUA,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
    replyTo: opts.replyTo ?? REPLY_TO,
  })
}
