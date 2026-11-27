/**
 * Referral codes: the cookie that carries one to signup, and the lookups that
 * turn one back into a person.
 *
 * Codes are stored as generated, in lowercase: 8 letters and digits, or `ref_`
 * and 8 more (lib/partners.ts, /affiliate). Until Nov 27, 2026 the /refer/CODE
 * landing page and the /z/CODE ZENITH card looked codes up uppercased, so 288
 * of the 297 codes never matched and both pages were a 404 for nearly everyone,
 * the one active partner included. Every lookup goes through
 * referralCodeCandidates now.
 *
 * Pure, no imports, so it can be checked without the app running.
 */

/** Carries a referral to the auth callback, which credits it (lib/sign-in.ts). */
export const REFERRAL_COOKIE = 'sm_ref'

/** 60 days: /affiliates promises partners "a 60-day cookie window so late converts still count". */
export const REFERRAL_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 60

const CODE_PATTERN = /^[A-Za-z0-9_-]{3,40}$/

/**
 * The spellings a code may be stored under: as given, in lowercase and in
 * uppercase. Use with `.in('referral_code', ...)`. Empty for anything that
 * cannot be a code, so no lookup runs.
 */
export function referralCodeCandidates(raw: string | null | undefined): string[] {
  const code = (raw ?? '').trim()
  if (!CODE_PATTERN.test(code)) return []
  return Array.from(new Set([code, code.toLowerCase(), code.toUpperCase()]))
}

/**
 * The referral code a page view carries: `?ref=CODE` on any page (every link
 * the app hands out), or the /refer/CODE landing page, which used to set only a
 * 7-day cookie for onboarding's banner, so a visitor who left it and signed up
 * later was credited to no one. A `?ref=` value is taken as it comes, as it
 * always was.
 */
export function referralCodeFromUrl(url: { pathname: string; searchParams: URLSearchParams }): string | null {
  const fromQuery = url.searchParams.get('ref')
  if (fromQuery) return fromQuery
  const match = url.pathname.match(/^\/refer\/([^/]+)\/?$/)
  if (!match) return null
  let code: string
  try { code = decodeURIComponent(match[1]).trim() } catch { return null }
  return CODE_PATTERN.test(code) ? code : null
}
