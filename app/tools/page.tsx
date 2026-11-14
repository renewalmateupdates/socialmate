import type { Metadata } from 'next'
import Link from 'next/link'
import { FREE_TOOLS } from '@/lib/tools/catalog'
import PublicLayout from '@/components/PublicLayout'
import { Section, Eyebrow, Display, Body } from '@/components/instrument/primitives'

const URL = 'https://socialmate.studio/tools'

export const metadata: Metadata = {
  title: 'Free Social Media Tools',
  description: 'Free tools for people who post: a character counter for every platform, a thread splitter, a quote card maker, an image resizer for every platform, a UTM link builder, a LinkedIn text formatter, a Discord timestamp generator and a Bluesky custom domain helper. No signup.',
  openGraph: {
    title: 'Free Social Media Tools',
    description: 'Character counter, thread splitter, quote cards, image resizer, UTM builder, LinkedIn formatter, Discord timestamps and a Bluesky custom domain helper. Free, no signup.',
    url: URL,
  },
  alternates: { canonical: URL },
}


export default function ToolsPage() {
  return (
    <PublicLayout>
      <Section>
        <div className="max-w-2xl">
          <Eyebrow tone="amber">Free · no signup</Eyebrow>
          <Display as="h1" size="lg" className="mt-4">Free tools for people who post</Display>
          <Body size="lg" className="mt-4">
            Small, fast tools for the fiddly parts of posting. They run in your browser and store nothing, and the
            image tools never upload your pictures. The Bluesky domain helper is the one that looks things up: your
            handle at Bluesky, your domain at a public DNS service.
          </Body>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FREE_TOOLS.map(({ href, icon: Icon, name, blurb }) => (
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
