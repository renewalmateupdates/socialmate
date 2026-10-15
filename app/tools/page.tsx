import type { Metadata } from 'next'
import Link from 'next/link'
import { Clock, MessagesSquare } from 'lucide-react'
import PublicLayout from '@/components/PublicLayout'
import { Section, Eyebrow, Display, Body } from '@/components/instrument/primitives'

const URL = 'https://socialmate.studio/tools'

export const metadata: Metadata = {
  title: 'Free Social Media Tools',
  description: 'Free tools for people who post: a thread splitter for X, Bluesky and Mastodon, and a Discord timestamp generator. No signup.',
  openGraph: {
    title: 'Free Social Media Tools',
    description: 'A thread splitter and a Discord timestamp generator. Free, no signup.',
    url: URL,
  },
  alternates: { canonical: URL },
}

const TOOLS = [
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
]

export default function ToolsPage() {
  return (
    <PublicLayout>
      <Section>
        <div className="max-w-2xl">
          <Eyebrow tone="amber">Free · no signup</Eyebrow>
          <Display as="h1" size="lg" className="mt-4">Free tools for people who post</Display>
          <Body size="lg" className="mt-4">
            Small, fast tools for the fiddly parts of posting. They run in your browser, and nothing you type is
            sent anywhere.
          </Body>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
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
