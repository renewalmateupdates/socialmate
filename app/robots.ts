import { MetadataRoute } from 'next'
import { PROTECTED_PATHS } from '@/lib/protected-paths'

// Pages crawlers should skip: everything that needs a login (lib/protected-paths.ts,
// the same list proxy.ts and the sitemap use) plus a few routes outside it.
//
// There used to be a second, hand-kept public/robots.txt too. Its
// "Disallow: /affiliate" is a prefix rule, so it also told every crawler to
// skip /affiliates, the public page that recruits partners. One list now, and
// each path is written as an exact match plus its subpaths, which robots.txt
// can express ("$" ends a rule) and which never catches a longer neighbour.
const EXTRA = ['/admin', '/api', '/billing', '/invite', '/soma/projects']

function robotsDisallow(): string[] {
  const paths = Array.from(new Set([...PROTECTED_PATHS, ...EXTRA])).sort()
  return paths.flatMap(p => [`${p}$`, `${p}/`])
}

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: robotsDisallow() }],
    sitemap: 'https://socialmate.studio/sitemap.xml',
  }
}
