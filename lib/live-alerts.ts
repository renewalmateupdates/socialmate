// Go-live alerts: when a Twitch channel starts streaming, post to the
// creator's connected platforms.
//
// Pure logic with no imports, so the settings page can use it in the browser
// and scripts/test-live-alerts.mjs can load it without a build. The Twitch API
// calls are in lib/twitch.ts, and the webhook signature check is in
// lib/twitch-verify.ts because it needs node:crypto.

export const DEFAULT_TEMPLATE = '{name} is live on Twitch: {title}\n\n{url}'
export const MAX_TEMPLATE_CHARS = 500
/** A stream that drops and restarts gets a new id; this keeps it to one alert. */
export const COOLDOWN_MINUTES = 30
/**
 * Shown from the moment an alert asks Twitch to subscribe until Twitch calls
 * our webhook to confirm it. If it never clears, the webhook is not reachable.
 */
export const WAITING_NOTE = 'Waiting for Twitch to confirm this channel. This usually takes a few seconds; reload to check.'

export interface AlertVars {
  name:  string
  title: string
  game:  string
  url:   string
}

const PLACEHOLDER = /\{(name|title|game|url)\}/g

/**
 * Fills {name}, {title}, {game} and {url}. On a line where a field came out
 * empty (a stream with no title), the spacing and the dangling ':' or ',' it
 * leaves are tidied; every other line is kept exactly as written.
 */
export function renderAlert(template: string, vars: AlertVars): string {
  return template
    .split('\n')
    .map(line => {
      let emptied = false
      const filled = line.replace(PLACEHOLDER, (_, key: keyof AlertVars) => {
        const value = (vars[key] ?? '').trim()
        if (!value) emptied = true
        return value
      })
      if (!emptied) return filled.trimEnd()
      return filled.replace(/[ \t]{2,}/g, ' ').replace(/\s+([:,.!?])/g, '$1').replace(/[:,\-–]\s*$/, '').trim()
    })
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

/** A Twitch login from whatever was typed: 'name', '@name', or a twitch.tv link. */
export function normalizeTwitchLogin(raw: unknown): string | null {
  if (typeof raw !== 'string') return null
  let s = raw.trim()
  const link = s.match(/twitch\.tv\/([A-Za-z0-9_]+)/i)
  if (link) s = link[1]
  s = s.replace(/^@/, '').toLowerCase()
  return /^[a-z0-9_]{3,25}$/.test(s) ? s : null
}

export function validateTemplate(raw: unknown): { ok: true; template: string } | { ok: false; error: string } {
  const template = typeof raw === 'string' && raw.trim() ? raw.trim() : DEFAULT_TEMPLATE
  if (template.length > MAX_TEMPLATE_CHARS) return { ok: false, error: `Keep the message under ${MAX_TEMPLATE_CHARS} characters.` }
  return { ok: true, template }
}

/**
 * The platforms an alert may post to: ones SocialMate can post text to on its
 * own (`allowed`), that this person has connected, and X only on a paid plan.
 */
export function checkAlertPlatforms(
  raw: unknown,
  ctx: { allowed: readonly string[]; connected: string[]; paidPlan: boolean; paidOnly: string[] },
): { ok: true; platforms: string[] } | { ok: false; error: string } {
  const platforms = Array.isArray(raw) ? Array.from(new Set(raw.filter((p): p is string => typeof p === 'string'))) : []
  if (!platforms.length) return { ok: false, error: 'Pick at least one place to post the alert.' }
  for (const p of platforms) {
    if (!ctx.allowed.includes(p)) return { ok: false, error: `Alerts can't post to ${p} yet.` }
    if (!ctx.connected.includes(p)) return { ok: false, error: `Connect ${p} on the Accounts page first.` }
    if (ctx.paidOnly.includes(p) && !ctx.paidPlan) return { ok: false, error: 'Posting to X needs the Pro plan.' }
  }
  return { ok: true, platforms }
}

/**
 * Whether a stream start should post. Never twice for one stream, and never
 * within the cooldown of the last alert.
 */
export function shouldAlert(
  last: { last_stream_id: string | null; last_alert_at: string | null },
  streamId: string,
  now: Date,
): boolean {
  if (last.last_stream_id && last.last_stream_id === streamId) return false
  if (last.last_alert_at && now.getTime() - new Date(last.last_alert_at).getTime() < COOLDOWN_MINUTES * 60_000) return false
  return true
}
