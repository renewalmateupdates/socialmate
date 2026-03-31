import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
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
    ]
  },
};

export default nextConfig;
