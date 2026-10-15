/**
 * Whether this sign-in is the account's first one.
 *
 * Was "created less than 60 seconds ago". That holds for Google sign-up, but an
 * email account is created when the signup form is submitted, and the auth
 * callback runs when the confirmation link is clicked. Every email signup from
 * Aug 1 to Oct 14, 2026 that took longer than a minute to click it (7 people,
 * 61 to 182 seconds) was treated as a returning user: no signup_completed
 * event, no welcome email sequence, and their newsletter choice never saved.
 *
 * Nobody can sign in to an email account before confirming it, so a
 * confirmation in the last 15 minutes means this is the first sign-in.
 *
 * Pure, no imports.
 */
export function isFirstSignIn(
  user: { created_at: string; email_confirmed_at?: string | null },
  now: number = Date.now(),
): boolean {
  const created = Date.parse(user.created_at)
  if (Number.isFinite(created) && now - created < 60_000) return true
  if (!user.email_confirmed_at) return false
  const confirmed = Date.parse(user.email_confirmed_at)
  return Number.isFinite(confirmed) && now - confirmed >= 0 && now - confirmed < 15 * 60_000
}
