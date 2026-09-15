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
const css=`<style id="canvasflow-mobile-ai-resize-css">@media screen and (max-width:760px),screen and (max-height:520px) and (max-width:900px){#aiPanel{position:fixed!important;z-index:99999!important;overflow:hidden!important}@media (orientation:landscape){#aiPanel{width:220px!important;height:140px!important;min-width:220px!important;min-height:140px!important;max-width:220px!important;max-height:140px!important}#aiPanel .ai-body{padding:4px!important;gap:3px!important}#canvasflowMobileChat{gap:3px!important}.cf-mobile-messages{min-height:35px!important;padding:4px!important;gap:3px!important}.cf-mobile-welcome,.cf-mobile-bubble{font-size:9px!important;line-height:1.3!important;padding:4px 6px!important}.cf-mobile-composer{flex-basis:30px!important;padding:2px!important}.cf-mobile-composer button{width:26px!important;height:26px!important;flex-basis:26px!important;font-size:14px!important}.cf-mobile-input{min-width:0!important}#canvasflowMobileChat #lessonInput{height:24px!important;min-height:24px!important;max-height:24px!important;padding:4px!important;font-size:10px!important}.cf-mobile-attachment{padding:3px 5px!important;font-size:8px!important}#aiPanel .ai-actions{flex-basis:25px!important;gap:3px!important}#aiPanel .ai-action{padding:4px 6px!important;font-size:8px!important;min-height:22px!important}#aiPanel .ai-action b{font-size:8px!important}#canvasflowAIResizeHandle{width:24px!important;height:24px!important;top:4px!important;left:4px!important;padding:4px!important}}
}</style>`;
const cm='<style id="canvasflow-mobile-ai-resize-css">';const c=s.indexOf(cm);if(c>=0){const d=s.indexOf('</style>',c);if(d>=0)s=s.slice(0,c)+css+s.slice(d+8);}else s=s.replace('</head>',css+'</head>');
fs.writeFileSync(file,'utf8');
console.log('CanvasFlow: compact mobile landscape AI chat installed.');
