'use client'

import Link from 'next/link'
import PublicFooter from '@/components/PublicFooter'
import { useI18n } from '@/contexts/I18nContext'

const COMPARISON = [
  { feature: 'Starting price',            notion: 'Free / $10/month (Plus)',       socialmate: '$0 — free forever'        },
  { feature: 'Primary focus',             notion: 'Docs, wikis, databases',        socialmate: 'Social media scheduling'  },
  { feature: 'Social media scheduling',   notion: '❌ Cannot post to platforms',   socialmate: '✅ 7 platforms'            },
  { feature: 'Content calendar',          notion: 'Manual tracking only',          socialmate: '✅ Live calendar + scheduler' },
  { feature: 'AI writing tools',          notion: 'Notion AI ($10/month add-on)',  socialmate: '15+ social tools free'    },
  { feature: 'Publish to Bluesky',        notion: '❌',                             socialmate: '✅'                       },
  { feature: 'Publish to Discord',        notion: '❌',                             socialmate: '✅'                       },
  { feature: 'Publish to TikTok',         notion: '❌',                             socialmate: '✅'                       },
  { feature: 'Publish to LinkedIn',       notion: '❌',                             socialmate: '✅'                       },
  { feature: 'Publish to Telegram',       notion: '❌',                             socialmate: '✅'                       },
  { feature: 'Bulk scheduling',           notion: '❌',                             socialmate: '✅ Free'                   },
  { feature: 'Link in bio (SIGIL)',        notion: '❌',                             socialmate: '✅ Free'                   },
  { feature: 'Competitor tracking',       notion: '❌',                             socialmate: '✅ Free (3 accounts)'     },
  { feature: 'Post analytics',            notion: '❌',                             socialmate: '✅ Free'                   },
  { feature: 'Team collaboration',        notion: '✅ Strong (docs-based)',          socialmate: '✅ Social workflow'       },
]

const FAQ = [
  {
    q: "Can Notion schedule social media posts?",
    a: "No. Notion is a productivity and documentation tool. It cannot connect to social media platforms, schedule posts, or publish content automatically. Creators who use Notion for content planning still need a separate scheduler — which is where SocialMate comes in.",
  },
  {
    q: 'Why do creators use Notion as a social media tool?',
    a: "Many creators use Notion to track content ideas, write drafts, and manage an editorial calendar. But Notion cannot actually publish that content. You end up manually copying posts from Notion into each platform — which defeats the purpose of having a system. SocialMate is what actually publishes the content across all 7 platforms at once.",
  },
  {
    q: 'Can I use both Notion and SocialMate?',
    a: "Yes. Many creators use Notion for long-form planning and idea capture, then move approved content into SocialMate for scheduling and publishing. SocialMate has its own built-in drafts system and content calendar, so many users find they can consolidate entirely.",
  },
  {
    q: 'What does SocialMate do that Notion cannot?',
    a: "SocialMate actually publishes your content. It connects to Discord, Telegram, Bluesky, Mastodon, TikTok, LinkedIn, and X/Twitter, and publishes posts on a schedule. It also has 15+ AI writing tools, competitor tracking, analytics, team collaboration for social workflows, and a link in bio builder — all purpose-built for social media.",
  },
]

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ.map(f => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
}

