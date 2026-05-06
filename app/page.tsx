import Link from 'next/link'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import ReferralBanner from '@/app/components/ReferralBanner'
import PublicNav from '@/components/PublicNav'
import UserStatsCounter from '@/components/UserStatsCounter'
import PHLaunchBanner from '@/components/PHLaunchBanner'
import HeroLaunchBadge from '@/components/HeroLaunchBadge'

const PLATFORMS = [
  { name: 'Discord',     icon: '💬', status: 'live'    },
  { name: 'Bluesky',     icon: '🦋', status: 'live'    },
  { name: 'Telegram',    icon: '✈️', status: 'live'    },
  { name: 'Mastodon',    icon: '🐘', status: 'live'    },
  { name: 'X / Twitter', icon: '🐦', status: 'live'    },
  { name: 'LinkedIn',    icon: '💼', status: 'soon'    },
  { name: 'YouTube',     icon: '▶️', status: 'soon'    },
  { name: 'Pinterest',   icon: '📌', status: 'soon'    },
  { name: 'Reddit',      icon: '🤖', status: 'soon'    },
  { name: 'TikTok',      icon: '🎵', status: 'soon'    },
  { name: 'Instagram',   icon: '📸', status: 'planned' },
  { name: 'Facebook',    icon: '📘', status: 'planned' },
  { name: 'Threads',     icon: '🧵', status: 'planned' },
  { name: 'Snapchat',    icon: '👻', status: 'planned' },
  { name: 'Lemon8',      icon: '🍋', status: 'planned' },
  { name: 'BeReal',      icon: '📷', status: 'planned' },
]

const AI_TOOLS = [
  { name: 'Caption Generator',    emoji: '✍️',  credits: '5 credits',    proOnly: false },
  { name: 'Hashtag Generator',    emoji: '#️⃣', credits: '5 credits',    proOnly: false },
  { name: 'Post Rewriter',        emoji: '🔁',  credits: '5 credits',    proOnly: false },
  { name: 'Viral Hook Generator', emoji: '🎣',  credits: '5 credits',    proOnly: false },
  { name: 'Thread Generator',     emoji: '🧵',  credits: '10 credits',   proOnly: false },
  { name: 'Content Repurposer',   emoji: '♻️',  credits: '10 credits',   proOnly: false },
  { name: 'Post Score',           emoji: '⚡',  credits: '5 credits',    proOnly: false },
  { name: 'SM-Pulse',             emoji: '🔥',  credits: '20 credits',   proOnly: false },
  { name: 'SM-Radar',             emoji: '📡',  credits: '20 credits',   proOnly: false },
  { name: 'Content Gap Detector', emoji: '🕳️', credits: '10 credits',   proOnly: false },
  { name: 'AI Content Calendar',  emoji: '📅',  credits: '25 cr · Pro+', proOnly: true  },
  { name: 'AI Image Generation',  emoji: '🎨',  credits: '25 cr · Pro+', proOnly: true  },
]

const FEATURES = [
  {
    icon: '📅',
    title: 'Smart Scheduling',
    desc: 'Schedule across 5 social platforms, with Twitch and YouTube clips support built in. Bulk upload, automated queues, and platform-specific character limit enforcement included.',
  },
  {
    icon: '🤖',
    title: '12 AI Tools Built In',
    desc: 'Generate captions, hashtags, viral hooks, full threads, content calendars, and post scores — all powered by Google Gemini.',
  },
  {
    icon: '📊',
    title: 'Real Analytics',
    desc: 'Posting streaks, platform breakdown, best days and times, consistency scores, and engagement tracking. No inflated numbers.',
  },
  {
    icon: '🔗',
    title: 'Link in Bio Builder',
    desc: 'A fully-featured bio link page built right in. Custom themes, button styles, social icons, and a public URL — free on every plan.',
  },
  {
    icon: '👥',
    title: 'Team Collaboration',
    desc: 'Invite team members, assign roles, manage access, and run content approval workflows. Free plan includes 2 seats.',
  },
  {
    icon: '🏢',
    title: 'Client Workspaces',
    desc: 'Pro includes 1 client workspace. Agency includes 10 — each fully isolated with their own accounts, posts, analytics, and team.',
  },
  {
    icon: '♻️',
    title: 'Evergreen Recycling',
    desc: 'Mark your best posts as evergreen and they automatically re-queue when your schedule runs empty. Set it once.',
  },
  {
    icon: '📡',
    title: 'RSS / Blog Import',
    desc: 'Pull posts from any RSS or Atom feed and turn them into scheduled social posts in one click. Works with any blog or podcast.',
  },
  {
    icon: '🔭',
    title: 'Competitor Tracking',
    desc: 'Track up to 3 competitor accounts on every plan including free. Know what they\'re posting before you do.',
  },
]

