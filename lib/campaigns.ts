// Campaign mode: a set of messages that rotates through chosen days and times
// until an end date.
//
// The rules live on the campaign row; lib/campaign-run.ts turns the next week
// of them into ordinary scheduled posts. Everything here is a pure function
// with no imports, so scripts/test-campaigns.mjs can load it without a build.
//
// Times are wall-clock times in the campaign's own time zone. "Mondays at
// 10:00" stays 10:00 across a daylight-saving change, which a fixed UTC offset
// would not.

export const CAMPAIGN_PLATFORMS = ['bluesky', 'mastodon', 'discord', 'telegram', 'linkedin', 'twitter'] as const
export type CampaignPlatform = typeof CAMPAIGN_PLATFORMS[number]

// X charges per post, so it is Pro and up everywhere else in the app too.
export const PAID_ONLY_PLATFORMS: string[] = ['twitter']

export const MAX_NAME_CHARS     = 80
export const MAX_MESSAGES       = 20
export const MAX_MESSAGE_CHARS  = 2000
export const MAX_TIMES          = 4
export const MAX_WEEKS          = 26
/** How many AI rewrites each message gets when rewording is on. */
export const VARIANTS_PER_MESSAGE = 6
/** How far ahead a campaign's posts are made. */
export const TOP_UP_DAYS        = 7

// The longest post each platform takes, for telling the model how short to write.
export const PLATFORM_CHAR_LIMITS: Record<string, number> = {
  twitter:  280,
  bluesky:  300,
  mastodon: 500,
  discord:  2000,
  linkedin: 3000,
  telegram: 4096,
}

export interface CampaignMessage {
  text:       string
  variants?:  string[]
  image_url?: string | null
}

export interface CampaignSchedule {
  days:       number[]
  times:      string[]
  timezone:   string
  start_date: string
  end_date:   string
}

export interface CleanCampaign extends CampaignSchedule {
  name:      string
  platforms: CampaignPlatform[]
  messages:  CampaignMessage[]
}

const DAY_MS  = 86_400_000
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

// ── Dates and time zones ─────────────────────────────────────────────────────

export function isValidTimeZone(tz: unknown): tz is string {
  if (typeof tz !== 'string' || !tz) return false
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: tz })
    return true
  } catch {
    return false
  }
}

function isValidDay(day: unknown): day is string {
  if (typeof day !== 'string' || !DATE_RE.test(day)) return false
  const [y, m, d] = day.split('-').map(Number)
  const t = new Date(Date.UTC(y, m - 1, d))
  return t.getUTCFullYear() === y && t.getUTCMonth() === m - 1 && t.getUTCDate() === d
}

/** The calendar day ('YYYY-MM-DD') it is at this instant in this time zone. */
export function localDayKey(at: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(at)
  const get = (type: string) => parts.find(p => p.type === type)?.value ?? ''
  return `${get('year')}-${get('month')}-${get('day')}`
}

/** How far ahead of UTC this time zone is at this instant, in ms. */
function zoneOffsetMs(at: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone, hourCycle: 'h23',
    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit',
  }).formatToParts(at)
  const get = (type: string) => Number(parts.find(p => p.type === type)?.value)
  const asUtc = Date.UTC(get('year'), get('month') - 1, get('day'), get('hour') % 24, get('minute'), get('second'))
  return asUtc - Math.floor(at.getTime() / 1000) * 1000
}

/** The instant a wall-clock time on a calendar day happens in this time zone. */
export function zonedTimeToUtc(day: string, time: string, timeZone: string): Date {
  const [y, m, d] = day.split('-').map(Number)
  const [hh, mm]  = time.split(':').map(Number)
  const wall      = Date.UTC(y, m - 1, d, hh, mm)
  const first     = wall - zoneOffsetMs(new Date(wall), timeZone)
  // Near a daylight-saving change the offset at the guess can differ from the
  // offset at the answer; one correction settles it.
  const second    = wall - zoneOffsetMs(new Date(first), timeZone)
  return new Date(second)
}

function addDays(day: string, n: number): string {
  const [y, m, d] = day.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d) + n * DAY_MS).toISOString().slice(0, 10)
}

function weekday(day: string): number {
  const [y, m, d] = day.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay()
}

function daysBetween(a: string, b: string): number {
  const [y1, m1, d1] = a.split('-').map(Number)
  const [y2, m2, d2] = b.split('-').map(Number)
  return Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / DAY_MS)
}

// ── Slots ────────────────────────────────────────────────────────────────────

export interface CampaignSlot {
  at:      Date
  /** Position among every slot the campaign will ever have, from its first. Drives the rotation. */
  ordinal: number
}

