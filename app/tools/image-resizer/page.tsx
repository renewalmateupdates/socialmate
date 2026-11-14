import type { Metadata } from 'next'
import Link from 'next/link'
import PublicLayout from '@/components/PublicLayout'
import MoreTools from '../MoreTools'
import { Section, Eyebrow, Display, Body, Button } from '@/components/instrument/primitives'
import ImageResizer from './ImageResizer'

const URL = 'https://socialmate.studio/tools/image-resizer'

export const metadata: Metadata = {
  title: 'Free Image Resizer for X, LinkedIn, Bluesky, TikTok and More',
  description:
    'Upload one picture and get it cropped or fitted for X (1600×900), LinkedIn (1200×627), Bluesky, Discord, a YouTube thumbnail, a TikTok cover, a Pinterest pin and a square post. Drag to move each crop. Free, no signup, nothing uploaded.',
  openGraph: {
    title: 'Free Social Media Image Resizer',
    description: 'One picture, every platform size, drag to move the crop. Runs in your browser, nothing uploaded.',
    url: URL,
  },
  alternates: { canonical: URL },
}

const FAQ = [
  {
    q: 'Is my picture uploaded?',
    a: 'No. It is opened, cropped and saved by your own browser, so it works the same with a private photo. Nothing goes to SocialMate unless you press Use in post, and then only once you are signed in.',
  },
  {
    q: 'What is the difference between Fill and Fit?',
    a: 'Fill covers the whole size and cuts off what does not fit; drag the preview to choose which part stays. Fit keeps the whole picture and fills the space around it with a blurred copy, dark or white.',
  },
  {
    q: 'JPG or PNG?',
    a: 'JPG for photos: the files are several times smaller, and Bluesky takes images up to about 1 MB. PNG for screenshots, text or anything with see-through parts.',
  },
  {
    q: 'Which of these sizes can SocialMate post to?',
    a: 'SocialMate schedules image posts to X (on Pro), LinkedIn, Bluesky, Discord, Mastodon and Telegram. It does not post to YouTube or Pinterest yet, and its TikTok posting is for video, so download those sizes and upload them there yourself.',
  },
]

const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Social Media Image Resizer',
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

export default function ImageResizerPage() {
  return (
    <PublicLayout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Section width="wide">
        <Link href="/tools" className="text-small text-ink-muted transition-colors hover:text-ink-high">Free tools</Link>
        <div className="mt-6 max-w-2xl">
          <Eyebrow tone="amber">Free tool · no signup</Eyebrow>
          <Display as="h1" size="lg" className="mt-4">Image resizer for every platform</Display>
          <Body size="lg" className="mt-4">
            Choose one picture and see it at once at the size X, LinkedIn, Bluesky, Discord, YouTube, TikTok and
            Pinterest each expect. Drag to move a crop, then download the ones you need.
          </Body>
        </div>
        <div className="mt-10">
          <ImageResizer />
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
        <Display size="md" className="mt-4">Post the picture everywhere at once</Display>
        <Body className="mt-4">
          SocialMate sends one post, with its image, to Bluesky, Mastodon, LinkedIn, Discord and Telegram on a
          schedule, free for up to 250 posts a month, with X on the Pro plan. Want words on the picture? The quote
          card maker does that.
        </Body>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button href="/signup">Start free</Button>
          <Button href="/tools/quote-card" variant="secondary">Quote card maker</Button>
        </div>
      </Section>

      <MoreTools current="/tools/image-resizer" />
    </PublicLayout>
  )
}
