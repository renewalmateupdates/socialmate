import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard',
          '/compose',
          '/settings',
          '/admin',
          '/api',
          '/onboarding',
          '/queue',
          '/drafts',
          '/analytics',
          '/team',
          '/billing',
          '/workspaces',
          '/accounts',
          '/affiliate',
          '/notifications',
          '/media',
          '/bulk-scheduler',
          '/calendar',
          '/evergreen',
          '/hashtags',
          '/templates',
          '/sm-pulse',
          '/sm-radar',
          '/content-gap',
          '/competitor-tracking',
          '/social-inbox',
          '/best-times',
          '/rss-import',
          '/approvals',
          '/link-in-bio',
          '/search',
          '/invite',
        ],
      },
    ],
    sitemap: 'https://socialmate.studio/sitemap.xml',
  }
}