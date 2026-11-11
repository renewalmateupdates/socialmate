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
