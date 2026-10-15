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
]

export function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PATHS.some(path => pathname === path || pathname.startsWith(path + '/'))
}
