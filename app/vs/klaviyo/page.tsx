'use client'

import Link from 'next/link'
import PublicFooter from '@/components/PublicFooter'
import { useI18n } from '@/contexts/I18nContext'

const COMPARISON = [
  { feature: 'Starting price',           klaviyo: '$45/month (500 contacts)',      socialmate: '$0 — free forever'       },
  { feature: 'Primary focus',            klaviyo: 'Email & SMS marketing',         socialmate: 'Social media scheduling'  },
  { feature: 'Social media scheduling',  klaviyo: '❌ Not included',               socialmate: '✅ 7 platforms'           },
  { feature: 'Email campaigns',          klaviyo: '✅ Core feature',               socialmate: '❌ Not included'          },
  { feature: 'AI writing tools',         klaviyo: 'AI subject line suggestions',   socialmate: '15+ social AI tools free' },
  { feature: 'Discord support',          klaviyo: '❌',                             socialmate: '✅'                      },
  { feature: 'Telegram support',         klaviyo: '❌',                             socialmate: '✅'                      },
  { feature: 'Bluesky support',          klaviyo: '❌',                             socialmate: '✅'                      },
  { feature: 'Mastodon support',         klaviyo: '❌',                             socialmate: '✅'                      },
  { feature: 'TikTok support',           klaviyo: '❌',                             socialmate: '✅'                      },
  { feature: 'LinkedIn support',         klaviyo: '❌',                             socialmate: '✅'                      },
  { feature: 'Free plan',                klaviyo: '500 email sends (limited)',      socialmate: '✅ Full free plan'        },
  { feature: 'Bulk scheduling',          klaviyo: '❌',                             socialmate: '✅ Free'                  },
  { feature: 'Link in bio (SIGIL)',       klaviyo: '❌',                             socialmate: '✅ Free'                  },
  { feature: 'Competitor tracking',      klaviyo: '❌',                             socialmate: '✅ Free (3 accounts)'    },
]

