import { inngest } from '@/lib/inngest'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { Resend } from 'resend'
import { lifecycleEmail } from '@/lib/lifecycle-emails'

function getResend() { return new Resend(process.env.RESEND_API_KEY) }

const APP_URL     = process.env.NEXT_PUBLIC_APP_URL || 'https://socialmate.studio'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'socialmatehq@gmail.com'
const FROM        = 'Joshua @ SocialMate <joshua@socialmate.studio>'

const DAY_MS = 86_400_000

// Days after a user's last published post that we reach out.
const NUDGE_DAY = 10
const LAST_DAY  = 21

// comebackEmails (lib/inngest.ts) fires on login recency at exactly these
// marks. We check the same numbers so nobody gets two of my emails in one day.
const COMEBACK_DAYS = [7, 14, 30]

// ─────────────────────────────────────────────────────────────────────────────
// Stopped Posting — daily 3pm UTC
//
// The segment nothing covered. onboardingSequence drips on a signup timer and
// stops at day 7; comebackEmails watches whether you *log in*. Neither notices
// the user who publishes for three weeks and then goes quiet, which is the one
// worth catching — they got far enough to see the value, so something specific
// stopped them.
//
// Anchored on last published_at, not created_at: a queue full of scheduled
// posts is not the same as a person who is still active, and posts.created_at
// was NULL for SOMA rows until PR #534 anyway.
// ─────────────────────────────────────────────────────────────────────────────
export const stoppedPostingEmails = inngest.createFunction(
  { id: 'stopped-posting-emails', name: 'Stopped Posting Re-engagement', retries: 1 },
  { cron: '0 15 * * *' },
  async ({ step }) => {
    const now = Date.now()

    // Latest publish per user, over a bounded window.
    //
    // The window is not an optimisation, it is a correctness requirement.
    // PostgREST silently caps a response at 1000 rows, so an unbounded
    // "newest first" scan quietly stops partway and users whose latest post
    // falls past the cutoff look like they never published at all. Asking only
    // for the last WINDOW_DAYS keeps the result small enough to be complete.
    //
    // It is also exactly the data we need: anyone whose most recent post
    // predates the window is already past the day 21 touchpoint, so we would
    // not write to them regardless.
    const WINDOW_DAYS = LAST_DAY + 7
    const since = new Date(now - WINDOW_DAYS * DAY_MS).toISOString()

    const lastPublished = await step.run('map-last-published', async () => {
      const { data, error } = await getSupabaseAdmin()
        .from('posts')
        .select('user_id, published_at')
        .eq('status', 'published')
        .not('published_at', 'is', null)
        .gte('published_at', since)
        .order('published_at', { ascending: false })
        .limit(1000)

      if (error) throw new Error(`last-published lookup failed: ${error.message}`)

      const latest: Record<string, string> = {}
      for (const row of data ?? []) {
        // Rows arrive newest first, so the first hit per user is their latest.
        if (row.user_id && !latest[row.user_id]) latest[row.user_id] = row.published_at
      }
      return latest
    })

    const targets = await step.run('segment-users', async () => {
      const { data } = await getSupabaseAdmin().auth.admin.listUsers({ perPage: 1000 })

      const out: { email: string; name: string; daysQuiet: number; step: 'nudge' | 'last' }[] = []
      for (const u of data?.users ?? []) {
        if (!u.email || u.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) continue

        const last = lastPublished[u.id]
        if (!last) continue // never published — onboardingSequence owns them

        const daysQuiet = Math.floor((now - new Date(last).getTime()) / DAY_MS)
        if (daysQuiet !== NUDGE_DAY && daysQuiet !== LAST_DAY) continue

        // Don't stack on top of a comeback email going out the same day.
        if (u.last_sign_in_at) {
          const daysSinceLogin = Math.floor((now - new Date(u.last_sign_in_at).getTime()) / DAY_MS)
          if (COMEBACK_DAYS.includes(daysSinceLogin)) continue
        }

        out.push({
          email: u.email,
          name: (u.user_metadata?.full_name as string | undefined)?.split(' ')[0] || u.email.split('@')[0],
          daysQuiet,
          step: daysQuiet === NUDGE_DAY ? 'nudge' : 'last',
        })
      }
      return out
    })

    if (targets.length === 0) return { nudge: 0, last: 0 }

    const sent = await step.run('send', async () => {
      const resend = getResend()
      let nudge = 0
      let last  = 0

      for (const t of targets) {
        const html = t.step === 'nudge'
          ? lifecycleEmail({
              headline: `${t.name}, your last post went out ${t.daysQuiet} days ago.`,
              paragraphs: [
                'Not a guilt trip. You already did the hard part, which is publishing something at all. Momentum is just the part that slips when the week gets loud.',
                'The fastest way back in is one post, scheduled now, going out tomorrow. Everything you set up is still exactly where you left it.',
              ],
              panel: {
                label: 'Three minutes, tops',
                lines: [
                  'Write a post and let the AI hooks tighten it',
                  'Pick your platforms once, publish to all seven',
                  'Or let SOMA draft the week and just approve it',
                ],
              },
              ctaLabel: 'Schedule one post',
              ctaHref: `${APP_URL}/compose`,
            })
          : lifecycleEmail({
              headline: 'Three weeks quiet. What stopped you?',
              paragraphs: [
                `It has been ${t.daysQuiet} days since your last post went out, and this is the last time I will bring it up.`,
                'I would rather know what got in the way than keep sending nudges. If something was broken, confusing, or just not worth the effort, reply to this email and tell me. I read every one of these myself and it genuinely changes what I build next.',
                'And if you want to pick it back up, your account is untouched.',
              ],
              ctaLabel: 'Open your dashboard',
              ctaHref: `${APP_URL}/dashboard`,
              footnote: 'This is the last automated note you will get about going quiet.',
            })

        try {
          await resend.emails.send({
            from: FROM,
            to: t.email,
            subject: t.step === 'nudge'
              ? 'Your queue is empty'
              : 'What stopped you?',
            html,
          })
          if (t.step === 'nudge') nudge++
          else last++
        } catch { /* non-fatal, one bad address must not stop the batch */ }
      }

      return { nudge, last }
    })

    return sent
  }
)
