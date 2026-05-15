import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

// next-intl middleware handles locale detection and routing for public pages only.
// Authenticated app routes (dashboard, compose, settings, etc.) are NOT prefixed.
// English URLs remain unchanged (/pricing, /blog, etc.) — localePrefix: 'as-needed'.

const intlMiddleware = createMiddleware(routing)

export default intlMiddleware

export const config = {
  // Run on public page paths and [locale]-prefixed paths only.
  // Explicitly exclude: API routes, Next.js internals, static files, auth routes,
  // and all authenticated app routes.
  matcher: [
    // Match the locale-prefixed variants: /es/..., /pt/..., etc.
    '/(es|pt|fr|de|ru|zh)/:path*',
    // Match the public pages themselves (no locale prefix for 'en')
    '/',
    '/pricing',
    '/signup',
    '/login',
    '/blog',
    '/blog/:path*',
    '/faq',
    '/changelog',
    '/wall-of-love',
    '/affiliates',
    '/story',
    '/roadmap',
    '/features',
    '/privacy',
    '/terms',
    '/support',
    '/guides',
    '/guides/:path*',
    '/vs',
    '/vs/:path*',
    '/for/:path*',
    '/give',
    '/merch',
    '/partners',
    '/referral',
    '/studio-stax',
    '/studio-stax/:path*',
  ],
}
