import {
  ATTRIBUTION_COOKIES,
  ATTRIBUTION_DONE_COOKIE,
  ATTRIBUTION_MAX_AGE_SECONDS,
  firstTouchUpdates,
  readAttribution,
  type Attribution,
  type AttributionKey,
} from '@/lib/attribution'

// Browser half of lib/attribution.ts. Call only in the browser.

function getCookie(name: string): string | undefined {
  const hit = document.cookie.split('; ').find(c => c.startsWith(`${name}=`))
  return hit ? hit.slice(name.length + 1) : undefined
}

/** What this browser has recorded about where its visitor came from. */
export function readBrowserAttribution(): Attribution {
  return readAttribution(getCookie)
}

/** Record the source and landing page, once per browser, on whatever page loads first. */
export function captureFirstTouch(): void {
  try {
    // The cookie banner's Decline is honoured here.
    if (localStorage.getItem('cookie_consent') === 'declined') return
  } catch { /* storage blocked: carry on, these are first-party cookies */ }
  if (getCookie(ATTRIBUTION_DONE_COOKIE)) return

  const updates = firstTouchUpdates(readBrowserAttribution(), {
    url: window.location.href,
    referrer: document.referrer,
  })
  const secure = window.location.protocol === 'https:' ? ';Secure' : ''
  for (const [key, value] of Object.entries(updates)) {
    const name = ATTRIBUTION_COOKIES[key as AttributionKey]
    document.cookie = `${name}=${encodeURIComponent(value ?? '')};path=/;max-age=${ATTRIBUTION_MAX_AGE_SECONDS};SameSite=Lax${secure}`
  }
}
