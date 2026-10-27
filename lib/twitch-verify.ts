// The EventSub webhook signature check. Server only: it needs node:crypto,
// which is why it is not in lib/live-alerts.ts with the rest of the alert logic.

import { createHmac, timingSafeEqual } from 'node:crypto'

/** Twitch signs every message with a timestamp; older ones are refused as replays. */
export const MAX_MESSAGE_AGE_MS = 10 * 60 * 1000

/**
 * Checks that an EventSub message really came from Twitch: an HMAC-SHA256 of
 * message id + timestamp + raw body with our secret, and a recent timestamp.
 */
export function verifyTwitchMessage(
  headers: { id: string | null; timestamp: string | null; signature: string | null },
  rawBody: string,
  secret: string,
  now: Date,
): boolean {
  const { id, timestamp, signature } = headers
  if (!id || !timestamp || !signature || !secret) return false
  const sent = Date.parse(timestamp)
  if (!Number.isFinite(sent) || Math.abs(now.getTime() - sent) > MAX_MESSAGE_AGE_MS) return false
  const expected = 'sha256=' + createHmac('sha256', secret).update(id + timestamp + rawBody).digest('hex')
  const a = Buffer.from(expected)
  const b = Buffer.from(signature)
  return a.length === b.length && timingSafeEqual(a, b)
}
