/**
 * Which free tool, if any, a blog post should point at. About 36 posts are
 * about Discord and about 61 about threads, X, Bluesky or Mastodon: pages
 * search engines already know, whose readers are exactly who the tools serve.
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

export function relatedToolFor(post: { slug: string; title: string }): RelatedTool | null {
  const text = `${post.slug.replace(/-/g, ' ')} ${post.title}`.toLowerCase()
  if (/\bdiscord\b/.test(text)) return DISCORD
  // "Threads" can also mean Meta's app, which the splitter is not for.
  const metaThreads = /\b(meta|instagram)\b|threads app/.test(text)
  if ((/\bthreads?\b/.test(text) && !metaThreads) || /\b(bluesky|mastodon|twitter|tweets?)\b/.test(text)) return THREADS
  return null
}
