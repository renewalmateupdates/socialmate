import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
