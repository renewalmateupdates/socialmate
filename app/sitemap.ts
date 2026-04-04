import { MetadataRoute } from 'next'

const BLOG_SLUGS = [
  // Original 14
  'why-we-built-socialmate',
  'socialmate-gives-back-sm-give',
  'discord-scheduling-grow-your-server',
  'mastodon-scheduling-free-tool',
  'how-to-repurpose-content-across-platforms',
  'how-to-schedule-posts-on-bluesky',
  'social-media-scheduling-for-small-business',
  'free-social-media-tools-for-creators',
  'how-to-grow-bluesky-following',
  'social-media-scheduling-vs-posting-manually',
  'best-free-social-media-scheduler-2025',
  'how-to-use-ai-for-social-media-captions',
  'why-your-hashtag-strategy-isnt-working',
  'real-cost-of-social-media-management-tools-2025',
  // 12 new posts (Apr 2026)
  'how-to-schedule-telegram-posts-free',
  'bluesky-vs-twitter-where-to-post-2026',
  'social-media-content-calendar-template-2026',
  'best-time-to-post-on-bluesky',
  'discord-community-management-guide',
  'social-media-automation-solo-creators',
  'free-hootsuite-alternative-2026',
  'how-to-grow-discord-server-2026',
  'ai-social-media-tools-free-2026',
  'how-to-post-consistently-social-media',
  'mastodon-vs-bluesky-2026',
  'social-media-scheduling-agencies-freelancers',
]

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://socialmate.studio'
  const now  = new Date()

  const core: MetadataRoute.Sitemap = [
    { url: base,                          lastModified: now, changeFrequency: 'weekly',  priority: 1   },
    { url: `${base}/pricing`,             lastModified: now, changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${base}/features`,            lastModified: now, changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${base}/studio-stax`,         lastModified: now, changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${base}/studio-stax/apply`,   lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/give`,                lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/partners`,            lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/signup`,              lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/login`,               lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/story`,               lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/roadmap`,             lastModified: now, changeFrequency: 'weekly',  priority: 0.7 },
    { url: `${base}/affiliate`,           lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/blog`,                lastModified: now, changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${base}/vs`,                  lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/privacy`,             lastModified: now, changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${base}/terms`,               lastModified: now, changeFrequency: 'yearly',  priority: 0.3 },
  ]

  const comparisons: MetadataRoute.Sitemap = [
    { url: `${base}/vs/hootsuite`,    lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/vs/buffer`,       lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/vs/later`,        lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/vs/sendible`,     lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/vs/metricool`,    lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/vs/publer`,       lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/vs/planable`,     lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/vs/sprout-social`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/vs/socialpilot`,  lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/vs/zoho-social`,  lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/vs/socialrails`,  lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
  ]

  const blogPosts: MetadataRoute.Sitemap = BLOG_SLUGS.map(slug => ({
    url: `${base}/blog/${slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  return [...core, ...comparisons, ...blogPosts]
}