/**
 * The campaign's slots that fall after `after` and no later than `until`.
 *
 * The whole campaign is walked from its first day so each slot's ordinal is
 * the same on every run. That is what keeps the rotation stable when posts are
 * made a week at a time. A campaign is at most 26 weeks of at most 4 times a
 * day, so the walk is never more than 728 slots.
 */
export function campaignSlots(schedule: CampaignSchedule, after: Date, until: Date): CampaignSlot[] {
  const days  = new Set(schedule.days)
  const times = [...schedule.times].sort()
  const out: CampaignSlot[] = []
  let ordinal = 0
  const span = daysBetween(schedule.start_date, schedule.end_date)
  for (let i = 0; i <= span; i++) {
    const day = addDays(schedule.start_date, i)
    if (!days.has(weekday(day))) continue
    for (const time of times) {
      const at = zonedTimeToUtc(day, time, schedule.timezone)
      if (at > after && at <= until) out.push({ at, ordinal })
      ordinal++
    }
  }
  return out
}

/**
 * What a slot posts. Messages take turns; each time the list comes round
 * again the next version is used, starting with the message as written.
 */
export function pickContent(messages: CampaignMessage[], ordinal: number): {
  messageIndex: number
  variantIndex: number
  text:         string
  imageUrl:     string | null
} {
  const messageIndex = ordinal % messages.length
  const message      = messages[messageIndex]
  const versions     = [message.text, ...(message.variants ?? [])]
  const variantIndex = Math.floor(ordinal / messages.length) % versions.length
  return { messageIndex, variantIndex, text: versions[variantIndex], imageUrl: message.image_url ?? null }
}

/** Slots per week, for the summary line and the plan-limit warning. */
export function postsPerWeek(schedule: Pick<CampaignSchedule, 'days' | 'times'>): number {
  return schedule.days.length * schedule.times.length
}

// ── Validation ───────────────────────────────────────────────────────────────

function isHttpUrl(s: unknown): s is string {
  if (typeof s !== 'string') return false
  try {
    const u = new URL(s)
    return u.protocol === 'https:' || u.protocol === 'http:'
  } catch {
    return false
  }
}

/**
 * Checks a campaign as submitted and returns a clean copy, or the first thing
 * wrong with it in words the form can show.
 */
export function validateCampaign(
  input: unknown,
  ctx: { today: string; paidPlan: boolean; connected: string[] },
): { ok: true; value: CleanCampaign } | { ok: false; error: string } {
  const b = (input ?? {}) as Record<string, unknown>

  const name = typeof b.name === 'string' ? b.name.trim() : ''
  if (!name) return { ok: false, error: 'Give the campaign a name.' }
  if (name.length > MAX_NAME_CHARS) return { ok: false, error: `Keep the name under ${MAX_NAME_CHARS} characters.` }

  const platforms = Array.isArray(b.platforms) ? Array.from(new Set(b.platforms.filter((p): p is string => typeof p === 'string'))) : []
  if (!platforms.length) return { ok: false, error: 'Pick at least one platform.' }
  for (const p of platforms) {
    if (!(CAMPAIGN_PLATFORMS as readonly string[]).includes(p)) return { ok: false, error: `Campaigns can't post to ${p} yet.` }
    if (!ctx.connected.includes(p)) return { ok: false, error: `Connect ${p} on the Accounts page first.` }
    if (PAID_ONLY_PLATFORMS.includes(p) && !ctx.paidPlan) return { ok: false, error: 'Posting to X needs the Pro plan.' }
  }

  const days = Array.isArray(b.days) ? Array.from(new Set(b.days.filter((d): d is number => Number.isInteger(d) && (d as number) >= 0 && (d as number) <= 6))).sort() : []
  if (!days.length) return { ok: false, error: 'Pick at least one day of the week.' }

  const times = Array.isArray(b.times) ? Array.from(new Set(b.times.filter((t): t is string => typeof t === 'string' && TIME_RE.test(t)))).sort() : []
  if (!times.length) return { ok: false, error: 'Pick at least one time of day.' }
  if (times.length > MAX_TIMES) return { ok: false, error: `Pick up to ${MAX_TIMES} times a day.` }

  if (!isValidTimeZone(b.timezone)) return { ok: false, error: 'Your time zone could not be read. Reload the page and try again.' }

  const start = b.start_date
  const end   = b.end_date
  if (!isValidDay(start) || !isValidDay(end)) return { ok: false, error: 'Pick a start date and an end date.' }
  if (start < ctx.today) return { ok: false, error: 'The start date is in the past.' }
  if (end < start) return { ok: false, error: 'The end date is before the start date.' }
  if (daysBetween(start, end) > MAX_WEEKS * 7) return { ok: false, error: `A campaign can run for up to ${MAX_WEEKS} weeks.` }

  const rawMessages = Array.isArray(b.messages) ? b.messages : []
  const messages: CampaignMessage[] = []
  for (const m of rawMessages) {
    const r    = (m ?? {}) as Record<string, unknown>
    const text = typeof r.text === 'string' ? r.text.trim() : ''
    if (!text) continue
    if (text.length > MAX_MESSAGE_CHARS) return { ok: false, error: `Each message has to be under ${MAX_MESSAGE_CHARS} characters.` }
    messages.push({ text, image_url: isHttpUrl(r.image_url) ? r.image_url : null })
  }
  if (!messages.length) return { ok: false, error: 'Write at least one message.' }
  if (messages.length > MAX_MESSAGES) return { ok: false, error: `A campaign can hold up to ${MAX_MESSAGES} messages.` }

  return {
    ok: true,
    value: {
      name,
      platforms: platforms as CampaignPlatform[],
      days, times,
      timezone: b.timezone as string,
      start_date: start, end_date: end,
      messages,
    },
  }
}

