'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import Sidebar from '@/components/Sidebar'

type RoadmapItem = {
  title:    string
  desc:     string
  status:   'in-progress' | 'coming-soon' | 'planned' | 'shipped'
  category: string
}

const ROADMAP: RoadmapItem[] = [
  // ── IN PROGRESS ──────────────────────────────────────────
  { title: 'Analytics improvements',     desc: 'GitHub-style posting heatmap, platform breakdown charts, best-times visualization, and recent posts table.',     status: 'in-progress',  category: 'Analytics'     },
  { title: 'Media Library',              desc: 'Upload, compress, and reuse images and videos across posts. Client-side compression to 1920px and 2MB max.',     status: 'in-progress',  category: 'Media'         },
  { title: 'Blog auto-generation',       desc: 'Gemini writes a blog feature for each Studio Stax lister once past the refund window. Lister gets notified by email when it\'s live.', status: 'in-progress', category: 'Platform' },

  // ── COMING SOON ───────────────────────────────────────────
  { title: 'LinkedIn publishing',        desc: 'Full UGC Posts API integration. Requires LinkedIn developer app approval (r/w_member_social).',                 status: 'coming-soon',  category: 'Platforms'     },
  { title: 'YouTube Community Posts',    desc: 'Post to YouTube Community tab (requires 500+ subscribers). OAuth token management complete.',                    status: 'coming-soon',  category: 'Platforms'     },
  { title: 'Pinterest publishing',       desc: 'Pin creation via Pinterest v5 API with board selection. OAuth complete.',                                        status: 'coming-soon',  category: 'Platforms'     },
  { title: 'Evergreen recycling engine', desc: 'Mark published posts as evergreen. Inngest daily function auto-queues when schedule runs dry.',                  status: 'coming-soon',  category: 'Scheduling'    },
  { title: 'RSS / Blog Import',          desc: 'Fetch and parse any RSS or Atom feed. Turn entries into scheduled posts in one click.',                          status: 'coming-soon',  category: 'Import'        },
  { title: 'Social Inbox',              desc: 'Fetch Bluesky/Mastodon mentions and replies. Unified inbox with read/unread state and filters.',                 status: 'coming-soon',  category: 'Engagement'    },
  { title: 'Notifications system',       desc: 'Bell icon with unread badge. Post published/failed, approval events, credit alerts — all in one place.',         status: 'coming-soon',  category: 'Platform'      },
  { title: 'Content Approval workflows', desc: 'Team members submit posts for review. Owner approves (schedules) or rejects (sends back with note).',           status: 'coming-soon',  category: 'Teams'         },

  // ── PLANNED ───────────────────────────────────────────────
  { title: 'Instagram publishing',       desc: 'Instagram Graph API integration. Requires Facebook Business account and Meta app review.',                       status: 'planned',      category: 'Platforms'     },
  { title: 'TikTok publishing',          desc: 'TikTok Content Posting API. Requires TikTok developer app approval.',                                            status: 'planned',      category: 'Platforms'     },
  { title: 'Twitter / X publishing',     desc: 'X API v2 Basic tier integration. Requires developer account and API key approval.',                              status: 'planned',      category: 'Platforms'     },
  { title: 'Facebook Pages',             desc: 'Facebook Graph API for posting to Business Pages. Requires Meta app review.',                                    status: 'planned',      category: 'Platforms'     },
  { title: 'Threads',                    desc: 'Threads API integration once the API becomes publicly available.',                                                status: 'planned',      category: 'Platforms'     },
  { title: 'Reddit',                     desc: 'Reddit API integration for posting to subreddits. Respects rate limits and flair requirements.',                 status: 'planned',      category: 'Platforms'     },
  { title: 'Browser extension',          desc: 'Save content from any webpage directly to SocialMate drafts or queue with one click.',                           status: 'planned',      category: 'Tools'         },
  { title: 'Post analytics per platform', desc: 'Platform-specific engagement data (impressions, clicks, follows) returned from each platform API.',             status: 'planned',      category: 'Analytics'     },
  { title: 'Competitor tracking',        desc: 'Track competitor accounts on Bluesky/Mastodon. Inngest fetches and surfaces their content every 6 hours.',       status: 'planned',      category: 'Intelligence'  },

  // ── SHIPPED ───────────────────────────────────────────────
  { title: 'Studio Stax directory',      desc: 'Founder-curated directory of tools, creators, and projects. Ranked by SM-Give donations. First 100 annual listings lock in the founding rate ($99/yr). Apply at /studio-stax.', status: 'shipped', category: 'Platform' },
  { title: 'Image & video upload',       desc: 'Attach images and videos directly in the compose screen. Uploads to Supabase Storage and publishes to Discord, Bluesky, Mastodon, and Telegram.', status: 'shipped', category: 'Media' },
  { title: 'SM-Give charity program',    desc: '50% of every donation goes directly to SM-Give — funding school supplies, baby essentials, and homeless care packages. No strings attached.', status: 'shipped', category: 'Platform' },
  { title: 'Dark mode',                  desc: 'Full dark mode across all pages with Tailwind dark: variants, system preference detection, and Supabase sync.',  status: 'shipped',      category: 'Design'        },
  { title: 'Mobile layout',             desc: 'Fully responsive across all pages — hamburger nav, proper touch targets, mobile-optimized forms and compose.',    status: 'shipped',      category: 'Mobile'        },
  { title: 'Bulk Scheduler',            desc: 'CSV upload with PapaParse, row validation, preview table with inline editing, and batch scheduling.',             status: 'shipped',      category: 'Scheduling'    },
  { title: 'AI Image Generation',        desc: 'Generate on-brand social images from your post content using Gemini Imagen. Pro+ feature, 25 credits.',          status: 'shipped',      category: 'AI'            },
  { title: 'Bluesky publishing',         desc: 'Full AT Protocol integration with token refresh and post URI tracking.',                                         status: 'shipped',      category: 'Platforms'     },
  { title: 'Discord publishing',         desc: 'Webhook-based posting to Discord channels. Multiple destination support.',                                       status: 'shipped',      category: 'Platforms'     },
  { title: 'Telegram publishing',        desc: 'Bot token + chat ID based posting. HTML parse mode support.',                                                    status: 'shipped',      category: 'Platforms'     },
  { title: 'Mastodon publishing',        desc: 'Per-instance OAuth with token exchange. Supports any Mastodon instance.',                                        status: 'shipped',      category: 'Platforms'     },
  { title: 'Stripe billing',             desc: 'Free, Pro ($5/mo), and Agency ($20/mo) plans with credit pack purchases.',                                       status: 'shipped',      category: 'Platform'      },
  { title: 'Affiliate system',           desc: 'Referral codes, conversion tracking, tiered commissions, and affiliate dashboard.',                              status: 'shipped',      category: 'Growth'        },
  { title: 'AI caption tools',           desc: 'Caption generator, hashtag generator, post rewriter, viral hook generator — all on free tier.',                 status: 'shipped',      category: 'AI'            },
  { title: 'Link in Bio builder',        desc: 'Bio page builder with profile, links, themes, and a public URL at /[username].',                                 status: 'shipped',      category: 'Tools'         },
  { title: 'Workspace system',           desc: 'Personal workspace auto-created on signup. Client workspaces on Pro+.',                                          status: 'shipped',      category: 'Teams'         },
  { title: 'AI credits system',          desc: 'Monthly credit allotment with bank capacity limits, rollover, reset cron, and top-up purchases.',                status: 'shipped',      category: 'Platform'      },
  { title: 'Scheduled publishing',       desc: 'Inngest-powered scheduling with sleepUntil, retry logic, and status tracking.',                                  status: 'shipped',      category: 'Scheduling'    },
  { title: 'Onboarding flow',            desc: '5-step onboarding: welcome, platform connect, use case, schedule setup, done.',                                  status: 'shipped',      category: 'Platform'      },
]

