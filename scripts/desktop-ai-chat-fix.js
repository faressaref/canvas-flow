import fs from "node:fs";

const file = "public/index.html";
let s = fs.readFileSync(file, "utf8");

const js = `<script id="canvasflow-desktop-ai-chat-fix">(function(){
  const isDesktop=()=>window.matchMedia('(min-width:1000px)').matches && !document.body.classList.contains('tablet-mode');
  let ready=false;
  function setup(){
    if(!isDesktop() || ready) return;
    const panel=document.getElementById('aiPanel');
    const body=panel?.querySelector('.ai-body');
    const input=document.getElementById('lessonInput');
    const images=document.getElementById('lessonImages');
    const drop=document.getElementById('lessonDrop');
    const actions=panel?.querySelector('.ai-actions');
    const result=document.getElementById('aiResult');
    if(!panel||!body||!input||!actions||!result) return;

    const chat=document.createElement('div');
    chat.id='canvasflowDesktopChat';
    chat.innerHTML='<div class="cf-desktop-messages" aria-live="polite"><div class="cf-desktop-welcome">أهلاً 👋<br>أنا CanvasFlow AI Study Tutor.<br>ابعت سؤالك أو ارفع صور الدرس، واختار نوع المساعدة.</div></div>' +
      '<div class="cf-desktop-composer"><button type="button" class="cf-desktop-attach" title="رفع صور">📎</button><div class="cf-desktop-input"></div><button type="button" class="cf-desktop-send" title="إرسال">➤</button></div>';

    const messages=chat.querySelector('.cf-desktop-messages');
    const composer=chat.querySelector('.cf-desktop-composer');
    composer.querySelector('.cf-desktop-input').appendChild(input);
    body.innerHTML='';
    body.appendChild(chat);
    body.appendChild(actions);
    body.appendChild(document.getElementById('lessonPreviews'));
    body.appendChild(document.getElementById('aiStatus'));
    if(drop) drop.style.display='none';
    const settings=panel.querySelector('.ai-settings');
    if(settings) settings.style.display='none';

    function addBubble(text,type){
      const b=document.createElement('div');
      b.className='cf-desktop-bubble '+type;
      b.textContent=String(text||'').trim();
      if(b.textContent) messages.appendChild(b);
      messages.scrollTop=messages.scrollHeight;
    }

    const send=()=>{
      const value=input.value.trim();
      if(!value && !(window.lessonImageFiles||[]).length){
        addBubble('اكتب سؤالك أو ارفع صورة الأول 📷','ai');
        return;
      }
      addBubble(value || '📷 صور مرفقة','user');
      const modeBtn=actions.querySelector('[data-ai="explain"]');
      if(modeBtn) modeBtn.click();
    };
    composer.querySelector('.cf-desktop-attach').onclick=e=>{e.preventDefault();images?.click();};
    composer.querySelector('.cf-desktop-send').onclick=e=>{e.preventDefault();send();};
    input.addEventListener('keydown',e=>{
      if(e.key==='Enter' && !e.shiftKey){e.preventDefault();send();}
    });

    const originalRunAI=window.runAI;
    if(typeof originalRunAI==='function'){
      window.runAI=async function(mode){
        const before=messages.querySelectorAll('.cf-desktop-bubble.ai').length;
        await originalRunAI(mode);
        const text=(result.textContent||'').trim();
        if(text && text!=='ابدأ المحادثة 👋\\nابعتلي الدرس أو ارفع صوره، واختار اللي عايزه من الأزرار فوق.' && text!=='جاري قراءة صفحات الدرس وتجهيز النتيجة...'){
          addBubble(text,'ai');
          result.textContent='';
        }
      };
    }

    actions.querySelectorAll('[data-ai]').forEach(btn=>{
      btn.addEventListener('click',()=>{
        const label=btn.querySelector('b')?.textContent || btn.textContent || '';
        const current=input.value.trim();
        if(current && !btn.dataset.cfSent){
          addBubble(current,'user');
          btn.dataset.cfSent='1';
          setTimeout(()=>delete btn.dataset.cfSent,300);
        }
      });
    });
    ready=true;
  }
  setup();
  setTimeout(setup,300);setTimeout(setup,1000);setTimeout(setup,2000);
  window.addEventListener('resize',()=>{if(!ready) setup();},{passive:true});
})();</script>`;

const marker='<script id="canvasflow-desktop-ai-chat-fix">';
const start=s.indexOf(marker);
if(start>=0){const end=s.indexOf('</script>',start);if(end>=0)s=s.slice(0,start)+js+s.slice(end+9);}
else s=s.replace('</body>',js+'\n</body>');

