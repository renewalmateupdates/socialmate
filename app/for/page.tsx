import type { Metadata } from 'next'
import Link from 'next/link'
import PublicLayout from '@/components/PublicLayout'
import { Section, Eyebrow, Display, Body, Button } from '@/components/instrument/primitives'
import { audienceHub } from '@/lib/audiences'

const URL = 'https://socialmate.studio/for'

export const metadata: Metadata = {
  title: 'Who SocialMate Is For: Creators, Streamers, Writers and Teams',
  description:
    'Find the SocialMate guide for what you do: streamers and clippers, artists, authors, newsletter writers, Discord and Telegram communities, small businesses, agencies and more.',
  openGraph: {
    title: 'Who SocialMate Is For',
    description: 'A guide for each kind of creator, community and business that schedules posts with SocialMate.',
    url: URL,
  },
  alternates: { canonical: URL },
}

export default function AudienceHubPage() {
  const groups = audienceHub()
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Who SocialMate is for',
    url: URL,
    hasPart: groups.flatMap(g => g.pages.map(p => ({ '@type': 'WebPage', name: p.label, url: `https://socialmate.studio${p.href}` }))),
  }

  return (
    <PublicLayout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Section width="wide">
        <div className="max-w-2xl">
          <Eyebrow tone="amber">Guides by audience</Eyebrow>
          <Display as="h1" size="lg" className="mt-4">Who SocialMate is for</Display>
          <Body size="lg" className="mt-4">
            One scheduler for Bluesky, Discord, Telegram, Mastodon, LinkedIn, TikTok and X. Pick what you do to see
            how people like you use it, and what it does not do.
          </Body>
        </div>

        <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map(g => (
            <div key={g.group}>
              <h2 className="font-mono text-eyebrow uppercase text-ink-muted">{g.group}</h2>
              <ul className="mt-3 space-y-1">
                {g.pages.map(p => (
                  <li key={p.href}>
                    <Link
                      href={p.href}
                      className="tap flex min-h-[44px] items-center rounded-xl px-3 text-body text-ink-body transition-colors hover:bg-raised hover:text-ink-high"
                    >
                      {p.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      <Section width="narrow" divide>
        <Display size="md">Not on the list?</Display>
        <Body className="mt-4">
          The free plan covers 250 posts a month to Bluesky, Discord, Telegram, Mastodon and LinkedIn, plus TikTok
          videos, with X on the Pro plan. Try it with whatever you post.
        </Body>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button href="/signup">Start free</Button>
          <Button href="/tools" variant="secondary">Free tools</Button>
        </div>
      </Section>
    </PublicLayout>
  )
}
