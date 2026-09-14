import fs from "node:fs";

const file = "public/index.html";
let s = fs.readFileSync(file, "utf8");

const marker = '<style id="canvasflow-mobile-ai-panel-css">';
const start = s.indexOf(marker);
if (start >= 0) {
  const end = s.indexOf('</style>', start);
  if (end >= 0) {
    const old = s.slice(start, end + 8);
    const next = old
      .replace('width:min(420px,92vw) !important;height:62dvh !important;max-height:calc(100dvh - 78px) !important;min-height:320px !important;', 'width:min(430px,calc(100vw - 16px)) !important;height:min(640px,calc(100dvh - 80px)) !important;max-height:calc(100dvh - 80px) !important;min-height:360px !important;')
      .replace('width:min(560px,72vw) !important;height:72dvh !important;max-height:calc(100dvh - 24px) !important;min-height:260px !important;', 'width:min(560px,calc(100vw - 24px)) !important;height:min(520px,calc(100dvh - 24px)) !important;max-height:calc(100dvh - 24px) !important;min-height:260px !important;');
    s = s.slice(0, start) + next + s.slice(end + 8);
  }
}

fs.writeFileSync(file, s);
console.log('CanvasFlow: adjusted mobile AI chat portrait dimensions.');
