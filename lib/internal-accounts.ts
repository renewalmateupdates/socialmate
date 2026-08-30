/**
 * Accounts that belong to us, not to customers.
 *
 * Every activation number this project has quoted since March has counted these.
 * "One user has ever published" was true only if you count
 * gilgameshenterprisellc@gmail.com — Joshua's own second account, which connected
 * Bluesky and Discord in March 2026, published seven posts over four days, and
 * stopped. Excluding the admin account alone was not enough, because the admin
 * account is only one of five.
 *
 * With these excluded, the real figure is that **no external user has ever
 * published a post**. That is a different problem from "one did", and it is the
 * number that should drive what gets built.
 *
 * Keep this list honest in both directions. Leaving a real customer in here
 * hides the only signal that matters; leaving one of ours out inflates every
 * ratio on /admin/funnel.
 */
export const INTERNAL_EMAILS: string[] = [
  'socialmatehq@gmail.com',          // admin / primary
  'gilgameshenterprisellc@gmail.com', // Mate Suite ops account
  'renewalmate.updates@gmail.com',    // Mate Suite ops account
  'googlereview@socialmate.studio',   // created for store review
  // Deliberately NOT here: nichole_bostic@yahoo.com. Confirmed Aug 30 to be
  // the founder's mother, who signed up when he showed her the product. A real
  // person on someone else's account is not an internal account, and listing
  // her here would hide a genuine signup. She counts as external, and her
  // record is a fair data point: 0 logins, onboarding never completed, nothing
  // connected. She did not stall at the connect step. She never came back.
]

const set = new Set(INTERNAL_EMAILS.map(e => e.toLowerCase()))

export function isInternalEmail(email: string | null | undefined): boolean {
  return !!email && set.has(email.toLowerCase())
}

/** Ids for the internal accounts present in a given id→email mapping. */
export function internalIdsFrom(rows: { id: string; email?: string | null }[]): Set<string> {
  return new Set(rows.filter(r => isInternalEmail(r.email)).map(r => r.id))
}
