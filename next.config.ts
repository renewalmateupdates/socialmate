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
