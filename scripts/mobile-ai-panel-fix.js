import fs from "node:fs";

const file = "public/index.html";
let s = fs.readFileSync(file, "utf8");

const injected = `<script id="canvasflow-mobile-ai-panel-fix">(function(){
  function mobile(){
    return ('ontouchstart' in window || navigator.maxTouchPoints > 0) && Math.min(window.innerWidth,window.innerHeight) <= 900;
  }
  function boot(){
    if(!mobile()){ document.body.classList.remove('canvasflow-mobile-ai'); return; }
    document.body.classList.add('canvasflow-mobile-ai');
    const panel=document.getElementById('aiPanel') || document.querySelector('.ai-panel,[class*="ai-panel"]');
    const toggle=document.getElementById('aiToggle') || document.querySelector('[class*="ai-toggle"],[aria-label*="AI"],[title*="AI"]');
    if(!panel || panel.dataset.canvasflowMobileAiInstalled==='1')return;
    panel.dataset.canvasflowMobileAiInstalled='1';

    let resizeBtn=panel.querySelector('[data-canvasflow-ai-resize]');
    if(!resizeBtn){
      resizeBtn=document.createElement('button');
      resizeBtn.type='button';
      resizeBtn.setAttribute('data-canvasflow-ai-resize','1');
      resizeBtn.setAttribute('aria-label','الضغط المطول والسحب لتغيير حجم قائمة AI');
      resizeBtn.title='اضغط مطولاً واسحب للتحكم في الحجم';
      resizeBtn.textContent='↗';
      panel.appendChild(resizeBtn);
    }

    let pressTimer=null;
    let resizing=false;
    let pointerId=null;
    let startX=0;
    let startY=0;
    let startW=0;
    let startH=0;
    let suppressClickUntil=0;

    function stopPress(){
      if(pressTimer){clearTimeout(pressTimer);pressTimer=null;}
    }
    function startResize(e){
      if(!mobile())return;
      resizing=true;
      pointerId=e.pointerId;
      startX=e.clientX;
      startY=e.clientY;
      const r=panel.getBoundingClientRect();
      startW=r.width;
      startH=r.height;
      resizeBtn.classList.add('canvasflow-ai-resizing');
      suppressClickUntil=Date.now()+500;
      try{resizeBtn.setPointerCapture(pointerId);}catch(_){ }
      e.preventDefault();
      e.stopPropagation();
    }
    function resizeMove(e){
      if(!resizing || e.pointerId!==pointerId)return;
      const dx=e.clientX-startX;
      const dy=e.clientY-startY;
      const maxW=Math.max(260,window.innerWidth-16);
      const maxH=Math.max(180,window.innerHeight-16);
      const minW=220;
      const minH=150;
      const newW=Math.max(minW,Math.min(maxW,startW-dx));
      const newH=Math.max(minH,Math.min(maxH,startH-dy));
      panel.dataset.canvasflowAiSize='custom';
      panel.style.setProperty('width',newW+'px','important');
      panel.style.setProperty('height',newH+'px','important');
      panel.style.setProperty('max-height',maxH+'px','important');
      e.preventDefault();
      e.stopPropagation();
    }
    function endResize(e){
      if(!resizing || (e.pointerId!=null && e.pointerId!==pointerId))return;
      resizing=false;
      pointerId=null;
      stopPress();
      resizeBtn.classList.remove('canvasflow-ai-resizing');
      try{resizeBtn.releasePointerCapture(e.pointerId);}catch(_){ }
      e.preventDefault();
      e.stopPropagation();
    }

    resizeBtn.addEventListener('pointerdown',function(e){
      if(!mobile())return;
      stopPress();
      pointerId=e.pointerId;
      pressTimer=setTimeout(function(){startResize(e);},350);
      e.preventDefault();
      e.stopPropagation();
    },{passive:false});
    resizeBtn.addEventListener('pointermove',function(e){
      if(!resizing){
        if(Math.abs(e.clientX-startX)>8 || Math.abs(e.clientY-startY)>8)stopPress();
        return;
      }
      resizeMove(e);
    },{passive:false});
    resizeBtn.addEventListener('pointerup',endResize,{passive:false});
    resizeBtn.addEventListener('pointercancel',endResize,{passive:false});
    resizeBtn.addEventListener('click',function(e){
      if(Date.now()<suppressClickUntil){e.preventDefault();e.stopPropagation();}
    },true);

    function position(){
      if(!mobile())return;
      const cs=getComputedStyle(panel);
      const rect=panel.getBoundingClientRect();
      if(cs.display==='none'||cs.visibility==='hidden'||rect.width===0||rect.height===0)return;
      if(toggle){
        const r=toggle.getBoundingClientRect();
        const width=panel.offsetWidth||330;
        panel.style.setProperty('position','fixed','important');
        panel.style.setProperty('left',Math.max(8,Math.min(r.left,window.innerWidth-width-8))+'px','important');
        panel.style.setProperty('bottom',Math.max(8,window.innerHeight-r.top+8)+'px','important');
        panel.style.setProperty('top','auto','important');
      }
      panel.style.setProperty('max-height',Math.max(160,window.innerHeight-16)+'px','important');
      panel.style.setProperty('overflow-y','auto','important');
    }
    function requestPosition(){requestAnimationFrame(position)}

    panel.classList.add('canvasflow-mobile-ai-ready');
    requestPosition();
    if(toggle)toggle.addEventListener('click',function(){setTimeout(requestPosition,50);});
    window.addEventListener('resize',requestPosition,{passive:true});
    window.addEventListener('orientationchange',function(){setTimeout(requestPosition,100);},{passive:true});
  }
  boot();
  setTimeout(boot,250);
  setTimeout(boot,1000);
})();</script>`;

