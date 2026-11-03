/**
 * Which free tool, if any, a blog post should point at. About 36 posts are
 * about Discord, about 61 about threads, X, Bluesky or Mastodon, and more
 * about LinkedIn: pages search engines already know, whose readers are
 * exactly who the tools serve.
 * Linking them is the fastest way to get the tools found.
 *
 * Pure, no imports.
 */

export interface RelatedTool {
  href: string
  name: string
  pitch: string
}

const DISCORD: RelatedTool = {
  href: '/tools/discord-timestamp',
  name: 'Discord timestamp generator',
  pitch: 'Put event times in your announcements that show in every member’s own time zone. Free, no signup.',
}

const THREADS: RelatedTool = {
  href: '/tools/thread-splitter',
  name: 'Thread splitter',
  pitch: 'Turn long text into a numbered thread that fits X, Bluesky or Mastodon, counted the way each platform counts. Free, no signup.',
}

const LINKEDIN: RelatedTool = {
  href: '/tools/linkedin-formatter',
  name: 'LinkedIn text formatter',
  pitch: 'Add bold, italic and clean lists to a LinkedIn post and see where “see more” cuts in. Free, no signup.',
}

const BLUESKY_DOMAIN: RelatedTool = {
  href: '/tools/bluesky-custom-domain',
  name: 'Bluesky custom domain helper',
  pitch: 'Get the exact DNS record to use your own domain as your Bluesky handle, and check it is live. Free, no signup.',
}

const CHARACTER_COUNTER: RelatedTool = {
  href: '/tools/character-counter',
  name: 'Character counter',
  pitch: 'See at once whether a post fits X, Bluesky, Mastodon, LinkedIn, TikTok, Discord and Telegram. Free, no signup.',
}

const UTM: RelatedTool = {
  href: '/tools/utm-builder',
  name: 'UTM link builder',
  pitch: 'Tag one link for every platform you post to, so your analytics show which post sent each visit. Free, no signup.',
}

export function relatedToolFor(post: { slug: string; title: string }): RelatedTool | null {
  const text = `${post.slug.replace(/-/g, ' ')} ${post.title}`.toLowerCase()
  if (/\bbluesky\b/.test(text) && /\b(custom domain|domain|handle|verif)/.test(text)) return BLUESKY_DOMAIN
  if (/\bcharacter (limit|count)s?\b|\bhow long\b|\blength\b/.test(text)) return CHARACTER_COUNTER
  if (/\bdiscord\b/.test(text)) return DISCORD
  if (/\blinkedin\b/.test(text)) return LINKEDIN
  if (/\b(utm|analytics|track(ing)? links?|attribution)\b/.test(text)) return UTM
  // "Threads" can also mean Meta's app, which the splitter is not for.
  const metaThreads = /\b(meta|instagram)\b|threads app/.test(text)
  if ((/\bthreads?\b/.test(text) && !metaThreads) || /\b(bluesky|mastodon|twitter|tweets?)\b/.test(text)) return THREADS
  return null
}
