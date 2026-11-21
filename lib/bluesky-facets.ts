/**
 * Clickable links for Bluesky posts.
 *
 * Bluesky only makes a link clickable when the post record says where it is: a
 * "facet" giving the link's UTF-8 byte range and its target. Text alone is not
 * enough, and SocialMate's Bluesky posts never sent facets, so every link in
 * them (socialmate.studio included) was plain text in the Bluesky app until
 * Nov 2026. Bluesky's own example: bluesky-social/cookbook, python-bsky-post.
 *
 * Bare domains are linked too, as the Bluesky app does when you type one, but
 * only for the common TLDs below, so "Node.js" or "file.txt" stay text.
 */

export interface LinkFacet {
  index: { byteStart: number; byteEnd: number }
  features: { $type: 'app.bsky.richtext.facet#link'; uri: string }[]
}

const BARE_TLDS = [
  'com', 'net', 'org', 'io', 'co', 'app', 'dev', 'studio', 'ai', 'me', 'us', 'uk', 'ca', 'au',
  'de', 'fr', 'nl', 'gg', 'tv', 'xyz', 'shop', 'store', 'link', 'site', 'online', 'info', 'biz',
  'social', 'blog', 'news', 'live', 'world', 'pro', 'page', 'art', 'design', 'tech', 'fm',
]

// A link starts the text or follows whitespace or an opening bracket/quote.
// Group 2: a full http(s) URL. Group 3: a bare domain with an optional path.
const LINK_RE = /(^|[\s(\["'“‘])(https?:\/\/[^\s<>"]+|((?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,})(?:\/[^\s<>"]*)?)/gi

const TRAILING = /[.,!?;:'"’”]+$/

function trimEnd(url: string): string {
  let out = url.replace(TRAILING, '')
  // A closing bracket belongs to the link only when the link opened one,
  // as in Wikipedia URLs: https://en.wikipedia.org/wiki/Mercury_(planet)
  while (out.endsWith(')') && count(out, '(') < count(out, ')')) out = out.slice(0, -1).replace(TRAILING, '')
  return out
}

function count(s: string, ch: string): number {
  let n = 0
  for (let i = 0; i < s.length; i++) if (s[i] === ch) n++
  return n
}

function utf8Bytes(s: string): number {
  return new TextEncoder().encode(s).length
}

export interface TagFacet {
  index: { byteStart: number; byteEnd: number }
  features: { $type: 'app.bsky.richtext.facet#tag'; tag: string }[]
}

export type Facet = LinkFacet | TagFacet

// Bluesky's own hashtag rule, from @atproto/api's RichText.detectFacets: a #
// (or the full-width ＃) at the start or after whitespace, then a tag that is
// not all digits. Trailing punctuation is dropped and a tag is at most 64
// characters. Kept as a string so TypeScript leaves the Unicode classes alone.
const TAG_SOURCE =
  '(^|\\s)[#\\uFF03]((?!\\uFE0F)[^\\s\\u00AD\\u2060\\u200A\\u200B\\u200C\\u200D\\u20E2]*' +
  '[^\\d\\s\\p{P}\\u00AD\\u2060\\u200A\\u200B\\u200C\\u200D\\u20E2]+' +
  '[^\\s\\u00AD\\u2060\\u200A\\u200B\\u200C\\u200D\\u20E2]*)?'

/**
 * Tag facets for every hashtag in the text, in order. Until Nov 2026 Bluesky
 * posts carried link facets only, so a #hashtag sent from SocialMate showed as
 * plain text: not clickable, and not in Bluesky's tag search.
 */
export function tagFacets(text: string): TagFacet[] {
  const facets: TagFacet[] = []
  const re = new RegExp(TAG_SOURCE, 'gu')
  let m: RegExpExecArray | null
  while ((m = re.exec(text)) !== null) {
    if (m[0].length === 0) { re.lastIndex++; continue }
    const tag = (m[2] || '').trim().replace(new RegExp('\\p{P}+$', 'u'), '')
    if (!tag || tag.length > 64) continue
    const start = m.index + m[1].length
    const byteStart = utf8Bytes(text.slice(0, start))
    facets.push({
      index: { byteStart, byteEnd: byteStart + utf8Bytes(text.slice(start, start + 1 + tag.length)) },
      features: [{ $type: 'app.bsky.richtext.facet#tag', tag }],
    })
  }
  return facets
}

/** Every facet a post needs: its links, and its hashtags outside any link, in order. */
export function postFacets(text: string): Facet[] {
  const links = linkFacets(text)
  const insideLink = (f: TagFacet) =>
    links.some(l => f.index.byteStart < l.index.byteEnd && f.index.byteEnd > l.index.byteStart)
  const tags = tagFacets(text).filter(f => !insideLink(f))
  return [...links, ...tags].sort((a, b) => a.index.byteStart - b.index.byteStart)
}

/** Link facets for every link in the text, in order. */
export function linkFacets(text: string): LinkFacet[] {
  const facets: LinkFacet[] = []
  const re = new RegExp(LINK_RE.source, 'gi')
  let m: RegExpExecArray | null
  while ((m = re.exec(text)) !== null) {
    const lead = m[1]
    const raw = trimEnd(m[2])
    if (!raw) continue
    let uri = raw
    if (!/^https?:\/\//i.test(raw)) {
      const domain = (m[3] || '').toLowerCase()
      const tld = domain.slice(domain.lastIndexOf('.') + 1)
      // An email address is not a link: "me@shop.com" leaves "shop.com" after the @.
      const before = text.slice(0, m.index + lead.length)
      if (!BARE_TLDS.includes(tld) || /@$/.test(before)) continue
      uri = `https://${raw}`
    }
    try {
      new URL(uri)
    } catch {
      continue
    }
    const byteStart = utf8Bytes(text.slice(0, m.index + lead.length))
    facets.push({
      index: { byteStart, byteEnd: byteStart + utf8Bytes(raw) },
      features: [{ $type: 'app.bsky.richtext.facet#link', uri }],
    })
  }
  return facets
}
