import type { Metadata } from 'next'
import Link from 'next/link'
import PublicLayout from '@/components/PublicLayout'
import { Section, Eyebrow, Display, Body, Button } from '@/components/instrument/primitives'
import DiscordTimestamp from './DiscordTimestampLoader'

const URL = 'https://socialmate.studio/tools/discord-timestamp'

export const metadata: Metadata = {
  title: 'Discord Timestamp Generator: Show Times in Every Time Zone',
  description:
    'Make Discord timestamp codes like <t:1760486400:F> that show in each reader’s own time zone, with a live preview of every format. Free, no signup.',
  openGraph: {
    title: 'Discord Timestamp Generator',
    description: 'Discord timestamp codes that show in each reader’s own time zone, with a preview of every format. Free.',
    url: URL,
  },
  alternates: { canonical: URL },
}

const FAQ = [
  {
    q: 'What is a Discord timestamp?',
    a: 'A code like <t:1760486400:F> that Discord shows as a real date and time, converted to each reader’s own time zone. Nobody has to work out what "8pm EST" means where they live.',
  },
  {
    q: 'How do I use one?',
    a: 'Copy a code and paste it into any Discord message. It turns into the formatted time as soon as you send it.',
  },
  {
    q: 'Which format should I use?',
    a: 'For events, the long date and time plus the relative one, like "Friday, October 16 8:00 PM (in 2 days)", is the one people read fastest. The relative format counts down on its own.',
  },
  {
    q: 'Can I schedule the announcement too?',
    a: 'Yes. SocialMate schedules Discord announcements to a channel you pick, free, along with posts to six other platforms.',
  },
]

const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Discord Timestamp Generator',
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

export default function DiscordTimestampPage() {
  return (
    <PublicLayout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Section width="wide">
        <Link href="/tools" className="text-small text-ink-muted transition-colors hover:text-ink-high">Free tools</Link>
        <div className="mt-6 max-w-2xl">
          <Eyebrow tone="amber">Free tool · no signup</Eyebrow>
          <Display as="h1" size="lg" className="mt-4">Discord timestamp generator</Display>
          <Body size="lg" className="mt-4">
            Pick a time and copy a code. Discord shows it in every reader’s own time zone, so an event at 8pm
            is 8pm in New York, 5pm in Los Angeles and 1am in London, without anyone doing the math.
          </Body>
        </div>
        <div className="mt-10">
          <DiscordTimestamp />
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
        <Display size="md" className="mt-4">Schedule the announcement too</Display>
        <Body className="mt-4">
          Write it once, pick the channel and the time, and SocialMate posts it to your Discord server for you.
          Free, with Bluesky, Mastodon, Telegram and LinkedIn on the same schedule.
        </Body>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button href="/signup">Start free</Button>
          <Button href="/tools" variant="secondary">More free tools</Button>
        </div>
      </Section>
    </PublicLayout>
  )
}
