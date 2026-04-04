import { MetadataRoute } from 'next'

const BLOG_SLUGS = [
  'why-we-built-socialmate',
  'best-free-social-media-scheduler-2025',
  'how-to-use-ai-for-social-media-captions',
  'why-your-hashtag-strategy-isnt-working',
  'schedule-30-days-of-content-in-one-sitting',
  'real-cost-of-social-media-management-tools-2025',
  'best-times-to-post-2026',
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
    { url: `${base}/privacy`,             lastModified: now, changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${base}/terms`,               lastModified: now, changeFrequency: 'yearly',  priority: 0.3 },
  ]

  const comparisons: MetadataRoute.Sitemap = [
    { url: `${base}/vs/buffer`,        lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/vs/hootsuite`,     lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/vs/later`,         lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/vs/zoho-social`,   lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/vs/socialrails`,   lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/vs/metricool`,     lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/vs/publer`,        lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/vs/planable`,      lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
  ]

  const blogPosts: MetadataRoute.Sitemap = BLOG_SLUGS.map(slug => ({
    url: `${base}/blog/${slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  return [...core, ...comparisons, ...blogPosts]
}
