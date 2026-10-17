const { spawnSync } = require('child_process');
const https = require('https');

function sendDiag(title, message) {
  try {
    const data = Buffer.from(message, 'utf8');
    const req = https.request('https://ntfy.sh/g1mart-build-diag', {
      method: 'POST',
      headers: {
        'Title': title,
        'Content-Type': 'text/plain',
        'Content-Length': data.length
      }
    });
    req.on('error', (err) => console.error('[build_runner] ntfy error:', err.message));
    req.write(data);
    req.end();
  } catch (e) {
    console.error('[build_runner] ntfy exception:', e.message);
  }
}

console.log('[build_runner] Node:', process.version, 'Platform:', process.platform);

// 1. Run patch
const patch = spawnSync('node', ['scripts/patch_next.js'], { stdio: 'inherit', shell: true, encoding: 'utf8' });
if (patch.status !== 0) {
  console.error('[build_runner] Patch script failed with code', patch.status);
  sendDiag('Patch Failed', `Patch failed with code ${patch.status}`);
}

// 2. Run next build
console.log('[build_runner] Starting next build...');
const build = spawnSync('npx', ['next', 'build'], { stdio: ['inherit', 'pipe', 'pipe'], shell: true, encoding: 'utf8' });

console.log(build.stdout || '');
console.error(build.stderr || '');

if (build.status !== 0) {
  console.error('[build_runner] next build failed with code', build.status);
  const out = (build.stdout || '') + '\n--- STDERR ---\n' + (build.stderr || '');
  sendDiag('Next Build Failed', out.slice(-3500));
  setTimeout(() => process.exit(build.status || 1), 2500);
} else {
  console.log('[build_runner] next build succeeded!');
  sendDiag('Next Build Succeeded', 'Build succeeded cleanly with code 0');
  setTimeout(() => process.exit(0), 1500);
}
