'use client'

import Link from 'next/link'
import PublicFooter from '@/components/PublicFooter'
import { useI18n } from '@/contexts/I18nContext'

const COMPARISON = [
  { feature: 'Price',                          substack: 'Free (10% cut of paid subs)',       socialmate: '$0 — free forever'        },
  { feature: 'Primary purpose',                substack: 'Newsletter + blog publishing',      socialmate: 'Social media scheduling'  },
  { feature: 'Social media scheduling',        substack: '❌ Cannot post to platforms',        socialmate: '✅ 7 platforms native'     },
  { feature: 'Schedule to TikTok',             substack: '❌',                                 socialmate: '✅ Free (20 videos/mo)'   },
  { feature: 'Schedule to LinkedIn',           substack: '❌',                                 socialmate: '✅ Free'                   },
  { feature: 'Schedule to Discord',            substack: '❌',                                 socialmate: '✅ Free'                   },
  { feature: 'Schedule to Telegram',           substack: '❌',                                 socialmate: '✅ Free'                   },
  { feature: 'Schedule to Bluesky',            substack: '⚠️ Substack Notes only',            socialmate: '✅ Full scheduling'        },
  { feature: 'Schedule to Mastodon',           substack: '❌',                                 socialmate: '✅ Free'                   },
  { feature: 'Schedule to X / Twitter',        substack: '❌',                                 socialmate: '✅ (Pro+)'                 },
  { feature: 'Content calendar',               substack: '❌ No scheduling calendar',          socialmate: '✅ Full calendar UI'       },
  { feature: 'Bulk scheduling',                substack: '❌',                                 socialmate: '✅ Free'                   },
  { feature: 'AI writing tools',               substack: '❌ No AI social tools',             socialmate: '15+ tools free'            },
  { feature: 'Analytics',                      substack: 'Email open rate / subscriber stats', socialmate: '✅ Social analytics free'  },
  { feature: 'Link in bio (SIGIL)',             substack: '❌',                                 socialmate: '✅ Free'                   },
  { feature: 'RSS import',                     substack: 'N/A (is the RSS source)',           socialmate: '✅ Import Substack RSS'    },
  { feature: 'Monetization',                   substack: '✅ Paid subscriptions (10% cut)',    socialmate: '✅ Tip jar + fan subs (0% cut)' },
  { feature: 'Team collaboration',             substack: '⚠️ Limited',                        socialmate: '✅ Free (2 seats)'         },
]

