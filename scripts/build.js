const { spawnSync } = require('child_process');
const https = require('https');
const path = require('path');
const fs = require('fs');

function report(title, msg) {
  try {
    const data = Buffer.from(msg, 'utf8');
    const req = https.request('https://ntfy.sh/g1mart-build-diag', {
      method: 'POST',
      headers: {
        'Title': title,
        'Content-Type': 'text/plain',
        'Content-Length': data.length,
      }
    });
    req.on('error', () => {});
    req.write(data);
    req.end();
  } catch (e) {}
}

report('Vercel Build Started', `Node: ${process.version}, Platform: ${process.platform}`);

// 1. Run patch
try {
  require('./patch_next.js');
} catch (e) {
  report('Patch Failed on Vercel', e.stack || e.message);
}

// 2. Run next build
const isWin = process.platform === 'win32';
const nextBin = path.resolve('node_modules/.bin/' + (isWin ? 'next.cmd' : 'next'));

console.log('[build.js] Executing next build via:', nextBin);
const res = spawnSync(nextBin, ['build'], {
  encoding: 'utf8',
  env: process.env,
  shell: isWin,
  maxBuffer: 20 * 1024 * 1024,
});

console.log(res.stdout || '');
if (res.stderr) console.error(res.stderr);

if (res.status !== 0) {
  const fullLog = (res.stdout || '') + '\n=== STDERR ===\n' + (res.stderr || '');
  report(`Vercel Build Failed (${res.status})`, fullLog.slice(-3800));
  setTimeout(() => process.exit(res.status || 1), 3000);
} else {
  report('Vercel Build Succeeded!', 'Exit 0');
  setTimeout(() => process.exit(0), 1000);
}
