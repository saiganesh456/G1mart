import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  serverExternalPackages: ['@supabase/ssr', '@supabase/supabase-js'],
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
