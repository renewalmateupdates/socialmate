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
          '/calendar',
          '/drafts',
          '/queue',
          '/analytics',
          '/settings',
          '/accounts',
          '/team',
          '/referral',
          '/notifications',
          '/search',
          '/hashtags',
          '/media',
          '/templates',
          '/link-in-bio',
          '/bulk-scheduler',
          '/best-times',
          '/onboarding',
        ],
      },
    ],
    sitemap: 'https://socialmate-six.vercel.app/sitemap.xml',
  }
}