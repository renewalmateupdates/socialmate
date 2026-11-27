'use client'

import Link from 'next/link'
import PublicFooter from '@/components/PublicFooter'
import { useI18n } from '@/contexts/I18nContext'
import { REPURPOSE_COST } from '@/lib/ai-tool-costs'

const COMPARISON = [
  { feature: 'Price',                          substack: 'Free (10% cut of paid subs)',       socialmate: '$0 — free forever'        },
  { feature: 'Primary purpose',                substack: 'Newsletter + blog publishing',      socialmate: 'Social media scheduling'  },
  { feature: 'Social media scheduling',        substack: '❌ Cannot post to platforms',        socialmate: '✅ 7 platforms native'     },
  { feature: 'Schedule to TikTok',             substack: '❌',                                 socialmate: '✅ Free (20 videos/mo)'   },
  { feature: 'Schedule to LinkedIn',           substack: '❌',                                 socialmate: '✅ Free'                   },
  { feature: 'Schedule to Discord',            substack: '❌',                                 socialmate: '✅ Free'                   },
  { feature: 'Schedule to Telegram',           substack: '❌',                                 socialmate: '✅ Free'                   },
  { feature: 'Schedule to Bluesky',            substack: '❌ Notes stay on Substack',          socialmate: '✅ Full scheduling'        },
  { feature: 'Schedule to Mastodon',           substack: '❌',                                 socialmate: '✅ Free'                   },
  { feature: 'Schedule to X / Twitter',        substack: '❌',                                 socialmate: '✅ (Pro+)'                 },
  { feature: 'Content calendar',               substack: '❌ No scheduling calendar',          socialmate: '✅ Full calendar UI'       },
  { feature: 'Bulk scheduling',                substack: '❌',                                 socialmate: '✅ Free'                   },
  { feature: 'AI writing tools',               substack: '❌ No AI social tools',             socialmate: '15+ tools, 50 credits/mo free'            },
  { feature: 'Analytics',                      substack: 'Email open rate / subscriber stats', socialmate: '✅ Social analytics free'  },
  { feature: 'Link in bio (SIGIL)',             substack: '❌',                                 socialmate: '✅ Free'                   },
  { feature: 'RSS import',                     substack: 'N/A (is the RSS source)',           socialmate: '✅ Import issues as drafts' },
  { feature: 'Paid newsletter subscriptions',  substack: '✅ Built in (10% cut)',              socialmate: '❌ Not a newsletter platform' },
  { feature: 'Team collaboration',             substack: '⚠️ Limited',                        socialmate: '✅ Free (2 seats)'         },
]

