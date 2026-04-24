import Link from 'next/link'
import { Metadata } from 'next'
import PublicNav from '@/components/PublicNav'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'FAQ — SocialMate',
  description: 'Answers to common questions about SocialMate, SOMA, Enki, Studio Stax, pricing, and how everything works.',
}

const sections = [
  {
    title: 'General',
    faqs: [
      {
        q: 'What is SocialMate?',
        a: 'SocialMate is a Creator OS — a multi-platform social media scheduler and AI-powered toolkit built for creators, agencies, and businesses who want to build an online presence without paying $99/month for the privilege. We charge $5/month for Pro. Free plan available, no credit card required.',
      },
      {
        q: 'What platforms does SocialMate support?',
        a: 'Live today: Bluesky, Mastodon, Discord, Telegram, and X/Twitter (pay-per-use at $0.01/tweet). Coming soon: TikTok (API submitted, in review), LinkedIn (API pending), Instagram, Pinterest, Reddit, Threads, YouTube, Tumblr.',
      },
      {
        q: 'Is there a free plan?',
        a: 'Yes. The free plan includes 50 AI credits/month, 2 seats, post scheduling on all connected platforms, drafts, a content calendar, a Link in Bio builder, competitor tracking (3 accounts), and evergreen recycling. No credit card required to sign up.',
      },
      {
        q: 'What does "credits" mean?',
        a: 'Credits power AI features — caption generation, rewriting, thread creation, SOMA content generation, and more. Each plan includes a monthly credit pool that resets on the 1st. You can also purchase credit packs that never expire. Credits are consumed in order: monthly first, then purchased.',
      },
      {
        q: 'Who built this?',
        a: 'SocialMate was built by Joshua Bostic, a solo bootstrapped founder. He works a Walmart deli job and builds this nights and weekends. No VC funding, no team, no gatekeeping. The mission: power to the people.',
      },
    ],
  },
  {
    title: 'SOMA — AI Marketing Agent',
    faqs: [
      {
        q: 'What is SOMA?',
        a: 'SOMA is your AI marketing agent. Each week, you drop in a "master doc" — a brain dump of what happened, what you shipped, what changed, how you\'re feeling. SOMA diffs it against last week\'s doc, extracts what\'s new, and generates a full content calendar of platform-native posts (formatted correctly for Twitter, LinkedIn, Instagram, Bluesky, etc.). One upload. One click. A week or two of scheduled content.',
      },
      {
        q: 'What\'s a master doc?',
        a: 'It\'s anything. A brain dump, a journal entry, a Notion export, a list of wins and challenges, a product changelog, meeting notes — whatever captures what happened this week. SOMA doesn\'t need it to be polished. It extracts the story from the raw content.',
      },
      {
        q: 'How does the diff work?',
        a: 'When you submit a new master doc, SOMA compares it to the previous version using Gemini AI. It identifies what\'s NEW this week — new wins, new challenges, shifts in direction, fresh themes. Your content calendar is built from the delta, not the full document, so posts stay current and don\'t repeat last week\'s content.',
      },
      {
        q: 'What are the three SOMA modes?',
        a: 'Safe: SOMA generates posts as drafts. You review and approve each one before anything goes live. Autopilot: Posts are auto-scheduled. You get a notification to review the batch — you can still edit or remove before publish time. Full Send: Fully autonomous. Posts are scheduled and published with no review required. You set it, SOMA runs it.',
      },
      {
        q: 'Will SOMA spam my followers?',
        a: 'No. SOMA has hard monthly run caps per mode (Safe: 4 runs/mo, Autopilot: 8 runs/mo, Full Send: 12 runs/mo), plus a credit gate before every generation run. You also control posts-per-day and the content window (7 or 14 days). We built responsible defaults into every layer. We also include a usage disclaimer in-app for transparency.',
      },
      {
        q: 'What does SOMA cost?',
        a: 'SOMA is an add-on for Pro and Agency users. The Autopilot/Full Send upgrade is $10/month. Each generation run costs 75 SOMA credits. Weekly ingestion costs 25 credits. Pro users receive 500 credits/month. Agency users receive 2,000/month. Credit packs are available starting at $1.99.',
      },
      {
        q: 'Can I use SOMA for multiple clients?',
        a: 'Yes — if you\'re on the Agency plan. Agency gives you up to 10 SOMA projects (each with their own master doc history, voice profile, platform settings, and schedule). Each project runs independently. Pro users get 1 project.',
      },
      {
        q: 'Does SOMA learn my voice?',
        a: 'Yes. SOMA uses your identity profile (tone, writing style, behavioral traits, example posts) that you set up during the SOMA onboarding interview. It injects your voice profile into every generation call so posts sound like you, not like a generic AI assistant.',
      },
    ],
  },
  {
    title: 'Enki — AI Trading Bot',
    faqs: [
      {
        q: 'What is Enki?',
        a: 'Enki is an AI-powered trading bot with quant-level logic: ADX trend filters, Kelly position sizing, trailing stops (ATR-based), partial exits at TP1/TP2, correlation guards, daily/portfolio drawdown limits, and a session filter (9:30–16:00 EST). It\'s designed to trade intelligently, not recklessly.',
      },
      {
        q: 'What is Citizen tier?',
        a: 'Citizen is the free tier — paper trading only. No real money. It\'s how you learn the system, test strategies, and build confidence before going live. Includes the 3-step citizen onboarding to get you set up.',
      },
      {
        q: 'What is Truth Mode?',
        a: 'Truth Mode is an experimental feature that runs Enki\'s momentum and mean reversion signals against live market data every 15 minutes. It tracks per-strategy stats (Sharpe, Sortino, win rate) with a 50-trade minimum before results are considered statistically valid. It\'s designed for transparency — no cherry-picked results, no vaporware dashboards.',
      },
      {
        q: 'Is Enki financial advice?',
        a: 'No. Enki is a software tool. Nothing in Enki or SocialMate constitutes financial advice. Trading carries risk. Never trade more than you can afford to lose. Enki is provided as-is, for educational and experimental purposes.',
      },
    ],
  },
  {
    title: 'Studio Stax',
    faqs: [
      {
        q: 'What is Studio Stax?',
        a: 'Studio Stax is a curated creator services marketplace. Vetted freelancers and studios list their services — editing, design, strategy, production, and more. Every listing goes through an admin approval process. Founding Member spots are limited.',
      },
      {
        q: 'How do I get listed?',
        a: 'Apply at /studio-stax/apply. We\'ll review your submission against our criteria checklist and approve or request changes. Founding Member pricing ($100/yr) is available while spots last. Standard listing is $150/yr after.',
      },
    ],
  },
  {
    title: 'Billing & Plans',
    faqs: [
      {
        q: 'What\'s included in Pro ($5/month)?',
        a: '500 AI credits/month, 5 seats, all scheduling features, 12 AI tools, Link in Bio, competitor tracking, evergreen recycling, smart queue, brand voice, analytics dashboard, push notifications, and 1 SOMA project (with Autopilot add-on).',
      },
      {
        q: 'What\'s included in Agency ($20/month)?',
        a: 'Everything in Pro, plus 2,000 credits/month, 15 seats, 5 client workspaces, 10 SOMA projects, and priority support.',
      },
      {
        q: 'Can I cancel anytime?',
        a: 'Yes. No contracts, no cancellation fees. Cancel from Settings → Plan and your subscription won\'t renew. You keep access until the end of your billing period.',
      },
      {
        q: 'Do credits roll over?',
        a: 'Monthly credits reset on the 1st. Purchased credit pack credits never expire. Credits are consumed monthly first, then purchased — so you always burn the expiring pool first.',
      },
      {
        q: 'Is there an affiliate program?',
        a: 'Yes. 30% recurring commission on all subscription payments. Hits 100+ active referrals? Jumps to 40% forever. Apply or learn more at /affiliates.',
      },
    ],
  },
  {
    title: 'Privacy & Safety',
    faqs: [
      {
        q: 'Who can see my posts and content?',
        a: 'Only you (and workspace members you invite). All data is isolated by workspace using Supabase Row-Level Security. No one outside your workspace can access your content, drafts, or analytics.',
      },
      {
        q: 'Does SocialMate store my social media passwords?',
        a: 'Never. We use OAuth for platform connections — we receive a scoped access token, not your password. You can disconnect any platform from Settings at any time.',
      },
      {
        q: 'What happens to my master docs in SOMA?',
        a: 'Master docs are stored securely in your workspace, versioned for diffing. They\'re sent to Google Gemini API for analysis (governed by Google\'s data usage policies). We don\'t sell or share your content with third parties.',
      },
    ],
  },
]

