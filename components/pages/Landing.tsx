import Link from 'next/link'
import type { Metadata } from 'next'
import ReferralBanner from '@/app/components/ReferralBanner'
import PublicNav from '@/components/PublicNav'
import PublicFooter from '@/components/PublicFooter'
import LazyUserStatsCounter from '@/components/LazyUserStatsCounter'
import PlatformIcon from '@/components/landing/PlatformIcon'
import HeroLoop from '@/components/landing/HeroLoop'
import EmberField from '@/components/landing/EmberField'
import Reveal from '@/components/landing/Reveal'
import { Section, Eyebrow, Display, Body, Button } from '@/components/instrument/primitives'
import { PLAN_POST_LIMITS } from '@/lib/post-limits'
import {
  PenLine, Hash, RefreshCw, TrendingUp, MessagesSquare, Recycle, Zap, Flame,
  Radar, Search, CalendarDays, ImagePlus, CalendarClock, BarChart3, Link2,
  Users, Building2, Rss, Telescope, Clapperboard, Check, Backpack, Baby,
  Home as HomeIcon,
  type LucideIcon,
} from 'lucide-react'

// Direct JSON imports — zero next-intl dependency. See CLAUDE.md: the plugin
// injects a webpack alias Turbopack silently ignores.
import enMessages from '@/messages/en.json'
import esMessages from '@/messages/es.json'
import ptMessages from '@/messages/pt.json'
import frMessages from '@/messages/fr.json'
import deMessages from '@/messages/de.json'
import ruMessages from '@/messages/ru.json'
import zhMessages from '@/messages/zh.json'
import jaMessages from '@/messages/ja.json'
import koMessages from '@/messages/ko.json'

/* ──────────────────────────────────────────────────────────────────────────────
   ONE LANDING PAGE. NINE LANGUAGES.

   Until now there were two: app/page.tsx carried the July "instrument" rebuild
   (PRs #513–#524) and components/pages/LocalizedLanding.tsx carried the design
   that rebuild replaced. Every /es /de /fr /pt /ru /zh /ja /ko visitor got the
   old one — different headline, emoji platform pills, gradient hero, different
   sections in a different order. Switching language changed what product you
   appeared to be looking at.

   That is the same failure this codebase keeps having with quota tables: a
   second copy of something, updated once. The fix is the same. There is one
   landing page and it takes a locale.

   COLOR IS A LANGUAGE ON THIS PAGE, NOT DECORATION.

     amber  → queued · scheduled · in-flight · primary brand voice
     violet → AI · SOMA · generation · credits
     jade   → published · live · included · real

   Anything that doesn't fit one of those three is neutral. Adding a fourth
   color, or using jade because a section "needed some green," breaks it.
   ────────────────────────────────────────────────────────────────────────────── */

const ALL_MESSAGES: Record<string, typeof enMessages> = {
  en: enMessages, es: esMessages, pt: ptMessages,
  fr: frMessages, de: deMessages, ru: ruMessages, zh: zhMessages,
  ja: jaMessages as unknown as typeof enMessages,
  ko: koMessages as unknown as typeof enMessages,
}

/**
 * Look a key up in the locale bundle, falling back to English.
 *
 * The fallback is the safety net that makes adding copy safe: a new key shows in
 * English everywhere until translated, rather than rendering a raw key path.
 */
function createT(locale: string) {
  const msgs = ALL_MESSAGES[locale] ?? enMessages
  return function t(key: string): string {
    const parts = key.split('.')
    let val: unknown = msgs
    for (const p of parts) val = (val as Record<string, unknown>)?.[p]
    if (typeof val === 'string') return val
    let fb: unknown = enMessages
    for (const p of parts) fb = (fb as Record<string, unknown>)?.[p]
    return typeof fb === 'string' ? fb : key
  }
}

const LIVE_PLATFORMS = ['Bluesky', 'Discord', 'Telegram', 'Mastodon', 'X', 'TikTok', 'LinkedIn']
const SOON_PLATFORMS = ['YouTube', 'Pinterest', 'Reddit']

