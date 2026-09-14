import fs from "node:fs";

const file = "public/index.html";
let s = fs.readFileSync(file, "utf8");

const injected = `<script id="canvasflow-mobile-ai-panel-fix">(function(){
  function mobile(){return ('ontouchstart' in window || navigator.maxTouchPoints>0) && Math.min(window.innerWidth,window.innerHeight)<=900;}
  function boot(){
    if(!mobile()){document.body.classList.remove('canvasflow-mobile-ai');return;}
    document.body.classList.add('canvasflow-mobile-ai');
    const panel=document.getElementById('aiPanel') || document.querySelector('.ai-panel,[class*="ai-panel"]');
    const toggle=document.getElementById('aiToggle') || document.querySelector('[class*="ai-toggle"],[aria-label*="AI"],[title*="AI"]');
    if(!panel || panel.dataset.canvasflowMobileAiInstalled==='1')return;
    panel.dataset.canvasflowMobileAiInstalled='1';

    panel.querySelectorAll('[data-canvasflow-ai-resize],[data-canvasflow-ai-corner-resize]').forEach(el=>el.remove());
    const handle=document.createElement('div');
    handle.setAttribute('data-canvasflow-ai-resize','1');
    handle.setAttribute('aria-label','اضغط مطولاً واسحب لتغيير حجم قائمة AI');
    handle.title='اضغط مطولاً واسحب لتغيير الحجم';
    handle.innerHTML='<span></span>';
    panel.appendChild(handle);

    let timer=null,resizing=false,pointerId=null,startX=0,startY=0,startW=0,startH=0;
    function clearTimer(){if(timer){clearTimeout(timer);timer=null;}}
    function begin(e){
      if(!mobile())return;
      resizing=true;pointerId=e.pointerId;startX=e.clientX;startY=e.clientY;
      const r=panel.getBoundingClientRect();startW=r.width;startH=r.height;
      handle.classList.add('active');
      try{handle.setPointerCapture(pointerId);}catch(_){ }
      e.preventDefault();e.stopPropagation();
    }
    handle.addEventListener('pointerdown',function(e){
      clearTimer();pointerId=e.pointerId;startX=e.clientX;startY=e.clientY;
      timer=setTimeout(function(){begin(e);},450);
      e.preventDefault();e.stopPropagation();
    },{passive:false});
    handle.addEventListener('pointermove',function(e){
      if(!resizing){if(Math.hypot(e.clientX-startX,e.clientY-startY)>14)clearTimer();return;}
      if(e.pointerId!==pointerId)return;
      const dx=e.clientX-startX,dy=e.clientY-startY;
      const minW=220,minH=150,maxW=Math.max(minW,window.innerWidth-16),maxH=Math.max(minH,window.innerHeight-16);
      const w=Math.max(minW,Math.min(maxW,startW-dx));
      const h=Math.max(minH,Math.min(maxH,startH-dy));
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
body.canvasflow-mobile-ai #aiPanel,body.canvasflow-mobile-ai .ai-panel,body.canvasflow-mobile-ai [class*="ai-panel"]{z-index:99999 !important;}
body.canvasflow-mobile-ai #aiPanel.canvasflow-mobile-ai-ready,body.canvasflow-mobile-ai .ai-panel.canvasflow-mobile-ai-ready,body.canvasflow-mobile-ai [class*="ai-panel"].canvasflow-mobile-ai-ready{transform:none !important;}
/* Mobile only: keep the AI window compact so the controls underneath stay visible. */
body.canvasflow-mobile-ai #aiPanel,body.canvasflow-mobile-ai .ai-panel,body.canvasflow-mobile-ai [class*="ai-panel"]{
 height:35dvh !important;max-height:35dvh !important;overflow-y:auto !important;
}
body.canvasflow-mobile-ai [data-canvasflow-ai-resize]{
 position:absolute !important;left:5px !important;top:5px !important;right:auto !important;bottom:auto !important;
 width:32px !important;height:32px !important;z-index:999999 !important;display:flex !important;
 align-items:flex-start !important;justify-content:flex-start !important;cursor:nwse-resize !important;
 touch-action:none !important;user-select:none !important;-webkit-user-select:none !important;
 background:transparent !important;border:0 !important;padding:0 !important;
}
body.canvasflow-mobile-ai [data-canvasflow-ai-resize] span{
 display:block !important;width:22px !important;height:22px !important;
 border-left:3px solid #697383 !important;border-top:3px solid #697383 !important;
 border-radius:4px 0 0 0 !important;opacity:.75 !important;
}
body.canvasflow-mobile-ai [data-canvasflow-ai-resize].active span{opacity:1 !important;transform:scale(1.12) !important;}
@media (orientation:landscape) and (max-width:900px){
 body.canvasflow-mobile-ai #aiPanel,body.canvasflow-mobile-ai .ai-panel,body.canvasflow-mobile-ai [class*="ai-panel"]{
  height:30dvh !important;max-height:30dvh !important;
 }
}
</style>`;

const cssMarker='<style id="canvasflow-mobile-ai-panel-css">';
const cssStart=s.indexOf(cssMarker);
if(cssStart>=0){
  const cssEnd=s.indexOf('</style>',cssStart);
  if(cssEnd>=0)s=s.slice(0,cssStart)+css+s.slice(cssEnd+8);
}else{
  s=s.replace('</head>',css+'\n</head>');
}

fs.writeFileSync(file,s);
console.log('CanvasFlow: reduced mobile AI panel height.');
