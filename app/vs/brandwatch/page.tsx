'use client'

import Link from 'next/link'
import PublicFooter from '@/components/PublicFooter'
import { useI18n } from '@/contexts/I18nContext'

const COMPARISON = [
  { feature: 'Starting price',           brandwatch: '$1,000+/month (enterprise)',  socialmate: '$0 — free forever'       },
  { feature: 'Social scheduling',        brandwatch: '❌ Not included',             socialmate: '✅ Full scheduler included' },
  { feature: 'Competitor tracking',      brandwatch: '✅ Advanced (paid)',           socialmate: '✅ Free (3 accounts)'    },
  { feature: 'AI writing tools',         brandwatch: '❌',                           socialmate: '15+ tools free'           },
  { feature: 'Platform coverage',        brandwatch: 'Twitter, Facebook, Instagram', socialmate: '7 platforms incl. Discord/Telegram' },
  { feature: 'Discord monitoring',       brandwatch: '❌',                           socialmate: '✅'                      },
  { feature: 'Telegram monitoring',      brandwatch: '❌',                           socialmate: '✅'                      },
  { feature: 'Bluesky / Mastodon',       brandwatch: '❌',                           socialmate: '✅'                      },
  { feature: 'Free plan',                brandwatch: '❌ Demo only',                socialmate: '✅ Free forever'          },
  { feature: 'Content scheduling',       brandwatch: '❌ Requires separate tool',   socialmate: '✅ Built in'              },
  { feature: 'Bulk scheduling',          brandwatch: '❌',                           socialmate: '✅ Free'                  },
  { feature: 'Link in bio (SIGIL)',       brandwatch: '❌',                           socialmate: '✅ Free'                  },
  { feature: 'Team seats (free)',         brandwatch: 'N/A — no free plan',          socialmate: '2'                       },
  { feature: 'Target audience',          brandwatch: 'Enterprise & agencies',        socialmate: 'Creators, small biz, agencies' },
]

