import fs from 'node:fs';

const file = 'public/index.html';
if (!fs.existsSync(file)) throw new Error(`Missing ${file}`);

let html = fs.readFileSync(file, 'utf8');

// Remove the legacy landscape runtime/rebuild block if an older source still has it.
const start = html.indexOf('// MOBILE LANDSCAPE TOOLBAR — keep every tool visible side-by-side and working.');
const end = html.indexOf('// ================= MOBILE UX =================', start);
if (start !== -1 && end !== -1) {
  html = html.slice(0, start) + html.slice(end);
}

// Do not add another toolbar, another menu, or another CSS override.
// The existing #mobileV2Bar is the single source of truth.
fs.writeFileSync(file, html, 'utf8');
console.log('mobile landscape order: preserved original Elements toolbar');
