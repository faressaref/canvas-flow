import fs from 'node:fs';

const file = 'public/index.html';
if (!fs.existsSync(file)) throw new Error(`Missing ${file}`);

let html = fs.readFileSync(file, 'utf8');
const marker = '<style id="canvasflow-mobile-landscape-reference-final">';
const start = html.indexOf(marker);
if (start === -1) {
  console.log('mobile landscape reference block not found; nothing to reorder');
  process.exit(0);
}

// Move the complete reference override to the absolute end of the document so
// it wins over every legacy style/script accidentally appended after </html>.
// This does not touch the AI implementation inside #aiPanel or its scripts.
let end = html.indexOf('</script>', start);
if (end === -1) throw new Error('Could not find end of mobile landscape reference block');
end += '</script>'.length;

const block = html.slice(start, end);
html = html.slice(0, start) + html.slice(end);
html = html.trimEnd() + '\n\n' + block + '\n';

fs.writeFileSync(file, html, 'utf8');
console.log('mobile landscape reference block moved to final document position; AI untouched');
