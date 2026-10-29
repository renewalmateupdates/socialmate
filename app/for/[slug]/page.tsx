import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  BarChart3, Bot, CalendarClock, Clock, Globe, Image as ImageIcon, MessagesSquare, Radio,
  Repeat, Reply, Send, Sparkles, Store, Users,
} from 'lucide-react'
import PublicLayout from '@/components/PublicLayout'
import { Section, Eyebrow, Display, Body, Button } from '@/components/instrument/primitives'
import { AUDIENCES, audienceFor, type FeatureIcon } from '@/lib/audiences'
import { PLAN_POST_LIMITS, scheduleWindowLabel } from '@/lib/post-limits'
import { accountsPerPlatformFor } from '@/lib/plan'

// Audience pages from lib/audiences.ts. The hand-built pages in app/for/<name>/
// win over this route; only slugs listed in AUDIENCES render here, anything
// else is a real 404.
export const dynamicParams = false

export function generateStaticParams() {
  return AUDIENCES.map(a => ({ slug: a.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const a = audienceFor(slug)
  if (!a) return {}
  const url = `https://socialmate.studio/for/${a.slug}`
  return {
    title: a.title,
    description: a.description,
    openGraph: { title: a.title, description: a.description, url },
    twitter: { card: 'summary_large_image', title: a.title, description: a.description },
    alternates: { canonical: url },
  }
}

const ICONS: Record<FeatureIcon, typeof Clock> = {
  calendar: CalendarClock, radio: Radio, repeat: Repeat, clock: Clock, image: ImageIcon, reply: Reply,
  chart: BarChart3, thread: MessagesSquare, bot: Bot, store: Store, sparkles: Sparkles, users: Users,
  globe: Globe, send: Send,
}

// Prices live on /pricing; these match it. Limits come from the same tables the
// app enforces.
const PLANS = [
  { tier: 'free', name: 'Free', price: '$0' },
  { tier: 'pro', name: 'Pro', price: '$8 a month' },
  { tier: 'agency', name: 'Agency', price: '$29 a month' },
] as const

export default async function AudiencePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const a = audienceFor(slug)
  if (!a) notFound()

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: a.faq.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  }

  return (
    <PublicLayout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <Section>
        <div className="max-w-3xl">
          <Eyebrow tone="amber">{a.eyebrow}</Eyebrow>
          <Display as="h1" size="lg" className="mt-4">{a.h1}</Display>
          <Body size="lg" className="mt-5">{a.answer}</Body>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href="/signup">Start free</Button>
            <Button href="/pricing" variant="secondary">See plans</Button>
          </div>
        </div>
      </Section>

      <Section divide>
        <Eyebrow>What you can do</Eyebrow>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {a.features.map(f => {
            const Icon = ICONS[f.icon]
            return (
              <div key={f.title} className="rounded-2xl border border-edge bg-panel p-6">
                <Icon className="h-5 w-5 text-amber" strokeWidth={1.75} aria-hidden="true" />
                <p className="mt-4 text-body-lg font-medium text-ink-high">{f.title}</p>
                <p className="mt-2 text-body text-ink-body">{f.body}</p>
              </div>
            )
          })}
        </div>
      </Section>

      <Section divide>
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <Eyebrow>How to set it up</Eyebrow>
            <ol className="mt-6 space-y-4">
              {a.steps.map((s, i) => (
                <li key={s} className="flex gap-4">
                  <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full border border-edge-lit font-mono text-mono text-amber">{i + 1}</span>
                  <span className="text-body text-ink-body">{s}</span>
                </li>
              ))}
            </ol>
          </div>
          <div>
            <Eyebrow>Good to know</Eyebrow>
            <ul className="mt-6 space-y-3">
              {a.limits.map(l => (
                <li key={l} className="rounded-xl border border-edge bg-panel px-4 py-3 text-body text-ink-body">{l}</li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section divide>
        <Eyebrow>Plans</Eyebrow>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {PLANS.map(p => (
            <div key={p.tier} className="rounded-2xl border border-edge bg-panel p-6">
              <p className="text-body-lg font-medium text-ink-high">{p.name}</p>
              <p className="mt-1 font-mono text-mono text-amber">{p.price}</p>
              <ul className="mt-4 space-y-1.5 text-small text-ink-body">
                <li>{PLAN_POST_LIMITS[p.tier].toLocaleString('en-US')} posts a month</li>
                <li>Schedule up to {scheduleWindowLabel(p.tier)} ahead</li>
                <li>{accountsPerPlatformFor(p.tier)} {accountsPerPlatformFor(p.tier) === 1 ? 'account' : 'accounts'} per platform</li>
                <li>{p.tier === 'free' ? 'X not included' : 'X included'}</li>
              </ul>
            </div>
          ))}
        </div>
      </Section>

      <Section divide>
        <div className="max-w-3xl">
          <Eyebrow>Questions</Eyebrow>
          <dl className="mt-6 space-y-6">
            {a.faq.map(f => (
              <div key={f.q}>
                <dt className="text-body-lg font-medium text-ink-high">{f.q}</dt>
                <dd className="mt-2 text-body text-ink-body">{f.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Section>

      <Section divide>
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <Display as="h2" size="md">Try it on the free plan</Display>
            <Body className="mt-3">No card needed. Connect a platform and schedule your first post in a few minutes.</Body>
            <div className="mt-6"><Button href="/signup">Start free</Button></div>
          </div>
          <nav aria-label="Related pages" className="flex flex-col gap-2">
            {a.related.map(r => (
              <Link key={r.href} href={r.href} className="text-body text-ink-muted underline decoration-edge-lit underline-offset-4 hover:text-ink-high">
                {r.label}
              </Link>
            ))}
          </nav>
        </div>
      </Section>
    </PublicLayout>
  )
}
