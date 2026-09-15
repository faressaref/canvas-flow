import fs from "node:fs";
const file="public/index.html";
let s=fs.readFileSync(file,"utf8");
const js=`<script id="canvasflow-mobile-ai-resize-fix">(function(){
function boot(){
 const p=document.getElementById('aiPanel'); if(!p||p.dataset.cfResizeFix)return; p.dataset.cfResizeFix='1';
 const old=document.getElementById('canvasflowAIResizeHandle'); if(old)old.remove();
 const h=document.createElement('button'); h.id='canvasflowAIResizeHandle'; h.type='button'; h.setAttribute('aria-label','تغيير حجم الشات'); h.innerHTML='<i></i><i></i><i></i>'; p.appendChild(h);
 let drag=false,sx=0,sy=0,sw=0,sh=0;
 function down(e){if(!matchMedia('(max-width:760px), (max-height:520px) and (max-width:900px)').matches)return;e.preventDefault();e.stopPropagation();const t=e.touches?e.touches[0]:e;sx=t.clientX;sy=t.clientY;sw=p.getBoundingClientRect().width;sh=p.getBoundingClientRect().height;drag=true;}
 function move(e){if(!drag)return;e.preventDefault();const t=e.touches?e.touches[0]:e;const w=Math.max(220,Math.min(innerWidth-12,sw-(t.clientX-sx)));const ht=Math.max(140,Math.min(innerHeight-16,sh-(t.clientY-sy)));p.style.width=w+'px';p.style.height=ht+'px';}
 function up(){drag=false;}
 h.addEventListener('pointerdown',down);window.addEventListener('pointermove',move,{passive:false});window.addEventListener('pointerup',up);h.addEventListener('touchstart',down,{passive:false});window.addEventListener('touchmove',move,{passive:false});window.addEventListener('touchend',up);
}
boot();[200,600,1200,2500].forEach(t=>setTimeout(boot,t));
new MutationObserver(boot).observe(document.documentElement,{childList:true,subtree:true});
})();</script>`;
const m='<script id="canvasflow-mobile-ai-resize-fix">';const a=s.indexOf(m);if(a>=0){const b=s.indexOf('</script>',a);if(b>=0)s=s.slice(0,a)+js+s.slice(b+9);}else s=s.replace('</body>',js+'</body>');
const css=`<style id="canvasflow-mobile-ai-resize-css">@media screen and (max-width:760px),screen and (max-height:520px) and (max-width:900px){#aiPanel{position:fixed!important;z-index:99999!important;overflow:hidden!important}#canvasflowAIResizeHandle{position:absolute!important;left:6px!important;top:6px!important;width:27px!important;height:27px!important;padding:5px!important;border:0!important;border-radius:7px!important;background:#18202a!important;display:flex!important;flex-direction:column!important;gap:3px!important;align-items:flex-start!important;justify-content:center!important;z-index:100001!important;cursor:nwse-resize!important;touch-action:none!important}#canvasflowAIResizeHandle i{display:block!important;width:14px!important;height:2px!important;background:#fff!important;border-radius:2px!important;transform:rotate(-45deg)!important;transform-origin:left center!important}#canvasflowAIResizeHandle i:nth-child(2){width:10px!important}#canvasflowAIResizeHandle i:nth-child(3){width:6px!important}@media (orientation:landscape){#aiPanel{width:min(300px,62vw)!important;height:min(180px,52vh)!important;min-width:220px!important;min-height:140px!important;max-width:calc(100vw - 12px)!important;max-height:calc(100vh - 16px)!important}#canvasflowAIResizeHandle{width:24px!important;height:24px!important;top:4px!important;left:4px!important;padding:4px!important}}}</style>`;
const cm='<style id="canvasflow-mobile-ai-resize-css">';const c=s.indexOf(cm);if(c>=0){const d=s.indexOf('</style>',c);if(d>=0)s=s.slice(0,c)+css+s.slice(d+8);}else s=s.replace('</head>',css+'</head>');
fs.writeFileSync(file,s,'utf8');
console.log('CanvasFlow: mobile AI resize control fixed.');
