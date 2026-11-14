import type { Metadata } from 'next'
import Link from 'next/link'
import PublicLayout from '@/components/PublicLayout'
import MoreTools from '../MoreTools'
import { Section, Eyebrow, Display, Body, Button } from '@/components/instrument/primitives'
import QuoteCard from './QuoteCard'

const URL = 'https://socialmate.studio/tools/quote-card'

export const metadata: Metadata = {
  title: 'Free Quote Card Maker for X, LinkedIn, Bluesky and More',
  description:
    'Turn a quote into a clean image card sized for X, LinkedIn, Bluesky, Discord, a YouTube thumbnail, a TikTok cover, a Pinterest pin or a square post. Three styles, light, dark or gold. Free, no signup, made in your browser.',
  openGraph: {
    title: 'Free Quote Card Maker',
    description: 'A quote, your name, three clean styles, every platform size. Free, made in your browser.',
    url: URL,
  },
  alternates: { canonical: URL },
}

const FAQ = [
  {
    q: 'What sizes does it make?',
    a: 'X 1600×900, LinkedIn 1200×627, Bluesky 1000×1000, Discord 1280×720, a YouTube thumbnail 1280×720, a TikTok cover 1080×1920, a Pinterest pin 1000×1500 and a 1080×1080 square. Pick one and download a PNG at that exact size.',
  },
  {
    q: 'Is my text uploaded anywhere?',
    a: 'No. The card is drawn in your browser and the download comes straight from it. Nothing is sent to SocialMate unless you press Use in a post, and even then the image is only uploaded once you are signed in to SocialMate.',
  },
  {
    q: 'What happens when the quote is long?',
    a: 'The text shrinks until it fits the card, so nothing runs off the edge. A very long quote on a wide card can get small; the square or Pinterest size gives it more room.',
  },
  {
    q: 'Can SocialMate post the card for me?',
    a: 'Yes. Use in a post opens SocialMate with the card attached, ready to schedule to Bluesky, Mastodon, LinkedIn, Discord and Telegram on the free plan, or X on Pro. SocialMate does not post to YouTube or Pinterest yet, so download those sizes and upload them there yourself.',
  },
]

const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Quote Card Maker',
    url: URL,
    applicationCategory: 'DesignApplication',
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

export default function QuoteCardPage() {
  return (
    <PublicLayout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Section width="wide">
        <Link href="/tools" className="text-small text-ink-muted transition-colors hover:text-ink-high">Free tools</Link>
        <div className="mt-6 max-w-2xl">
          <Eyebrow tone="amber">Free tool · no signup</Eyebrow>
          <Display as="h1" size="lg" className="mt-4">Quote card maker</Display>
          <Body size="lg" className="mt-4">
            Type a quote, add a name if you like, pick a style and a size. Download a PNG made for X, LinkedIn,
            Bluesky, Discord, a YouTube thumbnail, a TikTok cover, a Pinterest pin or a square post.
          </Body>
        </div>
        <div className="mt-10">
          <QuoteCard />
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
        <Display size="md" className="mt-4">Schedule it with the words around it</Display>
        <Body className="mt-4">
          SocialMate sends one post, with its image, to Bluesky, Mastodon, LinkedIn, Discord and Telegram on a
          schedule, free for up to 250 posts a month, with X on the Pro plan. Have a photo instead? The image
          resizer crops it for every platform.
        </Body>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button href="/signup">Start free</Button>
          <Button href="/tools/image-resizer" variant="secondary">Image resizer</Button>
        </div>
      </Section>

      <MoreTools current="/tools/quote-card" />
    </PublicLayout>
  )
}
