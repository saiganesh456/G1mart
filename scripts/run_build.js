const { spawnSync } = require('child_process');
const https = require('https');

function sendDiag(title, msg) {
  try {
    const data = String(msg || '').slice(0, 3900);
    const req = https.request('https://ntfy.sh/g1mart-build-diag', {
      method: 'POST',
      headers: {
        'Title': title,
        'Content-Type': 'text/plain',
        'Content-Length': Buffer.byteLength(data),
      },
      timeout: 4000,
    });
    req.on('error', () => {});
    req.write(data);
    req.end();
  } catch (e) {}
}

console.log('[run_build.js] Starting build pipeline...');

// 1. Run patch_next.js
try {
  require('./patch_next.js');
} catch (e) {
  sendDiag('patch_next.js Failed', e.stack || e.message);
}

// 2. Run next build
const nextBin = require.resolve('next/dist/bin/next');
const res = spawnSync(process.execPath, [nextBin, 'build'], {
  stdio: 'pipe',
  encoding: 'utf-8',
  env: process.env,
  maxBuffer: 50 * 1024 * 1024,
});

if (res.status !== 0) {
  const errOutput = (res.stderr || '') + '\n' + (res.stdout || '');
  console.error('[run_build.js] next build failed with status', res.status);
  console.error(errOutput);
  sendDiag(`Vercel next build FAILED (${res.status})`, errOutput.slice(-3800));
  process.exit(res.status || 1);
} else {
  console.log('[run_build.js] next build SUCCEEDED!');
  sendDiag('Vercel next build SUCCEEDED', (res.stdout || '').slice(-1000));
}
