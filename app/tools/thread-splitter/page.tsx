import type { Metadata } from 'next'
import Link from 'next/link'
import PublicLayout from '@/components/PublicLayout'
import { Section, Eyebrow, Display, Body, Button } from '@/components/instrument/primitives'
import ThreadSplitter from './ThreadSplitter'

const URL = 'https://socialmate.studio/tools/thread-splitter'

export const metadata: Metadata = {
  title: 'Free Thread Splitter for X, Bluesky and Mastodon',
  description:
    'Paste long text and get a numbered thread that fits X, Bluesky or Mastodon, counted the way each platform counts. Free, no signup.',
  openGraph: {
    title: 'Free Thread Splitter for X, Bluesky and Mastodon',
    description: 'Turn long text into a numbered thread that fits, counted the way each platform counts. Free, no signup.',
    url: URL,
  },
  alternates: { canonical: URL },
}

const FAQ = [
  {
    q: 'Where does it break the text?',
    a: 'It keeps paragraphs together when they fit, then breaks between sentences. It only splits a sentence at a word when that one sentence is longer than a whole post.',
  },
  {
    q: 'Why does X count my emoji as 2?',
    a: 'X weights characters. Most emoji and CJK characters count as 2, and every link counts as 23 no matter how long it is. Bluesky counts what you see, so an emoji is 1. The counter here follows each platform.',
  },
  {
    q: 'Does the numbering count against the limit?',
    a: 'Yes. "3/7" takes characters too, so every post is sized with room for its number.',
  },
  {
    q: 'Can SocialMate post the thread for me?',
    a: 'Yes. SocialMate posts it as a real reply chain with Post Now: free on Bluesky and Mastodon, and on X with the Pro plan.',
  },
]

const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Thread Splitter',
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

export default function ThreadSplitterPage() {
  return (
    <PublicLayout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Section width="wide">
        <Link href="/tools" className="text-small text-ink-muted transition-colors hover:text-ink-high">Free tools</Link>
        <div className="mt-6 max-w-2xl">
          <Eyebrow tone="amber">Free tool · no signup</Eyebrow>
          <Display as="h1" size="lg" className="mt-4">Thread splitter</Display>
          <Body size="lg" className="mt-4">
            Paste anything long. Get a numbered thread that fits X, Bluesky or Mastodon, counted the way each
            platform counts, with every post ready to copy.
          </Body>
        </div>
        <div className="mt-10">
          <ThreadSplitter />
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
        <Display size="md" className="mt-4">Post it as a real thread</Display>
        <Body className="mt-4">
          SocialMate posts your thread as a real reply chain and schedules everything else you write across seven
          platforms. Free on Bluesky, Mastodon, Discord, Telegram and LinkedIn. X is on Pro.
        </Body>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button href="/signup">Start free</Button>
          <Button href="/tools" variant="secondary">More free tools</Button>
        </div>
      </Section>
    </PublicLayout>
  )
}
