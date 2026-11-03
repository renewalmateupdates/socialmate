// UTM link builder for /tools/utm-builder. Pure, so it can be tested
// (scripts/test-utm.mjs).
//
// Analytics tools read utm_source, utm_medium and utm_campaign from a link to
// say where a visit came from. Google Analytics 4 files a visit under Organic
// Social when utm_medium is "social" (among a few spellings), which is why the
// per-platform links below default to it.

export interface UtmFields {
  url: string
  source: string
  medium: string
  campaign: string
  term?: string
  content?: string
}

export interface UtmResult {
  url: string | null
  /** Why no link could be built, in words a person can act on. */
  error?: string
  /** Things that work but are likely mistakes. */
  warnings: string[]
}

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'] as const

/** Trims, lowercases when asked, and turns spaces into dashes, which read better than %20 in a report. */
export function cleanValue(value: string | undefined, lowercase = true): string {
  const v = (value ?? '').trim().replace(/\s+/g, '-')
  return lowercase ? v.toLowerCase() : v
}

export function normalizeUrl(raw: string): URL | null {
  const trimmed = raw.trim()
  if (!trimmed) return null
  const withScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
  try {
    const u = new URL(withScheme)
    if (u.protocol !== 'https:' && u.protocol !== 'http:') return null
    if (!u.hostname.includes('.') && u.hostname !== 'localhost') return null
    return u
  } catch {
    return null
  }
}

export function buildUtmUrl(fields: UtmFields, lowercase = true): UtmResult {
  const warnings: string[] = []
  const u = normalizeUrl(fields.url)
  if (!fields.url.trim()) return { url: null, error: 'Paste the page you want to link to.', warnings }
  if (!u) return { url: null, error: 'That does not look like a web address. Try something like https://example.com/page.', warnings }

  const values: Record<(typeof UTM_KEYS)[number], string> = {
    utm_source: cleanValue(fields.source, lowercase),
    utm_medium: cleanValue(fields.medium, lowercase),
    utm_campaign: cleanValue(fields.campaign, lowercase),
    utm_term: cleanValue(fields.term, lowercase),
    utm_content: cleanValue(fields.content, lowercase),
  }
  if (!values.utm_source) return { url: null, error: 'Add a source, like bluesky or newsletter.', warnings }

  // Replace any UTM values the link already carries; keep every other parameter and the #fragment.
  for (const key of UTM_KEYS) u.searchParams.delete(key)
  for (const key of UTM_KEYS) if (values[key]) u.searchParams.set(key, values[key])

  if (!values.utm_medium) warnings.push('Without a medium, most analytics tools file the visit under a generic channel. "social" is the usual choice for social posts.')
  if (!values.utm_campaign) warnings.push('A campaign name lets you compare one launch or promotion with another.')
  if (!lowercase && /[A-Z]/.test(Object.values(values).join(''))) {
    warnings.push('Analytics tools treat "Bluesky" and "bluesky" as two different sources. Keeping everything lowercase avoids split reports.')
  }
  return { url: u.toString(), warnings }
}

/** Sources for the platforms SocialMate posts to, one link each. */
export const PLATFORM_SOURCES: { id: string; label: string; source: string }[] = [
  { id: 'bluesky',  label: 'Bluesky',  source: 'bluesky' },
  { id: 'x',        label: 'X',        source: 'x' },
  { id: 'mastodon', label: 'Mastodon', source: 'mastodon' },
  { id: 'linkedin', label: 'LinkedIn', source: 'linkedin' },
  { id: 'discord',  label: 'Discord',  source: 'discord' },
  { id: 'telegram', label: 'Telegram', source: 'telegram' },
  { id: 'tiktok',   label: 'TikTok',   source: 'tiktok' },
]

export function linksPerPlatform(base: Omit<UtmFields, 'source'>, platformIds: string[], lowercase = true) {
  return PLATFORM_SOURCES.filter(p => platformIds.includes(p.id)).map(p => ({
    ...p,
    result: buildUtmUrl({ ...base, source: p.source }, lowercase),
  }))
}
