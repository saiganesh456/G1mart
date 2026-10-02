import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Allow product images served from public/products/ (no external domains needed in Phase 1)
  images: {
    remotePatterns: [],
  },
};

export default nextConfig;
