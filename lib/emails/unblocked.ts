import { lifecycleEmail } from '@/lib/lifecycle-emails'

/**
 * The note to the accounts PR #610 unblocked.
 *
 * Lives here rather than inside the route so the preview script and the real
 * send render the same bytes. Two copies of an email body diverge the first
 * time one of them is edited, and the one that gets edited is never the one
 * that gets reviewed.
 */

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://socialmate.studio'

export const UNBLOCKED_SUBJECT = 'That one was on us, and it is fixed'

const PLATFORM_LABEL: Record<string, string> = {
  bluesky: 'Bluesky', discord: 'Discord', telegram: 'Telegram', mastodon: 'Mastodon',
  twitter: 'X', tiktok: 'TikTok', linkedin: 'LinkedIn', pinterest: 'Pinterest',
}

/** "17 April" reads as though a person looked. "138 days" reads as a merge field. */
function longDate(iso: string): string {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })
}

export function unblockedHtml(t: { name: string; platform: string; since: string }): string {
  const platform = PLATFORM_LABEL[t.platform] ?? t.platform
  const has = platform ? 'your ' + platform + ' account' : 'an account'

  // Only for people stuck long enough that naming the date lands. For someone
  // who signed up this morning it would read as strange.
  const stuckSince = t.since && (Date.now() - new Date(t.since).getTime()) > 14 * 86_400_000
    ? ' Yours has been sitting like that since ' + longDate(t.since) + '.'
    : ''

  const stillThere = platform
    ? 'Your ' + platform + ' connection is still there, exactly as you left it.'
    : 'Your connection is still there.'

  return lifecycleEmail({
    headline: t.name ? t.name + ', that one was on us.' : 'That one was on us.',
    paragraphs: [
      'You connected ' + has + ' to SocialMate. It worked. Then the app put you back on the setup screen and left you there, which is not what connecting an account is supposed to do.',
      'Finishing setup was meant to be marked the moment a connection succeeded, and it never was. So the app kept treating you as though you had not started yet, and there was no way through it from your side.' + stuckSince,
      'That is fixed now, and your account is already past it. ' + stillThere + ' Sign in and you go straight to your dashboard.',
      'If anything else is broken, reply to this. It comes to me directly and I read all of them.',
    ],
    ctaLabel: 'Open your dashboard',
    // The dashboard, not /onboarding. Sending them back to the screen that
    // trapped them would be a poor joke.
    ctaHref: APP_URL + '/dashboard',
    footnote: 'A one off note about a bug that affected your account. You will not get a series of these.',
  })
}
