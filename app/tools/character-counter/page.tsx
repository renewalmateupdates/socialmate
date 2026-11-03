import type { Metadata } from 'next'
import Link from 'next/link'
import PublicLayout from '@/components/PublicLayout'
import { Section, Eyebrow, Display, Body, Button } from '@/components/instrument/primitives'
import CharacterCounter from './CharacterCounter'

const URL = 'https://socialmate.studio/tools/character-counter'

export const metadata: Metadata = {
  title: 'Character Counter for X, Bluesky, LinkedIn, TikTok and More',
  description:
    'Paste a post and see at once whether it fits X (280), Bluesky (300), Mastodon (500), LinkedIn (3,000), TikTok, Discord, Telegram, Threads and Instagram, counted the way each one counts. Free, no signup.',
  openGraph: {
    title: 'Social Media Character Counter',
    description: 'One post, every platform\'s limit, counted the way each platform counts. Free.',
    url: URL,
  },
  alternates: { canonical: URL },
}

const FAQ = [
  {
    q: 'Why does X show a different count than other tools?',
    a: 'X counts most Chinese, Japanese and Korean characters and every emoji as 2, and every link as 23 whatever its length. This counter uses the same rules, so its X number matches the one X shows.',
  },
  {
    q: 'Why is my Bluesky count lower than my X count?',
    a: 'Bluesky counts what you see as one character, so an emoji or a flag is 1. X counts the same emoji as 2.',
  },
  {
    q: 'How are LinkedIn, Telegram, Threads and Instagram counted?',
    a: 'They do not publish exactly how they count, so this counts the strict way, with each emoji and styled letter as 2. A green number always fits, sometimes with a few characters to spare.',
  },
  {
    q: 'What is the longest post I can schedule to each platform?',
    a: 'SocialMate posts to X (280, longer for paid X accounts), Bluesky (300), Mastodon (usually 500), LinkedIn (3,000), Discord (2,000), Telegram (4,096, or 1,024 with a photo) and TikTok captions (2,200). Threads and Instagram are not available in SocialMate yet.',
  },
]

const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Social Media Character Counter',
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

export default function CharacterCounterPage() {
  return (
    <PublicLayout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Section width="wide">
        <Link href="/tools" className="text-small text-ink-muted transition-colors hover:text-ink-high">Free tools</Link>
        <div className="mt-6 max-w-2xl">
          <Eyebrow tone="amber">Free tool · no signup</Eyebrow>
          <Display as="h1" size="lg" className="mt-4">Character counter for every platform</Display>
          <Body size="lg" className="mt-4">
            Write once and see straight away where it fits: X, Bluesky, Mastodon, LinkedIn, TikTok, Discord,
            Telegram, Threads and Instagram, each counted the way that platform counts.
          </Body>
        </div>
        <div className="mt-10">
          <CharacterCounter />
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
        <Display size="md" className="mt-4">Post it everywhere at once</Display>
        <Body className="mt-4">
          SocialMate sends one post to Bluesky, Mastodon, LinkedIn, Discord and Telegram on a schedule, free for up
          to 250 posts a month, with X on the Pro plan. Too long for X? The thread splitter turns it into a thread.
        </Body>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button href="/signup">Start free</Button>
          <Button href="/tools/thread-splitter" variant="secondary">Thread splitter</Button>
        </div>
      </Section>
    </PublicLayout>
  )
}