const css=`<style id="canvasflow-desktop-ai-chat-css">
@media screen and (min-width:1000px){
  body:not(.tablet-mode) #aiPanel{width:min(430px,calc(100vw - 110px))!important;height:min(680px,calc(100vh - 84px))!important;min-height:420px!important;}
  body:not(.tablet-mode) #aiPanel .ai-body{display:flex!important;flex-direction:column!important;gap:8px!important;min-height:0!important;padding:9px!important;overflow:hidden!important;}
  body:not(.tablet-mode) #aiPanel .ai-label,
  body:not(.tablet-mode) #aiPanel #lessonDrop,
  body:not(.tablet-mode) #aiPanel .ai-settings{display:none!important;}
  body:not(.tablet-mode) #canvasflowDesktopChat{display:flex!important;flex-direction:column!important;flex:1 1 auto!important;min-height:0!important;overflow:hidden!important;gap:8px!important;}
  body:not(.tablet-mode) .cf-desktop-messages{flex:1 1 auto;min-height:0;overflow:auto;background:#fafbfc;border:1px solid #e6e9ee;border-radius:13px;padding:10px;display:flex;flex-direction:column;gap:8px;scroll-behavior:smooth;}
  body:not(.tablet-mode) .cf-desktop-welcome{align-self:flex-start;max-width:88%;padding:10px 12px;border:1px solid #e1e5eb;border-radius:13px 13px 13px 5px;background:#fff;color:#39424e;font-size:11px;line-height:1.65;}
  body:not(.tablet-mode) .cf-desktop-bubble{max-width:88%;padding:9px 11px;border-radius:13px;font-size:11px;line-height:1.7;white-space:pre-wrap;word-break:break-word;}
  body:not(.tablet-mode) .cf-desktop-bubble.user{align-self:flex-end;background:#18202a;color:#fff;border-radius:13px 13px 5px 13px;}
  body:not(.tablet-mode) .cf-desktop-bubble.ai{align-self:flex-start;background:#fff;color:#303844;border:1px solid #e1e5eb;border-radius:13px 13px 13px 5px;}
  body:not(.tablet-mode) .cf-desktop-composer{display:flex;align-items:center;gap:6px;flex:0 0 46px;border:1px solid #dfe4ea;border-radius:13px;background:#fff;padding:5px;}
  body:not(.tablet-mode) .cf-desktop-input{flex:1 1 auto;min-width:0;}
  body:not(.tablet-mode) #canvasflowDesktopChat #lessonInput{display:block!important;width:100%!important;height:34px!important;min-height:34px!important;max-height:34px!important;resize:none!important;border:0!important;outline:none!important;background:transparent!important;box-shadow:none!important;padding:8px 7px!important;margin:0!important;font-size:12px!important;}
  body:not(.tablet-mode) .cf-desktop-composer button{width:34px;height:34px;flex:0 0 34px;border:0;border-radius:10px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:17px;padding:0;}
  body:not(.tablet-mode) .cf-desktop-attach{background:#eef1f5;color:#39424e;}
  body:not(.tablet-mode) .cf-desktop-send{background:#18202a;color:#fff;}
  body:not(.tablet-mode) #aiPanel .ai-actions{order:2;display:flex;flex:0 0 38px;flex-wrap:nowrap;gap:5px;overflow-x:auto;overflow-y:hidden;margin:0;padding:1px 0;scrollbar-width:thin;}
  body:not(.tablet-mode) #aiPanel .ai-action{flex:0 0 auto;width:auto;min-width:0;padding:7px 10px;border-radius:18px;font-size:9px;white-space:nowrap;}
  body:not(.tablet-mode) #aiPanel .ai-action b{display:inline;font-size:9px;margin:0;}
  body:not(.tablet-mode) #aiPanel .ai-action span{display:none;}
  body:not(.tablet-mode) #aiPanel #lessonPreviews{flex:0 0 auto;max-height:54px;overflow:auto;margin:0;display:flex;gap:5px;}
  body:not(.tablet-mode) #aiPanel #lessonPreviews:empty{display:none;}
  body:not(.tablet-mode) #aiPanel #aiResult{display:none!important;}
  body:not(.tablet-mode) #aiPanel #aiStatus{flex:0 0 auto;font-size:8px;margin:0;min-height:10px;}
}
</style>`;
const cssMarker='<style id="canvasflow-desktop-ai-chat-css">';
const cs=s.indexOf(cssMarker);
if(cs>=0){const ce=s.indexOf('</style>',cs);if(ce>=0)s=s.slice(0,cs)+css+s.slice(ce+8);}
else s=s.replace('</head>',css+'\n</head>');

fs.writeFileSync(file,s);
console.log('CanvasFlow: desktop AI chat UI added.');