const FAQ = [
  {
    q: "Is Klaviyo a social media tool?",
    a: "No. Klaviyo is an email and SMS marketing platform for e-commerce brands. It does not schedule social media posts, connect to platforms like Bluesky or Discord, or provide social AI writing tools. If you are looking for a social media scheduler, Klaviyo is not the right comparison.",
  },
  {
    q: 'Why are people comparing Klaviyo and SocialMate?',
    a: 'Both are creator and brand marketing tools, but they serve different channels. Klaviyo is for email; SocialMate is for social media. If you need both, you would use them together. If you are deciding where to invest your marketing time and budget first, social media with SocialMate (free) is a lower barrier to entry than Klaviyo ($45+/month).',
  },
  {
    q: 'Can SocialMate replace Klaviyo?',
    a: "No — and that is the honest answer. SocialMate is a social media tool. Klaviyo is an email tool. They are complementary. However, if you are a creator just getting started and wondering whether to invest in email marketing or social media scheduling first, SocialMate's free plan lets you build an audience across 7 platforms at zero cost.",
  },
  {
    q: 'What does SocialMate do that Klaviyo does not?',
    a: 'Schedule posts to Discord, Telegram, Bluesky, Mastodon, TikTok, LinkedIn, and X/Twitter. Generate captions, threads, hooks, and hashtags with 15+ AI tools. Track competitors, manage link in bio (SIGIL), view analytics, manage a team, and import RSS feeds — all in one product starting at free.',
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

export default function VsKlaviyoPage() {
  const { t } = useI18n()
  return (
    <div className="dark min-h-screen bg-gray-950">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
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
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-blue-950/30 border border-blue-800 rounded-full px-4 py-1.5 text-xs font-bold text-blue-400 mb-4">
            Updated June 2026
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-4 text-white">
            SocialMate vs Klaviyo
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Klaviyo is an email platform, not a social media scheduler. SocialMate covers 7 platforms with bulk scheduling, 15+ AI tools, and competitor tracking — free to start.
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          <div className="bg-gray-900 border-2 border-gray-700 rounded-2xl p-6">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Klaviyo</p>
            <p className="font-extrabold text-lg mb-2 text-white">Excellent email tool. Not a social scheduler.</p>
            <ul className="space-y-1 text-xs text-gray-400">
              <li>✅ Email and SMS automation</li>
              <li>✅ E-commerce integrations</li>
              <li>❌ $45+/month starting price</li>
              <li>❌ No social media scheduling</li>
              <li>❌ No Discord, Telegram, Bluesky, TikTok, LinkedIn</li>
              <li>❌ Not designed for social content creation</li>
            </ul>
          </div>
          <div className="bg-black text-white rounded-2xl p-6">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">SocialMate</p>
            <p className="font-extrabold text-lg mb-2">Social media, AI tools, 7 platforms. Starts free.</p>
            <ul className="space-y-1 text-xs text-gray-300">
              <li>✅ Schedule to 7 platforms simultaneously</li>
              <li>✅ 15+ AI writing tools on free tier</li>
              <li>✅ Discord, Telegram, Bluesky, TikTok, LinkedIn</li>
              <li>✅ Bulk scheduling, competitor tracking, SIGIL</li>
              <li>✅ No credit card required</li>
              <li>✅ Pro plan is $5/month, not $45</li>
            </ul>
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6 text-white">{t('vs_shared.feature_comparison')}</h2>
          <div className="overflow-x-auto"><div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden min-w-[480px]">
            <div className="grid grid-cols-3 bg-gray-800 px-5 py-3 text-xs font-extrabold text-gray-400 uppercase tracking-wide">
              <span>{t('vs_shared.table_feature')}</span>
              <span>Klaviyo</span>
              <span>{t('vs_shared.table_socialmate')}</span>
            </div>
            {COMPARISON.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 px-5 py-3.5 text-sm border-t border-gray-800 ${i % 2 === 0 ? 'bg-gray-900' : 'bg-gray-800/30'}`}>
                <span className="font-semibold text-gray-300 text-xs">{row.feature}</span>
                <span className="text-xs text-gray-400">{row.klaviyo}</span>
                <span className="text-xs font-semibold text-gray-100">{row.socialmate}</span>
              </div>
            ))}
          </div></div>
        </div>

        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6 text-white">Different tools for different jobs</h2>
          <div className="space-y-4">
            {[
              {
                n: '1',
                title: 'Klaviyo is for email. SocialMate is for social.',
                desc: 'This is not a battle — they serve different channels. Klaviyo helps you email your list. SocialMate helps you schedule posts across Discord, Telegram, Bluesky, Mastodon, TikTok, LinkedIn, and X. If you need both, use both. If you are starting out, SocialMate is free.',
              },
              {
                n: '2',
                title: 'SocialMate is 9x cheaper than Klaviyo at the entry level',
                desc: "Klaviyo's starting plan is $45/month for 500 contacts. SocialMate's Pro plan is $5/month for unlimited posts across 7 platforms. If budget is a concern, the math is clear.",
              },
              {
                n: '3',
                title: 'Social AI tools you will not find in Klaviyo',
                desc: 'SocialMate includes 15+ AI tools: caption generator, thread builder, hashtag suggester, hook writer, content repurposer, post scorer, and more. Klaviyo has AI for email subject lines. Different tools for different jobs.',
              },
              {
                n: '4',
                title: 'Build your social audience first — then monetize via email',
                desc: 'The most effective creator funnel: grow on social with SocialMate, then capture emails with your preferred tool. SocialMate handles the top of the funnel across 7 platforms so you have an audience to convert.',
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

        <div className="bg-black text-white rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-extrabold tracking-tight mb-3">Ready to build your social presence?</h2>
          <p className="text-gray-400 text-sm mb-6 max-w-lg mx-auto">
            SocialMate covers 7 platforms, 15+ AI tools, and bulk scheduling — completely free to start. No credit card required.
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
