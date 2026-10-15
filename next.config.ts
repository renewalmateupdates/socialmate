import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },

  // This project prerenders 1000+ static pages (blog + vs/ + for/ + locales).
  // Next defaults to one worker per core, and on a 12-core machine that meant 11
  // parallel workers each trying to hold a full page-rendering heap. A cold build
  // died either way: a large per-worker heap exhausted system memory, and a small
  // one made every individual worker OOM (exit 134).
  //
  // Capping the worker count is the actual lever — 4 workers comfortably render
  // the same 1067 pages, just with less contention. Warm local builds hid this
  // because they reuse .next; CI and Vercel always build cold, so this protects
  // the deploy as much as it does the laptop.
  experimental: {
    cpus: 4,
  },
  async redirects() {
    return [
      // One host. www.socialmate.studio served the whole app instead of
      // redirecting, so anyone who arrived on www got their cookies there: an
      // OAuth connect started on www set its one-time state on www, every
      // platform returns to the bare domain, and the state check failed every
      // time. Sign-ins split across the two hosts the same way. API routes and
      // the auth callback stay reachable on www so a webhook or an in-flight
      // sign-in pointed at it keeps working.
      {
        source: '/:path((?!api/|auth/|_next/).*)',
        has: [{ type: 'host', value: 'www.socialmate.studio' }],
        destination: 'https://socialmate.studio/:path',
        permanent: true,
      },
      // Legacy route redirects
      {
        source: '/listings',
        destination: '/studio-stax',
        permanent: true,
      },
      {
        source: '/listings/apply',
        destination: '/studio-stax/apply',
        permanent: true,
      },
      // Contact → Support
      {
        source: '/contact',
        destination: '/support',
        permanent: true,
      },
      {
        source: '/contact-us',
        destination: '/support',
        permanent: true,
      },
      // Partners admin → admin/partners
      {
        source: '/partners/admin',
        destination: '/admin/partners',
        permanent: true,
      },
      // Affiliate old route
      {
        source: '/affiliate',
        destination: '/partners',
        permanent: true,
      },
      // Settings plan → settings
      {
        source: '/settings/plan',
        destination: '/settings',
        permanent: false,
      },
    ]
  },
};

export default nextConfig;
