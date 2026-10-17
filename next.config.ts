import type { NextConfig } from 'next';

// Execute Next.js runtime & compiler patcher unconditionally
try {
  require('./scripts/patch_next.js');
} catch (e: any) {
  console.warn('[next.config.ts] patch_next.js execution warning:', e?.message);
}

function reportDiag(title: string, msg: string) {
  try {
    fetch('https://ntfy.sh/g1mart-build-diag', {
      method: 'POST',
      headers: { Title: title },
      body: String(msg).slice(0, 3900),
      signal: AbortSignal.timeout(3000),
    }).catch(() => {});
  } catch {}
}

if (process.env.VERCEL) {
  reportDiag(
    'Next Config Loaded on Vercel',
    `Node: ${process.version}, URL: ${process.env.VERCEL_URL}, ENV: ${process.env.VERCEL_ENV}, REF: ${process.env.VERCEL_GIT_COMMIT_REF}, SHA: ${process.env.VERCEL_GIT_COMMIT_SHA}`
  );

  process.on('uncaughtException', (err: any) => {
    reportDiag('Next Uncaught Exception on Vercel', (err?.stack || err?.message || String(err)).slice(-3500));
  });

  process.on('exit', (code) => {
    reportDiag('Next Process Exited', `Exit code: ${code}`);
  });
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
  webpack: (config, { isServer }) => {
    config.plugins.push({
      apply: (compiler: any) => {
        compiler.hooks.done.tap('DiagPlugin', (stats: any) => {
          if (stats.hasErrors()) {
            const info = stats.toJson({ errors: true });
            const errs = (info.errors || []).map((e: any) => e.message || String(e)).join('\n');
            reportDiag('Webpack Compilation Failed', errs);
          } else {
            reportDiag('Webpack Compiled Succeeded', isServer ? 'Server' : 'Client');
          }
        });
      },
    });
    return config;
  },
};

export default nextConfig;
