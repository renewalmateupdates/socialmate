import Link from 'next/link'
import ReferralBanner from '@/app/components/ReferralBanner'
import PublicNav from '@/components/PublicNav'
import PublicFooter from '@/components/PublicFooter'
import LazyUserStatsCounter from '@/components/LazyUserStatsCounter'
import PlatformIcon from '@/components/landing/PlatformIcon'
import HeroLoop from '@/components/landing/HeroLoop'
import EmberField from '@/components/landing/EmberField'
import Reveal from '@/components/landing/Reveal'
import { Section, Eyebrow, Display, Body, Button, Card } from '@/components/instrument/primitives'
import {
  PenLine, Hash, RefreshCw, TrendingUp, MessagesSquare, Recycle, Zap, Flame,
  Radar, Search, CalendarDays, ImagePlus, CalendarClock, Bot, BarChart3, Link2,
  Users, Building2, Rss, Telescope, Clapperboard, Check, Backpack, Baby,
  Home as HomeIcon, Heart,
  type LucideIcon,
} from 'lucide-react'

// Cache landing page at CDN for 1 hour — content rarely changes between deploys.
export const revalidate = 3600

/* ──────────────────────────────────────────────────────────────────────────────
   COLOR IS A LANGUAGE ON THIS PAGE, NOT DECORATION.

     amber  → queued · scheduled · in-flight · primary brand voice
     violet → AI · SOMA · generation · credits
     jade   → published · live · included · real

   Anything that doesn't fit one of those three is neutral. That restriction is
   the design: by the time a reader reaches the price beat we've taught them that
   jade means shipped, without a word of explanation. Adding a fourth color, or
   using jade because a section "needed some green," breaks the whole thing.
   ────────────────────────────────────────────────────────────────────────────── */

const LIVE_PLATFORMS = ['Bluesky', 'Discord', 'Telegram', 'Mastodon', 'X', 'TikTok', 'LinkedIn']
const SOON_PLATFORMS = ['YouTube', 'Pinterest', 'Reddit']

const AI_TOOLS: { name: string; icon: LucideIcon; credits: string }[] = [
  { name: 'Caption Generator',    icon: PenLine,        credits: '5' },
  { name: 'Hashtag Generator',    icon: Hash,           credits: '5' },
  { name: 'Post Rewriter',        icon: RefreshCw,      credits: '5' },
  { name: 'Viral Hook Generator', icon: TrendingUp,     credits: '5' },
  { name: 'Thread Generator',     icon: MessagesSquare, credits: '10' },
  { name: 'Content Repurposer',   icon: Recycle,        credits: '10' },
  { name: 'Post Score',           icon: Zap,            credits: '5' },
  { name: 'SM-Pulse',             icon: Flame,          credits: '20' },
  { name: 'SM-Radar',             icon: Radar,          credits: '20' },
  { name: 'Content Gap Detector', icon: Search,         credits: '10' },
  { name: 'AI Content Calendar',  icon: CalendarDays,   credits: '25' },
  { name: 'AI Image Generation',  icon: ImagePlus,      credits: '25' },
]

const FEATURES: { icon: LucideIcon; title: string; desc: string }[] = [
  {
    icon: CalendarClock,
    title: 'Scheduling',
    desc: 'Seven platforms, bulk upload, automated queues, and per-platform character limits enforced before you hit send.',
  },
  {
    icon: BarChart3,
    title: 'Analytics',
    desc: 'Posting streaks, platform breakdown, best days and times, and engagement tracking. No inflated numbers.',
  },
  {
    icon: Link2,
    title: 'SIGIL link in bio',
    desc: 'A full bio link page with custom themes, button styles, and your own public URL. Free on every plan.',
  },
  {
    icon: Clapperboard,
    title: 'Clips Studio',
    desc: 'Browse your Twitch clips and YouTube videos inside SocialMate and schedule them without downloading anything.',
  },
  {
    icon: Users,
    title: 'Teams',
    desc: 'Invite people, assign roles, and run approval workflows before anything goes out. Two seats on the free plan.',
  },
  {
    icon: Building2,
    title: 'Client workspaces',
    desc: 'Fully isolated workspaces with their own accounts, posts, analytics, and team. Pro includes one, Agency includes five.',
  },
  {
    icon: Recycle,
    title: 'Evergreen recycling',
    desc: 'Mark your best posts as evergreen and they re-queue automatically when your schedule runs empty.',
  },
  {
    icon: Rss,
    title: 'RSS import',
    desc: 'Pull from any RSS or Atom feed and turn posts into scheduled social posts. Works with any blog or podcast.',
  },
  {
    icon: Telescope,
    title: 'Competitor tracking',
    desc: 'Track up to three competitor accounts on every plan, including free. Know what they posted before you write.',
  },
]