const FAQ = [
  {
    q: 'Does Substack have social media scheduling?',
    a: "Substack does not have social media scheduling. It publishes newsletters and blog posts that go to email subscribers and the Substack feed. Substack Notes lets you post short-form content to your Substack profile — but this does not post to LinkedIn, TikTok, Discord, Telegram, Bluesky, Mastodon, or X. To schedule posts across social platforms, you need a dedicated tool like SocialMate.",
  },
  {
    q: 'Can I use SocialMate to promote my Substack newsletter?',
    a: "Yes — and this is one of the best use cases. SocialMate can import your Substack RSS feed and automatically create social posts when a new issue publishes. You write the newsletter in Substack; SocialMate promotes it across 7 social platforms automatically. Turn every Substack issue into a week of social content.",
  },
  {
    q: 'Should I use Substack or SocialMate?',
    a: "They solve different problems. Substack is for newsletter publishing and email-first monetization. SocialMate is for scheduling social media posts across 7 platforms. Most serious creators use both: Substack to own their email list, SocialMate to stay active on social without spending hours posting manually.",
  },
  {
    q: 'How does SocialMate monetization compare to Substack?',
    a: "Substack takes 10% of paid subscription revenue (plus Stripe fees). SocialMate's Creator Monetization Hub takes 0% — all tip jar payments and fan subscriptions go directly to you via Stripe Connect. SocialMate is a social scheduling tool with optional monetization, not a publishing platform. For newsletter-first monetization, Substack is purpose-built. For tip jars alongside your social presence, SocialMate costs less.",
  },
  {
    q: 'Can SocialMate post to Bluesky like Substack Notes?',
    a: "Yes. SocialMate supports full Bluesky scheduling — not just Substack Notes-style quick posts. You can schedule long-form threads, images, and posts to Bluesky in advance from SocialMate's content calendar. Substack Notes posts to your Substack-branded profile; SocialMate posts to your actual Bluesky account.",
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

export default function VsSubstackPage() {
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
            SocialMate vs Substack
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Substack publishes newsletters. SocialMate schedules social media posts across 7 platforms — TikTok, LinkedIn, Discord, Bluesky, and more. Use both: write on Substack, distribute on SocialMate.
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

        {/* VERDICT */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          <div className="bg-gray-900 border-2 border-gray-700 rounded-2xl p-6">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Substack</p>
            <p className="font-extrabold text-lg mb-2 text-white">Newsletter publishing + email-first monetization</p>
            <ul className="space-y-1 text-xs text-gray-400">
              <li>✅ Best-in-class newsletter platform</li>
              <li>✅ Paid subscriptions (10% Substack cut)</li>
              <li>✅ Substack Notes for short-form posts</li>
              <li>❌ Cannot post to LinkedIn, TikTok, Discord, Telegram</li>
              <li>❌ No social media scheduling or calendar</li>
              <li>❌ No AI tools for social content</li>
            </ul>
          </div>
          <div className="bg-black text-white rounded-2xl p-6">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">SocialMate</p>
            <p className="font-extrabold text-lg mb-2">Social scheduling for 7 platforms. 15+ AI tools. Free.</p>
            <ul className="space-y-1 text-xs text-gray-300">
              <li>✅ Schedule to 7 social platforms simultaneously</li>
              <li>✅ Import Substack RSS feed — auto-promote each issue</li>
              <li>✅ 15+ AI tools for social content creation</li>
              <li>✅ Cross-platform analytics and calendar</li>
              <li>✅ Tip jar + fan subs with 0% platform cut</li>
              <li>✅ No credit card required</li>
            </ul>
          </div>
        </div>

        {/* TABLE */}
        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6 text-white">{t('vs_shared.feature_comparison')}</h2>
          <div className="overflow-x-auto"><div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden min-w-[480px]">
            <div className="grid grid-cols-3 bg-gray-800 px-5 py-3 text-xs font-extrabold text-gray-400 uppercase tracking-wide">
              <span>{t('vs_shared.table_feature')}</span>
              <span>Substack</span>
              <span>{t('vs_shared.table_socialmate')}</span>
            </div>
            {COMPARISON.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 px-5 py-3.5 text-sm border-t border-gray-800 ${i % 2 === 0 ? 'bg-gray-900' : 'bg-gray-800/30'}`}>
                <span className="font-semibold text-gray-300 text-xs">{row.feature}</span>
                <span className="text-xs text-gray-400">{row.substack}</span>
                <span className="text-xs font-semibold text-gray-100">{row.socialmate}</span>
              </div>
            ))}
          </div></div>
        </div>

        {/* WHY */}
        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6 text-white">How SocialMate and Substack work together</h2>
          <div className="space-y-4">
            {[
              {
                n: '1',
                title: "Substack owns your email list — SocialMate owns your social reach",
                desc: "Substack is the right home for your newsletter. Email subscribers are the most valuable audience you can own — Substack makes that easy. But most Substack readers also follow creators on LinkedIn, Bluesky, TikTok, and Discord. SocialMate lets you reach them there too, automatically.",
              },
              {
                n: '2',
                title: 'Import your Substack RSS to auto-promote every issue',
                desc: "SocialMate's RSS import reads your Substack feed. When you publish a new issue, SocialMate can generate a social post for each platform automatically — showing the headline, a teaser excerpt, and a link. Your newsletter announcement goes to all 7 social platforms without you writing 7 separate posts.",
              },
              {
                n: '3',
                title: 'AI tools to repurpose newsletter content into social posts',
                desc: "SocialMate's content repurposing AI reads long-form content and turns it into thread formats, short captions, LinkedIn posts, TikTok hooks, and email teasers. Paste a Substack article → get 6 social-optimized formats in seconds. 5 credits per run.",
              },
              {
                n: '4',
                title: '0% creator cut vs Substack\'s 10% cut',
                desc: "Substack takes 10% of paid subscription revenue. SocialMate's Creator Monetization Hub takes 0% — tip jars and fan subscriptions go directly to you via Stripe Connect. If you want monetization outside your Substack newsletter (tips from social followers, one-time support), SocialMate is the free option.",
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
          <h2 className="text-2xl font-extrabold tracking-tight mb-3">Promote your Substack on 7 social platforms — free</h2>
          <p className="text-gray-400 text-sm mb-6 max-w-lg mx-auto">
            SocialMate schedules to LinkedIn, TikTok, Discord, Bluesky, Telegram, Mastodon, and X. Import your Substack RSS and auto-promote every issue. Free forever.
          </p>
          <Link href="/signup" className="inline-block bg-amber-500 text-black font-bold px-8 py-3.5 rounded-2xl hover:opacity-90 transition-all text-sm">
            {t('vs_shared.cta_create_free')}
          </Link>
          <p className="text-gray-600 text-xs mt-3">{t('vs_shared.cta_no_card')}</p>
        </div>

        <div className="mt-8 text-center">
          <Link href="/vs" className="text-xs text-gray-400 hover:text-gray-300 transition-colors">
            ← View all comparisons
          </Link>
        </div>
      </div>
      <PublicFooter />
    </div>
  )
}