// Tool names are product names and stay English in every locale, exactly as they
// did before. Only the credit cost is data.
const AI_TOOLS: { name: string; icon: LucideIcon; credits: string }[] = [
  { name: 'Caption Generator',    icon: PenLine,        credits: '5'  },
  { name: 'Hashtag Generator',    icon: Hash,           credits: '5'  },
  { name: 'Post Rewriter',        icon: RefreshCw,      credits: '5'  },
  { name: 'Viral Hook Generator', icon: TrendingUp,     credits: '5'  },
  { name: 'Thread Generator',     icon: MessagesSquare, credits: '10' },
  { name: 'Content Repurposer',   icon: Recycle,        credits: '10' },
  { name: 'Post Score',           icon: Zap,            credits: '5'  },
  { name: 'SM-Pulse',             icon: Flame,          credits: '20' },
  { name: 'SM-Radar',             icon: Radar,          credits: '20' },
  { name: 'Content Gap Detector', icon: Search,         credits: '10' },
  { name: 'AI Content Calendar',  icon: CalendarDays,   credits: '25' },
  { name: 'AI Image Generation',  icon: ImagePlus,      credits: '25' },
]

const FEATURES: { icon: LucideIcon; key: string }[] = [
  { icon: CalendarClock, key: 'scheduling'  },
  { icon: BarChart3,     key: 'analytics'   },
  { icon: Link2,         key: 'sigil'       },
  { icon: Clapperboard,  key: 'clips'       },
  { icon: Users,         key: 'teams'       },
  { icon: Building2,     key: 'workspaces'  },
  { icon: Recycle,       key: 'evergreen'   },
  { icon: Rss,           key: 'rss'         },
  { icon: Telescope,     key: 'competitors' },
]

// Values that are numbers stay numbers in every language; the ones carrying a
// unit are translated. The post cap reads from the shared table rather than
// being typed here — this block previously said 100 while the server enforced
// 250, which is the same drift that produced the August pricing corrections.
const FREE_TIER: { value: string | null; valueKey?: string; labelKey: string }[] = [
  { value: '50',                              labelKey: 'credits'     },
  { value: String(PLAN_POST_LIMITS.free),     labelKey: 'posts'       },
  { value: '2',                               labelKey: 'seats'       },
  { value: '3',                               labelKey: 'competitors' },
  { value: null, valueKey: 'storage_value',   labelKey: 'storage'     },
  { value: null, valueKey: 'analytics_value', labelKey: 'analytics'   },
  { value: null, valueKey: 'window_value',    labelKey: 'window'      },
  { value: null, valueKey: 'sigil_value',     labelKey: 'sigil'       },
]

const GUIDES = [
  { vol: '01', key: 'vol1', href: '/guides/starting-a-business'   },
  { vol: '02', key: 'vol2', href: '/guides/marketing-zero-budget' },
  { vol: '03', key: 'vol3', href: '/guides/business-credit-legal' },
  { vol: '04', key: 'vol4', href: '/guides/vibe-coding-with-ai'   },
]

const LOCALE_URLS: Record<string, string> = {
  'x-default': 'https://socialmate.studio',
  en: 'https://socialmate.studio',
  es: 'https://socialmate.studio/es',
  pt: 'https://socialmate.studio/pt',
  fr: 'https://socialmate.studio/fr',
  de: 'https://socialmate.studio/de',
  ru: 'https://socialmate.studio/ru',
  zh: 'https://socialmate.studio/zh',
  ja: 'https://socialmate.studio/ja',
  ko: 'https://socialmate.studio/ko',
}

export function generateLocaleMetadata(locale: string): Metadata {
  const t = createT(locale)
  return {
    title: 'SocialMate — Free Social Media Scheduler',
    description: t('landing.hero.sub'),
    alternates: {
      // Every locale points its canonical at the English page — these are
      // translations of one document, not nine separate ones.
      canonical: 'https://socialmate.studio',
      languages: LOCALE_URLS,
    },
  }
}

