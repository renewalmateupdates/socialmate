import type { Metadata } from 'next'
import Link from 'next/link'
import PublicLayout from '@/components/PublicLayout'
import { Section, Eyebrow, Display, Body, Button } from '@/components/instrument/primitives'
import UtmBuilder from './UtmBuilder'

const URL = 'https://socialmate.studio/tools/utm-builder'

export const metadata: Metadata = {
  title: 'UTM Link Builder for Social Media Posts',
  description:
    'Build UTM-tagged links for Bluesky, LinkedIn, X, Mastodon, Discord, Telegram and TikTok in one go, so your analytics show which post sent each visit. Free, no signup.',
  openGraph: {
    title: 'UTM Link Builder for Social Media',
    description: 'Tagged links for every platform you post to, in one go. Free.',
    url: URL,
  },
  alternates: { canonical: URL },
}

const FAQ = [
  {
    q: 'What is a UTM link?',
    a: 'A normal link with a few labels added at the end, like ?utm_source=bluesky&utm_medium=social. Analytics tools such as Google Analytics read those labels to tell you which post, platform or campaign sent each visitor.',
  },
  {
    q: 'What should I put in source, medium and campaign?',
    a: 'Source is where the link is posted (bluesky, linkedin, newsletter). Medium is the kind of channel; use social for social posts, which Google Analytics files under Organic Social. Campaign is the launch or promotion, like spring-sale.',
  },
  {
    q: 'Why make everything lowercase?',
    a: 'Analytics tools treat Bluesky and bluesky as two different sources, so a mix of spellings splits one source into several rows in your reports.',
  },
  {
    q: 'Do UTM links hurt how a post performs?',
    a: 'The labels make a link longer, which matters on X only if you count by hand: X counts every link as 23 characters whatever its length. If a long link looks messy, put it behind a short link.',
  },
]

const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'UTM Link Builder for Social Media',
    url: URL,
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Any',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    publisher: { '@type': 'Organization', name: 'SocialMate', url: 'https://socialmate.studio' },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  },
]

export default function UtmBuilderPage() {
  return (
    <PublicLayout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Section width="wide">
        <Link href="/tools" className="text-small text-ink-muted transition-colors hover:text-ink-high">Free tools</Link>
        <div className="mt-6 max-w-2xl">
          <Eyebrow tone="amber">Free tool · no signup</Eyebrow>
          <Display as="h1" size="lg" className="mt-4">UTM link builder for social posts</Display>
          <Body size="lg" className="mt-4">
            Tag a link once for every platform you post to, and your analytics will show which post actually
            sent the visit, instead of lumping it all under &ldquo;direct&rdquo;.
          </Body>
        </div>
        <div className="mt-10">
          <UtmBuilder />
        </div>
      </Section>

      <Section width="narrow" divide>
        <Display size="md">Questions</Display>
        <dl className="mt-8 space-y-8">
          {FAQ.map(f => (
            <div key={f.q}>
              <dt className="text-body font-medium text-ink-high">{f.q}</dt>
              <dd className="mt-2 text-body text-ink-body">{f.a}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section width="narrow" divide>
        <Eyebrow tone="jade">SocialMate</Eyebrow>
        <Display size="md" className="mt-4">Schedule the posts that carry them</Display>
        <Body className="mt-4">
          Paste each tagged link into SocialMate, pick the platforms and the time, and the posts go out on
          schedule. Free for up to 250 posts a month, with X on the Pro plan.
        </Body>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button href="/signup">Start free</Button>
          <Button href="/tools" variant="secondary">More free tools</Button>
        </div>
      </Section>
    </PublicLayout>
  )
}
