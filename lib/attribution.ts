/**
 * Where a new account came from.
 *
 * This used to be captured only on /signup. Most people land on the homepage
 * or a blog post first and reach /signup by clicking through, so the referrer
 * /signup saw was socialmate.studio itself, which was thrown away. 85 of the
 * 125 external signups from Aug 17 to Oct 14, 2026 had no source at all,
 * including the whole mid-September spike.
 *
 * Now the first page anyone lands on records it (lib/attribution-client.ts),
 * the signup form copies it into the new account's metadata so an email
 * confirmed on another device still carries it, and app/auth/callback saves it.
 *
 * Pure, no imports, so it can be checked without the app running.
 */

export const ATTRIBUTION_COOKIES = {
  source:   'sm_utm_source',
  medium:   'sm_utm_medium',
  campaign: 'sm_utm_campaign',
  referrer: 'sm_referrer',
  landing:  'sm_landing',
} as const

/** Set once an account has been created in this browser, so capture stops. */
export const ATTRIBUTION_DONE_COOKIE = 'sm_attr_done'

export const ATTRIBUTION_MAX_AGE_SECONDS = 30 * 24 * 60 * 60

export type AttributionKey = keyof typeof ATTRIBUTION_COOKIES
export type Attribution = Partial<Record<AttributionKey, string>>

const KEYS = Object.keys(ATTRIBUTION_COOKIES) as AttributionKey[]

// Steps in our own sign-in and checkout flows, not places anyone came from.
const NOT_A_SOURCE = [
  /(^|\.)socialmate\.studio$/,
  /^localhost$/,
  /^127\.0\.0\.1$/,
  /(^|\.)supabase\.co$/,
  /^accounts\.google\.com$/,
  /(^|\.)stripe\.com$/,
]

export function isExternalReferrer(referrer: string): boolean {
  if (!referrer) return false
  try {
    const host = new URL(referrer).hostname.toLowerCase()
    return !!host && !NOT_A_SOURCE.some(re => re.test(host))
  } catch {
    return false
  }
}

/**
 * The cookies to set for this page view, given the ones already there.
 *
 * Referrer and landing page are first touch: once set they stay. A link tagged
 * with UTM parameters is a deliberate campaign click, so it replaces all three
 * earlier UTM values (with '' for any it does not carry, so a new source is
 * never paired with an old medium).
 */
export function firstTouchUpdates(existing: Attribution, page: { url: string; referrer: string }): Attribution {
  const out: Attribution = {}
  let url: URL
  try { url = new URL(page.url) } catch { return out }

  const source = url.searchParams.get('utm_source')
  if (source) {
    out.source   = source.slice(0, 100)
    out.medium   = (url.searchParams.get('utm_medium') ?? '').slice(0, 100)
    out.campaign = (url.searchParams.get('utm_campaign') ?? '').slice(0, 100)
  }
  if (!existing.referrer && isExternalReferrer(page.referrer)) out.referrer = page.referrer.slice(0, 300)
  if (!existing.landing) out.landing = url.pathname.slice(0, 200)
  return out
}

/** Attribution from any cookie getter (document.cookie or next/headers). Empty values are dropped. */
export function readAttribution(get: (name: string) => string | undefined): Attribution {
  const out: Attribution = {}
  for (const key of KEYS) {
    const raw = get(ATTRIBUTION_COOKIES[key])
    if (!raw) continue
    let value = raw
    try { value = decodeURIComponent(raw) } catch { /* keep it as it came */ }
    if (value) out[key] = value
  }
  return out
}

/** Cookie values win. The copy saved in the account's metadata at signup fills the gaps. */
export function mergeAttribution(fromCookies: Attribution, fromMetadata: unknown): Attribution {
  const meta = fromMetadata && typeof fromMetadata === 'object' ? fromMetadata as Record<string, unknown> : {}
  const out: Attribution = {}
  for (const key of KEYS) {
    const metaValue = typeof meta[key] === 'string' ? (meta[key] as string) : undefined
    const value = fromCookies[key] || metaValue
    if (value) out[key] = value
  }
  return out
}

/** "https://www.google.com/" gives "google.com". */
export function referrerHost(referrer?: string): string | undefined {
  if (!referrer) return undefined
  try { return new URL(referrer).hostname.replace(/^www\./, '') || undefined } catch { return undefined }
}

/**
 * Set on a new account's first sign-in when it first landed on a TikTok page,
 * so onboarding can lead with TikTok. The attribution cookies are deleted at
 * that same moment, and the landing page is only saved in a funnel event
 * written in the background, so onboarding has nothing else it can read in time.
 */
export const ONBOARDING_LEAD_COOKIE = 'sm_onboard_lead'
export const ONBOARDING_LEAD_MAX_AGE_SECONDS = 7 * 24 * 60 * 60

/**
 * Whether a first landing page is about TikTok. ChatGPT sends most new signups
 * to /for/tiktok-creators (7 of the 12 from Oct 15 to 23, 2026). The video
 * creators page counts too: TikTok is the only platform that takes their video.
 */
export function landedOnTiktok(landing?: string): boolean {
  if (!landing) return false
  const path = landing.split(/[?#]/)[0].toLowerCase().replace(/\/+$/, '')
  return path.includes('tiktok') || path === '/for/video-creators'
}