export default function FaqPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <PublicNav />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-24">

        <div className="text-center mb-14">
          <p className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-3">Frequently Asked Questions</p>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white mb-4 leading-tight">
            Everything you want to know.
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Straight answers. No marketing fluff. If something\'s missing, reach out.
          </p>
        </div>

        <div className="space-y-12">
          {sections.map(section => (
            <div key={section.title}>
              <h2 className="text-xs font-bold uppercase tracking-widest text-amber-400/80 mb-5 pb-2 border-b border-gray-800">
                {section.title}
              </h2>
              <div className="space-y-6">
                {section.faqs.map(faq => (
                  <div key={faq.q} className="rounded-2xl border border-gray-800 bg-gray-900/50 p-5 sm:p-6">
                    <p className="font-bold text-white mb-2 text-sm sm:text-base">{faq.q}</p>
                    <p className="text-gray-400 text-sm leading-relaxed">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-8 text-center">
          <p className="text-white font-bold text-lg mb-2">Still have questions?</p>
          <p className="text-gray-400 text-sm mb-5">We\'re a small team and we actually read messages.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="mailto:socialmatehq@gmail.com"
              className="px-6 py-3 rounded-xl bg-amber-500 text-black font-extrabold text-sm hover:bg-amber-400 transition-all"
            >
              Email Us
            </a>
            <Link
              href="/blog"
              className="px-6 py-3 rounded-xl border border-gray-700 text-gray-300 font-semibold text-sm hover:border-gray-500 transition-all"
            >
              Read the Blog
            </Link>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  )
}
