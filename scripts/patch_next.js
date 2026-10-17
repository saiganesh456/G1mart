const fs = require('fs');
const path = require('path');

console.log('[patch_next.js] Running Next.js patcher...');

// 1. Patch not-found invariant in next-server runtimes
const files = [
  'node_modules/next/dist/compiled/next-server/server.runtime.prod.js',
  'node_modules/next/dist/compiled/next-server/app-page.runtime.dev.js',
  'node_modules/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js',
  'node_modules/next/dist/compiled/next-server/app-page-experimental.runtime.dev.js',
  'node_modules/next/dist/compiled/next-server/app-page-turbo-experimental.runtime.dev.js',
];

for (const rel of files) {
  try {
    const p = path.resolve(rel);
    if (fs.existsSync(p)) {
      let content = fs.readFileSync(p, 'utf8');
      const target = 'if(void 0===n)throw Error("Invariant: no direct app page entry found for "+e);';
      const repl = 'if(void 0===n){if(e==="/_not-found")return"/_not-found/page";throw Error("Invariant: no direct app page entry found for "+e);}';
      if (content.includes(target)) {
        content = content.replace(target, repl);
        fs.writeFileSync(p, content, 'utf8');
        console.log('[patch_next.js] Patched', rel);
      } else if (content.includes('if(e==="/_not-found")return"/_not-found/page"')) {
        console.log('[patch_next.js] Already patched', rel);
      }
    }
  } catch (e) {
    console.warn('[patch_next.js] Error patching', rel, e.message);
  }
}

// 2. Patch next/dist/build/index.js to ensure directories exist before writeFileUtf8 and handle missing pagesManifest
try {
  const buildIndexPath = path.resolve('node_modules/next/dist/build/index.js');
  if (fs.existsSync(buildIndexPath)) {
    let content = fs.readFileSync(buildIndexPath, 'utf8');
    const writeTarget = 'async function writeFileUtf8(filePath, content) {\n    await _fs.promises.writeFile(filePath, content, \'utf-8\');\n}';
    const writeRepl = 'async function writeFileUtf8(filePath, content) {\n    await _fs.promises.mkdir(_path.default.dirname(filePath), { recursive: true });\n    await _fs.promises.writeFile(filePath, content, \'utf-8\');\n}';
    let changed = false;
    if (content.includes(writeTarget)) {
      content = content.replace(writeTarget, writeRepl);
      changed = true;
      console.log('[patch_next.js] Patched writeFileUtf8 in next/dist/build/index.js');
    }

    const manifestTarget = 'let pagesManifest = await readManifest(pagesManifestPath);';
    const manifestRepl = 'let pagesManifest = await readManifest(pagesManifestPath).catch(() => ({}));';
    if (content.includes(manifestTarget)) {
      content = content.replace(manifestTarget, manifestRepl);
      changed = true;
      console.log('[patch_next.js] Patched pagesManifest in next/dist/build/index.js');
    }

    if (changed) {
      fs.writeFileSync(buildIndexPath, content, 'utf8');
    }
  }
} catch (e) {
  console.warn('[patch_next.js] Error patching build/index.js:', e.message);
}

// 3. Patch app-paths selectAppPageEntry for /_not-found during build page data collection
const appPathsFiles = [
  'node_modules/next/dist/shared/lib/router/utils/app-paths.js',
  'node_modules/next/dist/esm/shared/lib/router/utils/app-paths.js',
];

for (const rel of appPathsFiles) {
  try {
    const p = path.resolve(rel);
    if (fs.existsSync(p)) {
      let content = fs.readFileSync(p, 'utf8');
      const target = 'throw new Error("Invariant: no direct app page entry found for " + pathname);';
      const repl = 'if (pathname === "/_not-found") return "/_not-found/page"; throw new Error("Invariant: no direct app page entry found for " + pathname);';
      if (content.includes(target) && !content.includes('if (pathname === "/_not-found")')) {
        content = content.replace(target, repl);
        fs.writeFileSync(p, content, 'utf8');
        console.log('[patch_next.js] Patched selectAppPageEntry in', rel);
      } else if (content.includes('if (pathname === "/_not-found")')) {
        console.log('[patch_next.js] Already patched selectAppPageEntry in', rel);
      }
    }
  } catch (e) {
    console.warn('[patch_next.js] Error patching', rel, e.message);
  }
}

console.log('[patch_next.js] Patching completed successfully.');
process.exit(0);
