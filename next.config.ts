import type { NextConfig } from 'next';
import https from 'https';

// Execute Next.js runtime & compiler patcher unconditionally
try {
  require('./scripts/patch_next.js');
} catch (e: any) {
  console.warn('[next.config.ts] patch_next.js execution warning:', e?.message);
}

function reportDiag(title: string, msg: string) {
  try {
    const data = Buffer.from(msg, 'utf8');
    const req = https.request('https://ntfy.sh/g1mart-build-diag', {
      method: 'POST',
      headers: {
        'Title': title,
        'Content-Type': 'text/plain',
        'Content-Length': data.length,
      },
    });
    req.on('error', () => {});
    req.write(data);
    req.end();
  } catch {}
}

if (process.env.VERCEL) {
  reportDiag('Next Config Loaded on Vercel', `Node: ${process.version}, Platform: ${process.platform}`);
  
  process.on('uncaughtException', (err) => {
    reportDiag('Next Uncaught Exception on Vercel', (err?.stack || err?.message || String(err)).slice(-3500));
  });

  process.on('exit', (code) => {
    if (code !== 0) {
      reportDiag('Next Process Exited With Error', `Exit code: ${code}`);
    } else {
      reportDiag('Next Process Exited Cleanly', `Exit code: 0`);
    }
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
};

export default nextConfig;
