// What each SOMA mode allows, and the mode a workspace has actually paid for.
//
// These numbers used to live in five places that disagreed: creating a project
// allowed Full Send 10 posts a day while generation capped it at 7, Autopilot's
// window was sold as 14 days and stored as up to 30, and editing a project
// accepted any field at all, mode included. The project form, the project
// routes, the generator and the Autopilot cron all read from here now.
//
// Pure: no imports, safe in the browser.

export type SomaMode = 'safe' | 'autopilot' | 'full_send'

export const SOMA_MODES: readonly SomaMode[] = ['safe', 'autopilot', 'full_send']

export interface SomaModeLimits {
  /** Posts per day, per platform. Full Send's 7 is the generator's real ceiling (lib/soma-schedule.ts). */
  postsPerDay: number
  /** How many days ahead one run fills. */
  windowDays: number
  /** Manual and Monday runs per month. Full Send's daily cron has its own cap of 30. */
  runsPerMonth: number
}

export const SOMA_MODE_LIMITS: Record<SomaMode, SomaModeLimits> = {
  safe:      { postsPerDay: 2, windowDays: 7,  runsPerMonth: 4 },
  autopilot: { postsPerDay: 5, windowDays: 14, runsPerMonth: 8 },
  full_send: { postsPerDay: 7, windowDays: 30, runsPerMonth: 12 },
}

/**
 * Platforms SOMA writes for. SOMA writes text, and TikTok takes video only:
 * lib/publish/index.ts refuses a text post to TikTok, so a TikTok row in a SOMA
 * project could only ever fail. Videos go out from TikTok Studio.
 */
export const SOMA_PLATFORMS = ['bluesky', 'twitter', 'mastodon', 'discord', 'telegram', 'linkedin'] as const

export function isSomaPlatform(platform: string): boolean {
  return (SOMA_PLATFORMS as readonly string[]).includes(platform)
}

export function isSomaMode(mode: unknown): mode is SomaMode {
  return typeof mode === 'string' && (SOMA_MODES as readonly string[]).includes(mode)
}

export interface SomaAddons {
  soma_autopilot_enabled?: boolean | null
  soma_full_send_enabled?: boolean | null
}

/**
 * The mode a workspace has paid for, given the mode a project asks for. The
 * Stripe webhook turns on both flags for Full Send and only the Autopilot flag
 * for Autopilot, and turns both off on cancel. So a Full Send project in an
 * Autopilot-only workspace runs as Autopilot, and anything unpaid runs as Safe:
 * drafts that wait for approval.
 */
export function effectiveSomaMode(requested: string | null | undefined, addons: SomaAddons | null | undefined): SomaMode {
  if (requested === 'full_send' && addons?.soma_full_send_enabled) return 'full_send'
  if ((requested === 'full_send' || requested === 'autopilot') && addons?.soma_autopilot_enabled) return 'autopilot'
  return 'safe'
}

export type PlatformSchedule = Record<string, { posts_per_day: number; days: number[] }>

const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6]

/**
 * Keeps only SOMA platforms, caps each platform's posts per day to the mode,
 * and keeps valid weekdays. Returns the capped schedule and the busiest
 * platform's count, which is what `soma_projects.posts_per_day` stores.
 */
export function capSchedule(
  platforms: string[],
  schedule: PlatformSchedule | null | undefined,
  mode: SomaMode,
  fallbackPerDay = 1,
): { schedule: PlatformSchedule; postsPerDay: number } {
  const max = SOMA_MODE_LIMITS[mode].postsPerDay
  const out: PlatformSchedule = {}
  let busiest = 0
  for (const platform of platforms) {
    if (!isSomaPlatform(platform)) continue
    const cfg = schedule?.[platform]
    const raw = Number(cfg?.posts_per_day ?? fallbackPerDay)
    const perDay = Math.min(Math.max(Number.isFinite(raw) ? Math.round(raw) : 1, 1), max)
    const days = Array.isArray(cfg?.days)
      ? Array.from(new Set(cfg!.days.filter(d => Number.isInteger(d) && d >= 0 && d <= 6))).sort((a, b) => a - b)
      : []
    out[platform] = { posts_per_day: perDay, days: days.length > 0 ? days : ALL_DAYS }
    if (perDay > busiest) busiest = perDay
  }
  return { schedule: out, postsPerDay: Math.max(busiest, 1) }
}