const marker='<script id="canvasflow-mobile-ai-panel-fix">';
const start=s.indexOf(marker);
if(start>=0){const end=s.indexOf('</script>',start);if(end>=0)s=s.slice(0,start)+injected+s.slice(end+9)}
else s=s.replace('</body>',injected+'\n</body>');

const css=`
<style id="canvasflow-mobile-ai-panel-css">
body.canvasflow-mobile-ai #aiPanel,
body.canvasflow-mobile-ai .ai-panel,
body.canvasflow-mobile-ai [class*="ai-panel"]{z-index:90 !important;}
body.canvasflow-mobile-ai #aiPanel.canvasflow-mobile-ai-ready,
body.canvasflow-mobile-ai .ai-panel.canvasflow-mobile-ai-ready,
body.canvasflow-mobile-ai [class*="ai-panel"].canvasflow-mobile-ai-ready{transform:none !important;}
body.canvasflow-mobile-ai [data-canvasflow-ai-resize]{
  position:absolute !important; left:8px !important; top:8px !important; z-index:999 !important;
  width:30px !important; height:30px !important; min-width:30px !important; padding:0 !important;
  border:1px solid #dfe4ea !important; border-radius:7px !important; background:#fff !important;
  color:#39424e !important; box-shadow:0 3px 10px rgba(0,0,0,.10) !important;
  display:flex !important; align-items:center !important; justify-content:center !important;
  font-size:15px !important; cursor:grab !important; touch-action:none !important;
  user-select:none !important; -webkit-user-select:none !important;
}
body.canvasflow-mobile-ai [data-canvasflow-ai-resize].canvasflow-ai-resizing{
  cursor:grabbing !important; transform:scale(1.06) !important;
}
body.canvasflow-mobile-ai #aiPanel[data-canvasflow-ai-size="normal"],
body.canvasflow-mobile-ai .ai-panel[data-canvasflow-ai-size="normal"]{width:min(330px,calc(100vw - 16px)) !important;}
body.canvasflow-mobile-ai #aiPanel[data-canvasflow-ai-size="large"],
body.canvasflow-mobile-ai .ai-panel[data-canvasflow-ai-size="large"]{width:min(430px,calc(100vw - 16px)) !important;}
body.canvasflow-mobile-ai #aiPanel[data-canvasflow-ai-size="compact"],
body.canvasflow-mobile-ai .ai-panel[data-canvasflow-ai-size="compact"]{width:min(270px,calc(100vw - 16px)) !important;}
@media (max-height:500px){
  body.canvasflow-mobile-ai #aiPanel,
  body.canvasflow-mobile-ai .ai-panel,
  body.canvasflow-mobile-ai [class*="ai-panel"]{max-height:calc(100dvh - 16px) !important;}
}
</style>`;
if(!s.includes('id="canvasflow-mobile-ai-panel-css"'))s=s.replace('</head>',css+'\n</head>');

fs.writeFileSync(file,s,'utf8');
console.log('CanvasFlow: mobile AI resize handle now uses long-press + drag.');