const COMPARISON = [
  {
    label: 'What you get',
    industry: 'Typical tools',
    socialmate: 'SocialMate',
    header: true,
  },
  { label: 'Starting price',          industry: '$25–$99/month',        socialmate: '$0 — free forever'   },
  { label: 'Free plan',               industry: '❌ Removed or crippled', socialmate: '✅ Genuinely free'  },
  { label: 'AI writing tools',        industry: '1–2 basic',            socialmate: '12 tools included'   },
  { label: 'Bulk scheduling',         industry: 'Paid add-on',          socialmate: '✅ Free'              },
  { label: 'Link in bio',             industry: 'Separate paid tool',   socialmate: '✅ Free on all plans' },
  { label: 'Competitor tracking',     industry: 'Paid add-on',          socialmate: '✅ Free'              },
  { label: 'Evergreen recycling',     industry: 'Paid add-on',          socialmate: '✅ Free'              },
  { label: 'RSS import',              industry: '❌ Not included',       socialmate: '✅ Free'              },
  { label: 'Team seats',              industry: 'Per seat fee',         socialmate: '2 seats free'        },
  { label: 'Client workspaces',       industry: 'Enterprise only',      socialmate: 'From $5/mo'          },
  { label: 'White label',             industry: 'Enterprise only',      socialmate: 'From $20/mo'         },
]


