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
          '/analytics',
          '/accounts',
          '/team',
          '/settings',
          '/admin',
          '/api/',
        ],
      },
    ],
    sitemap: 'https://socialmate-six.vercel.app/sitemap.xml',
  }
}