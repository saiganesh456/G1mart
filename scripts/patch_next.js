const fs = require('fs');
const path = require('path');

// 1. Patch not-found invariant in next-server runtimes
const files = [
  'node_modules/next/dist/compiled/next-server/server.runtime.prod.js',
  'node_modules/next/dist/compiled/next-server/app-page.runtime.dev.js',
  'node_modules/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js',
  'node_modules/next/dist/compiled/next-server/app-page-experimental.runtime.dev.js',
  'node_modules/next/dist/compiled/next-server/app-page-turbo-experimental.runtime.dev.js',
];

for (const rel of files) {
  const p = path.resolve(rel);
  if (fs.existsSync(p)) {
    let content = fs.readFileSync(p, 'utf8');
    const target = 'if(void 0===n)throw Error("Invariant: no direct app page entry found for "+e);';
    const repl = 'if(void 0===n){if(e==="/_not-found")return"/_not-found/page";throw Error("Invariant: no direct app page entry found for "+e);}';
    if (content.includes(target)) {
      content = content.replace(target, repl);
      fs.writeFileSync(p, content, 'utf8');
      console.log('Patched', rel);
    } else if (content.includes('if(e==="/_not-found")return"/_not-found/page"')) {
      console.log('Already patched', rel);
    } else {
      console.log('Target string not found in', rel);
    }
  }
}

// 2. Patch next/dist/build/index.js to ensure directories exist before writeFileUtf8 and handle missing pagesManifest
const buildIndexPath = path.resolve('node_modules/next/dist/build/index.js');
if (fs.existsSync(buildIndexPath)) {
  let content = fs.readFileSync(buildIndexPath, 'utf8');

  // Patch writeFileUtf8 to mkdir recursively
  const writeTarget = 'async function writeFileUtf8(filePath, content) {\n    await _fs.promises.writeFile(filePath, content, \'utf-8\');\n}';
  const writeRepl = 'async function writeFileUtf8(filePath, content) {\n    await _fs.promises.mkdir(_path.default.dirname(filePath), { recursive: true });\n    await _fs.promises.writeFile(filePath, content, \'utf-8\');\n}';
  if (content.includes(writeTarget)) {
    content = content.replace(writeTarget, writeRepl);
    console.log('Patched writeFileUtf8 in next/dist/build/index.js');
  }

  // Patch readManifest(pagesManifestPath)
  const manifestTarget = 'let pagesManifest = await readManifest(pagesManifestPath);';
  const manifestRepl = 'let pagesManifest = await readManifest(pagesManifestPath).catch(() => ({}));';
  if (content.includes(manifestTarget)) {
    content = content.replace(manifestTarget, manifestRepl);
    console.log('Patched pagesManifest in next/dist/build/index.js');
  }

  fs.writeFileSync(buildIndexPath, content, 'utf8');
}