export default function Landing({
  locale = 'en',
  refCode = '',
}: {
  locale?: string
  refCode?: string
}) {
  const t = createT(locale)

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
                {t('landing.hero.badge')}
              </span>
            </div>

            {/* display-lg, not display-xl. In a split layout 76px forces this
                headline onto four lines and it stops reading as confident and
                starts reading as shouting. 56px on two lines is the composed
                version, and restraint is the whole thesis.

                text-balance matters more here than in English: German and
                Russian run 20–30% longer and would otherwise break badly. */}
            <h1 className="mt-7 font-display text-display-lg text-balance text-ink-high">
              {t('landing.hero.headline_1')}
              <br />
              {t('landing.hero.headline_2')}
            </h1>

            <p className="mt-6 max-w-lg text-body-lg text-pretty text-ink-muted">
              {t('landing.hero.sub')}
            </p>

            <div className="mt-9 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
              <Button href="/signup" variant="primary">{t('landing.hero.cta_primary')}</Button>
              <Button href="/pricing" variant="secondary">{t('landing.hero.cta_secondary')}</Button>
            </div>

            <p className="mt-5 font-mono text-eyebrow uppercase text-ink-faint">
              {t('landing.hero.no_card')}
            </p>

            {/* Platform marks render in mono, not brand colors. Logos are data;
                color on this page is reserved for state. Names are proper nouns
                and stay untranslated in every locale. */}
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
        <Eyebrow>{t('landing.platforms.eyebrow')}</Eyebrow>
        <Display size="md" className="mt-5 max-w-2xl">
          {t('landing.platforms.headline')}
        </Display>
        <Body className="mt-5 max-w-xl text-ink-muted">
          {t('landing.platforms.body')}
        </Body>

        <div className="mt-12 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3 lg:grid-cols-4">
          {LIVE_PLATFORMS.map(p => (
            <div key={p} className="flex items-center gap-3 border-b border-edge py-3.5">
              <PlatformIcon name={p} size={17} mono />
              <span className="flex-1 text-small text-ink-body">{p}</span>
              {/* jade = live. Its only job on this page. */}
              <span className="font-mono text-eyebrow uppercase text-jade">
                {t('landing.platforms.live')}
              </span>
            </div>
          ))}
          {/* No opacity-50 here. Dimming a whole row drags real, readable content
              below AA — these rows were measuring ~3.1:1. The ink ramp already
              makes them secondary without making them illegible. */}
          {SOON_PLATFORMS.map(p => (
            <div key={p} className="flex items-center gap-3 border-b border-edge py-3.5">
              <PlatformIcon name={p} size={17} mono className="opacity-60" />
              <span className="flex-1 text-small text-ink-muted">{p}</span>
              <span className="font-mono text-eyebrow uppercase text-ink-faint">
                {t('landing.platforms.soon')}
              </span>
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
          {t('landing.soma.headline')}
        </Display>
        <Body className="mt-5 max-w-xl text-ink-muted">
          {t('landing.soma.body')}
        </Body>

        <Reveal>
          <div className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-edge bg-edge sm:grid-cols-3 lg:grid-cols-4">
            {AI_TOOLS.map(tool => (
              <div key={tool.name} className="bg-panel p-5">
                <tool.icon className="h-4 w-4 text-violet" strokeWidth={2} aria-hidden="true" />
                <p className="mt-4 text-small leading-snug text-ink-body">{tool.name}</p>
                <p className="mt-1.5 font-mono text-eyebrow uppercase text-ink-faint">
                  {tool.credits} {t('landing.soma.credits')}
                </p>
              </div>
            ))}
          </div>
        </Reveal>

        <div className="mt-10">
          <Button href="/ai-features" variant="secondary">{t('landing.soma.cta')}</Button>
        </div>
      </Section>

      {/* ══ FEATURES ═══════════════════════════════════════════════════════ */}
      <Section divide>
        <Eyebrow>{t('landing.features.eyebrow')}</Eyebrow>
        <Display size="md" className="mt-5 max-w-2xl">
          {t('landing.features.headline')}
        </Display>

        <div className="mt-12 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(f => (
            <div key={f.key}>
              <f.icon className="h-4.5 w-4.5 text-ink-muted" strokeWidth={2} aria-hidden="true" />
              <h3 className="mt-4 font-display text-title text-ink-high">
                {t(`landing.features.items.${f.key}.title`)}
              </h3>
              <p className="mt-2.5 text-small leading-relaxed text-ink-muted">
                {t(`landing.features.items.${f.key}.desc`)}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* ══ FREE TIER ══════════════════════════════════════════════════════
          jade here means "included," which is the same promise as "live." */}
      <Section divide>
        <Eyebrow tone="jade">{t('landing.free.eyebrow')}</Eyebrow>
        <Display size="md" className="mt-5 max-w-2xl">
          {t('landing.free.headline')}
        </Display>
        <Body className="mt-5 max-w-xl text-ink-muted">
          {t('landing.free.body')}
        </Body>

        <div className="mt-12 grid grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-4">
          {FREE_TIER.map(item => (
            <div key={item.labelKey} className="border-t border-edge pt-4">
              <p className="font-mono text-2xl font-semibold tracking-tight text-ink-high">
                {item.value ?? t(`landing.free.items.${item.valueKey}`)}
              </p>
              <p className="mt-2 text-small leading-snug text-ink-muted">
                {t(`landing.free.items.${item.labelKey}`)}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-3">
          {['scheduling', 'bulk', 'analytics', 'bio', 'competitors'].map(k => (
            <span key={k} className="inline-flex items-center gap-2 text-small text-ink-muted">
              <Check className="h-3.5 w-3.5 text-jade" strokeWidth={3} aria-hidden="true" />
              {t(`landing.free.checks.${k}`)}
            </span>
          ))}
        </div>
      </Section>

      {/* ══ THE PRICE BEAT ═════════════════════════════════════════════════
          The section with the least going on hits the hardest. No competitor is
          named — the reader does the math themselves, and it lands ten times
          harder because they did. */}
      <Section width="narrow" divide className="text-center">
        <Eyebrow>{t('landing.price.eyebrow')}</Eyebrow>

        {/* The number is the section. Amber is the primary brand voice, and a
            soft bloom behind it makes the price read as the headline it is.
            $8 is not translated — it is the same eight dollars everywhere. */}
        <div className="relative mt-14 flex justify-center">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-1/2 -z-10 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber/20 blur-[80px]"
          />
          <p className="font-mono text-numeral leading-none">
            <span className="bg-gradient-to-b from-amber-bright to-amber bg-clip-text text-transparent">
              $8
            </span>
          </p>
        </div>
        <p className="mt-6 text-body text-ink-muted">{t('landing.price.plan_line')}</p>

        <div className="mt-16 flex flex-col items-center gap-5">
          <span className="inline-flex items-center gap-2 rounded-full border border-amber/30 bg-amber/10 px-3.5 py-1.5 font-mono text-eyebrow uppercase text-amber">
            {t('landing.price.badge')}
          </span>
          <p className="mx-auto max-w-md text-body-lg text-pretty text-ink-muted">
            {t('landing.price.body_before')}{' '}
            <span className="font-mono text-ink-faint line-through">$99</span>{' '}
            {t('landing.price.body_after')}
          </p>
        </div>

        <div className="mt-12 flex justify-center">
          <Button href="/signup" variant="primary">{t('landing.hero.cta_primary')}</Button>
        </div>
      </Section>

      {/* ══ GUIDES ═════════════════════════════════════════════════════════
          Numbered markers are legitimate here: the volumes are a sequence. */}
      <Section divide>
        <Eyebrow>{t('landing.guides.eyebrow')}</Eyebrow>
        <Display size="md" className="mt-5 max-w-2xl">
          {t('landing.guides.headline')}
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
                  {t(`landing.guides.${g.key}`)}
                </span>
              </Link>
            ))}
          </div>
        </Reveal>

        <div className="mt-10">
          <Button href="/guides" variant="secondary">{t('landing.guides.cta')}</Button>
        </div>
      </Section>

      {/* ══ SM-GIVE ════════════════════════════════════════════════════════ */}
      <Section width="narrow" divide>
        <Eyebrow>SM-Give</Eyebrow>
        <Display size="md" className="mt-5">
          {t('landing.give.headline')}
        </Display>
        <Body className="mt-5 max-w-xl text-ink-muted">
          {t('landing.give.body')}
        </Body>

        <div className="mt-10 flex flex-wrap gap-x-8 gap-y-4">
          {([
            { icon: Backpack, key: 'school'   },
            { icon: Baby,     key: 'baby'     },
            { icon: HomeIcon, key: 'homeless' },
          ] as { icon: LucideIcon; key: string }[]).map(tag => (
            <span key={tag.key} className="inline-flex items-center gap-2.5 text-small text-ink-muted">
              <tag.icon className="h-4 w-4 text-ink-faint" strokeWidth={2} aria-hidden="true" />
              {t(`landing.give.${tag.key}`)}
            </span>
          ))}
        </div>

        <div className="mt-10">
          <Button href="/give" variant="secondary">{t('landing.give.cta')}</Button>
        </div>
      </Section>

      {/* ══ FINAL CTA ══════════════════════════════════════════════════════ */}
      <Section width="narrow" divide className="text-center">
        <Display size="lg">{t('landing.final.headline')}</Display>
        <Body className="mx-auto mt-6 max-w-md text-ink-muted">
          {t('landing.final.body')}
        </Body>
        <div className="mt-10 flex justify-center">
          <Button href="/signup" variant="primary">{t('landing.hero.cta_primary')}</Button>
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
