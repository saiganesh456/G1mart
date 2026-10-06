import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Allow product images served from public/products/ (no external domains needed in Phase 1)
  images: {
    unoptimized: true,
    remotePatterns: [],
  },
};

export default nextConfig;
