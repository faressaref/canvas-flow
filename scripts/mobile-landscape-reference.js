import fs from 'node:fs';

const file = 'public/index.html';
if (!fs.existsSync(file)) throw new Error(`Missing ${file}`);

let html = fs.readFileSync(file, 'utf8');

// Remove stale generated landscape blocks from older iterations.
const staleIds = [
  'canvasflow-mobile-landscape-reference-final',
  'canvasflow-mobile-landscape-reference-js',
  'canvasflow-mobile-landscape-toolbar-final',
  'canvasflow-mobile-landscape-class-detector',
  'canvasflow-mobile-landscape-tablet-build-final'
];
for (const id of staleIds) {
  const re = new RegExp(`<(?:style|script)\\s+id=["']${id}["'][^>]*>[\\\\s\\\\S]*?<\\/(?:style|script)>\\s*`, 'gi');
  html = html.replace(re, '\\n');
}

// The source already contains the authoritative clean landscape style.
// This script intentionally does NOT rebuild #mobileV2Bar or inject inline styles.
fs.writeFileSync(file, html, 'utf8');
console.log('mobile landscape reference: destructive toolbar overrides removed');
