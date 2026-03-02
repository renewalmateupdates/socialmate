import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://socialmate-six.vercel.app'
  const now = new Date()

  const staticPages = [
    { url: base, priority: 1.0, changeFrequency: 'weekly' as const },
    { url: `${base}/pricing`, priority: 0.9, changeFrequency: 'monthly' as const },
    { url: `${base}/blog`, priority: 0.8, changeFrequency: 'weekly' as const },
    { url: `${base}/login`, priority: 0.7, changeFrequency: 'monthly' as const },
    { url: `${base}/signup`, priority: 0.9, changeFrequency: 'monthly' as const },
    { url: `${base}/privacy`, priority: 0.4, changeFrequency: 'yearly' as const },
    { url: `${base}/terms`, priority: 0.4, changeFrequency: 'yearly' as const },
  ]

  const blogPosts = [
    'buffer-alternative-free',
    'hootsuite-alternative',
    'free-linktree-alternative',
    'bulk-scheduling-guide',
    'best-times-to-post',
    'social-media-team-collaboration',
    'instagram-scheduling-guide',
    'hashtag-strategy',
    'social-media-analytics',
  ].map(slug => ({
    url: `${base}/blog/${slug}`,
    priority: 0.7,
    changeFrequency: 'monthly' as const,
  }))

  return [...staticPages, ...blogPosts].map(page => ({
    ...page,
    lastModified: now,
  }))
}