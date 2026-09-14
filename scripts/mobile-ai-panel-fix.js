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
    if(!panel)return;

    /* Do not intercept, replace, or stop the real AI toggle click. We only
       reposition the panel after the app has opened/closed it. This is
       important on touch devices in landscape mode. */
    let resizeBtn=panel.querySelector('[data-canvasflow-ai-resize]');
    if(!resizeBtn){
      resizeBtn=document.createElement('button');
      resizeBtn.type='button';
      resizeBtn.setAttribute('data-canvasflow-ai-resize','1');
      resizeBtn.setAttribute('aria-label','تغيير حجم قائمة AI');
      resizeBtn.title='تغيير حجم القائمة';
      resizeBtn.textContent='↗';
      panel.appendChild(resizeBtn);
      resizeBtn.addEventListener('click',function(e){
        e.preventDefault();e.stopPropagation();
        const sizes=['normal','large','compact'];
        const current=panel.dataset.canvasflowAiSize||'normal';
        const next=sizes[(sizes.indexOf(current)+1)%sizes.length];
        panel.dataset.canvasflowAiSize=next;
        resizeBtn.textContent=next==='compact'?'↘':next==='large'?'↙':'↗';
        requestPosition();
      });
    }

    function position(){
      if(!mobile()||!panel.classList.contains('open'))return;
      if(toggle){
        const r=toggle.getBoundingClientRect();
        panel.style.position='fixed';
        panel.style.left=Math.max(8,Math.min(r.left,window.innerWidth-panel.offsetWidth-8))+'px';
        panel.style.bottom=Math.max(8,window.innerHeight-r.top+8)+'px';
        panel.style.top='auto';
      }
      const maxH=Math.max(160,window.innerHeight-(parseFloat(panel.style.bottom)||8)-8);
      panel.style.maxHeight=Math.min(maxH,window.innerHeight-16)+'px';
      panel.style.overflowY='auto';
    }
    function requestPosition(){requestAnimationFrame(position)}

    panel.classList.add('canvasflow-mobile-ai-ready');
    requestPosition();
    if(toggle)toggle.addEventListener('click',function(){setTimeout(requestPosition,0);});
    window.addEventListener('resize',requestPosition,{passive:true});
    window.addEventListener('orientationchange',function(){setTimeout(requestPosition,80);},{passive:true});
    new MutationObserver(requestPosition).observe(panel,{attributes:true,attributeFilter:['class','style']});
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
body.canvasflow-mobile-ai [class*="ai-panel"]{
  z-index:90 !important;
}
body.canvasflow-mobile-ai #aiPanel.canvasflow-mobile-ai-ready,
body.canvasflow-mobile-ai .ai-panel.canvasflow-mobile-ai-ready,
body.canvasflow-mobile-ai [class*="ai-panel"].canvasflow-mobile-ai-ready{
  transform:none !important;
}
body.canvasflow-mobile-ai [data-canvasflow-ai-resize]{
  position:absolute !important;
  left:8px !important;
  top:8px !important;
  z-index:5 !important;
  width:30px !important;
  height:30px !important;
  min-width:30px !important;
  padding:0 !important;
  border:1px solid #dfe4ea !important;
  border-radius:7px !important;
  background:#fff !important;
  color:#39424e !important;
  box-shadow:0 3px 10px rgba(0,0,0,.10) !important;
  display:flex !important;
  align-items:center !important;
  justify-content:center !important;
  font-size:15px !important;
  cursor:pointer !important;
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
console.log('CanvasFlow: AI toggle kept native; mobile landscape positioning fixed.');