const FAQ = [
  {
    q: "Who is Brandwatch actually for?",
    a: "Brandwatch is an enterprise social listening platform targeting large brands and agencies with dedicated research teams. Plans start at $1,000+/month and require a sales call. It is not built for individual creators or small businesses who need to schedule and publish content.",
  },
  {
    q: 'Does Brandwatch include a post scheduler?',
    a: 'No. Brandwatch is a listening and analytics platform, not a scheduler. To actually publish content you need a separate tool. SocialMate combines competitor tracking, scheduling, AI writing, and analytics in one product starting at $0.',
  },
  {
    q: 'Can SocialMate replace Brandwatch for small businesses?',
    a: "For most small businesses and creators, yes. SocialMate's competitor tracking lets you follow up to 3 competitor accounts on the free plan, monitor their posting patterns, and get alerts when they publish. You also get a full scheduler, 15+ AI tools, and 7-platform support. Brandwatch's deep NLP sentiment analysis and firehose data are overkill unless you're running a major brand.",
  },
  {
    q: 'Does SocialMate track mentions?',
    a: 'SocialMate tracks competitor post activity and engagement. For full mention monitoring across the open web, that is a niche enterprise tool. What SocialMate does is let you schedule content, track competitor performance, and grow — all in one affordable tool.',
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

export default function VsBrandwatchPage() {
  const { t } = useI18n()
  return (
    <div className="dark min-h-screen bg-gray-950">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      {/* NAV */}
      <nav className="border-b border-gray-800 bg-gray-950 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="SocialMate" className="w-8 h-8 rounded-xl" />
            <span className="font-bold tracking-tight text-white">SocialMate</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-xs font-semibold text-gray-400 hover:text-white transition-colors">{t('vs_shared.nav_login')}</Link>
            <Link href="/signup" className="text-xs font-bold px-4 py-2 bg-amber-500 text-black rounded-xl hover:opacity-80 transition-all">{t('vs_shared.nav_start_free')}</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-12">

        {/* HERO */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-blue-950/30 border border-blue-800 rounded-full px-4 py-1.5 text-xs font-bold text-blue-400 mb-4">
            Updated June 2026
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-4 text-white">
            SocialMate vs Brandwatch
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Brandwatch costs $1,000+/month and does not even include a post scheduler. SocialMate gives you competitor tracking, scheduling, 15+ AI tools, and 7 platforms — free to start.
          </p>
          <div className="flex items-center justify-center gap-4 mt-6">
            <Link href="/signup" className="px-6 py-3 bg-amber-500 text-black font-bold rounded-2xl hover:opacity-80 transition-all text-sm">
              {t('vs_shared.cta_try_free')}
            </Link>
            <Link href="/pricing" className="px-6 py-3 border border-gray-700 font-semibold rounded-2xl hover:border-gray-500 transition-all text-sm text-gray-200">
              {t('vs_shared.cta_see_pricing')}
            </Link>
          </div>
        </div>

        {/* VERDICT BANNER */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          <div className="bg-gray-900 border-2 border-gray-700 rounded-2xl p-6">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Brandwatch</p>
            <p className="font-extrabold text-lg mb-2 text-white">Enterprise listening tool with enterprise price</p>
            <ul className="space-y-1 text-xs text-gray-400">
              <li>✅ Deep social listening & sentiment</li>
              <li>✅ Large historical data sets</li>
              <li>❌ $1,000+/month starting price</li>
              <li>❌ No content scheduler — you still need another tool</li>
              <li>❌ No Discord, Telegram, Bluesky, or Mastodon</li>
              <li>❌ Not designed for creators or small businesses</li>
            </ul>
          </div>
          <div className="bg-black text-white rounded-2xl p-6">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">SocialMate</p>
            <p className="font-extrabold text-lg mb-2">Schedule + track competitors. All in one. Starts free.</p>
            <ul className="space-y-1 text-xs text-gray-300">
              <li>✅ Competitor tracking built in (free)</li>
              <li>✅ Full post scheduler — all 7 platforms</li>
              <li>✅ 15+ AI writing tools included</li>
              <li>✅ Discord, Telegram, Bluesky, Mastodon</li>
              <li>✅ No credit card required</li>
              <li>✅ Free plan — not a demo, not a trial</li>
            </ul>
          </div>
        </div>

        {/* COMPARISON TABLE */}
        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6 text-white">{t('vs_shared.feature_comparison')}</h2>
          <div className="overflow-x-auto"><div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden min-w-[480px]">
            <div className="grid grid-cols-3 bg-gray-800 px-5 py-3 text-xs font-extrabold text-gray-400 uppercase tracking-wide">
              <span>{t('vs_shared.table_feature')}</span>
              <span>Brandwatch</span>
              <span>{t('vs_shared.table_socialmate')}</span>
            </div>
            {COMPARISON.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 px-5 py-3.5 text-sm border-t border-gray-800 ${i % 2 === 0 ? 'bg-gray-900' : 'bg-gray-800/30'}`}>
                <span className="font-semibold text-gray-300 text-xs">{row.feature}</span>
                <span className="text-xs text-gray-400">{row.brandwatch}</span>
                <span className="text-xs font-semibold text-gray-100">{row.socialmate}</span>
              </div>
            ))}
          </div></div>
        </div>

        {/* WHY SWITCH */}
        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6 text-white">Why most creators and small businesses do not need Brandwatch</h2>
          <div className="space-y-4">
            {[
              {
                n: '1',
                title: 'Brandwatch does not schedule posts',
                desc: 'You pay $1,000+/month and still need a separate tool to actually publish content. SocialMate gives you competitor tracking and a full scheduler in one product at a fraction of the price.',
              },
              {
                n: '2',
                title: 'The price is enterprise-only',
                desc: 'Brandwatch is built for Fortune 500 brands with dedicated social listening teams. For creators, solopreneurs, and small businesses, the ROI simply does not add up. SocialMate\'s Pro plan is $5/month.',
              },
              {
                n: '3',
                title: 'SocialMate tracks the platforms that matter to you',
                desc: 'Brandwatch focuses on the legacy platforms — Twitter, Facebook, Instagram. It has no support for Discord, Telegram, Bluesky, or Mastodon. If your community lives on these platforms, Brandwatch is blind to them.',
              },
              {
                n: '4',
                title: 'Creator OS, not just listening',
                desc: 'SocialMate is an entire Creator OS — scheduler, AI tools, competitor tracking, link in bio (SIGIL), analytics, inbox, and more. Brandwatch is one expensive slice of that stack with no publishing capability.',
              },
            ].map((r) => (
              <div key={r.n} className="flex gap-4 p-5 bg-gray-800 border border-gray-700 rounded-2xl hover:border-gray-600 transition-all">
                <div className="w-8 h-8 bg-amber-500 text-black rounded-full flex items-center justify-center text-sm font-extrabold flex-shrink-0">{r.n}</div>
                <div>
                  <p className="text-sm font-extrabold mb-1 text-gray-100">{r.title}</p>
                  <p className="text-xs text-gray-400 leading-relaxed">{r.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6 text-white">{t('vs_shared.faq_heading')}</h2>
          <div className="space-y-4">
            {FAQ.map((faq, i) => (
              <div key={i} className="p-5 bg-gray-800 border border-gray-700 rounded-2xl">
                <p className="text-sm font-extrabold mb-2 text-gray-100">{faq.q}</p>
                <p className="text-xs text-gray-400 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-black text-white rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-extrabold tracking-tight mb-3">All-in-one beats one expensive slice</h2>
          <p className="text-gray-400 text-sm mb-6 max-w-lg mx-auto">
            Get scheduling, competitor tracking, 15+ AI tools, and 7 platforms in one product. Starts free — no credit card required.
          </p>
          <Link href="/signup" className="inline-block bg-amber-500 text-black font-bold px-8 py-3.5 rounded-2xl hover:opacity-90 transition-all text-sm">
            {t('vs_shared.cta_create_free')}
          </Link>
          <p className="text-gray-600 text-xs mt-3">{t('vs_shared.cta_no_card')}</p>
        </div>
      </div>
      <PublicFooter />
    </div>
  )
}
