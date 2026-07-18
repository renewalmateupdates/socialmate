'use client'

import Link from 'next/link'
import PublicFooter from '@/components/PublicFooter'
import { useI18n } from '@/contexts/I18nContext'

const COMPARISON = [
  { feature: 'Starting price',              mailchimp: '$13/month (Essentials)',      socialmate: '$0 — free forever'        },
  { feature: 'Primary purpose',             mailchimp: 'Email marketing',             socialmate: 'Social media scheduling'  },
  { feature: 'Social media scheduling',     mailchimp: '⚠️ Limited add-on only',     socialmate: '✅ 7 platforms native'     },
  { feature: 'Bluesky support',             mailchimp: '❌',                           socialmate: '✅ Free'                   },
  { feature: 'Discord support',             mailchimp: '❌',                           socialmate: '✅ Free'                   },
  { feature: 'Telegram support',            mailchimp: '❌',                           socialmate: '✅ Free'                   },
  { feature: 'Mastodon support',            mailchimp: '❌',                           socialmate: '✅ Free'                   },
  { feature: 'TikTok scheduling',           mailchimp: '❌',                           socialmate: '✅ Free (20 videos/mo)'   },
  { feature: 'LinkedIn scheduling',         mailchimp: '⚠️ Basic only',              socialmate: '✅ Free'                   },
  { feature: 'Bulk scheduling',             mailchimp: '❌',                           socialmate: '✅ Free'                   },
  { feature: 'AI writing tools',            mailchimp: 'Email copy AI (paid)',        socialmate: '15+ social AI tools free' },
  { feature: 'Content calendar',            mailchimp: '❌ No visual calendar',       socialmate: '✅ Full calendar UI'       },
  { feature: 'Link in bio (SIGIL)',          mailchimp: '❌',                           socialmate: '✅ Free'                   },
  { feature: 'Analytics',                   mailchimp: 'Email analytics only',        socialmate: '✅ Social analytics free'  },
  { feature: 'Competitor tracking',         mailchimp: '❌',                           socialmate: '✅ Free (3 accounts)'     },
  { feature: 'RSS / blog import',           mailchimp: '✅ (RSS campaigns)',          socialmate: '✅ Free'                   },
  { feature: 'Team seats (free plan)',       mailchimp: '1',                           socialmate: '2'                        },
  { feature: 'Free plan posts',             mailchimp: '❌ No social scheduling free', socialmate: '100 / month'                },
]