const FREE_TIER = [
  { value: '50',      label: 'AI credits per month' },
  { value: '100',     label: 'Posts per month' },
  { value: '2',       label: 'Team seats' },
  { value: '3',       label: 'Competitor accounts' },
  { value: '1 GB',    label: 'Media storage' },
  { value: '30 days', label: 'Analytics history' },
  { value: '2 weeks', label: 'Scheduling window' },
  { value: 'Free',    label: 'SIGIL link in bio page' },
]

const GUIDES = [
  { vol: '01', title: 'Starting a Business From Scratch', href: '/guides/starting-a-business' },
  { vol: '02', title: 'Marketing on Zero Budget',         href: '/guides/marketing-zero-budget' },
  { vol: '03', title: 'Business Credit, Legal & Tax',     href: '/guides/business-credit-legal' },
  { vol: '04', title: 'Vibe Coding with AI',              href: '/guides/vibe-coding-with-ai' },
]

export default async function Home({ searchParams }: { searchParams: Promise<{ ref?: string }> }) {
  const params = await searchParams
  const refCode = params?.ref || ''

  return (
    <div className="dark relative min-h-screen bg-void font-body text-ink-body">
      {/* Shared Gilgamesh signature. Sits at z-0 behind everything; content is
          lifted to z-10 so the embers read as atmosphere, never as foreground. */}
      <EmberField />

      <div className="relative z-10">
      {refCode && <ReferralBanner refCode={refCode} />}

      <PublicNav />

      {/* ══ HERO ═══════════════════════════════════════════════════════════
          Split Console. Copy stays a tight readable column; the loop lives on
          the right as the illuminated screen of the instrument. */}
      {/* overflow-x-clip contains the decorative bloom behind the SOMA panel,
          whose -inset-8 otherwise pushes the document 12px wider than a 360px
          viewport. `clip` rather than `hidden`: it doesn't create a scroll
          container, so it can't break sticky positioning. */}
      <section className="mx-auto w-full max-w-7xl overflow-x-clip px-gutter pt-20 pb-section lg:pt-28">
        {/* min-w-0 on both columns is load-bearing, not defensive. Grid children
            default to min-width:auto, and the loop panel's prompt line is a fixed
            37ch of nowrap mono — without this it sets the column's min-content
            width and shoves the headline and buttons off a 360px screen. */}
        <div className="grid items-center gap-14 lg:grid-cols-[1.2fr_1fr] lg:gap-20">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2.5 rounded-full border border-edge bg-panel px-3.5 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-jade" aria-hidden="true" />
              <span className="font-mono text-eyebrow uppercase text-ink-muted">
                7 platforms live
              </span>
            </div>

            {/* display-lg, not display-xl. In a split layout 76px forces this
                headline onto four lines and it stops reading as confident and
                starts reading as shouting. 56px on two lines is the composed
                version, and restraint is the whole thesis. */}
            <h1 className="mt-7 font-display text-display-lg text-balance text-ink-high">
              Post everywhere.
              <br />
              Stop opening six tabs.
            </h1>

            {/* Chanel's rule: this used to name all seven platforms, which the
                mono row directly below already answers. Saying it twice was the
                accessory. This line does the job the list can't — what the thing
                is for. */}
            <p className="mt-6 max-w-lg text-body-lg text-pretty text-ink-muted">
              One compose box, one schedule, and a queue that tells you what
              actually went live.
            </p>

            <div className="mt-9 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
              <Button href="/signup" variant="primary">Create free account</Button>
              <Button href="/pricing" variant="secondary">See pricing</Button>
            </div>

            <p className="mt-5 font-mono text-eyebrow uppercase text-ink-faint">
              No card required · Free plan never expires
            </p>

            {/* Platform marks render in mono, not brand colors. Logos are data;
                color on this page is reserved for state. */}
            <div className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-edge pt-7">
              {LIVE_PLATFORMS.map(p => (
                <span key={p} className="inline-flex items-center gap-2 text-ink-faint">
                  <PlatformIcon name={p} size={15} mono />
                  <span className="font-mono text-eyebrow uppercase">{p}</span>
                </span>
              ))}
            </div>
          </div>

          <div className="min-w-0">
            <HeroLoop />
          </div>
        </div>
      </section>

      {/* ══ LIVE PROOF ═════════════════════════════════════════════════════
          Real, DB-backed numbers sit high on the page as social proof. Renders
          nothing at zero rather than inventing it. */}
      <div className="mx-auto w-full max-w-7xl px-gutter pb-section">
        <LazyUserStatsCounter />
      </div>

      {/* ══ PLATFORMS ══════════════════════════════════════════════════════ */}
      <Section id="platforms" divide>
        <Eyebrow>Platform support</Eyebrow>
        <Display size="md" className="mt-5 max-w-2xl">
          Seven live. Including the ones nobody else schedules.
        </Display>
        <Body className="mt-5 max-w-xl text-ink-muted">
          Discord and Telegram scheduling is genuinely rare. Bluesky and Mastodon are
          first-class, not afterthoughts. Twitch clips and YouTube videos schedule
          straight from inside the app.
        </Body>

        <div className="mt-12 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3 lg:grid-cols-4">
          {LIVE_PLATFORMS.map(p => (
            <div key={p} className="flex items-center gap-3 border-b border-edge py-3.5">
              <PlatformIcon name={p} size={17} mono />
              <span className="flex-1 text-small text-ink-body">{p}</span>
              {/* jade = live. Its only job on this page. */}
              <span className="font-mono text-eyebrow uppercase text-jade">Live</span>
            </div>
          ))}
          {/* No opacity-50 here. Dimming a whole row drags real, readable content
              below AA — these rows were measuring ~3.1:1. The ink ramp already
              makes them secondary without making them illegible. */}
          {SOON_PLATFORMS.map(p => (
            <div key={p} className="flex items-center gap-3 border-b border-edge py-3.5">
              <PlatformIcon name={p} size={17} mono className="opacity-60" />
              <span className="flex-1 text-small text-ink-muted">{p}</span>
              <span className="font-mono text-eyebrow uppercase text-ink-faint">Soon</span>
            </div>
          ))}
        </div>
      </Section>

      {/* ══ SOMA / AI ══════════════════════════════════════════════════════
          The only section allowed to be violet, because it is the only section
          about machine intelligence. */}
      <Section divide>
        <Eyebrow tone="violet">SOMA · AI</Eyebrow>
        <Display size="md" className="mt-5 max-w-2xl">
          SOMA writes in your voice while you&apos;re asleep.
        </Display>
        <Body className="mt-5 max-w-xl text-ink-muted">
          Answer a voice interview once and SOMA learns how you actually sound. Then it
          drafts a week of posts, per platform, and puts them in your queue for review.
          Fifteen more AI tools sit alongside it. Fifty credits a month, free.
        </Body>

        <Reveal>
          <div className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-edge bg-edge sm:grid-cols-3 lg:grid-cols-4">
            {AI_TOOLS.map(tool => (
              <div key={tool.name} className="bg-panel p-5">
                <tool.icon className="h-4 w-4 text-violet" strokeWidth={2} aria-hidden="true" />
                <p className="mt-4 text-small leading-snug text-ink-body">{tool.name}</p>
                <p className="mt-1.5 font-mono text-eyebrow uppercase text-ink-faint">
                  {tool.credits} credits
                </p>
              </div>
            ))}
          </div>
        </Reveal>

        <div className="mt-10">
          <Button href="/ai-features" variant="secondary">See every AI tool</Button>
        </div>
      </Section>

      {/* ══ FEATURES ═══════════════════════════════════════════════════════ */}
      <Section divide>
        <Eyebrow>The rest of it</Eyebrow>
        <Display size="md" className="mt-5 max-w-2xl">
          Everything that usually costs extra.
        </Display>

        <div className="mt-12 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(f => (
            <div key={f.title}>
              <f.icon className="h-4.5 w-4.5 text-ink-muted" strokeWidth={2} aria-hidden="true" />
              <h3 className="mt-4 font-display text-title text-ink-high">{f.title}</h3>
              <p className="mt-2.5 text-small leading-relaxed text-ink-muted">{f.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ══ FREE TIER ══════════════════════════════════════════════════════
          jade here means "included," which is the same promise as "live." */}
      <Section divide>
        <Eyebrow tone="jade">Included at $0</Eyebrow>
        <Display size="md" className="mt-5 max-w-2xl">
          The free plan is not a trial.
        </Display>
        <Body className="mt-5 max-w-xl text-ink-muted">
          No countdown, no card, no feature you rely on disappearing in fourteen days.
          Credits exist to cover the cost of AI compute, and nothing else is gated behind
          them.
        </Body>

        <div className="mt-12 grid grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-4">
          {FREE_TIER.map(item => (
            <div key={item.label} className="border-t border-edge pt-4">
              <p className="font-mono text-2xl font-semibold tracking-tight text-ink-high">
                {item.value}
              </p>
              <p className="mt-2 text-small leading-snug text-ink-muted">{item.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-3">
          {['Scheduling', 'Bulk upload', 'Analytics', 'Link in bio', 'Competitor tracking'].map(x => (
            <span key={x} className="inline-flex items-center gap-2 text-small text-ink-muted">
              <Check className="h-3.5 w-3.5 text-jade" strokeWidth={3} aria-hidden="true" />
              {x}
            </span>
          ))}
        </div>
      </Section>

      {/* ══ THE PRICE BEAT ═════════════════════════════════════════════════
          The section with the least going on hits the hardest. No competitor is
          named — the reader does the math themselves, and it lands ten times
          harder because they did. */}
      <Section width="narrow" divide className="text-center">
        <Eyebrow>What it costs</Eyebrow>

        {/* The number is the section. Amber is the primary brand voice, and a
            soft bloom behind it makes the price read as the headline it is. */}
        <div className="relative mt-14 flex justify-center">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-1/2 -z-10 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber/20 blur-[80px]"
          />
          <p className="font-mono text-numeral leading-none">
            <span className="bg-gradient-to-b from-amber-bright to-amber bg-clip-text text-transparent">
              $5
            </span>
          </p>
        </div>
        <p className="mt-6 text-body text-ink-muted">SocialMate Pro. Per month.</p>

        <div className="mt-16 flex flex-col items-center gap-5">
          <span className="inline-flex items-center gap-2 rounded-full border border-amber/30 bg-amber/10 px-3.5 py-1.5 font-mono text-eyebrow uppercase text-amber">
            Roughly one-twentieth of the going rate
          </span>
          <p className="mx-auto max-w-md text-body-lg text-pretty text-ink-muted">
            The rest of the category runs{' '}
            <span className="font-mono text-ink-faint line-through">$99</span> a month.
            We didn&apos;t remove features to get here.
          </p>
        </div>

        <div className="mt-12 flex justify-center">
          <Button href="/signup" variant="primary">Create free account</Button>
        </div>
      </Section>

      {/* ══ GUIDES ═════════════════════════════════════════════════════════
          Numbered markers are legitimate here: the volumes are a sequence. */}
      <Section divide>
        <Eyebrow>Gilgamesh&apos;s Guides</Eyebrow>
        <Display size="md" className="mt-5 max-w-2xl">
          Four playbooks. No email required.
        </Display>

        <Reveal>
          <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-edge bg-edge sm:grid-cols-2">
            {GUIDES.map(g => (
              <Link
                key={g.vol}
                href={g.href}
                className="tap group flex items-baseline gap-5 bg-panel p-6 hover:bg-raised"
              >
                <span className="font-mono text-mono text-ink-faint">{g.vol}</span>
                <span className="flex-1 text-body text-ink-body group-hover:text-ink-high">
                  {g.title}
                </span>
              </Link>
            ))}
          </div>
        </Reveal>

        <div className="mt-10">
          <Button href="/guides" variant="secondary">Browse all guides</Button>
        </div>
      </Section>

      {/* ══ SM-GIVE ════════════════════════════════════════════════════════ */}
      <Section width="narrow" divide>
        <Eyebrow>SM-Give</Eyebrow>
        <Display size="md" className="mt-5">
          Two percent of every subscription goes out the door.
        </Display>
        <Body className="mt-5 max-w-xl text-ink-muted">
          School supply bookbags, baby essentials for struggling parents, and homeless care
          packages. No corporate partners, no sponsors, no matching-gift press release.
        </Body>

        <div className="mt-10 flex flex-wrap gap-x-8 gap-y-4">
          {([
            { icon: Backpack, label: 'School supplies' },
            { icon: Baby,     label: 'Baby essentials' },
            { icon: HomeIcon, label: 'Homeless care' },
          ] as { icon: LucideIcon; label: string }[]).map(tag => (
            <span key={tag.label} className="inline-flex items-center gap-2.5 text-small text-ink-muted">
              <tag.icon className="h-4 w-4 text-ink-faint" strokeWidth={2} aria-hidden="true" />
              {tag.label}
            </span>
          ))}
        </div>

        <div className="mt-10">
          <Button href="/give" variant="secondary">How SM-Give works</Button>
        </div>
      </Section>

      {/* ══ FINAL CTA ══════════════════════════════════════════════════════ */}
      <Section width="narrow" divide className="text-center">
        <Display size="lg">Start posting everywhere.</Display>
        <Body className="mx-auto mt-6 max-w-md text-ink-muted">
          Free plan, no card, set up in about a minute. Upgrade to Pro for $5 whenever it
          earns it.
        </Body>
        <div className="mt-10 flex justify-center">
          <Button href="/signup" variant="primary">Create free account</Button>
        </div>
      </Section>

      {/* ══ FOOTER ═════════════════════════════════════════════════════════
          Shared instrument footer — identical to every other public page. The
          empty className drops the default mt-16 since the Section above already
          sets the rhythm. */}
      <PublicFooter className="" />
      </div>
    </div>
  )
}
