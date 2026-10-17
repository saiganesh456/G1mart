import type { NextConfig } from 'next';

// Execute Next.js runtime & compiler patcher
try {
  require('./scripts/patch_next.js');
} catch (e: any) {
  console.warn('[next.config.ts] patch_next.js warning:', e?.message);
}

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
