import fs from "node:fs";

const file = "public/index.html";
let s = fs.readFileSync(file, "utf8");

const injected = `<script id="canvasflow-mobile-ai-panel-fix">(function(){
  function mobile(){
    return ('ontouchstart' in window || navigator.maxTouchPoints > 0) && Math.min(window.innerWidth,window.innerHeight) <= 900;
  }
  function boot(){
    if(!mobile()){document.body.classList.remove('canvasflow-mobile-ai');return;}
    document.body.classList.add('canvasflow-mobile-ai');
    const panel=document.getElementById('aiPanel') || document.querySelector('.ai-panel,[class*="ai-panel"]');
    const toggle=document.getElementById('aiToggle') || document.querySelector('[class*="ai-toggle"],[aria-label*="AI"],[title*="AI"]');
    if(!panel || panel.dataset.canvasflowMobileAiInstalled==='1')return;
    panel.dataset.canvasflowMobileAiInstalled='1';

    // Remove the old top-left button from previous mobile fixes.
    panel.querySelectorAll('[data-canvasflow-ai-resize]').forEach(function(el){el.remove();});

    const handle=document.createElement('div');
    handle.setAttribute('data-canvasflow-ai-corner-resize','1');
    handle.setAttribute('aria-label','اضغط مطولاً واسحب لتغيير حجم قائمة AI');
    handle.title='اضغط مطولاً واسحب';
    handle.innerHTML='<span></span>';
    panel.appendChild(handle);

    let timer=null, resizing=false, pointerId=null, startX=0, startY=0, startW=0, startH=0;
    function clearTimer(){if(timer){clearTimeout(timer);timer=null;}}
    function begin(e){
      if(!mobile())return;
      resizing=true; pointerId=e.pointerId; startX=e.clientX; startY=e.clientY;
      const r=panel.getBoundingClientRect(); startW=r.width; startH=r.height;
      handle.classList.add('active');
      try{handle.setPointerCapture(pointerId);}catch(_){ }
      e.preventDefault();e.stopPropagation();
    }
    handle.addEventListener('pointerdown',function(e){
      clearTimer(); pointerId=e.pointerId; startX=e.clientX; startY=e.clientY;
      timer=setTimeout(function(){begin(e);},450);
      e.preventDefault();e.stopPropagation();
    },{passive:false});
    handle.addEventListener('pointermove',function(e){
      if(!resizing){if(Math.hypot(e.clientX-startX,e.clientY-startY)>10)clearTimer();return;}
      if(e.pointerId!==pointerId)return;
      const dx=e.clientX-startX,dy=e.clientY-startY;
      const minW=220,minH=150,maxW=Math.max(minW,window.innerWidth-16),maxH=Math.max(minH,window.innerHeight-16);
      // Bottom-right handle: dragging right/down grows the panel, left/up shrinks it.
      const w=Math.max(minW,Math.min(maxW,startW+dx));
      const h=Math.max(minH,Math.min(maxH,startH+dy));
      panel.style.setProperty('width',w+'px','important');
      panel.style.setProperty('height',h+'px','important');
      panel.style.setProperty('max-height',maxH+'px','important');
      panel.dataset.canvasflowAiSize='custom';
      e.preventDefault();e.stopPropagation();
    },{passive:false});
    function end(e){
      clearTimer();
      if(resizing && (e.pointerId==null || e.pointerId===pointerId)){
        resizing=false;handle.classList.remove('active');
        try{handle.releasePointerCapture(e.pointerId);}catch(_){ }
      }
      pointerId=null;e.preventDefault();e.stopPropagation();
    }
    handle.addEventListener('pointerup',end,{passive:false});
    handle.addEventListener('pointercancel',end,{passive:false});

    function position(){
      if(!mobile())return;
      const cs=getComputedStyle(panel),rect=panel.getBoundingClientRect();
      if(cs.display==='none'||cs.visibility==='hidden'||rect.width===0||rect.height===0)return;
      if(toggle){
        const r=toggle.getBoundingClientRect(),width=panel.offsetWidth||330;
        panel.style.setProperty('position','fixed','important');
        panel.style.setProperty('left',Math.max(8,Math.min(r.left,window.innerWidth-width-8))+'px','important');
        panel.style.setProperty('bottom',Math.max(8,window.innerHeight-r.top+8)+'px','important');
        panel.style.setProperty('top','auto','important');
      }
      panel.style.setProperty('max-height',Math.max(160,window.innerHeight-16)+'px','important');
      panel.style.setProperty('overflow-y','auto','important');
    }
    panel.classList.add('canvasflow-mobile-ai-ready');
    requestAnimationFrame(position);
    if(toggle)toggle.addEventListener('click',function(){setTimeout(position,80);});
    window.addEventListener('resize',position,{passive:true});
    window.addEventListener('orientationchange',function(){setTimeout(position,120);},{passive:true});
  }
  boot();setTimeout(boot,250);setTimeout(boot,1000);
})();</script>`;

const marker='<script id="canvasflow-mobile-ai-panel-fix">';
const start=s.indexOf(marker);
if(start>=0){const end=s.indexOf('</script>',start);if(end>=0)s=s.slice(0,start)+injected+s.slice(end+9);}
else s=s.replace('</body>',injected+'\n</body>');

const css=`
<style id="canvasflow-mobile-ai-panel-css">
body.canvasflow-mobile-ai #aiPanel,body.canvasflow-mobile-ai .ai-panel,body.canvasflow-mobile-ai [class*="ai-panel"]{z-index:90 !important;}
body.canvasflow-mobile-ai #aiPanel.canvasflow-mobile-ai-ready,body.canvasflow-mobile-ai .ai-panel.canvasflow-mobile-ai-ready,body.canvasflow-mobile-ai [class*="ai-panel"].canvasflow-mobile-ai-ready{transform:none !important;}
body.canvasflow-mobile-ai [data-canvasflow-ai-corner-resize]{
 position:absolute !important;right:5px !important;bottom:5px !important;left:auto !important;top:auto !important;
 width:30px !important;height:30px !important;z-index:9999 !important;display:flex !important;
 align-items:flex-end !important;justify-content:flex-end !important;cursor:se-resize !important;
 touch-action:none !important;user-select:none !important;-webkit-user-select:none !important;
 background:transparent !important;border:0 !important;padding:0 !important;
}
body.canvasflow-mobile-ai [data-canvasflow-ai-corner-resize] span{
 display:block !important;width:22px !important;height:22px !important;
 border-right:3px solid #697383 !important;border-bottom:3px solid #697383 !important;
 border-radius:0 0 4px 0 !important;opacity:.75 !important;
}
body.canvasflow-mobile-ai [data-canvasflow-ai-corner-resize].active span{opacity:1 !important;transform:scale(1.12) !important;}
@media (max-height:500px){body.canvasflow-mobile-ai #aiPanel,body.canvasflow-mobile-ai .ai-panel,body.canvasflow-mobile-ai [class*="ai-panel"]{max-height:calc(100dvh - 16px) !important;}}
</style>`;
if(!s.includes('id="canvasflow-mobile-ai-panel-css"'))s=s.replace('</head>',css+'\n</head>');

fs.writeFileSync(file,s,'utf8');
console.log('CanvasFlow: mobile AI panel now uses bottom-right long-press resize handle.');
