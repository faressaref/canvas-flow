import fs from "node:fs";

const file = "public/index.html";
let s = fs.readFileSync(file, "utf8");

const marker = '<style id="canvasflow-landing-color-shortcut-fix">';
const css = `<style id="canvasflow-landing-color-shortcut-fix">
/* Hide the color shortcut ONLY while the landing page is visible. */
body.canvasflow-landing-active #tabletQuickColors,
body.canvasflow-landing-active #mobileV2Bar .mobile-v2-color,
body.canvasflow-landing-active #color,
body.canvasflow-landing-active #tabletColor {
  display:none !important;
  visibility:hidden !important;
  pointer-events:none !important;
}
</style>`;

if (s.includes(marker)) {
  const start = s.indexOf(marker);
  const end = s.indexOf('</style>', start);
  if (end >= 0) s = s.slice(0, start) + css + s.slice(end + 8);
} else {
  s = s.replace('</head>', css + '</head>');
}

const runtimeMarker = '<script id="canvasflow-landing-color-shortcut-runtime">';
const runtime = `<script id="canvasflow-landing-color-shortcut-runtime">(function(){
  function sync(){
    var landing=document.getElementById('landing');
    var active=!!landing && getComputedStyle(landing).display!=='none' && landing.getAttribute('aria-hidden')!=='true';
    document.body.classList.toggle('canvasflow-landing-active',active);
  }
  function boot(){
    sync();
    var landing=document.getElementById('landing');
    if(landing){new MutationObserver(sync).observe(landing,{attributes:true,attributeFilter:['style','class','aria-hidden']});}
    new MutationObserver(sync).observe(document.body,{childList:true,subtree:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();</script>`;

if (!s.includes(runtimeMarker)) s = s.replace('</head>', runtime + '</head>');

fs.writeFileSync(file, s, "utf8");
console.log("CanvasFlow: landing color shortcut hidden; board controls preserved.");
