import type { Metadata } from 'next'
import Link from 'next/link'
import PublicLayout from '@/components/PublicLayout'
import { Section, Eyebrow, Display, Body, Button } from '@/components/instrument/primitives'
import BlueskyDomain from './BlueskyDomain'

const URL = 'https://socialmate.studio/tools/bluesky-custom-domain'

export const metadata: Metadata = {
  title: 'Bluesky Custom Domain Handle: Get the DNS Record and Check It',
  description:
    'Use your own domain as your Bluesky handle. Get the exact _atproto TXT record for your account, then check whether it is live before you press verify. Free, no signup.',
  openGraph: {
    title: 'Bluesky Custom Domain Helper',
    description: 'The exact DNS record for your Bluesky handle, and a check that it is live. Free.',
    url: URL,
  },
  alternates: { canonical: URL },
}

const FAQ = [
  {
    q: 'How do I use my own domain as my Bluesky handle?',
    a: 'Add one TXT record at your domain\'s DNS provider: host _atproto, value did= followed by your account\'s DID. Once it is live, choose to use your own domain under Settings, Account, Handle in Bluesky and press verify.',
  },
  {
    q: 'Why does Bluesky say it cannot verify my domain?',
    a: 'Usually the record is not live yet, the host was entered as the bare domain instead of _atproto, or the value has a typo or an extra did= record beside it. The check on this page tells you which.',
  },
  {
    q: 'Can I use a subdomain, like you.example.com?',
    a: 'Yes. The record then goes at _atproto.you.example.com. Many teams give each member a subdomain this way.',
  },
  {
    q: 'Will I lose my followers or posts?',
    a: 'No. Your account is tied to your DID, not your handle, so followers and posts stay. Links and mentions that used your old handle stop pointing to you, so update them where you can.',
  },
  {
    q: 'What does this page send anywhere?',
    a: 'Only what it needs: your current handle to Bluesky\'s public API to look up your DID, and your domain to Cloudflare\'s public DNS resolver to read the record. Nothing is stored.',
  },
]

const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Bluesky Custom Domain Helper',
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

export default function BlueskyCustomDomainPage() {
  return (
    <PublicLayout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Section width="wide">
        <Link href="/tools" className="text-small text-ink-muted transition-colors hover:text-ink-high">Free tools</Link>
        <div className="mt-6 max-w-2xl">
          <Eyebrow tone="amber">Free tool · no signup</Eyebrow>
          <Display as="h1" size="lg" className="mt-4">Bluesky custom domain helper</Display>
          <Body size="lg" className="mt-4">
            Turn yourname.bsky.social into yourname.com. Get the exact DNS record for your account, then check that
            it is live before you press verify in Bluesky.
          </Body>
        </div>
        <div className="mt-10">
          <BlueskyDomain />
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
        <Display size="md" className="mt-4">Schedule your Bluesky posts</Display>
        <Body className="mt-4">
          SocialMate schedules posts and real threads to Bluesky for free, up to 250 posts a month, with Mastodon,
          LinkedIn, Discord and Telegram on the same schedule.
        </Body>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button href="/signup">Start free</Button>
          <Button href="/for/bluesky-creators" variant="secondary">SocialMate for Bluesky</Button>
        </div>
      </Section>
    </PublicLayout>
  )
}
