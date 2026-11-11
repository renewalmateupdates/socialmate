'use client'

import Link from 'next/link'
import PublicFooter from '@/components/PublicFooter'
import { useI18n } from '@/contexts/I18nContext'

/**
 * One comparison page, from data. The Nov 2026 pages use this so the layout
 * and SocialMate's facts (lib/vs-facts.ts) live in one place; each page only
 * holds what was checked about the competitor, and where.
 *
 * Fair by design: every page has a "when they're the better pick" section,
 * because a page that only lists wins reads as an ad and helps nobody choose.
 */

export interface VsRow {
  feature: string
  them: string
  us: string
}

export interface VsComparisonProps {
  competitor: string
  /** Shown under the title: what the competitor facts were checked against, and when. */
  checked: string
  intro: string
  them: { title: string; points: string[] }
  us: { title: string; points: string[] }
  rows: VsRow[]
  /** When the competitor is the better pick. */
  theyWin: string[]
  /** When SocialMate is. */
  weWin: { title: string; desc: string }[]
  faq: { q: string; a: string }[]
  closing: { title: string; body: string }
}

export default function VsComparison(p: VsComparisonProps) {
  const { t } = useI18n()
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: p.faq.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }

  return (
    <div className="dark min-h-screen bg-panel">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <nav className="border-b border-edge bg-panel sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="SocialMate" className="w-8 h-8 rounded-xl" />
            <span className="font-bold tracking-tight text-ink-high">SocialMate</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-xs font-semibold text-ink-muted hover:text-ink-high transition-colors">{t('vs_shared.nav_login')}</Link>
            <Link href="/signup" className="text-xs font-bold px-4 py-2 bg-void text-ink-high rounded-xl hover:opacity-80 transition-all">{t('vs_shared.nav_start_free')}</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-raised border border-edge-lit rounded-full px-4 py-1.5 text-xs font-bold text-ink-muted mb-4">
            Updated November 2026
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-4 text-ink-high">SocialMate vs {p.competitor}</h1>
          <p className="text-lg text-ink-muted max-w-2xl mx-auto">{p.intro}</p>
          <div className="flex flex-wrap items-center justify-center gap-4 mt-6">
            <Link href="/signup" className="px-6 py-3 bg-void text-ink-high font-bold rounded-2xl hover:opacity-80 transition-all text-sm">
              {t('vs_shared.cta_try_free')}
            </Link>
            <Link href="/pricing" className="px-6 py-3 border border-edge font-semibold rounded-2xl hover:border-edge transition-all text-sm text-ink-high">
              {t('vs_shared.cta_see_pricing')}
            </Link>
          </div>
          <p className="text-xs text-ink-faint mt-4">{p.checked}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          <div className="bg-panel border-2 border-edge rounded-2xl p-6">
            <p className="text-xs font-bold text-ink-body uppercase tracking-wide mb-2">{p.competitor}</p>
            <p className="font-extrabold text-lg mb-2 text-ink-high">{p.them.title}</p>
            <ul className="space-y-1 text-xs text-ink-muted">
              {p.them.points.map(pt => <li key={pt}>{pt}</li>)}
            </ul>
          </div>
          <div className="bg-void text-ink-high rounded-2xl p-6">
            <p className="text-xs font-bold text-ink-body uppercase tracking-wide mb-2">SocialMate</p>
            <p className="font-extrabold text-lg mb-2">{p.us.title}</p>
            <ul className="space-y-1 text-xs text-ink-body">
              {p.us.points.map(pt => <li key={pt}>{pt}</li>)}
            </ul>
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6 text-ink-high">{t('vs_shared.feature_comparison')}</h2>
          <div className="overflow-x-auto">
            <div className="bg-panel border border-edge rounded-2xl overflow-hidden min-w-[480px]">
              <div className="grid grid-cols-3 bg-raised px-5 py-3 text-xs font-extrabold text-ink-muted uppercase tracking-wide">
                <span>{t('vs_shared.table_feature')}</span>
                <span>{p.competitor}</span>
                <span>{t('vs_shared.table_socialmate')}</span>
              </div>
              {p.rows.map((row, i) => (
                <div key={row.feature} className={`grid grid-cols-3 px-5 py-3.5 text-sm border-t border-edge ${i % 2 === 0 ? 'bg-panel' : 'bg-raised'}`}>
                  <span className="font-semibold text-ink-body text-xs">{row.feature}</span>
                  <span className="text-xs text-ink-muted">{row.them}</span>
                  <span className="text-xs font-semibold text-ink-high">{row.us}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-4 text-ink-high">When {p.competitor} is the better pick</h2>
          <ul className="space-y-2">
            {p.theyWin.map(w => (
              <li key={w} className="p-4 bg-panel border border-edge rounded-2xl text-xs text-ink-muted leading-relaxed">{w}</li>
            ))}
          </ul>
        </div>

        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6 text-ink-high">When SocialMate is</h2>
          <div className="space-y-4">
            {p.weWin.map((r, i) => (
              <div key={r.title} className="flex gap-4 p-5 bg-panel border border-edge rounded-2xl">
                <div className="w-8 h-8 bg-void text-ink-high rounded-full flex items-center justify-center text-sm font-extrabold flex-shrink-0">{i + 1}</div>
                <div>
                  <p className="text-sm font-extrabold mb-1 text-ink-high">{r.title}</p>
                  <p className="text-xs text-ink-muted leading-relaxed">{r.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6 text-ink-high">{t('vs_shared.faq_heading')}</h2>
          <div className="space-y-4">
            {p.faq.map(f => (
              <div key={f.q} className="p-5 bg-panel border border-edge rounded-2xl">
                <p className="text-sm font-extrabold mb-2 text-ink-high">{f.q}</p>
                <p className="text-xs text-ink-muted leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-void text-ink-high rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-extrabold tracking-tight mb-3">{p.closing.title}</h2>
          <p className="text-ink-body text-sm mb-6 max-w-lg mx-auto">{p.closing.body}</p>
          <Link href="/signup" className="inline-block bg-panel text-ink-high font-bold px-8 py-3.5 rounded-2xl hover:opacity-90 transition-all text-sm">
            {t('vs_shared.cta_create_free')}
          </Link>
          <p className="text-ink-muted text-xs mt-3">{t('vs_shared.cta_no_card')}</p>
        </div>
      </div>
      <PublicFooter />
    </div>
  )
}
