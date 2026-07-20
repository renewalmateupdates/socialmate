'use client'
import { useState } from 'react'
import Link from 'next/link'
import PublicLayout from '@/components/PublicLayout'
import { useI18n } from '@/contexts/I18nContext'
import { BarChart3, Bot, Building2, CalendarClock, CalendarDays, CheckCircle2, Clock, FileDown, FileText, Flame, FolderOpen, Hash, History, ImagePlus, Inbox, Link2, MessagesSquare, Package, PenLine, Radar, Recycle, RefreshCw, Rss, Search, ShieldCheck, Tag, Tags, Telescope, TrendingUp, Users, Wrench, Zap } from 'lucide-react'
import PlatformIcon from '@/components/landing/PlatformIcon'

const FEATURE_CATEGORIES = [
  {
    category: 'AI Tools',
    icon: Bot,
    desc: '15+ AI tools powered by Google Gemini. Credits included on every plan.',
    features: [
      {
        name: 'Caption Generator',
        icon: PenLine,
        credits: '5 credits',
        proOnly: false,
        what: 'Generates platform-optimized captions based on your topic and tone.',
        how: 'Powered by Google Gemini. Analyzes your topic and platform to generate captions that match character limits, tone, and engagement patterns.',
      },
      {
        name: 'Hashtag Generator',
        icon: Hash,
        credits: '5 credits',
        proOnly: false,
        what: 'Generates a set of relevant, high-performing hashtags for your post.',
        how: 'AI analyzes your caption content and niche to suggest hashtags that balance reach and relevance.',
      },
      {
        name: 'Post Rewrite / Improver',
        icon: RefreshCw,
        credits: '5 credits',
        proOnly: false,
        what: 'Takes your existing caption and makes it sharper, more engaging, and better structured.',
        how: 'AI rewrites for stronger hooks, better readability, and platform-appropriate tone.',
      },
      {
        name: 'Viral Hook Generator',
        icon: TrendingUp,
        credits: '5 credits',
        proOnly: false,
        what: 'Generates 3 scroll-stopping opening lines designed to drive clicks and engagement.',
        how: 'Trained on viral content patterns across TikTok, YouTube, LinkedIn and Reddit.',
      },
      {
        name: 'Thread Generator',
        icon: MessagesSquare,
        credits: '10 credits',
        proOnly: false,
        what: 'Turns a single topic or idea into a structured multi-part thread with a hook, supporting points, and a CTA.',
        how: 'AI structures your idea into a full narrative arc — ready to copy and post.',
      },
      {
        name: 'Content Repurposer',
        icon: Recycle,
        credits: '10 credits',
        proOnly: false,
        what: 'Paste a blog post, transcript, or long caption and get platform-ready short-form content out the other side.',
        how: 'AI extracts key ideas from long-form content and reshapes them into posts optimized for each platform.',
      },
      {
        name: 'Post Score',
        icon: Zap,
        credits: '5 credits',
        proOnly: false,
        what: 'AI predicts how your post will perform before you publish — with a score out of 100, strengths, and improvements.',
        how: 'Scores your post against engagement patterns on the selected platform. Shows what to fix before it goes live.',
      },
      {
        name: 'AI Content Calendar',
        icon: CalendarDays,
        credits: '25 credits',
        proOnly: true,
        what: 'Generate a full 30-day content calendar based on your niche, platforms, and posting goals.',
        how: 'AI plans a content strategy around your niche, then generates individual posts for each day. Fully editable before publishing.',
      },
      {
        name: 'AI Image Generation',
        icon: ImagePlus,
        credits: '25 credits',
        proOnly: true,
        what: 'Generate custom images for your posts directly inside SocialMate.',
        how: 'Powered by Google Gemini image models. Generated images can be added directly to your scheduled post.',
      },
    ],
  },
  {
    category: 'Growth Intelligence',
    icon: Radar,
    desc: 'Real data from Reddit and YouTube — trend scanning, growth analysis, and gap detection.',
    features: [
      {
        name: 'SM-Pulse',
        icon: Flame,
        credits: '20 credits per scan',
        proOnly: false,
        what: 'Scans Reddit and YouTube in real time to surface what is trending in your niche right now.',
        how: 'Analyzes trending topics, viral post formats, and engagement spikes. Returns top 3 trending topics, 3 content angles, 10 hashtags, and the best platform to post on right now.',
      },
      {
        name: 'SM-Radar',
        icon: Radar,
        credits: '20 credits per report',
        proOnly: false,
        what: 'Analyzes real trending data to surface content gaps, competitor weaknesses, and your single best content strategy this week.',
        how: 'Pulls from live Reddit and YouTube data to identify what topics are being asked about but not answered well, and hands you a concrete opportunity to act on.',
      },
      {
        name: 'Content Gap Detector',
        icon: Search,
        credits: '10 credits',
        proOnly: false,
        what: 'Spots underserved topics and missing content in your niche so you can create what nobody else is making.',
        how: 'Analyzes your niche and surfaces content gaps, audience questions going unanswered, and underused formats — each scored for ease and reach potential.',
      },
    ],
  },
  {
    category: 'Scheduling & Automation',
    icon: CalendarClock,
    desc: 'Schedule across 7 live platforms from one place. Bulk upload, evergreen recycling, and automated queues.',
    features: [
      {
        name: 'Bulk Scheduler',
        icon: Package,
        credits: 'Free',
        proOnly: false,
        what: 'Schedule dozens of posts at once instead of one at a time.',
        how: 'Posts are queued and distributed across your selected timeframe. Manual bulk scheduling is always free on every plan.',
      },
      {
        name: 'Evergreen Content Recycling',
        icon: Recycle,
        credits: 'Free',
        proOnly: false,
        what: 'Mark your best posts as evergreen and they automatically re-queue when your schedule goes empty.',
        how: 'Toggle any published post as evergreen from your post history. SocialMate re-schedules it automatically so your content never goes cold.',
      },
      {
        name: 'RSS / Blog Import',
        icon: Rss,
        credits: 'Free',
        proOnly: false,
        what: 'Pull posts from any RSS or Atom feed and turn them into scheduled social posts in one click.',
        how: 'Paste any RSS feed URL — blog posts, podcasts, YouTube channels, newsletters. Select which items to import and they save as drafts ready to edit and schedule.',
      },
      {
        name: 'Content Approval Workflows',
        icon: CheckCircle2,
        credits: 'Free',
        proOnly: true,
        what: 'Let team members submit posts for admin review before they go live.',
        how: 'Team members submit posts to a review queue. Admins approve or reject from the Approvals page. Approved posts move to drafts for scheduling.',
      },
      {
        name: 'Best Time to Post',
        icon: Clock,
        credits: 'Free',
        proOnly: false,
        what: 'See when your audience is most active so you can schedule posts for maximum reach.',
        how: 'Pulled from your connected account analytics. Displayed on your dashboard and suggested during scheduling.',
      },
      {
        name: 'Platform Requirement Guard',
        icon: ShieldCheck,
        credits: 'Always free',
        proOnly: false,
        what: 'Automatically warns you if your post violates a platform\'s rules before it goes live.',
        how: 'Checks every post against known platform limits for character counts, video length, file size, and hashtag caps — before scheduling.',
      },
    ],
  },
  {
    category: 'Creator Tools',
    icon: Wrench,
    desc: 'The tools that make your workflow faster — templates, media, hashtags, and your bio page.',
    features: [
      {
        name: 'Link in Bio Page',
        icon: Link2,
        credits: 'Free',
        proOnly: false,
        what: 'A clean, shareable bio page that houses all your links — like Linktree, built into SocialMate at no cost.',
        how: 'Fully customizable from your dashboard. Custom themes, button styles, social icons, and a public URL included free. Pro users can connect a custom domain. Earn a custom domain free by referring 3 paying users.',
      },
      {
        name: 'Post Template Library',
        icon: FileText,
        credits: 'Free',
        proOnly: false,
        what: 'Save your best post formats as reusable templates so you never start from scratch.',
        how: 'Templates are stored in your account. Load any template into the Compose editor with one click.',
      },
      {
        name: 'Media Library',
        icon: FolderOpen,
        credits: 'Free',
        proOnly: false,
        what: 'Store and organize your images and videos inside SocialMate for quick access when scheduling.',
        how: 'Free tier: 1 GB. Pro: 10 GB. Agency: 50 GB. Upload once, attach to any post.',
      },
      {
        name: 'Hashtag Collections',
        icon: Tags,
        credits: 'Free',
        proOnly: false,
        what: 'Save groups of hashtags and apply them to posts with one click.',
        how: 'Create unlimited named hashtag groups. Inject any collection into your post while composing.',
      },
    ],
  },
  {
    category: 'Analytics',
    icon: BarChart3,
    desc: 'Real data from your posting activity — no fake metrics, no inflated numbers.',
    features: [
      {
        name: 'Analytics Dashboard',
        icon: BarChart3,
        credits: 'Free',
        proOnly: false,
        what: 'Track your posting activity, platform breakdown, streak, peak times, and consistency score — all in one place.',
        how: 'Pulls from your post history to calculate daily activity charts, best days and times, monthly breakdowns, and a consistency score out of 100.',
      },
      {
        name: 'Analytics History',
        icon: History,
        credits: 'Free / Credits',
        proOnly: false,
        what: '14-day and 30-day history free on all plans. 90-day free on Pro. 6-month free on Agency.',
        how: 'Free plan can unlock 90-day view for 2 credits. Pro can unlock 6-month for 2 credits. Agency gets full 6-month history at no extra cost.',
      },
      {
        name: 'PDF Analytics Reports',
        icon: FileDown,
        credits: 'Free',
        proOnly: true,
        what: 'Export a full analytics report as a PDF — post counts, engagement, platform breakdown, peak times, and more.',
        how: 'One click from the Analytics page. Generates a clean, branded report you can share with clients or keep for your records.',
      },
    ],
  },
  {
    category: 'Competitive Intelligence',
    icon: Telescope,
    desc: 'Track competitors, monitor your inbox, and stay ahead of what\'s happening in your niche.',
    features: [
      {
        name: 'Competitor Tracking',
        icon: Telescope,
        credits: 'Free',
        proOnly: false,
        what: 'Track up to 3 competitor accounts across platforms — available on every plan including free.',
        how: 'Add competitors by name, platform, and handle. Pair with SM-Pulse to scan what\'s trending in their niche and get ahead of them.',
      },
      {
        name: 'Social Inbox',
        icon: Inbox,
        credits: 'Free',
        proOnly: false,
        what: 'Comments and mentions from all your connected platforms — in one unified inbox.',
        how: 'Filter by platform, type (comment, mention, DM), and read/unread status. Click any message to mark it read. Live sync coming soon.',
      },
    ],
  },
  {
    category: 'Team & Agency',
    icon: Users,
    desc: 'Collaborate with your team, manage clients, and control access — all built in.',
    features: [
      {
        name: 'Team Management',
        icon: Users,
        credits: 'Free',
        proOnly: false,
        what: 'Invite team members, assign roles, and manage who can post, draft, or admin your account.',
        how: 'Free: 2 seats. Pro: 5 seats. Agency: 15 seats. Seat limits are enforced automatically.',
      },
      {
        name: 'Client Workspaces',
        icon: Building2,
        credits: 'Free',
        proOnly: true,
        what: 'Separate workspaces for each client — fully isolated content, platforms, and settings.',
        how: 'Agency plan includes full workspace management. Switch between client accounts from the sidebar workspace switcher.',
      },
      {
        name: 'White Label',
        icon: Tag,
        credits: '+$20/mo or +$40/mo add-on',
        proOnly: true,
        what: 'Remove all SocialMate branding and replace it with your own logo, colors, and domain.',
        how: 'White Label Basic ($20/mo): logo + colors + brand name. White Label Pro ($40/mo): everything in Basic plus a custom domain so clients never see SocialMate.',
      },
    ],
  },
]

