/**
 * One request for the same JSON, however many components ask for it.
 *
 * Every app page renders its own <Sidebar />, and the sidebar is mounted twice
 * (the phone drawer, which only slides off screen, and the desktop rail). Each
 * copy fetched the X quota, SOMA credits, pending approvals and the unread
 * count on mount, and polled notifications every minute, so one open tab sent
 * about ten requests per page change and four a minute while it sat in the
 * background. On Nov 19, 2026 the two notification polls were Vercel's two
 * busiest routes (about 2,000 calls each in 12 hours, two thirds of all Active
 * CPU), and Vercel paused the Hobby team for CPU that day.
 *
 * Callers that ask for the same URL within `maxAgeMs` share one request and
 * its answer, including across page changes, since this module stays loaded
 * between client-side navigations. A failed request resolves to null, the
 * same as an error response, and is asked again once `maxAgeMs` has passed.
 */

type Entry = { at: number; promise: Promise<unknown> }

const entries = new Map<string, Entry>()

export function fetchJsonShared<T = unknown>(url: string, maxAgeMs: number): Promise<T | null> {
  const now = Date.now()
  const hit = entries.get(url)
  if (hit && now - hit.at < maxAgeMs) return hit.promise as Promise<T | null>

  const promise: Promise<T | null> = fetch(url)
    .then(res => (res.ok ? (res.json() as Promise<T>) : null))
    .catch(() => null)
  entries.set(url, { at: now, promise })
  return promise
}

/** Forget a cached answer, so the next ask goes to the server (after marking notifications read, say). */
export function forgetShared(url: string): void {
  entries.delete(url)
}
