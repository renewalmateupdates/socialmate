// Twitch Helix and EventSub calls for go-live alerts.
//
// Everything here uses an app access token (client credentials), so a creator
// never has to connect Twitch: a public channel name is enough, and stream.online
// is a public event Twitch sends for any channel.
//
// One EventSub subscription per channel serves every SocialMate alert on it.
// Twitch answers a second subscribe for the same channel with 409, and the
// existing one is reused.

import { createHash } from 'node:crypto'

const HELIX = 'https://api.twitch.tv/helix'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://socialmate.studio'
export const EVENTSUB_CALLBACK = `${APP_URL}/api/twitch/eventsub`

let cached: { token: string; expiresAt: number } | null = null

async function appToken(force = false): Promise<string> {
  if (!force && cached && cached.expiresAt > Date.now() + 60_000) return cached.token
  const res = await fetch('https://id.twitch.tv/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id:     process.env.TWITCH_CLIENT_ID ?? '',
      client_secret: process.env.TWITCH_CLIENT_SECRET ?? '',
      grant_type:    'client_credentials',
    }),
    signal: AbortSignal.timeout(8000),
  })
  if (!res.ok) throw new Error(`Twitch token request failed (${res.status})`)
  const data = await res.json() as { access_token: string; expires_in: number }
  cached = { token: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 }
  return cached.token
}

async function helix(path: string, init: RequestInit = {}): Promise<Response> {
  const call = async (token: string) => fetch(`${HELIX}${path}`, {
    ...init,
    headers: {
      'Client-Id':     process.env.TWITCH_CLIENT_ID ?? '',
      Authorization:   `Bearer ${token}`,
      'Content-Type':  'application/json',
      ...(init.headers ?? {}),
    },
    signal: AbortSignal.timeout(8000),
  })
  let res = await call(await appToken())
  // A token Twitch has revoked early: get a fresh one once.
  if (res.status === 401) res = await call(await appToken(true))
  return res
}

/**
 * The secret Twitch signs our EventSub messages with. Derived from the client
 * secret already in the environment, so this needs no new setting, and it
 * changes if that secret is ever rotated.
 */
export function eventsubSecret(): string {
  return createHash('sha256').update(`${process.env.TWITCH_CLIENT_SECRET ?? ''}:socialmate-eventsub`).digest('hex')
}

export function twitchConfigured(): boolean {
  return !!process.env.TWITCH_CLIENT_ID && !!process.env.TWITCH_CLIENT_SECRET
}

export interface TwitchUser { id: string; login: string; display_name: string }

export async function lookupTwitchUser(login: string): Promise<TwitchUser | null> {
  const res = await helix(`/users?login=${encodeURIComponent(login)}`)
  if (!res.ok) throw new Error(`Twitch user lookup failed (${res.status})`)
  const data = await res.json() as { data?: TwitchUser[] }
  return data.data?.[0] ?? null
}

/** The channel's current title and category. Reliable the moment a stream starts, unlike /streams. */
export async function channelInfo(broadcasterId: string): Promise<{ title: string; game: string } | null> {
  const res = await helix(`/channels?broadcaster_id=${encodeURIComponent(broadcasterId)}`)
  if (!res.ok) return null
  const data = await res.json() as { data?: { title?: string; game_name?: string }[] }
  const c = data.data?.[0]
  return c ? { title: c.title ?? '', game: c.game_name ?? '' } : null
}

/**
 * Subscribes to stream.online for a channel, or finds the subscription it
 * already has. `fresh` means Twitch is about to send its confirmation call;
 * a reused subscription reports its current status instead.
 */
export async function ensureStreamOnlineSub(broadcasterId: string): Promise<{ id: string; fresh: boolean; status: string }> {
  const res = await helix('/eventsub/subscriptions', {
    method: 'POST',
    body: JSON.stringify({
      type:      'stream.online',
      version:   '1',
      condition: { broadcaster_user_id: broadcasterId },
      transport: { method: 'webhook', callback: EVENTSUB_CALLBACK, secret: eventsubSecret() },
    }),
  })
  if (res.ok) {
    const data = await res.json() as { data?: { id: string; status?: string }[] }
    const sub = data.data?.[0]
    if (sub?.id) return { id: sub.id, fresh: true, status: sub.status ?? 'webhook_callback_verification_pending' }
    throw new Error('Twitch accepted the subscription but sent no id')
  }
  if (res.status === 409) {
    const existing = await findStreamOnlineSub(broadcasterId)
    if (existing) return { ...existing, fresh: false }
  }
  const detail = await res.text().catch(() => '')
  throw new Error(`Twitch subscription failed (${res.status}) ${detail.slice(0, 200)}`)
}

async function findStreamOnlineSub(broadcasterId: string): Promise<{ id: string; status: string } | null> {
  const res = await helix(`/eventsub/subscriptions?type=stream.online&user_id=${encodeURIComponent(broadcasterId)}`)
  if (!res.ok) return null
  const data = await res.json() as { data?: { id: string; status: string; transport?: { callback?: string } }[] }
  const mine = (data.data ?? []).find(s => s.transport?.callback === EVENTSUB_CALLBACK && s.status !== 'authorization_revoked')
  return mine ? { id: mine.id, status: mine.status } : null
}

export async function deleteSub(id: string): Promise<void> {
  const res = await helix(`/eventsub/subscriptions?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
  if (!res.ok && res.status !== 404) throw new Error(`Twitch unsubscribe failed (${res.status})`)
}