const STATUS_CONFIG = {
  'in-progress': { label: 'In Progress', color: 'bg-blue-100 text-blue-700',    dot: 'bg-blue-500'  },
  'coming-soon': { label: 'Coming Soon', color: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-500' },
  'planned':     { label: 'Planned',     color: 'bg-gray-100 text-gray-500',    dot: 'bg-gray-400'  },
  'shipped':     { label: 'Shipped',     color: 'bg-green-100 text-green-700',  dot: 'bg-green-500' },
}

const ORDER: RoadmapItem['status'][] = ['in-progress', 'coming-soon', 'planned', 'shipped']

export default function RoadmapClient() {
  const [feedbackText, setFeedbackText]   = useState('')
  const [feedbackEmail, setFeedbackEmail] = useState('')
  const [feedbackSent, setFeedbackSent]   = useState(false)
  const [sending, setSending]             = useState(false)
  const [isAuthed, setIsAuthed]           = useState(false)
  const [authChecked, setAuthChecked]     = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setIsAuthed(!!data.user)
      setAuthChecked(true)
    })
  }, [])

  async function submitRequest() {
    if (!feedbackText.trim()) return
    setSending(true)
    try {
      await fetch('/api/feature-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: feedbackText.trim(),
          email:   feedbackEmail.trim() || null,
        }),
      })
      setFeedbackSent(true)
      setFeedbackText('')
      setFeedbackEmail('')
    } catch {
      // Silently fail
      setFeedbackSent(true)
    } finally {
      setSending(false)
    }
  }

  const publicNav = (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-gray-950/95 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800">
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-black dark:bg-white rounded-lg flex items-center justify-center text-white dark:text-black text-sm font-bold">S</div>
          <span className="font-bold text-base tracking-tight text-gray-900 dark:text-gray-100">SocialMate</span>
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          {[
            { label: 'Features',  href: '/features'  },
            { label: 'Pricing',   href: '/pricing'   },
            { label: 'Roadmap',   href: '/roadmap'   },
            { label: 'Blog',      href: '/blog'      },
            { label: 'Story',     href: '/story'     },
          ].map(l => (
            <Link key={l.label} href={l.href}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                l.href === '/roadmap'
                  ? 'bg-gray-900 dark:bg-white text-white dark:text-black'
                  : 'text-gray-500 hover:text-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}>
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/login"  className="text-sm font-semibold text-gray-500 hover:text-black dark:hover:text-white transition-all hidden sm:block">Sign in</Link>
          <Link href="/signup" className="bg-black dark:bg-white text-white dark:text-black text-sm font-bold px-4 py-2 rounded-xl hover:opacity-80 transition-all">
            Get started free →
          </Link>
        </div>
      </div>
    </header>
  )

  const roadmapContent = (
    <div className="max-w-4xl mx-auto px-6 py-16">

        {/* HERO */}
        <div className="mb-14">
          <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">Public roadmap</p>
          <h1 className="text-4xl font-extrabold tracking-tight mb-4 text-gray-900 dark:text-gray-100">What we're building</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm max-w-2xl leading-relaxed">
            SocialMate is built in public. This is what's in progress, what's coming next, what's planned,
            and what's already shipped. Feature requests welcome at the bottom.
          </p>
        </div>

        {/* STATUS LEGEND */}
        <div className="flex flex-wrap gap-3 mb-12">
          {ORDER.map(s => {
            const cfg = STATUS_CONFIG[s]
            const count = ROADMAP.filter(i => i.status === s).length
            return (
              <div key={s} className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${cfg.color}`}>
                <div className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                {cfg.label} ({count})
              </div>
            )
          })}
        </div>

        {/* SECTIONS */}
        {ORDER.map(status => {
          const items = ROADMAP.filter(i => i.status === status)
          const cfg   = STATUS_CONFIG[status]
          return (
            <div key={status} className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
                <h2 className="text-lg font-extrabold tracking-tight text-gray-900 dark:text-gray-100">{cfg.label}</h2>
                <span className="text-xs font-bold text-gray-400 dark:text-gray-500">{items.length} item{items.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="space-y-3">
                {items.map((item, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl hover:border-gray-200 dark:hover:border-gray-600 transition-all">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <p className="text-sm font-extrabold text-gray-900 dark:text-gray-100">{item.title}</p>
                        <span className="text-xs font-bold text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">{item.category}</span>
                        {item.status === 'shipped' && <span className="text-xs">✅</span>}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}

        {/* FEATURE REQUEST FORM */}
        <div className="bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-6 mt-8">
          <h2 className="text-lg font-extrabold tracking-tight mb-2 text-gray-900 dark:text-gray-100">Request a feature</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-5 leading-relaxed">
            Have an idea that's not on the roadmap? Tell us. We read every submission and it genuinely shapes what we build.
          </p>
          {feedbackSent ? (
            <div className="text-center py-6">
              <div className="text-3xl mb-3">🙏</div>
              <p className="text-sm font-extrabold mb-1">Got it — thank you!</p>
              <p className="text-xs text-gray-500">We read every request.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <textarea
                value={feedbackText}
                onChange={e => setFeedbackText(e.target.value)}
                placeholder="What should we build? Be specific — the more detail, the better."
                rows={4}
                className="w-full px-4 py-3 text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400 rounded-xl resize-none focus:outline-none focus:border-gray-400 dark:focus:border-gray-400"
              />
              <input
                type="email"
                value={feedbackEmail}
                onChange={e => setFeedbackEmail(e.target.value)}
                placeholder="Your email (optional — we'll update you when it ships)"
                className="w-full px-4 py-3 text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400 rounded-xl focus:outline-none focus:border-gray-400 dark:focus:border-gray-400"
              />
              <button
                onClick={submitRequest}
                disabled={!feedbackText.trim() || sending}
                className="bg-pink-500 text-white text-sm font-bold px-6 py-2.5 rounded-xl hover:opacity-80 transition-all disabled:opacity-40">
                {sending ? 'Sending...' : 'Submit idea →'}
              </button>
            </div>
          )}
        </div>
      </div>
  )

  const publicFooter = (
    <footer className="border-t border-gray-100 dark:border-gray-800 py-8">
      <div className="max-w-5xl mx-auto px-6 flex items-center justify-between flex-wrap gap-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-6 h-6 bg-black dark:bg-white rounded-lg flex items-center justify-center text-white dark:text-black text-xs font-bold">S</div>
          <span className="font-bold text-sm text-gray-900 dark:text-gray-100">SocialMate</span>
        </Link>
        <div className="flex items-center gap-6 text-xs text-gray-400 dark:text-gray-500">
          <Link href="/features" className="hover:text-black dark:hover:text-white">Features</Link>
          <Link href="/pricing"  className="hover:text-black dark:hover:text-white">Pricing</Link>
          <Link href="/blog"     className="hover:text-black dark:hover:text-white">Blog</Link>
        </div>
      </div>
    </footer>
  )

  if (isAuthed) {
    return (
      <div className="flex h-screen overflow-hidden bg-white dark:bg-gray-950">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-8">
            {roadmapContent}
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {publicNav}
      {roadmapContent}
      {publicFooter}
    </div>
  )
}
