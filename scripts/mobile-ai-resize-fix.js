import fs from "node:fs";
const file="public/index.html";
let s=fs.readFileSync(file,"utf8");
const marker='<style id="canvasflow-mobile-ai-resize-css">';
const css=`<style id="canvasflow-mobile-ai-resize-css">
@media screen and (max-width:760px),screen and (max-height:520px) and (max-width:900px){
#aiPanel{position:fixed!important;z-index:99999!important;overflow:hidden!important}
@media (orientation:landscape){
#aiPanel{width:280px!important;height:175px!important;min-width:280px!important;min-height:175px!important;max-width:280px!important;max-height:175px!important;left:auto!important;right:12px!important;top:auto!important;bottom:12px!important;transform:none!important}
#aiPanel .ai-body{padding:5px!important;gap:4px!important}
.cf-mobile-messages{min-height:48px!important;padding:6px!important;gap:4px!important}
.cf-mobile-welcome,.cf-mobile-bubble{font-size:10px!important;line-height:1.35!important;padding:5px 7px!important}
.cf-mobile-composer{flex-basis:36px!important;padding:2px!important}
.cf-mobile-composer button{width:30px!important;height:30px!important;flex-basis:30px!important;font-size:15px!important}
#canvasflowMobileChat #lessonInput{height:28px!important;min-height:28px!important;max-height:28px!important;padding:5px 6px!important;font-size:11px!important}
.cf-mobile-attachment{padding:3px 6px!important;font-size:9px!important}
#aiPanel .ai-actions{flex-basis:28px!important;gap:4px!important}
#aiPanel .ai-action{padding:5px 7px!important;font-size:8px!important;min-height:25px!important}
#aiPanel .ai-action b{font-size:8px!important}
#canvasflowAIResizeHandle{width:22px!important;height:22px!important;top:4px!important;left:4px!important;line-height:22px!important;font-size:12px!important;padding:0!important}
#canvasflowAIResizeHandleTop{display:flex!important;position:absolute!important;top:4px!important;left:4px!important;width:22px!important;height:22px!important;z-index:100000!important;align-items:center!important;justify-content:center!important;cursor:nwse-resize!important}
}
}
</style>`;
const start=s.indexOf(marker);
if(start>=0){const end=s.indexOf('</style>',start);if(end>=0)s=s.slice(0,start)+css+s.slice(end+8);}else{s=s.replace('</head>',css+'</head>');}

// Add a second resize control at the top-left of the AI panel, replacing the old top arrow visually.
const jsMarker='</body>';
const extra=`<script id="canvasflow-ai-top-resize-control">(function(){function boot(){var p=document.getElementById('aiPanel');if(!p){setTimeout(boot,300);return}if(document.getElementById('canvasflowAIResizeHandleTop'))return;var h=document.createElement('button');h.id='canvasflowAIResizeHandleTop';h.type='button';h.title='Resize AI';h.setAttribute('aria-label','Resize AI');h.textContent='↗';h.style.cssText='display:flex;position:absolute;top:4px;left:4px;width:22px;height:22px;z-index:100000;align-items:center;justify-content:center;padding:0;border:0;background:rgba(255,255,255,.08);color:inherit;border-radius:6px;font-size:12px;cursor:nwse-resize';p.appendChild(h);var startX,startY,startW,startH,drag=false;h.addEventListener('pointerdown',function(e){e.preventDefault();e.stopPropagation();drag=true;startX=e.clientX;startY=e.clientY;startW=p.offsetWidth;startH=p.offsetHeight;h.setPointerCapture&&h.setPointerCapture(e.pointerId)});h.addEventListener('pointermove',function(e){if(!drag)return;e.preventDefault();var w=Math.max(220,Math.min(420,startW+(e.clientX-startX)));var ht=Math.max(140,Math.min(320,startH+(e.clientY-startY)));p.style.width=w+'px';p.style.height=ht+'px';p.style.minWidth=w+'px';p.style.maxWidth=w+'px';p.style.minHeight=ht+'px';p.style.maxHeight=ht+'px'});h.addEventListener('pointerup',function(){drag=false});h.addEventListener('pointercancel',function(){drag=false})}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot()})();</script>`;
if(!s.includes('id="canvasflow-ai-top-resize-control"'))s=s.replace(jsMarker,extra+jsMarker);
fs.writeFileSync(file,s,"utf8");
console.log('CanvasFlow: AI moved right and top-left resize control added.');