const CREDIT_SUMMARY = [
  { name: 'Caption Generator',    cost: '5 cr',  proOnly: false },
  { name: 'Hashtag Generator',    cost: '5 cr',  proOnly: false },
  { name: 'Post Rewrite',         cost: '5 cr',  proOnly: false },
  { name: 'Viral Hook',           cost: '5 cr',  proOnly: false },
  { name: 'Thread Generator',     cost: '10 cr', proOnly: false },
  { name: 'Content Repurposer',   cost: '10 cr', proOnly: false },
  { name: 'Post Score',           cost: '5 cr',  proOnly: false },
  { name: 'SM-Pulse',             cost: '20 cr', proOnly: false },
  { name: 'SM-Radar',             cost: '20 cr', proOnly: false },
  { name: 'Content Gap',          cost: '10 cr', proOnly: false },
  { name: 'AI Content Calendar',  cost: '25 cr', proOnly: true  },
  { name: 'AI Image Generation',  cost: '25 cr', proOnly: true  },
]

export default function Features() {
  const { t } = useI18n()
  const [activeCategory, setActiveCategory] = useState('All')
  const categories = [t('features.filter_all'), ...FEATURE_CATEGORIES.map(c => c.category)]
  const filtered = activeCategory === t('features.filter_all')
    ? FEATURE_CATEGORIES
    : FEATURE_CATEGORIES.filter(c => c.category === activeCategory)

  return (
    <PublicLayout>
      <div className="max-w-5xl mx-auto px-6 py-16">

        {/* HEADER */}
        <div className="mb-10">
          <p className="text-xs font-bold text-ink-muted uppercase tracking-widest mb-3">{t('features.eyebrow')}</p>
          <h1 className="text-4xl font-extrabold tracking-tight mb-3 text-ink-high">{t('features.hero_title')}</h1>
          <p className="text-sm text-ink-muted max-w-2xl leading-relaxed">
            {t('features.hero_desc')}
          </p>
        </div>

        {/* CREDIT QUICK REFERENCE */}
        <div className="bg-panel border border-edge text-ink-high rounded-2xl p-6 mb-10">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs font-bold text-ink-body uppercase tracking-widest mb-1">{t('features.credit_ref_eyebrow')}</p>
              <p className="text-sm font-extrabold">{t('features.credit_ref_title')}</p>
            </div>
            <Link href="/pricing" className="text-xs font-bold text-ink-body hover:text-ink-high transition-all flex-shrink-0">
              {t('features.see_pricing')}
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            {CREDIT_SUMMARY.map(tool => (
              <div key={tool.name} className="bg-raised rounded-xl p-2.5 text-center relative">
                {tool.proOnly && (
                  <span className="absolute -top-1.5 -right-1.5 text-xs font-bold bg-violet/10 text-ink-high px-1.5 py-0.5 rounded-full">Pro+</span>
                )}
                <p className="text-xs font-bold text-ink-high leading-snug mb-1">{tool.name}</p>
                <p className="text-xs text-ink-body font-bold">{tool.cost}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-ink-muted mt-4">{t('features.credits_bank_note')}</p>
        </div>

        {/* CATEGORY FILTER */}
        <div className="flex items-center gap-2 mb-8 flex-wrap">
          {categories.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`text-xs font-bold px-4 py-2 rounded-xl transition-all ${
                activeCategory === cat
                  ? 'bg-amber text-void'
                  : 'bg-panel border border-edge text-ink-muted hover:border-edge-lit'
              }`}>
              {cat}
            </button>
          ))}
        </div>

        {/* FEATURE SECTIONS */}
        {filtered.map(section => (
          <div key={section.category} className="mb-14">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <section.icon className="h-5 w-5 flex-shrink-0 text-ink-muted" strokeWidth={2} aria-hidden="true" />
                <h2 className="text-base font-extrabold tracking-tight text-ink-high">{section.category}</h2>
              </div>
            </div>
            {section.desc && (
              <p className="text-xs text-ink-muted mb-5 ml-8">{section.desc}</p>
            )}
            <div className="grid grid-cols-1 gap-3">
              {section.features.map(f => (
                <div key={f.name}
                  className="bg-panel border border-edge rounded-2xl p-5 hover:border-edge-lit transition-all">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <f.icon className="h-4 w-4 flex-shrink-0 text-ink-muted" strokeWidth={2} aria-hidden="true" />
                      <h3 className="text-sm font-extrabold text-ink-high">{f.name}</h3>
                      {f.proOnly && (
                        <span className="text-xs font-bold px-2 py-0.5 bg-violet/10 text-violet rounded-full">Pro+</span>
                      )}
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full flex-shrink-0 ${
                      f.credits === 'Free' || f.credits === 'Always free'
                        ? 'bg-jade/10 text-jade'
                        : f.credits.includes('add-on')
                        ? 'bg-raised text-ink-muted'
                        : 'bg-raised text-ink-high'
                    }`}>
                      {f.credits}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-bold text-ink-muted uppercase tracking-wide mb-1">{t('features.what_it_does')}</p>
                      <p className="text-xs text-ink-muted leading-relaxed">{f.what}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-ink-muted uppercase tracking-wide mb-1">{t('features.how_it_works')}</p>
                      <p className="text-xs text-ink-muted leading-relaxed">{f.how}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* PLATFORM NOTE */}
        <div className="bg-raised border border-edge rounded-2xl p-6 mb-10">
          <div className="flex items-start gap-4">
            <span className="text-3xl">📱</span>
            <div>
              <h3 className="text-sm font-extrabold mb-1 text-ink-high">{t('features.platform_note_title')}</h3>
              <p className="text-xs text-ink-muted leading-relaxed mb-3">
                {t('features.platform_note_desc')}
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  { name: 'Discord', status: 'live'    },
                  { name: 'Bluesky', status: 'live'    },
                  { name: 'Telegram', status: 'live'    },
                  { name: 'Mastodon', status: 'live'    },
                  { name: 'X / Twitter', status: 'live'    },
                  { name: 'LinkedIn', status: 'live'    },
                  { name: 'YouTube', status: 'soon'    },
                  { name: 'Pinterest', status: 'soon'    },
                  { name: 'Reddit', status: 'soon'    },
                  { name: 'Instagram', status: 'planned' },
                  { name: 'TikTok', status: 'live'    },
                  { name: 'Facebook', status: 'planned' },
                  { name: 'Threads', status: 'planned' },
                ].map(p => (
                  <div key={p.name} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${
                    p.status === 'live'    ? 'bg-jade/10 text-jade border border-jade/40' :
                    p.status === 'soon'    ? 'bg-raised text-ink-muted border border-edge-lit' :
                    'bg-panel text-ink-muted border border-edge'
                  }`}>
                    <PlatformIcon name={p.name} size={13} mono />
                    <span>{p.name}</span>
                    {p.status === 'live' && <span className="font-bold">✓</span>}
                    {p.status === 'soon' && <span className="text-ink-muted font-bold">{t('features.platform_soon')}</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* SM-Give strip */}
        <div className="border-t border-edge mt-16 pt-10 pb-4">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <p className="text-sm text-ink-muted">
              <span className="font-semibold text-ink-body">2% of every SocialMate subscription</span> goes to SM-Give — our charity initiative.{' '}
              <a href="/give" className="text-amber hover:text-amber-bright font-semibold transition-colors">{t('features.sm_give_link')}</a>
            </p>
          </div>
        </div>

        {/* BOTTOM CTA */}
        <div className="bg-panel border border-edge rounded-2xl p-8 text-center text-ink-high">
          <h2 className="text-2xl font-extrabold mb-2">{t('features.cta_title')}</h2>
          <p className="text-sm text-ink-body mb-6 max-w-md mx-auto">
            {t('features.cta_desc')}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/signup"
              className="bg-amber text-void text-sm font-bold px-6 py-3 rounded-xl hover:bg-amber-bright transition-all w-full sm:w-auto text-center">
              {t('features.cta_primary')}
            </Link>
            <Link href="/pricing"
              className="border border-edge-lit text-ink-high text-sm font-bold px-6 py-3 rounded-xl hover:border-ink-muted transition-all w-full sm:w-auto text-center">
              {t('features.cta_secondary')}
            </Link>
          </div>
        </div>

      </div>
    </PublicLayout>
  )
}