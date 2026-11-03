import { AtSign, Bold, Clock, Hash, Link2, MessagesSquare, type LucideIcon } from 'lucide-react'

// Every free tool, once: the /tools index, the "More free tools" strip on each
// tool page and the sitemap all read this list, so a new tool is added in one
// place. scripts/test-tool-catalog.mjs checks each href has a page.

export interface FreeTool {
  href: string
  icon: LucideIcon
  name: string
  blurb: string
}

export const FREE_TOOLS: FreeTool[] = [
  {
    href: '/tools/character-counter',
    icon: Hash,
    name: 'Character counter',
    blurb: 'See at once whether a post fits X, Bluesky, Mastodon, LinkedIn, TikTok, Discord, Telegram, Threads and Instagram.',
  },
  {
    href: '/tools/thread-splitter',
    icon: MessagesSquare,
    name: 'Thread splitter',
    blurb: 'Turn long text into a numbered thread that fits X, Bluesky or Mastodon, counted the way each platform counts.',
  },
  {
    href: '/tools/discord-timestamp',
    icon: Clock,
    name: 'Discord timestamp generator',
    blurb: 'Make codes Discord shows in every reader’s own time zone, with a preview of each format.',
  },
  {
    href: '/tools/linkedin-formatter',
    icon: Bold,
    name: 'LinkedIn text formatter',
    blurb: 'Bold, italic and clean lists for LinkedIn posts, with a preview of where “see more” cuts in.',
  },
  {
    href: '/tools/utm-builder',
    icon: Link2,
    name: 'UTM link builder',
    blurb: 'Tag one link for every platform you post to, so your analytics show which post sent each visit.',
  },
  {
    href: '/tools/bluesky-custom-domain',
    icon: AtSign,
    name: 'Bluesky custom domain helper',
    blurb: 'Get the exact DNS record to use your own domain as your Bluesky handle, and check that it is live.',
  },
]