const FAQ = [
  {
    q: 'Does Substack have social media scheduling?',
    a: "Substack does not have social media scheduling. It publishes newsletters and blog posts that go to email subscribers and the Substack feed. Substack Notes lets you post short-form content to your Substack profile — but this does not post to LinkedIn, TikTok, Discord, Telegram, Bluesky, Mastodon, or X. To schedule posts across social platforms, you need a dedicated tool like SocialMate.",
  },
  {
    q: 'Can I use SocialMate to promote my Substack newsletter?',
    a: "Yes, it's one of the best uses for it. SocialMate's RSS import reads your Substack feed (yourname.substack.com/feed) and brings the issues you pick in as drafts with the headline, a teaser and the link. Nothing posts on its own: edit each draft, then schedule it to Bluesky, LinkedIn, Mastodon, Discord and Telegram (and X on Pro). Write the newsletter in Substack; promote it from SocialMate.",
  },
  {
    q: 'Should I use Substack or SocialMate?',
    a: "They solve different problems. Substack is for newsletter publishing and email-first monetization. SocialMate is for scheduling social media posts across 7 platforms. Most serious creators use both: Substack to own their email list, SocialMate to stay active on social without spending hours posting manually.",
  },
  {
    q: 'Can SocialMate collect paid subscribers like Substack?',
    a: "No. SocialMate doesn't host articles, send newsletters or run paid subscriptions. If you want readers to pay for your writing, use Substack (or Beehiiv or Ghost). SocialMate is for after you publish: it schedules posts about each issue to the social platforms your readers already use.",
  },
  {
    q: 'Can SocialMate post to Bluesky like Substack Notes?',
    a: "Yes, and to your actual Bluesky account rather than your Substack profile. Schedule posts with images to Bluesky in advance from SocialMate's calendar. Threads also post to Bluesky as real reply chains, but a thread goes out right away; it can't be scheduled for later.",
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
            Updated November 2026
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-4 text-ink-high">
            SocialMate vs Substack
          </h1>
          <p className="text-lg text-ink-body max-w-2xl mx-auto">
            Substack publishes newsletters. SocialMate schedules social media posts across 7 platforms — TikTok, LinkedIn, Discord, Bluesky, and more. Use both: write on Substack, distribute on SocialMate.
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
            <p className="text-xs font-bold text-ink-body uppercase tracking-wide mb-2">Substack</p>
            <p className="font-extrabold text-lg mb-2 text-ink-high">Newsletter publishing + email-first monetization</p>
            <ul className="space-y-1 text-xs text-ink-body">
              <li>✅ Best-in-class newsletter platform</li>
              <li>✅ Paid subscriptions (10% Substack cut)</li>
              <li>✅ Substack Notes for short-form posts</li>
              <li>❌ Cannot post to LinkedIn, TikTok, Discord, Telegram</li>
              <li>❌ No social media scheduling or calendar</li>
              <li>❌ No AI tools for social content</li>
            </ul>
          </div>
          <div className="bg-void text-ink-high rounded-2xl p-6">
            <p className="text-xs font-bold text-ink-body uppercase tracking-wide mb-2">SocialMate</p>
            <p className="font-extrabold text-lg mb-2">Social scheduling for 7 platforms, 6 free. 15+ AI tools.</p>
            <ul className="space-y-1 text-xs text-ink-body">
              <li>✅ Schedule to 7 social platforms simultaneously</li>
              <li>✅ Import each Substack issue as a draft post</li>
              <li>✅ 15+ AI tools for social content creation</li>
              <li>✅ Cross-platform analytics and calendar</li>
              <li>✅ No credit card required</li>
              <li>❌ Not a newsletter or paid subscription platform</li>
            </ul>
          </div>
        </div>

        {/* TABLE */}
        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6 text-ink-high">{t('vs_shared.feature_comparison')}</h2>
          <div className="overflow-x-auto"><div className="bg-panel border border-edge rounded-2xl overflow-hidden min-w-[480px]">
            <div className="grid grid-cols-3 bg-raised px-5 py-3 text-xs font-extrabold text-ink-body uppercase tracking-wide">
              <span>{t('vs_shared.table_feature')}</span>
              <span>Substack</span>
              <span>{t('vs_shared.table_socialmate')}</span>
            </div>
            {COMPARISON.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 px-5 py-3.5 text-sm border-t border-edge ${i % 2 === 0 ? 'bg-panel' : 'bg-raised'}`}>
                <span className="font-semibold text-ink-body text-xs">{row.feature}</span>
                <span className="text-xs text-ink-body">{row.substack}</span>
                <span className="text-xs font-semibold text-ink-high">{row.socialmate}</span>
              </div>
            ))}
          </div></div>
        </div>

        {/* WHY */}
        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6 text-ink-high">How SocialMate and Substack work together</h2>
          <div className="space-y-4">
            {[
              {
                n: '1',
                title: "Substack owns your email list — SocialMate owns your social reach",
                desc: "Substack is the right home for your newsletter. Email subscribers are the most valuable audience you can own — Substack makes that easy. But most Substack readers also follow creators on LinkedIn, Bluesky, TikTok, and Discord. SocialMate lets you reach them there too, on a schedule.",
              },
              {
                n: '2',
                title: 'Import your Substack RSS to promote every issue',
                desc: "SocialMate's RSS import reads your Substack feed and turns the issues you pick into drafts with the headline, a teaser and the link. Edit the draft once, then schedule it to every text platform you've connected at the same time. Nothing posts until you schedule it.",
              },
              {
                n: '3',
                title: 'AI tools to repurpose newsletter content into social posts',
                desc: `Paste a Substack article into Repurpose and pick a format: a thread, a short caption, a hook, a LinkedIn post, a long-form post or an email teaser. Each run makes one format and costs ${REPURPOSE_COST} AI credits.`,
              },
              {
                n: '4',
                title: "SocialMate doesn't replace Substack",
                desc: "SocialMate doesn't host your writing or collect paid subscribers, and it isn't trying to. Keep your newsletter and your paying readers on Substack. Use SocialMate to keep showing up on social between issues, so more people find the newsletter.",
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
          <h2 className="text-2xl font-extrabold tracking-tight mb-3">Promote your Substack on social, free</h2>
          <p className="text-ink-body text-sm mb-6 max-w-lg mx-auto">
            SocialMate schedules to Bluesky, LinkedIn, Mastodon, Discord and Telegram on the free plan, X on Pro, and TikTok for video. Import your Substack RSS and turn each issue into a draft in seconds.
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
