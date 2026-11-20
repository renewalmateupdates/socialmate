/**
 * One sign-in check per page load, shared by every caller (Nov 20, 2026).
 *
 * `supabase.auth.getUser()` is a network request to Supabase Auth, and the
 * browser client runs them one at a time behind its auth lock. A single load
 * of /accounts made nine of them back to back (the theme, language and
 * workspace providers, the sidebar, and the page's own effects), about 0.9 s
 * on a desktop connection before the first query for the page's own data could
 * start, and far longer on a phone.
 *
 * `shareUserCheck` wraps the client's getUser so that callers arriving while a
 * check is in flight share it, and a definite answer (a signed-in user) is kept
 * for a short while. A failed or signed-out answer is never kept, so the next
 * caller asks again. lib/supabase.ts applies it in the browser only; a server
 * never shares one answer between requests.
 *
 * No imports, so scripts/test-shared-user.mjs can load it on its own.
 */

type UserCheck = { data: { user: { id: string } | null } | null; error: unknown }

export function shareUserCheck<R extends UserCheck>(
  fetchUser: (jwt?: string) => Promise<R>,
  options: { keepMs?: number; now?: () => number } = {},
) {
  const keepMs = options.keepMs ?? 60_000
  const now = options.now ?? (() => Date.now())

  let pending: Promise<R> | null = null
  let kept: { at: number; result: R } | null = null
  // Bumped by forget(), so an answer that was in flight when the user signed
  // out (or changed) is handed to its callers but never kept.
  let generation = 0

  function getUser(jwt?: string): Promise<R> {
    // A caller checking a specific token wants that token checked.
    if (jwt) return fetchUser(jwt)
    if (kept && now() - kept.at < keepMs) return Promise.resolve(kept.result)
    if (pending) return pending

    const asked = generation
    const request: Promise<R> = fetchUser().then(
      result => {
        if (asked === generation && !result.error && result.data?.user) {
          kept = { at: now(), result }
        }
        if (pending === request) pending = null
        return result
      },
      error => {
        if (pending === request) pending = null
        throw error
      },
    )
    pending = request
    return request
  }

  function forget() {
    generation++
    kept = null
    pending = null
  }

  /** The id of the user currently kept, if any. */
  function keptUserId(): string | null {
    return kept?.result.data?.user?.id ?? null
  }

  return { getUser, forget, keptUserId }
}