// ── Checking AI rewrites ─────────────────────────────────────────────────────

const URL_RE   = /https?:\/\/[^\s)]+/g
const PRICE_RE = /[$€£]\s?\d[\d,]*(?:\.\d+)?/g

/**
 * Keeps a rewrite only if it says nothing the original did not: every link and
 * price in the original, no link or price that was not, and short enough for
 * every platform the campaign posts to. The model writes the words; it does not
 * get to change a link or a price.
 */
export function acceptRewrite(original: string, rewrite: unknown, maxChars: number): string | null {
  if (typeof rewrite !== 'string') return null
  const text = rewrite.trim()
  if (!text || text.length > maxChars) return null
  if (text.toLowerCase() === original.trim().toLowerCase()) return null
  const same = (re: RegExp) => {
    const a = new Set(original.match(re) ?? [])
    const b = new Set(text.match(re) ?? [])
    return a.size === b.size && Array.from(a).every(x => b.has(x))
  }
  if (!same(URL_RE) || !same(PRICE_RE)) return null
  return text
}

/** The shortest post any of these platforms takes. */
export function charLimitFor(platforms: string[]): number {
  return Math.min(...platforms.map(p => PLATFORM_CHAR_LIMITS[p] ?? 500))
}

// ── Shopify import ───────────────────────────────────────────────────────────

/** The store's origin from whatever was typed: 'shop.example.com', a product link, anything with the host in it. */
export function normalizeStoreUrl(raw: unknown): string | null {
  if (typeof raw !== 'string' || !raw.trim()) return null
  const withScheme = /^https?:\/\//i.test(raw.trim()) ? raw.trim() : `https://${raw.trim()}`
  try {
    const u = new URL(withScheme)
    if (u.protocol !== 'https:' && u.protocol !== 'http:') return null
    if (!u.hostname.includes('.')) return null
    return `https://${u.hostname.toLowerCase()}`
  } catch {
    return null
  }
}

export interface ShopProduct {
  title:     string
  price:     string
  url:       string
  image_url: string | null
}

function formatPrice(raw: unknown): string | null {
  const n = Number(raw)
  if (!Number.isFinite(n) || n <= 0) return null
  return Number.isInteger(n) ? `$${n}` : `$${n.toFixed(2)}`
}

/**
 * Products from a Shopify store's public products.json, newest first. Leaves
 * out anything nobody can buy: no variant available, or a price of zero.
 * Images are asked for at 800px so they stay under Bluesky's 1MB limit.
 */
export function parseShopifyProducts(body: unknown, origin: string): ShopProduct[] {
  const products = (body as { products?: unknown[] })?.products
  if (!Array.isArray(products)) return []
  const out: ShopProduct[] = []
  for (const raw of products) {
    const p = raw as {
      title?: string; handle?: string
      variants?: { price?: string; available?: boolean }[]
      images?: { src?: string }[]
    }
    if (!p?.title || !p.handle) continue
    const variants = Array.isArray(p.variants) ? p.variants : []
    const buyable  = variants.filter(v => v?.available !== false)
    const price    = formatPrice(buyable[0]?.price)
    if (!buyable.length || !price) continue
    let image: string | null = null
    const src = p.images?.[0]?.src
    if (src) {
      try {
        const u = new URL(src)
        u.searchParams.set('width', '800')
        image = u.toString()
      } catch { image = null }
    }
    out.push({ title: p.title.trim(), price, url: `${origin}/products/${p.handle}`, image_url: image })
  }
  return out
}

/** The starting text for a product, before the user edits it. */
export function productMessage(p: ShopProduct): string {
  return `${p.title}, ${p.price}\n\n${p.url}`
}