export default async function Home({ searchParams }: { searchParams: Promise<{ ref?: string }> }) {
  const params = await searchParams
  const refCode = params?.ref || ''

  // Check if user is logged in (server-side)
  let isLoggedIn = false
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: () => {},
        },
      }
    )
    const { data: { user } } = await supabase.auth.getUser()
    if (user) isLoggedIn = true
  } catch {
    // If auth check fails, stays false — safe default
  }

  const live    = PLATFORMS.filter(p => p.status === 'live')
  const soon    = PLATFORMS.filter(p => p.status === 'soon')
  const planned = PLATFORMS.filter(p => p.status === 'planned')

  return (
    <div className="dark min-h-screen bg-gray-950">

      {refCode && <ReferralBanner refCode={refCode} />}
      <PHLaunchBanner />

      {/* NAV */}
      <PublicNav />

      {/* HERO */}
      <section className="max-w-4xl mx-auto px-6 pt-24 pb-20 text-center">
        <HeroLaunchBadge />
        <div className="inline-flex items-center gap-2 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 text-xs font-bold px-4 py-2 rounded-full mb-8">
          🌱 Free forever · No credit card required · 5 social platforms · Twitch &amp; YouTube clips · 12 AI tools
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight text-gray-900 dark:text-gray-100">
          Social media management{' '}
          <span className="text-gray-400 dark:text-gray-500">without the $99/month price tag.</span>
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
          Schedule across 5 social platforms, browse and schedule Twitch clips and YouTube videos, write better content with 12 AI tools, and track what&apos;s actually working — all from one place.
          Free to start. Pro from $5/month.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
          <Link href="/signup"
            className="bg-black text-white font-bold px-8 py-4 rounded-2xl hover:opacity-80 transition-all text-base w-full sm:w-auto text-center">
            Create free account →
          </Link>
          <Link href="/pricing"
            className="text-gray-500 dark:text-gray-400 font-semibold hover:text-black dark:hover:text-white transition-all text-base">
            See pricing →
          </Link>
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500">No card required · Free forever · Setup in 60 seconds</p>

        {/* BUILT BY */}
        <div className="mt-10 max-w-md mx-auto bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl px-5 py-4 text-left">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-base flex-shrink-0">👤</div>
            <div>
              <p className="text-xs font-bold text-gray-800 dark:text-gray-200">Built solo by Joshua Bostic</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Bootstrapped. No VC. No $99/month trap. Just a builder who needed better tools and built them for everyone.</p>
            </div>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-3 gap-4 sm:gap-6 mt-12 sm:mt-16 max-w-2xl mx-auto">
          {[
            { value: '5',   label: 'social platforms live' },
            { value: '12',  label: 'AI tools included' },
            { value: '$0',  label: 'To get started'    },
          ].map(stat => (
            <div key={stat.label} className="text-center">
              <p className="text-4xl font-extrabold tracking-tight">{stat.value}</p>
              <p className="text-xs text-gray-400 font-semibold mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Live user stats */}
        <div className="mt-6">
          <UserStatsCounter />
        </div>
      </section>

      {/* FREE TIER CALLOUT */}
      <section className="bg-black text-white py-16">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-10">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Free plan — no catch</p>
            <h2 className="text-3xl font-extrabold tracking-tight mb-3">
              Most tools charge for this.<br className="hidden md:block" /> We don't.
            </h2>
            <p className="text-gray-400 text-sm max-w-xl mx-auto">
              SocialMate's free plan is designed to be genuinely useful — not a crippled demo.
              Here's exactly what you get at $0/month, forever.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { icon: '🤖', value: '50',      label: 'AI credits / month'           },
              { icon: '📅', value: '2 weeks', label: 'Scheduling window'            },
              { icon: '👥', value: '2',        label: 'Team seats included'         },
              { icon: '💾', value: '1 GB',     label: 'Media storage'               },
              { icon: '📝', value: '100',      label: 'Posts / month'               },
              { icon: '📊', value: '30 days',  label: 'Analytics history'           },
              { icon: '🔗', value: 'Free',     label: 'Link in Bio page'            },
              { icon: '🔭', value: '3',        label: 'Competitor accounts tracked' },
            ].map(stat => (
              <div key={stat.label} className="bg-white/10 rounded-2xl p-4 text-center">
                <div className="text-2xl mb-1">{stat.icon}</div>
                <p className="text-lg font-extrabold">{stat.value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
          <div className="text-center">
            <Link href="/signup"
              className="inline-block bg-white text-black font-bold px-8 py-3.5 rounded-2xl hover:opacity-90 transition-all text-sm">
              Start free — no card needed →
            </Link>
          </div>
        </div>
      </section>

      {/* PLATFORMS */}
      <section id="platforms" className="border-t border-gray-100 dark:border-gray-800 py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-10">
            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">Platform support</p>
            <h2 className="text-3xl font-extrabold tracking-tight mb-3 text-gray-900 dark:text-gray-100">5 social platforms live. Twitch &amp; YouTube clips built in.</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
              Bluesky, Discord, Telegram, Mastodon, and X/Twitter live now. TikTok coming very soon. Twitch clips and YouTube videos schedulable directly inside SocialMate. LinkedIn, Reddit, and more on the roadmap.
            </p>
          </div>
          <div className="space-y-6">
            <div>
              <p className="text-xs font-bold text-green-600 uppercase tracking-widest mb-3 text-center">✅ Live now</p>
              <div className="flex flex-wrap justify-center gap-3">
                {live.map(p => (
                  <div key={p.name}
                    className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border-2 border-green-200 dark:border-green-800 rounded-xl text-sm font-bold text-gray-800 dark:text-gray-200">
                    <span>{p.icon}</span>{p.name}
                    <span className="text-xs font-bold text-green-600 bg-green-50 dark:bg-green-950 px-1.5 py-0.5 rounded-full">Live</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-3 text-center">🔜 Coming very soon</p>
              <div className="flex flex-wrap justify-center gap-3">
                {soon.map(p => (
                  <div key={p.name}
                    className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-blue-100 dark:border-blue-900 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-400">
                    <span>{p.icon}</span>{p.name}
                    <span className="text-xs font-bold text-blue-500 bg-blue-50 dark:bg-blue-950 px-1.5 py-0.5 rounded-full">Soon</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3 text-center">📋 Planned</p>
              <div className="flex flex-wrap justify-center gap-3">
                {planned.map(p => (
                  <div key={p.name}
                    className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl text-sm font-semibold text-gray-400 dark:text-gray-500">
                    <span>{p.icon}</span>{p.name}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CLIPS STUDIO */}
      <section className="py-20 bg-gradient-to-br from-purple-950 via-gray-950 to-black text-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-purple-900/60 border border-purple-700/50 text-purple-300 text-xs font-bold px-4 py-2 rounded-full mb-6">
              🎬 Built for streamers &amp; content creators
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight mb-4">
              From clip to scheduled post.<br className="hidden sm:block" /> No extra tabs.
            </h2>
            <p className="text-gray-400 text-sm max-w-xl mx-auto leading-relaxed">
              Browse your Twitch clips or YouTube videos directly inside SocialMate and
              schedule them to 5 platforms in one click. No downloading. No app-switching.
              No copy-pasting URLs into five different tabs.
            </p>
          </div>

          {/* Three feature cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-purple-500/40 transition-all">
              <div className="text-3xl mb-3">🟣</div>
              <h3 className="font-bold text-base mb-2">Twitch Clips</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Connect your Twitch account and your top clips appear in a thumbnail grid —
                view counts, duration, everything. Hit Schedule and you&apos;re done.
              </p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-red-500/40 transition-all">
              <div className="text-3xl mb-3">▶️</div>
              <h3 className="font-bold text-base mb-2">YouTube Videos</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Paste your channel URL — that&apos;s it. No API key, no approval process, no
                developer account. Your latest public videos load instantly and are ready to schedule.
              </p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-blue-500/40 transition-all">
              <div className="text-3xl mb-3">🔍</div>
              <h3 className="font-bold text-base mb-2">Search Any Channel</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                You don&apos;t even need to own the channel. Search any Twitch streamer&apos;s top clips
                and schedule them directly — perfect for clippers and fan accounts.
              </p>
            </div>
          </div>

          {/* Workflow steps */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 mb-12 text-center">
            {[
              { step: '1', label: 'Browse your clips' },
              { step: '2', label: 'Pick one' },
              { step: '3', label: 'Schedule to 5 platforms' },
            ].map((item, i) => (
              <div key={item.step} className="flex items-center gap-2 sm:gap-3">
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5">
                  <span className="text-xs font-bold text-purple-400">{item.step}</span>
                  <span className="text-sm font-semibold text-white">{item.label}</span>
                </div>
                {i < 2 && (
                  <span className="text-gray-600 text-lg hidden sm:block">→</span>
                )}
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center">
            <Link
              href="/signup"
              className="inline-block bg-purple-600 hover:bg-purple-500 text-white font-bold px-8 py-3.5 rounded-2xl transition-all text-sm">
              Try Clips Studio free →
            </Link>
            <p className="text-xs text-gray-600 mt-3">Free on all plans · Twitch OAuth · YouTube via channel URL</p>
          </div>
        </div>
      </section>

      {/* AI TOOLS */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">AI-Powered</p>
            <h2 className="text-3xl font-extrabold tracking-tight mb-3 text-gray-900 dark:text-gray-100">12 AI tools built in</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
              Every tool runs on Google Gemini. 50 credits included free every month —
              no separate AI subscription, no hidden costs. Credits exist to keep the service sustainable for everyone.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            {AI_TOOLS.map(tool => (
              <div key={tool.name}
                className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-4 text-center hover:border-gray-300 dark:hover:border-gray-500 transition-all relative">
                {tool.proOnly && (
                  <span className="absolute top-2 right-2 text-xs font-bold bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 px-1.5 py-0.5 rounded-full">
                    Pro+
                  </span>
                )}
                <div className="text-2xl mb-2">{tool.emoji}</div>
                <p className="text-xs font-bold leading-snug mb-1 text-gray-900 dark:text-gray-100">{tool.name}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">{tool.credits}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-black rounded-2xl p-6 text-white">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-extrabold text-lg">SM-Pulse</p>
                  <p className="text-xs text-gray-400">Real-time trend intelligence</p>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 bg-white/20 rounded-full flex-shrink-0">20 credits</span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                Scans Reddit and YouTube right now to surface trending topics, viral formats,
                and engagement spikes in your niche — before you create your next post.
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-extrabold text-lg text-gray-900 dark:text-gray-100">SM-Radar</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">Personal growth intelligence</p>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full flex-shrink-0">20 credits</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                Analyzes live Reddit and YouTube data to surface content gaps, competitor weaknesses,
                and the single best content strategy for your niche this week.
              </p>
            </div>
          </div>

          <div className="text-center">
            <Link href="/ai-features"
              className="inline-block bg-black text-white font-bold px-6 py-3 rounded-xl hover:opacity-80 transition-all text-sm">
              See all 12 AI tools →
            </Link>
          </div>
        </div>
      </section>

      {/* FEATURE GRID */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">Full feature set</p>
            <h2 className="text-3xl font-extrabold tracking-tight mb-3 text-gray-900 dark:text-gray-100">Everything you need to grow</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Every feature that matters. Most of them free.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-6 hover:border-gray-300 dark:hover:border-gray-500 transition-all">
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="text-sm font-extrabold mb-2 text-gray-900 dark:text-gray-100">{f.title}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMPARISON */}
      <section className="py-20 bg-white dark:bg-gray-950">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">How we compare</p>
            <h2 className="text-3xl font-extrabold tracking-tight mb-4 text-gray-900 dark:text-gray-100">
              What you've been paying for<br className="hidden md:block" /> vs what you actually need
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
              Social media management tools removed their free plans, locked features behind enterprise tiers,
              and kept raising prices. SocialMate went the other direction.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl overflow-x-auto">
            <div className="min-w-[420px]">
              {/* TABLE HEADER */}
              <div className="grid grid-cols-3 bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700 px-4 md:px-6 py-4">
                <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide">Feature</span>
                <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide text-center">Typical tools</span>
                <span className="text-xs font-bold text-black dark:text-white uppercase tracking-wide text-center">SocialMate</span>
              </div>

              {COMPARISON.filter(r => !r.header).map((row, i) => (
                <div key={i} className={`grid grid-cols-3 px-4 md:px-6 py-3.5 items-center ${
                  i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50/50 dark:bg-gray-800/50'
                } border-b border-gray-50 dark:border-gray-700 last:border-0`}>
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{row.label}</span>
                  <span className="text-xs text-gray-400 dark:text-gray-500 text-center">{row.industry}</span>
                  <span className="text-xs font-bold text-black dark:text-white text-center">{row.socialmate}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 bg-black rounded-2xl p-6 text-white text-center">
            <p className="text-sm font-extrabold mb-1">
              Everything above. Free to start. $5/month to grow.
            </p>
            <p className="text-xs text-gray-400 mb-1">
              No per-seat fees. No feature gating for basics. No removed free plan.
            </p>
            <p className="text-xs text-amber-400 mb-5">
              Features marked "✅ Free" are <strong>always free</strong>. AI tools use credits — free users get 50/month to keep infrastructure sustainable.
            </p>
            <Link href="/signup"
              className="inline-block bg-white text-black font-bold px-8 py-3.5 rounded-2xl hover:opacity-90 transition-all text-sm">
              Get started free →
            </Link>
          </div>
        </div>
      </section>

      {/* LINK IN BIO */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block text-xs font-bold bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full mb-4">
                Free bio link builder
              </span>
              <h2 className="text-3xl font-extrabold tracking-tight mb-4 text-gray-900 dark:text-gray-100">
                Link in Bio —<br />included free
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-4">
                Dedicated bio link tools charge $10–20/month for what SocialMate includes on every plan at no cost.
                Build your page, add your links, and share one URL everywhere.
              </p>
              <div className="space-y-2 mb-6">
                {[
                  'Custom themes and button styles',
                  'Social profile icons and links',
                  'Your own public URL — free',
                  'Custom domain — earn free via referrals, or included on Pro+',
                  'Remove SocialMate branding on Pro+',
                ].map(f => (
                  <div key={f} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                    <span className="text-green-500 font-bold flex-shrink-0">✓</span>{f}
                  </div>
                ))}
              </div>
              <Link href="/signup"
                className="inline-block bg-black text-white font-bold px-6 py-3 rounded-xl hover:opacity-80 transition-all text-sm">
                Create your free bio page →
              </Link>
            </div>
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm">
              <div className="bg-gray-900 rounded-xl p-6 text-white text-center">
                <div className="w-14 h-14 rounded-full bg-gray-600 flex items-center justify-center text-2xl mx-auto mb-3">👤</div>
                <p className="font-bold text-sm mb-1">Your Name</p>
                <p className="text-xs text-gray-400 mb-4">Your bio goes here</p>
                <div className="space-y-2">
                  {['🌐  My Website', '📝  Latest Post', '📬  Contact Me'].map(link => (
                    <div key={link} className="bg-white text-gray-900 text-xs font-bold py-2 px-4 rounded-lg">
                      {link}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-600 mt-4">Made with SocialMate · Free</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW WE STAY FREE */}
      <section className="py-20 bg-white dark:bg-gray-950">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">Built to last</p>
          <h2 className="text-3xl font-extrabold tracking-tight mb-3 text-gray-900 dark:text-gray-100">
            Free should mean free.<br className="hidden md:block" /> Not a limited demo.
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-8 leading-relaxed">
            SocialMate keeps infrastructure sustainable through a credit system — so we can give every free user tools that actually work without burning out. AI generation is the only thing credits gate, and free users get 50 every month. Everything else — scheduling, analytics, link in bio, bulk upload — is free, always.
          </p>

          {/* NO-ADS BADGE */}
          <div className="inline-flex items-center gap-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-3 mb-12">
            <span className="text-base">🚫</span>
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              No ads in your feed. No data selling. Just clean tools that actually work — we suggest, never spam.
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-10">
            {[
              {
                icon: '🆓',
                title: 'Genuinely generous free tier',
                desc: 'Scheduling, bulk upload, analytics, link in bio, competitor tracking, 2 team seats, and 50 AI credits per month — all at $0. No hidden paywalls on the basics.',
              },
              {
                icon: '⚡',
                title: 'Credits only gate AI costs',
                desc: "AI generation uses real compute — we use credits to keep that sustainable, not as a lever to squeeze upgrades. The credit system lets the free tier thrive.",
              },
              {
                icon: '🔒',
                title: 'No bait-and-switch',
                desc: 'Free means free. The free plan is not a trial, not a countdown, and not designed to frustrate you into upgrading. What you see is what you get.',
              },
            ].map((card, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-6 text-left hover:border-gray-300 dark:hover:border-gray-500 transition-all">
                <div className="text-2xl mb-3">{card.icon}</div>
                <h3 className="text-sm font-extrabold mb-2 text-gray-900 dark:text-gray-100">{card.title}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
          <Link href="/signup"
            className="inline-block bg-black text-white font-bold px-8 py-4 rounded-2xl hover:opacity-80 transition-all">
            Start free — no card needed →
          </Link>
        </div>
      </section>

      {/* FREE GUIDES CTA */}
      <section className="py-20 bg-[#0a0a0a] border-t border-gray-900">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold px-4 py-2 rounded-full mb-6">
              📚 Free forever · No signup required
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight mb-3 text-white">
              Gilgamesh&apos;s Guides — the free playbooks
            </h2>
            <p className="text-sm text-gray-400 max-w-xl mx-auto">
              Real-talk guides on starting a business, marketing from zero, and building with AI.
              Written by the solo founder who built SocialMate between deli shifts. No courses to buy. No email required.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
            {[
              {
                vol: 'Vol. 1',
                title: 'Starting a Business From Scratch',
                desc: 'Wyoming LLC for $150, Reddit validation, free stack, first customers, and what nobody tells you about doing it alone.',
                href: '/guides/starting-a-business',
                available: true,
              },
              {
                vol: 'Vol. 2',
                title: 'Marketing on Zero Budget',
                desc: 'Organic growth, content flywheels, community seeding, and how to turn every platform into a distribution channel.',
                href: '/guides/marketing-zero-budget',
                available: true,
              },
              {
                vol: 'Vol. 3',
                title: 'Vibe Coding with AI',
                desc: 'How to ship production software with no CS degree using AI as your co-pilot. The real workflow, the real mistakes.',
                href: '/guides',
                available: false,
              },
            ].map(g => (
              <div key={g.vol} className="rounded-2xl border border-[#1f1f1f] bg-[#111111] p-6 flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                  <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-xs font-bold text-amber-400">{g.vol}</span>
                  {g.available
                    ? <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">Live</span>
                    : <span className="rounded-full bg-gray-800 border border-gray-700 px-2.5 py-0.5 text-xs text-gray-500">Soon</span>
                  }
                </div>
                <h3 className="font-bold text-white text-sm mb-2">{g.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed flex-1">{g.desc}</p>
                <Link href={g.href} className={`mt-4 inline-flex items-center gap-1 text-xs font-bold transition-colors ${g.available ? 'text-amber-400 hover:text-amber-300' : 'text-gray-600 cursor-default pointer-events-none'}`}>
                  {g.available ? 'Read free →' : 'Coming soon'}
                </Link>
              </div>
            ))}
          </div>
          <div className="text-center">
            <Link href="/guides" className="inline-flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-7 py-3 text-sm font-bold text-amber-400 transition-colors hover:bg-amber-500/20">
              Browse all guides →
            </Link>
          </div>
        </div>
      </section>

      {/* STORY */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">Why we built this</p>
          <h2 className="text-3xl font-extrabold tracking-tight mb-6 text-gray-900 dark:text-gray-100">
            Professional tools shouldn't require<br className="hidden md:block" /> a professional budget.
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-8 max-w-xl mx-auto">
            SocialMate is fully bootstrapped — built solo, across every role, with no investors and no safety net.
            The belief driving it: creators and small businesses deserve tools that actually work
            at a price that doesn't require a business budget to justify.
            The platforms that charge $99/month know this. They just bet you won't look for a better option.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/story"
              className="text-sm font-bold text-black dark:text-white underline hover:opacity-70 transition-all">
              Read the full story →
            </Link>
            <Link href="/pricing"
              className="text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-all">
              See how pricing works →
            </Link>
          </div>
        </div>
      </section>

      {/* SM-GIVE */}
      <section className="py-16 bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-gray-950 dark:bg-gray-900 rounded-2xl px-5 sm:px-8 py-8 sm:py-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">❤️</span>
                <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">SM-Give Initiative</span>
              </div>
              <h2 className="text-xl font-extrabold text-white mb-3 tracking-tight">
                Every subscription supports something bigger.
              </h2>
              <p className="text-sm text-gray-400 leading-relaxed max-w-md">
                2% of every SocialMate subscription goes directly to SM-Give — funding school supply bookbags,
                baby essentials for struggling parents, and homeless care packages. No corporate partners. No sponsors. Just us.
              </p>
            </div>
            <div className="flex flex-col items-center gap-3 flex-shrink-0">
              <div className="flex flex-wrap justify-center gap-4">
                {['🎒 School Supplies', '👶 Baby Essentials', '🏠 Homeless Care'].map(tag => (
                  <div key={tag} className="text-center">
                    <div className="text-xl mb-1">{tag.split(' ')[0]}</div>
                    <div className="text-xs text-gray-500 font-medium leading-tight">{tag.slice(3)}</div>
                  </div>
                ))}
              </div>
              <Link href="/give"
                className="text-xs font-bold text-amber-400 hover:text-amber-300 transition-all border border-amber-400/30 hover:border-amber-400/60 px-5 py-2 rounded-xl mt-2">
                Learn about SM-Give →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 bg-black text-white">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-extrabold tracking-tight mb-4">Ready to get started?</h2>
          <p className="text-gray-400 mb-8 text-sm max-w-lg mx-auto">
            Free forever. No card required. 50 AI credits per month, included free. Set up in 60 seconds.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup"
              className="bg-white text-black font-bold px-8 py-4 rounded-2xl hover:opacity-90 transition-all text-base w-full sm:w-auto text-center">
              Create free account →
            </Link>
            <Link href="/pricing"
              className="text-gray-400 font-semibold hover:text-white transition-all text-sm">
              Compare plans →
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-gray-800 bg-black dark:bg-gray-950">
        <div className="max-w-6xl mx-auto px-6 pt-10 pb-6">

          {/* Top: logo + tagline */}
          <div className="flex items-center gap-2 mb-8">
            <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center text-black text-xs font-bold">S</div>
            <span className="text-sm font-bold text-white">SocialMate</span>
            <span className="text-xs text-gray-500 ml-1">by Gilgamesh Enterprise LLC</span>
          </div>

          {/* Columns */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-600 mb-3">Product</p>
              <ul className="space-y-2">
                {[['Features','/features'],['Pricing','/pricing'],['Roadmap','/roadmap'],['Clips Studio','/clips']].map(([label,href])=>(
                  <li key={href}><Link href={href} className="text-sm text-gray-400 hover:text-white transition-colors">{label}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-600 mb-3">Solutions</p>
              <ul className="space-y-2">
                {[['For Streamers','/for/streamers'],['For Agencies','/for/agencies'],['For Small Business','/for/small-business'],['Studio Stax','/studio-stax']].map(([label,href])=>(
                  <li key={href}><Link href={href} className="text-sm text-gray-400 hover:text-white transition-colors">{label}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-600 mb-3">Company</p>
              <ul className="space-y-2">
                {[['Our Story','/story'],['Blog','/blog'],['Merch','/merch'],['Affiliates','/affiliates'],['Referral','/referral']].map(([label,href])=>(
                  <li key={href}><Link href={href} className="text-sm text-gray-400 hover:text-white transition-colors">{label}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-600 mb-3">Legal</p>
              <ul className="space-y-2">
                <li><Link href="/privacy" className="text-sm text-gray-400 hover:text-white transition-colors">Privacy</Link></li>
                <li><Link href="/terms" className="text-sm text-gray-400 hover:text-white transition-colors">Terms</Link></li>
                <li><Link href="/give" className="text-sm text-rose-400 hover:text-rose-300 font-medium transition-colors">❤️ SM-Give</Link></li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="flex items-center justify-between flex-wrap gap-4 pt-6 border-t border-gray-800">
            <a href="https://www.producthunt.com/posts/socialmate-2"
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#FF6154] hover:bg-[#e5564a] text-white text-xs font-semibold rounded-lg transition-colors">
              <svg width="14" height="14" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13 0C5.82 0 0 5.82 0 13s5.82 13 13 13 13-5.82 13-13S20.18 0 13 0zm2.17 17.33H10.5V8.67h4.67c1.38 0 2.5 1.12 2.5 2.5v3.66c0 1.38-1.12 2.5-2.5 2.5z" fill="white"/>
              </svg>
              Featured on Product Hunt
            </a>
            <p className="text-xs text-gray-600">© 2026 SocialMate · All rights reserved</p>
          </div>

        </div>
      </footer>

    </div>
  )
}