export default function VsNotionhqPage() {
  const { t } = useI18n()
  return (
    <div className="dark min-h-screen bg-panel">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <nav className="border-b border-edge bg-panel sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="SocialMate" className="w-8 h-8 rounded-xl" />
            <span className="font-bold tracking-tight text-ink-high">SocialMate</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-xs font-semibold text-ink-body hover:text-ink-high transition-colors">{t('vs_shared.nav_login')}</Link>
            <Link href="/signup" className="text-xs font-bold px-4 py-2 bg-amber/10 text-ink-high rounded-xl hover:opacity-80 transition-all">{t('vs_shared.nav_start_free')}</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-raised border border-edge-lit rounded-full px-4 py-1.5 text-xs font-bold text-ink-muted mb-4">
            Updated June 2026
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-4 text-ink-high">
            SocialMate vs Notion
          </h1>
          <p className="text-lg text-ink-body max-w-2xl mx-auto">
            Notion helps you plan content. SocialMate actually publishes it — to 7 platforms at once. Stop manually copying posts and let automation do the work.
          </p>
          <div className="flex items-center justify-center gap-4 mt-6">
            <Link href="/signup" className="px-6 py-3 bg-amber/10 text-ink-high font-bold rounded-2xl hover:opacity-80 transition-all text-sm">
              {t('vs_shared.cta_try_free')}
            </Link>
            <Link href="/pricing" className="px-6 py-3 border border-edge font-semibold rounded-2xl hover:border-edge transition-all text-sm text-ink-high">
              {t('vs_shared.cta_see_pricing')}
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          <div className="bg-panel border-2 border-edge rounded-2xl p-6">
            <p className="text-xs font-bold text-ink-body uppercase tracking-wide mb-2">Notion</p>
            <p className="font-extrabold text-lg mb-2 text-ink-high">Great for planning. Cannot actually post.</p>
            <ul className="space-y-1 text-xs text-ink-body">
              <li>✅ Excellent docs and database system</li>
              <li>✅ Flexible content calendar templates</li>
              <li>❌ Cannot connect to any social platform</li>
              <li>❌ Cannot schedule or auto-publish posts</li>
              <li>❌ AI costs extra ($10/month add-on)</li>
              <li>❌ Still requires manual copy-paste to post</li>
            </ul>
          </div>
          <div className="bg-void text-ink-high rounded-2xl p-6">
            <p className="text-xs font-bold text-ink-body uppercase tracking-wide mb-2">SocialMate</p>
            <p className="font-extrabold text-lg mb-2">Write it. Schedule it. Done. 7 platforms.</p>
            <ul className="space-y-1 text-xs text-ink-body">
              <li>✅ Live calendar with actual scheduling</li>
              <li>✅ Auto-publishes to 7 platforms on schedule</li>
              <li>✅ 15+ AI writing tools — no extra charge</li>
              <li>✅ Bulk scheduling for months of content at once</li>
              <li>✅ Discord, Telegram, Bluesky, TikTok, LinkedIn</li>
              <li>✅ No credit card required</li>
            </ul>
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6 text-ink-high">{t('vs_shared.feature_comparison')}</h2>
          <div className="overflow-x-auto"><div className="bg-panel border border-edge rounded-2xl overflow-hidden min-w-[480px]">
            <div className="grid grid-cols-3 bg-raised px-5 py-3 text-xs font-extrabold text-ink-body uppercase tracking-wide">
              <span>{t('vs_shared.table_feature')}</span>
              <span>Notion</span>
              <span>{t('vs_shared.table_socialmate')}</span>
            </div>
            {COMPARISON.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 px-5 py-3.5 text-sm border-t border-edge ${i % 2 === 0 ? 'bg-panel' : 'bg-raised'}`}>
                <span className="font-semibold text-ink-body text-xs">{row.feature}</span>
                <span className="text-xs text-ink-body">{row.notion}</span>
                <span className="text-xs font-semibold text-ink-high">{row.socialmate}</span>
              </div>
            ))}
          </div></div>
        </div>

        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6 text-ink-high">The gap Notion cannot fill</h2>
          <div className="space-y-4">
            {[
              {
                n: '1',
                title: 'Notion does not post. SocialMate does.',
                desc: "The most important difference: Notion cannot publish to any social platform. No matter how organized your Notion content calendar is, you still need to manually post to each platform. SocialMate connects to 7 platforms and publishes on schedule — automatically.",
              },
              {
                n: '2',
                title: 'Stop the copy-paste grind',
                desc: "The Notion social media workflow looks like this: write in Notion → open Twitter → paste + post → open LinkedIn → paste + adjust + post → open Discord → paste + adjust + post. Repeat for 7 platforms. SocialMate eliminates this by scheduling all platforms from one interface.",
              },
              {
                n: '3',
                title: 'AI tools built for social, not documents',
                desc: "Notion AI is built for summarizing documents and writing wiki pages. SocialMate's 15+ AI tools are built for social: caption generator, thread builder, hashtag suggester, hook writer, content repurposer, post scorer. Entirely different use case.",
              },
              {
                n: '4',
                title: 'Consolidate to one tool',
                desc: "Many creators discover they can drop Notion from their social workflow entirely. SocialMate has a built-in drafts system, content calendar, bulk import, and post queue — everything you were tracking in Notion, plus the ability to actually publish it.",
              },
            ].map((r) => (
              <div key={r.n} className="flex gap-4 p-5 bg-raised border border-edge rounded-2xl hover:border-edge transition-all">
                <div className="w-8 h-8 bg-amber/10 text-ink-high rounded-full flex items-center justify-center text-sm font-extrabold flex-shrink-0">{r.n}</div>
                <div>
                  <p className="text-sm font-extrabold mb-1 text-ink-high">{r.title}</p>
                  <p className="text-xs text-ink-body leading-relaxed">{r.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6 text-ink-high">{t('vs_shared.faq_heading')}</h2>
          <div className="space-y-4">
            {FAQ.map((faq, i) => (
              <div key={i} className="p-5 bg-raised border border-edge rounded-2xl">
                <p className="text-sm font-extrabold mb-2 text-ink-high">{faq.q}</p>
                <p className="text-xs text-ink-body leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-void text-ink-high rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-extrabold tracking-tight mb-3">Stop planning. Start publishing.</h2>
          <p className="text-ink-body text-sm mb-6 max-w-lg mx-auto">
            SocialMate connects to 7 platforms and publishes on schedule. Free forever — no credit card required.
          </p>
          <Link href="/signup" className="inline-block bg-amber/10 text-ink-high font-bold px-8 py-3.5 rounded-2xl hover:opacity-90 transition-all text-sm">
            {t('vs_shared.cta_create_free')}
          </Link>
          <p className="text-ink-muted text-xs mt-3">{t('vs_shared.cta_no_card')}</p>
        </div>
      </div>
      <PublicFooter />
    </div>
  )
}
