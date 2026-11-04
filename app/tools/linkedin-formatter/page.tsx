import type { Metadata } from 'next'
import Link from 'next/link'
import PublicLayout from '@/components/PublicLayout'
import MoreTools from '../MoreTools'
import { Section, Eyebrow, Display, Body, Button } from '@/components/instrument/primitives'
import LinkedInFormatter from './LinkedInFormatter'

const URL = 'https://socialmate.studio/tools/linkedin-formatter'

export const metadata: Metadata = {
  title: 'LinkedIn Text Formatter: Bold, Italic and Lists for Posts',
  description:
    'Add bold, italic, bullets and numbered lists to LinkedIn posts, see where “see more” cuts in, and count against the 3,000-character limit. Free, no signup.',
  openGraph: {
    title: 'LinkedIn Text Formatter',
    description: 'Bold, italic and lists for LinkedIn posts, with a preview of the “see more” fold. Free.',
    url: URL,
  },
  alternates: { canonical: URL },
}

const FAQ = [
  {
    q: 'How does bold text work on LinkedIn?',
    a: 'LinkedIn posts are plain text, so there is no real bold button. This tool swaps letters for Unicode look-alikes (𝗹𝗶𝗸𝗲 𝘁𝗵𝗶𝘀) that show as bold anywhere you paste them.',
  },
  {
    q: 'Should I bold whole posts?',
    a: 'No. Screen readers can read styled letters one by one or skip them, and LinkedIn search may not match them. Use it for a word or a short line, and keep names, links and hashtags plain.',
  },
  {
    q: 'How long can a LinkedIn post be?',
    a: '3,000 characters. Styled letters can count as two characters each, so this counter counts them that way to keep you on the safe side.',
  },
  {
    q: 'Where does LinkedIn cut a post with “see more”?',
    a: 'After about the first two or three lines on a computer, and a little sooner on a phone. LinkedIn does not publish the exact rule, so the preview shows an estimate. Put the reason to keep reading in those first lines.',
  },
  {
    q: 'Can I schedule the post?',
    a: 'Yes. SocialMate schedules posts to your personal LinkedIn profile for free, and to Bluesky, Mastodon, Discord and Telegram on the same schedule.',
  },
]

const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'LinkedIn Text Formatter',
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

export default function LinkedInFormatterPage() {
  return (
    <PublicLayout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Section width="wide">
        <Link href="/tools" className="text-small text-ink-muted transition-colors hover:text-ink-high">Free tools</Link>
        <div className="mt-6 max-w-2xl">
          <Eyebrow tone="amber">Free tool · no signup</Eyebrow>
          <Display as="h1" size="lg" className="mt-4">LinkedIn text formatter</Display>
          <Body size="lg" className="mt-4">
            Bold a word, italicize a line, turn notes into a clean list, and see where LinkedIn will cut your post
            with “see more” before you publish it.
          </Body>
        </div>
        <div className="mt-10">
          <LinkedInFormatter />
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
        <Display size="md" className="mt-4">Schedule it for the morning</Display>
        <Body className="mt-4">
          Paste the formatted post into SocialMate, pick a time, and it goes out to your LinkedIn profile on
          schedule. Free, with Bluesky, Mastodon, Discord and Telegram alongside it.
        </Body>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button href="/signup">Start free</Button>
          <Button href="/tools" variant="secondary">More free tools</Button>
        </div>
      </Section>

      <MoreTools current="/tools/linkedin-formatter" />
    </PublicLayout>
  )
}
