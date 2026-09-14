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
    handle.addEventListener('pointerdown',function(e){
      clearTimer(); pointerId=e.pointerId; startX=e.clientX; startY=e.clientY;
      timer=setTimeout(function(){
        resizing=true;
        const r=panel.getBoundingClientRect(); startW=r.width; startH=r.height;
        handle.classList.add('active');
        try{handle.setPointerCapture(pointerId);}catch(_){ }
      },450);
      e.preventDefault();e.stopPropagation();
    },{passive:false});
    handle.addEventListener('pointermove',function(e){
      if(!resizing){if(Math.hypot(e.clientX-startX,e.clientY-startY)>16)clearTimer();return;}
      if(e.pointerId!==pointerId)return;
      const dx=e.clientX-startX,dy=e.clientY-startY;
      const minW=270,minH=190,maxW=Math.max(minW,window.innerWidth-16),maxH=Math.max(minH,window.innerHeight-16);
      const w=Math.max(minW,Math.min(maxW,startW-dx));
      const h=Math.max(minH,Math.min(maxH,startH-dy));
      panel.style.setProperty('width',w+'px','important');
      panel.style.setProperty('height',h+'px','important');
      panel.style.setProperty('max-height',maxH+'px','important');
      panel.dataset.canvasflowAiSize='custom';
      e.preventDefault();e.stopPropagation();
    },{passive:false});
    function end(e){clearTimer();if(resizing && e.pointerId===pointerId){resizing=false;handle.classList.remove('active');try{handle.releasePointerCapture(e.pointerId);}catch(_){ }}pointerId=null;}
    handle.addEventListener('pointerup',end,{passive:false});
    handle.addEventListener('pointercancel',end,{passive:false});

    function setupChat(){
      const body=panel.querySelector('.ai-body');
      const input=document.getElementById('lessonInput');
      const result=document.getElementById('aiResult');
      const actions=panel.querySelector('.ai-actions');
      const upload=document.getElementById('lessonImages');
      if(!body || !input || !result || body.dataset.canvasflowChatReady==='1')return;
      body.dataset.canvasflowChatReady='1';

      const oldLabel=body.querySelector('.ai-label');
      if(oldLabel)oldLabel.style.display='none';
      const oldDrop=document.getElementById('lessonDrop');
      if(oldDrop)oldDrop.style.display='none';
      if(upload){upload.setAttribute('multiple','');upload.setAttribute('accept','image/*,.pdf,.doc,.docx,.ppt,.pptx,.txt');}

      const chat=document.createElement('div');
      chat.className='canvasflow-mobile-chat';
      chat.innerHTML='<div class="canvasflow-chat-messages"></div><div class="canvasflow-chat-quick"></div><div class="canvasflow-chat-composer"><button type="button" class="canvasflow-chat-pin" aria-label="إرفاق صورة أو ملف" title="إرفاق صورة أو ملف">📎</button><textarea class="canvasflow-chat-text" rows="1" placeholder="اكتب رسالتك..."></textarea><button type="button" class="canvasflow-chat-send" aria-label="إرسال">➤</button></div>';
      const messages=chat.querySelector('.canvasflow-chat-messages');
      const quick=chat.querySelector('.canvasflow-chat-quick');
      const text=chat.querySelector('.canvasflow-chat-text');
      const pin=chat.querySelector('.canvasflow-chat-pin');
      const send=chat.querySelector('.canvasflow-chat-send');

      if(actions){
        const modes=['summary','explain','important','quiz','flashcards','recall','mindmap','studyplan'];
        modes.forEach(mode=>{const b=actions.querySelector('[data-ai="'+mode+'"]');if(b){const q=b.cloneNode(true);q.classList.add('canvasflow-mobile-quick');quick.appendChild(q);}});
        actions.style.display='none';
      }

      if(upload)pin.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();upload.click();});
      send.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();submit();});
      text.addEventListener('keydown',function(e){if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();submit();}});
      text.addEventListener('input',function(){text.style.height='auto';text.style.height=Math.min(text.scrollHeight,92)+'px';});

      function submit(){
        const value=text.value.trim();
        if(!value && !(upload&&upload.files&&upload.files.length))return;
        if(value){
          const bubble=document.createElement('div');bubble.className='canvasflow-user-bubble';bubble.textContent=value;messages.appendChild(bubble);
        }
        input.value=value;
        text.value='';text.style.height='auto';
        const explain=actions&&actions.querySelector('[data-ai="explain"]');
        const summary=actions&&actions.querySelector('[data-ai="summary"]');
        const target=explain||summary;
        if(target)target.click();
        messages.scrollTop=messages.scrollHeight;
      }

      if(upload)upload.addEventListener('change',function(){
        if(!upload.files.length)return;
        const bubble=document.createElement('div');bubble.className='canvasflow-file-bubble';bubble.textContent='📎 '+Array.from(upload.files).map(f=>f.name).join('، ');messages.appendChild(bubble);messages.scrollTop=messages.scrollHeight;
      });
      messages.innerHTML='<div class="canvasflow-ai-welcome">أهلاً 👋<br><span>ابعتلي سؤالك أو ارفع صورة / ملف وابدأ.</span></div>';
      body.innerHTML='';body.appendChild(chat);
    }
    setupChat();

    function position(){
      if(!mobile())return;
      const r=panel.getBoundingClientRect();
      if(r.width===0||r.height===0)return;
      panel.style.setProperty('position','fixed','important');
      if(toggle){
        const t=toggle.getBoundingClientRect(),width=panel.offsetWidth||Math.min(420,window.innerWidth-16);
        panel.style.setProperty('left',Math.max(8,Math.min(t.left,window.innerWidth-width-8))+'px','important');
        panel.style.setProperty('bottom',Math.max(8,window.innerHeight-t.top+8)+'px','important');
        panel.style.setProperty('top','auto','important');
      }
      panel.style.setProperty('overflow','hidden','important');
    }
    panel.classList.add('canvasflow-mobile-ai-ready');
    requestAnimationFrame(position);
    if(toggle)toggle.addEventListener('click',function(){setTimeout(position,80);});
    window.addEventListener('resize',position,{passive:true});
    window.addEventListener('orientationchange',function(){setTimeout(position,150);},{passive:true});
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
body.canvasflow-mobile-ai #aiPanel,body.canvasflow-mobile-ai .ai-panel,body.canvasflow-mobile-ai [class*="ai-panel"]{width:min(420px,92vw) !important;height:62dvh !important;max-height:calc(100dvh - 78px) !important;min-height:320px !important;overflow:hidden !important;border-radius:16px !important;}
body.canvasflow-mobile-ai #aiPanel .ai-head{flex:0 0 auto !important;}
body.canvasflow-mobile-ai #aiPanel .ai-body{display:flex !important;flex-direction:column !important;min-height:0 !important;height:calc(100% - 55px) !important;overflow:hidden !important;padding:8px !important;}
body.canvasflow-mobile-ai #aiPanel .canvasflow-mobile-chat{display:flex !important;flex-direction:column !important;min-height:0 !important;height:100% !important;gap:7px !important;direction:rtl !important;}
body.canvasflow-mobile-ai #aiPanel .canvasflow-chat-messages{flex:1 1 auto !important;min-height:0 !important;overflow-y:auto !important;padding:10px !important;border:1px solid #e1e5eb !important;border-radius:14px !important;background:#f7f8fa !important;font-size:12px !important;line-height:1.65 !important;direction:rtl !important;}
body.canvasflow-mobile-ai #aiPanel .canvasflow-ai-welcome{color:#697383 !important;text-align:center !important;margin-top:20px !important;line-height:1.8 !important;}
body.canvasflow-mobile-ai #aiPanel .canvasflow-ai-welcome span{font-size:10px !important;color:#89919d !important;}
body.canvasflow-mobile-ai #aiPanel .canvasflow-user-bubble{display:block !important;width:fit-content !important;max-width:88% !important;margin:3px 0 3px auto !important;padding:8px 11px !important;border-radius:14px 14px 4px 14px !important;background:#18202a !important;color:#fff !important;white-space:pre-wrap !important;}
body.canvasflow-mobile-ai #aiPanel .canvasflow-file-bubble{display:block !important;width:fit-content !important;max-width:90% !important;margin:3px 0 3px auto !important;padding:7px 10px !important;border-radius:12px !important;background:#e9edf3 !important;color:#39424e !important;font-size:10px !important;}
body.canvasflow-mobile-ai #aiPanel .canvasflow-chat-quick{display:flex !important;flex:0 0 auto !important;gap:5px !important;overflow-x:auto !important;direction:rtl !important;padding:1px 0 2px !important;scrollbar-width:none !important;}
body.canvasflow-mobile-ai #aiPanel .canvasflow-chat-quick::-webkit-scrollbar{display:none !important;}
body.canvasflow-mobile-ai #aiPanel .canvasflow-chat-quick .ai-action{display:inline-flex !important;flex:0 0 auto !important;width:auto !important;min-width:auto !important;padding:7px 10px !important;border-radius:18px !important;font-size:9px !important;white-space:nowrap !important;background:#fff !important;}
body.canvasflow-mobile-ai #aiPanel .canvasflow-chat-quick .ai-action b{display:inline !important;font-size:9px !important;margin:0 !important;}
body.canvasflow-mobile-ai #aiPanel .canvasflow-chat-quick .ai-action span{display:none !important;}
body.canvasflow-mobile-ai #aiPanel .canvasflow-chat-composer{display:flex !important;align-items:flex-end !important;direction:ltr !important;flex:0 0 auto !important;min-height:46px !important;max-height:104px !important;gap:5px !important;padding:5px !important;background:#fff !important;border:1px solid #dfe4ea !important;border-radius:16px !important;box-shadow:0 2px 8px rgba(0,0,0,.04) !important;}
body.canvasflow-mobile-ai #aiPanel .canvasflow-chat-text{flex:1 1 auto !important;min-width:0 !important;width:auto !important;height:34px !important;min-height:34px !important;max-height:92px !important;resize:none !important;border:0 !important;outline:0 !important;background:transparent !important;padding:8px 6px !important;font:12px/18px inherit !important;color:#18202a !important;direction:rtl !important;}
body.canvasflow-mobile-ai #aiPanel .canvasflow-chat-pin,body.canvasflow-mobile-ai #aiPanel .canvasflow-chat-send{flex:0 0 34px !important;width:34px !important;height:34px !important;border:0 !important;border-radius:10px !important;display:flex !important;align-items:center !important;justify-content:center !important;padding:0 !important;cursor:pointer !important;}
body.canvasflow-mobile-ai #aiPanel .canvasflow-chat-pin{background:#eef1f5 !important;color:#39424e !important;font-size:17px !important;}
body.canvasflow-mobile-ai #aiPanel .canvasflow-chat-send{background:#18202a !important;color:#fff !important;font-size:16px !important;}
body.canvasflow-mobile-ai [data-canvasflow-ai-resize]{position:absolute !important;left:5px !important;top:5px !important;right:auto !important;bottom:auto !important;width:32px !important;height:32px !important;z-index:999999 !important;display:flex !important;align-items:flex-start !important;justify-content:flex-start !important;cursor:nwse-resize !important;touch-action:none !important;user-select:none !important;background:transparent !important;border:0 !important;padding:0 !important;}
body.canvasflow-mobile-ai [data-canvasflow-ai-resize] span{display:block !important;width:22px !important;height:22px !important;border-left:3px solid #697383 !important;border-top:3px solid #697383 !important;border-radius:4px 0 0 0 !important;opacity:.75 !important;}
body.canvasflow-mobile-ai [data-canvasflow-ai-resize].active span{opacity:1 !important;transform:scale(1.12) !important;}
@media (orientation:landscape) and (max-width:900px){body.canvasflow-mobile-ai #aiPanel,body.canvasflow-mobile-ai .ai-panel,body.canvasflow-mobile-ai [class*="ai-panel"]{width:min(560px,72vw) !important;height:72dvh !important;max-height:calc(100dvh - 24px) !important;min-height:260px !important;}body.canvasflow-mobile-ai #aiPanel .ai-body{height:calc(100% - 48px) !important;}}
</style>`;

const cssMarker='<style id="canvasflow-mobile-ai-panel-css">';
const cssStart=s.indexOf(cssMarker);
if(cssStart>=0){const cssEnd=s.indexOf('</style>',cssStart);if(cssEnd>=0)s=s.slice(0,cssStart)+css+s.slice(cssEnd+8);}else{s=s.replace('</head>',css+'\n</head>');}

fs.writeFileSync(file,s);
console.log('CanvasFlow: fixed mobile AI chat proportions and added attachment pin.');
