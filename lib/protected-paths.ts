/**
 * Pages that need a signed-in session. proxy.ts sends anyone without one to
 * /login, and the sitemap leaves these out, so search engines are not handed
 * pages that only ever answer with a login redirect.
 *
 * Matching is by path segment. A bare startsWith('/affiliate') also caught
 * /affiliates, the public page that recruits partners, and sent every
 * logged-out visitor there to the login screen.
 */
export const PROTECTED_PATHS = [
  '/dashboard',
  '/analytics',
  '/compose',
  '/campaigns',
  '/live-alerts',
  '/calendar',
  '/queue',
  '/drafts',
  '/settings',
  '/accounts',
  '/ai-features',
  '/sm-pulse',
  '/sm-radar',
  '/bulk-scheduler',
  '/hashtags',
  '/affiliate',
  '/notifications',
  '/team',
  '/workspaces',
  '/onboarding',
  '/inbox',
  '/social-inbox',
  '/link-in-bio',
  '/rss-import',
  '/media',
  '/templates',
  '/approvals',
  '/evergreen',
  '/best-times',
  '/competitor-tracking',
  '/content-gap',
  '/search',
  // App screens that rendered an empty shell or "Loading..." to logged-out
  // visitors and sat in the sitemap. Signing in is the only useful next step.
  '/achievements',
  '/challenge',
  '/community',
  '/hashtag-collections',
  '/monetize/hub',
  '/zenith',
]

export function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PATHS.some(path => pathname === path || pathname.startsWith(path + '/'))
}
