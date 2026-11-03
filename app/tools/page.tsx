import type { Metadata } from 'next'
import Link from 'next/link'
import { AtSign, Bold, Clock, Hash, Link2, MessagesSquare } from 'lucide-react'
import PublicLayout from '@/components/PublicLayout'
import { Section, Eyebrow, Display, Body } from '@/components/instrument/primitives'

const URL = 'https://socialmate.studio/tools'

export const metadata: Metadata = {
  title: 'Free Social Media Tools',
  description: 'Free tools for people who post: a character counter for every platform, a thread splitter, a UTM link builder, a LinkedIn text formatter, a Discord timestamp generator and a Bluesky custom domain helper. No signup.',
  openGraph: {
    title: 'Free Social Media Tools',
    description: 'Character counter, thread splitter, UTM builder, LinkedIn formatter, Discord timestamps and a Bluesky custom domain helper. Free, no signup.',
    url: URL,
  },
  alternates: { canonical: URL },
}

const TOOLS = [
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

export default function ToolsPage() {
  return (
    <PublicLayout>
      <Section>
        <div className="max-w-2xl">
          <Eyebrow tone="amber">Free · no signup</Eyebrow>
          <Display as="h1" size="lg" className="mt-4">Free tools for people who post</Display>
          <Body size="lg" className="mt-4">
            Small, fast tools for the fiddly parts of posting. They run in your browser and store nothing. The
            Bluesky domain helper is the one that looks things up: your handle at Bluesky, your domain at a public DNS
            service.
          </Body>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TOOLS.map(({ href, icon: Icon, name, blurb }) => (
            <Link
              key={href}
              href={href}
              className="tap block rounded-2xl border border-edge bg-panel p-6 transition-colors hover:border-edge-lit hover:bg-raised"
            >
              <Icon className="h-5 w-5 text-amber" strokeWidth={1.75} />
              <p className="mt-4 text-body-lg font-medium text-ink-high">{name}</p>
              <p className="mt-2 text-body text-ink-body">{blurb}</p>
            </Link>
          ))}
        </div>
      </Section>
    </PublicLayout>
  )
}
