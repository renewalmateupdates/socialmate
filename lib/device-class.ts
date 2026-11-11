/**
 * Phone, tablet or desktop, and the in-app browser if there is one, read from
 * the user agent. Coarse on purpose: it answers "does this fail on phones?" and
 * nothing more.
 *
 * Added Nov 11, 2026. TikTok, LinkedIn and X sign-ins came back without their
 * state cookie 5 times in 45 days, most likely on phones where the platform's
 * app hands the sign-in back to a different browser, and a Nov 9 TikTok Studio
 * user failed twice in a row. No funnel event said which device any of it was.
 * Pure, so it can be tested without a browser.
 */

export type DeviceClass = 'phone' | 'tablet' | 'desktop'

export function deviceClass(userAgent: string, maxTouchPoints = 0): DeviceClass {
  // iPadOS 13 and later reports itself as a Mac; only the touch points tell.
  if (/iPad/.test(userAgent) || (/Macintosh/.test(userAgent) && maxTouchPoints > 1)) return 'tablet'
  // Android phones say "Mobile"; Android tablets don't.
  if (/Android/.test(userAgent) && !/Mobile/.test(userAgent)) return 'tablet'
  if (/Mobi|iPhone|iPod|Android/.test(userAgent)) return 'phone'
  return 'desktop'
}

/** The app whose built-in browser opened the page, when its user agent says so. */
export function inAppBrowser(userAgent: string): string | null {
  if (/musical_ly|BytedanceWebview|TikTok/i.test(userAgent)) return 'tiktok'
  if (/Instagram/.test(userAgent)) return 'instagram'
  if (/FBAN|FBAV|FB_IAB/.test(userAgent)) return 'facebook'
  if (/LinkedInApp/.test(userAgent)) return 'linkedin'
  if (/Snapchat/.test(userAgent)) return 'snapchat'
  return null
}
