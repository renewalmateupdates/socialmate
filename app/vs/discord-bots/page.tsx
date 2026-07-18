'use client'

import Link from 'next/link'
import PublicFooter from '@/components/PublicFooter'
import { useI18n } from '@/contexts/I18nContext'

const COMPARISON = [
  { feature: 'Technical setup required',   discordbots: 'Bot token + server perms + hosting', socialmate: 'OAuth connect — no code'  },
  { feature: 'Schedule to Discord',        discordbots: '✅ (with setup)',                    socialmate: '✅ No code required'      },
  { feature: 'Schedule to Bluesky',        discordbots: '❌',                                 socialmate: '✅'                       },
  { feature: 'Schedule to TikTok',         discordbots: '❌',                                 socialmate: '✅'                       },
  { feature: 'Schedule to LinkedIn',       discordbots: '❌',                                 socialmate: '✅'                       },
  { feature: 'Schedule to Telegram',       discordbots: '❌',                                 socialmate: '✅'                       },
  { feature: 'Schedule to Mastodon',       discordbots: '❌',                                 socialmate: '✅'                       },
  { feature: 'Schedule to X / Twitter',   discordbots: '❌',                                 socialmate: '✅'                       },
  { feature: 'AI writing tools',           discordbots: '❌',                                 socialmate: '15+ tools free'           },
  { feature: 'Visual content calendar',    discordbots: '❌ Command-line only',               socialmate: '✅ Full calendar UI'      },
  { feature: 'Bulk scheduling',            discordbots: '❌',                                 socialmate: '✅ Free'                   },
  { feature: 'Non-technical users',        discordbots: '❌ Requires developer access',       socialmate: '✅ Anyone can use it'     },
  { feature: 'Link in bio (SIGIL)',         discordbots: '❌',                                 socialmate: '✅ Free'                   },
  { feature: 'Analytics',                  discordbots: '❌',                                 socialmate: '✅ Free'                   },
  { feature: 'Price',                      discordbots: 'Free–$15+/mo (varies by bot)',       socialmate: '$0 — free forever'        },
]

const FAQ = [
  {
    q: "What Discord bots are used for scheduling?",
    a: "Common Discord scheduling bots include MEE6 (premium, $4.99/month), Dyno, and Carl-bot. These require you to set up a bot in your server, configure permissions, and use slash commands to schedule messages. They only post to Discord — nothing else.",
  },
  {
    q: 'Why is SocialMate better than a Discord bot for content scheduling?',
    a: "Discord bots require technical setup: creating a bot application in the Discord developer portal, generating a token, inviting the bot to your server with the right permissions, and learning slash commands. SocialMate is a no-code web app. Connect your Discord in two clicks with OAuth, write your post, pick a time, and schedule. No developer knowledge required.",
  },
  {
    q: 'Can SocialMate post to multiple Discord servers at once?',
    a: "Yes. SocialMate supports multiple Discord accounts and channels. You can connect multiple Discord servers and post to all of them (plus 6 other platforms) from one dashboard in a single scheduled post.",
  },
  {
    q: 'Does SocialMate have a Discord word filter like bots do?',
    a: "SocialMate includes a Discord management hub with a word filter and automation settings. You get scheduling + moderation tools in one platform, without needing a separate bot.",
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

export default function VsDiscordBotsPage() {
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
            SocialMate vs Discord Bots for Scheduling
          </h1>
          <p className="text-lg text-ink-body max-w-2xl mx-auto">
            Discord bots require technical setup and only post to Discord. SocialMate schedules Discord plus 6 other platforms with a no-code interface, AI tools, and analytics. Free.
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
            <p className="text-xs font-bold text-ink-body uppercase tracking-wide mb-2">Discord Bots (MEE6, Dyno, etc.)</p>
            <p className="font-extrabold text-lg mb-2 text-ink-high">Technical, Discord-only, limited</p>
            <ul className="space-y-1 text-xs text-ink-body">
              <li>✅ Can schedule Discord messages</li>
              <li>✅ Free tier available on some bots</li>
              <li>❌ Requires bot setup, tokens, server permissions</li>
              <li>❌ Discord only — no other platforms</li>
              <li>❌ No AI tools or content calendar</li>
              <li>❌ Not designed for non-developers</li>
            </ul>
          </div>
          <div className="bg-void text-ink-high rounded-2xl p-6">
            <p className="text-xs font-bold text-ink-body uppercase tracking-wide mb-2">SocialMate</p>
            <p className="font-extrabold text-lg mb-2">No code. 7 platforms. AI tools. Free.</p>
            <ul className="space-y-1 text-xs text-ink-body">
              <li>✅ Connect Discord in 2 clicks — no bot setup</li>
              <li>✅ Schedule to 6 other platforms simultaneously</li>
              <li>✅ Visual calendar UI — no slash commands needed</li>
              <li>✅ 15+ AI writing tools included free</li>
              <li>✅ Bulk scheduling, analytics, word filter</li>
              <li>✅ No credit card required</li>
            </ul>
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6 text-ink-high">{t('vs_shared.feature_comparison')}</h2>
          <div className="overflow-x-auto"><div className="bg-panel border border-edge rounded-2xl overflow-hidden min-w-[480px]">
            <div className="grid grid-cols-3 bg-raised px-5 py-3 text-xs font-extrabold text-ink-body uppercase tracking-wide">
              <span>{t('vs_shared.table_feature')}</span>
              <span>Discord Bots</span>
              <span>{t('vs_shared.table_socialmate')}</span>
            </div>
            {COMPARISON.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 px-5 py-3.5 text-sm border-t border-edge ${i % 2 === 0 ? 'bg-panel' : 'bg-raised'}`}>
                <span className="font-semibold text-ink-body text-xs">{row.feature}</span>
                <span className="text-xs text-ink-body">{row.discordbots}</span>
                <span className="text-xs font-semibold text-ink-high">{row.socialmate}</span>
              </div>
            ))}
          </div></div>
        </div>

        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6 text-ink-high">Scheduling should not require a developer</h2>
          <div className="space-y-4">
            {[
              {
                n: '1',
                title: 'No bot tokens, no server permissions, no code',
                desc: "Setting up a Discord bot requires creating an application in the Discord developer portal, generating a bot token, inviting the bot to your server with specific permission integers, and learning the slash command syntax. SocialMate is: connect with OAuth, write your post, pick a time, done.",
              },
              {
                n: '2',
                title: 'Discord is one platform. SocialMate covers seven.',
                desc: "A Discord bot handles Discord. But your community announcement also needs to go out on Bluesky, Telegram, LinkedIn, TikTok, Mastodon, and X. SocialMate posts to all 7 simultaneously from one scheduled post — no extra steps.",
              },
              {
                n: '3',
                title: 'AI-assisted content creation, not just delivery',
                desc: "Discord bots deliver text you have already written. SocialMate helps you write it too — 15+ AI tools generate captions, hashtags, thread hooks, and more. Then it schedules the content across all your platforms.",
              },
              {
                n: '4',
                title: 'A real content calendar — not a list of slash commands',
                desc: "Discord bots show scheduled messages as a list of commands. SocialMate has a full visual calendar showing all scheduled posts across all platforms. Drag and drop rescheduling, per-day view, filter by platform — a proper tool for a proper workflow.",
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
          <h2 className="text-2xl font-extrabold tracking-tight mb-3">Discord scheduling without the developer headache</h2>
          <p className="text-ink-body text-sm mb-6 max-w-lg mx-auto">
            Connect Discord in 2 clicks. Schedule to 7 platforms. 15+ AI tools. Free forever — no credit card required.
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
