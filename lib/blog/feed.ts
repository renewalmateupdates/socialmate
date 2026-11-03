// The blog's RSS 2.0 feed. Pure so it can be tested
// (scripts/test-blog-feed.mjs): app/blog/feed.xml/route.ts gathers the posts
// and this turns them into XML.
//
// Why a feed: feed readers, newsletter tools and aggregators pick posts up from
// it, and SocialMate's own RSS import can read it, so the blog can be shared
// with the product it describes.

export interface FeedItem {
  slug: string
  title: string
  description: string
  category?: string | null
  date: Date
}

const SITE = 'https://socialmate.studio'

/** Escapes text for an XML element or attribute. */
export function xmlEscape(text: string): string {
  return text
    // Characters XML 1.0 forbids outright; a stray one would break the whole feed.
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFE\uFFFF]/g, '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/** Newest first, one entry per slug, at most `limit`. Invalid dates sink to the end. */
export function prepareItems(items: FeedItem[], limit = 50): FeedItem[] {
  const seen = new Set<string>()
  const time = (d: Date) => (Number.isNaN(d.getTime()) ? -Infinity : d.getTime())
  return items
    .filter(i => i.slug && i.title)
    .sort((a, b) => time(b.date) - time(a.date) || a.slug.localeCompare(b.slug))
    .filter(i => (seen.has(i.slug) ? false : (seen.add(i.slug), true)))
    .slice(0, limit)
}

export function buildFeed(items: FeedItem[], now: Date = new Date()): string {
  const entries = items.map(i => {
    const url = `${SITE}/blog/${encodeURIComponent(i.slug)}`
    const date = Number.isNaN(i.date.getTime()) ? now : i.date
    return [
      '    <item>',
      `      <title>${xmlEscape(i.title)}</title>`,
      `      <link>${url}</link>`,
      `      <guid isPermaLink="true">${url}</guid>`,
      `      <pubDate>${date.toUTCString()}</pubDate>`,
      i.category ? `      <category>${xmlEscape(i.category)}</category>` : null,
      `      <description>${xmlEscape(i.description)}</description>`,
      '    </item>',
    ].filter(Boolean).join('\n')
  })
  const latest = items.find(i => !Number.isNaN(i.date.getTime()))?.date ?? now
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    '  <channel>',
    '    <title>SocialMate Blog</title>',
    `    <link>${SITE}/blog</link>`,
    `    <atom:link href="${SITE}/blog/feed.xml" rel="self" type="application/rss+xml" />`,
    '    <description>Guides for scheduling posts to Bluesky, Discord, Telegram, Mastodon, LinkedIn, TikTok and X, from the team behind SocialMate.</description>',
    '    <language>en</language>',
    `    <lastBuildDate>${latest.toUTCString()}</lastBuildDate>`,
    ...entries,
    '  </channel>',
    '</rss>',
    '',
  ].join('\n')
}
