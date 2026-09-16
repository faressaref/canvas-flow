import fs from 'node:fs';

const file = 'public/index.html';
let html = fs.readFileSync(file, 'utf8');

const legacyScriptIds = [
  'canvasflow-ai-attachment-and-board-prompt-fix',
  'canvasflow-mobile-ai-files-visible-fix',
  'canvasflow-mobile-ai-submit-final-fix',
  'canvasflow-mobile-ai-attachment-final-fix',
  'canvasflow-mobile-ai-attachment-queue-fix',
  'canvasflow-mobile-ai-direct-submit-fix'
];

for (const id of legacyScriptIds) {
  const escaped = id.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&');
  html = html.replace(new RegExp(`<script\\s+id=["']${escaped}["'][\\s\\S]*?<\\/script>\\s*`, 'gi'), '');
}

const legacyStyleIds = [
  'canvasflow-mobile-ai-chat-css',
  'canvasflow-mobile-ai-files-visible-css',
  'canvasflow-mobile-ai-submit-final-css'
];

for (const id of legacyStyleIds) {
  const escaped = id.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&');
  html = html.replace(new RegExp(`<style\\s+id=["']${escaped}["'][\\s\\S]*?<\\/style>\\s*`, 'gi'), '');
}

fs.writeFileSync(file, html, 'utf8');
console.log('CanvasFlow: removed legacy conflicting mobile AI injections.');