const FAQ = [
  {
    q: 'Does Mailchimp do social media scheduling?',
    a: "Mailchimp has a basic social posting feature, but it's not a social media scheduler. It supports Facebook, Instagram, and Twitter/X posting — no Discord, Telegram, Bluesky, Mastodon, or TikTok. There's no visual content calendar, no bulk scheduling, and no AI tools built for social content. It's an email tool that added a social tab. SocialMate is the inverse: built for social scheduling from day one.",
  },
  {
    q: 'Why would someone use Mailchimp and SocialMate together?',
    a: "Mailchimp owns email. SocialMate owns social. Many creators use both: Mailchimp to send newsletters to their list, SocialMate to schedule content across 7 social platforms. They solve different problems. If you're currently using Mailchimp as your only content tool and relying on its social tab, SocialMate is a free upgrade for the social side.",
  },
  {
    q: 'How much does Mailchimp actually cost for small businesses?',
    a: "Mailchimp's free plan allows up to 500 contacts and 1,000 emails/month — but it removes the Mailchimp branding only on paid plans. Essentials starts at $13/month for 500 contacts. Standard (with A/B testing, send time optimization) starts at $20/month. For social scheduling on top of email, you'd pay separately. SocialMate's full social scheduler is free.",
  },
  {
    q: 'Can SocialMate replace Mailchimp?',
    a: "No — SocialMate does not send email campaigns. Mailchimp is the right tool for email marketing: list management, campaigns, automations, A/B testing. SocialMate is the right tool for scheduling social posts across 7 platforms. Use both. Start SocialMate free alongside your Mailchimp account.",
  },
  {
    q: 'Which platforms does SocialMate support that Mailchimp does not?',
    a: "SocialMate supports Bluesky, Discord, Telegram, Mastodon, TikTok, LinkedIn, and X/Twitter. Mailchimp's social posting only covers Facebook, Instagram, and X. If you post on Discord, Telegram, Bluesky, Mastodon, or TikTok — Mailchimp cannot help you.",
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

export default function VsMailchimpPage() {
  const { t } = useI18n()
  return (
    <div className="dark min-h-screen bg-panel">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      {/* NAV */}
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

        {/* HERO */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-raised border border-edge-lit rounded-full px-4 py-1.5 text-xs font-bold text-ink-muted mb-4">
            Updated June 2026
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-4 text-ink-high">
            SocialMate vs Mailchimp
          </h1>
          <p className="text-lg text-ink-body max-w-2xl mx-auto">
            Mailchimp is an email marketing tool. SocialMate is a dedicated social media scheduler for 7 platforms — Discord, TikTok, Bluesky, LinkedIn, and more. Free to start.
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

        {/* VERDICT */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          <div className="bg-panel border-2 border-edge rounded-2xl p-6">
            <p className="text-xs font-bold text-ink-body uppercase tracking-wide mb-2">Mailchimp</p>
            <p className="font-extrabold text-lg mb-2 text-ink-high">Email marketing first, social is an afterthought</p>
            <ul className="space-y-1 text-xs text-ink-body">
              <li>✅ Industry-leading email campaigns</li>
              <li>✅ Automations, A/B testing, list segmentation</li>
              <li>✅ RSS-to-email campaigns</li>
              <li>❌ Social scheduling very limited (FB/IG/X only)</li>
              <li>❌ No Discord, Telegram, Bluesky, Mastodon, TikTok</li>
              <li>❌ No visual content calendar or bulk scheduling</li>
            </ul>
          </div>
          <div className="bg-void text-ink-high rounded-2xl p-6">
            <p className="text-xs font-bold text-ink-body uppercase tracking-wide mb-2">SocialMate</p>
            <p className="font-extrabold text-lg mb-2">Built for social. 7 platforms. 15+ AI tools. Free.</p>
            <ul className="space-y-1 text-xs text-ink-body">
              <li>✅ Schedule to 7 platforms simultaneously</li>
              <li>✅ Discord + Telegram + Bluesky + Mastodon + TikTok</li>
              <li>✅ Visual content calendar, bulk scheduling</li>
              <li>✅ 15+ AI writing tools free</li>
              <li>✅ Social analytics built in</li>
              <li>✅ No credit card required</li>
            </ul>
          </div>
        </div>

        {/* TABLE */}
        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6 text-ink-high">{t('vs_shared.feature_comparison')}</h2>
          <div className="overflow-x-auto"><div className="bg-panel border border-edge rounded-2xl overflow-hidden min-w-[480px]">
            <div className="grid grid-cols-3 bg-raised px-5 py-3 text-xs font-extrabold text-ink-body uppercase tracking-wide">
              <span>{t('vs_shared.table_feature')}</span>
              <span>Mailchimp</span>
              <span>{t('vs_shared.table_socialmate')}</span>
            </div>
            {COMPARISON.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 px-5 py-3.5 text-sm border-t border-edge ${i % 2 === 0 ? 'bg-panel' : 'bg-raised'}`}>
                <span className="font-semibold text-ink-body text-xs">{row.feature}</span>
                <span className="text-xs text-ink-body">{row.mailchimp}</span>
                <span className="text-xs font-semibold text-ink-high">{row.socialmate}</span>
              </div>
            ))}
          </div></div>
        </div>

        {/* WHY */}
        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6 text-ink-high">Why creators use SocialMate alongside Mailchimp</h2>
          <div className="space-y-4">
            {[
              {
                n: '1',
                title: "Mailchimp's social tab is not a social media scheduler",
                desc: "Mailchimp's social posting covers Facebook, Instagram, and X — nothing else. No bulk scheduling, no content calendar, no AI tools for social captions. It exists to complement email campaigns, not to be a standalone social scheduling platform. If you need real multi-platform social scheduling, you need SocialMate.",
              },
              {
                n: '2',
                title: 'SocialMate covers 7 platforms Mailchimp does not touch',
                desc: 'Discord, Telegram, Bluesky, Mastodon, TikTok, LinkedIn, and X/Twitter — all schedulable from one place in SocialMate. Mailchimp has no TikTok, no Discord, no Telegram, no Bluesky, no Mastodon. If your audience lives on any of these platforms, Mailchimp cannot reach them.',
              },
              {
                n: '3',
                title: 'AI tools built for social content, not email',
                desc: "SocialMate's 15+ AI tools are built for social: hook writing, hashtag generation, thread building, content repurposing across formats, TikTok script generation, and the SOMA autonomous content system that writes a full week of posts from your brand voice. Mailchimp's AI is built for email subject lines and campaign copy — different job.",
              },
              {
                n: '4',
                title: 'Use both — they solve different problems',
                desc: "The right setup for most creators and small businesses: Mailchimp for email marketing to your list, SocialMate for scheduling across 7 social platforms. SocialMate's free plan costs nothing to add alongside your Mailchimp subscription.",
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

        {/* FAQ */}
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

        {/* CTA */}
        <div className="bg-void text-ink-high rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-extrabold tracking-tight mb-3">Add social scheduling to your Mailchimp stack — free</h2>
          <p className="text-ink-body text-sm mb-6 max-w-lg mx-auto">
            SocialMate schedules to 7 platforms: Discord, TikTok, Bluesky, LinkedIn, Telegram, Mastodon, and X. 15+ AI tools. Free forever — no credit card required.
          </p>
          <Link href="/signup" className="inline-block bg-amber/10 text-ink-high font-bold px-8 py-3.5 rounded-2xl hover:opacity-90 transition-all text-sm">
            {t('vs_shared.cta_create_free')}
          </Link>
          <p className="text-ink-muted text-xs mt-3">{t('vs_shared.cta_no_card')}</p>
        </div>

        <div className="mt-8 text-center">
          <Link href="/vs" className="text-xs text-ink-body hover:text-ink-body transition-colors">
            ← View all comparisons
          </Link>
        </div>
      </div>
      <PublicFooter />
    </div>
  )
}
