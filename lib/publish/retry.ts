// Which publish failures are worth trying again, and which are the post's fault.
//
// Until now every failure was terminal. A scheduled post that failed for any
// reason was written status='failed' and never touched again — the only recourse
// was a human noticing and clicking Retry. That is correct for "this text is a
// duplicate" and wrong for "the upstream API was briefly unavailable", and X has
// been serving the second kind steadily:
//
//   2026-08-24  24 published, 4 failed   "X post failed: credits depleted"
//   2026-08-25  22 published, 4 failed
//   2026-08-28  11 published, 2 failed
//
// Those failures sit between successes on the same account minutes apart, which
// is the definition of transient. Ten posts were silently dropped in five days.

export class RetryablePublishError extends Error {
  readonly retryable = true as const
  constructor(message: string) {
    super(message)
    this.name = 'RetryablePublishError'
  }
}

// Message patterns that mean "the platform was unwilling right now", for
// publishers that throw plain Errors. Deliberately conservative: anything not
// matched here is treated as terminal, because retrying a genuinely bad post
// just fails it four times instead of once.
const TRANSIENT_PATTERNS: RegExp[] = [
  /credits? depleted/i,          // X, app-level write credits exhausted
  /usage ?cap/i,                 // X monthly cap phrasing
  /rate limit/i,
  /too many requests/i,
  /\b429\b/,
  /\b5\d{2}\b(?!\d)/,            // upstream 5xx
  /service unavailable/i,
  /internal (server )?error/i,
  /timed? ?out/i,
  /timeout/i,
  /ECONNRESET|ETIMEDOUT|ENOTFOUND|EAI_AGAIN|socket hang up/i,
  /temporarily (paused|unavailable)/i,
  /try again later/i,
]

// Patterns that look transient but are not, checked first. "Rate limit" inside
// a message that also says the account is suspended is not going to clear on a
// ten minute backoff.
const TERMINAL_OVERRIDES: RegExp[] = [
  /duplicate/i,
  /suspended/i,
  /not permitted/i,
  /reconnect your/i,          // token expired — needs a human, retrying can't fix it
  /no .* account connected/i,
  /is not yet available/i,
  /only supports video/i,
]

export function isRetryablePublishError(err: unknown): boolean {
  if (err instanceof RetryablePublishError) return true
  const message = err instanceof Error ? err.message : String(err ?? '')
  if (!message) return false
  if (TERMINAL_OVERRIDES.some(re => re.test(message))) return false
  return TRANSIENT_PATTERNS.some(re => re.test(message))
}

// How long to wait before attempt N+1, and how many attempts to allow.
//
// Three retries over roughly an hour. Long enough for a short upstream window to
// clear, short enough that a post still goes out near the time it was scheduled
// for rather than tomorrow. After that it fails for real and the human sees it.
export const MAX_PUBLISH_ATTEMPTS = 4
const BACKOFF_MINUTES = [10, 20, 40]

export function retryDelayMs(attemptsSoFar: number): number {
  const idx = Math.min(Math.max(attemptsSoFar - 1, 0), BACKOFF_MINUTES.length - 1)
  return BACKOFF_MINUTES[idx] * 60 * 1000
}
