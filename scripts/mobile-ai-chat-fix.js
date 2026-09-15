import fs from "node:fs";

const file = "public/index.html";
let s = fs.readFileSync(file, "utf8");

const js = `<script id="canvasflow-mobile-ai-chat-fix">(function(){
  const isMobile=()=>window.matchMedia('(max-width:760px), (max-height:520px) and (max-width:900px)').matches;
  let installed=false;
  function setup(){
    if(!isMobile()) return;
    const panel=document.getElementById('aiPanel');
    if(!panel) return;
    const body=panel.querySelector('.ai-body');
    const input=document.getElementById('lessonInput');
    const images=document.getElementById('lessonImages');
    const actions=panel.querySelector('.ai-actions');
    const result=document.getElementById('aiResult');
    if(!body||!input||!actions||!result) return;
    if(document.getElementById('canvasflowMobileChat')) { installed=true; return; }

    const chat=document.createElement('div');
    chat.id='canvasflowMobileChat';
    chat.innerHTML='<div class="cf-mobile-messages" aria-live="polite"><div class="cf-mobile-welcome">أهلاً 👋<br>أنا CanvasFlow AI.<br>اكتب سؤالك أو ارفع صورة/ملف من 📎.</div></div><div class="cf-mobile-composer"><button type="button" class="cf-mobile-attach" title="إرفاق صورة أو ملف">📎</button><div class="cf-mobile-input"></div><button type="button" class="cf-mobile-send" title="إرسال">➤</button></div>';
    const messages=chat.querySelector('.cf-mobile-messages');
    const composer=chat.querySelector('.cf-mobile-composer');
    composer.querySelector('.cf-mobile-input').appendChild(input);

    let picker=document.getElementById('canvasflowMobileFileInput');
    if(!picker){
      picker=document.createElement('input');
      picker.id='canvasflowMobileFileInput';
      picker.type='file';
      picker.accept='image/*,.pdf,.txt,.doc,.docx,.ppt,.pptx';
      picker.style.display='none';
      document.body.appendChild(picker);
    }
    composer.querySelector('.cf-mobile-attach').onclick=e=>{e.preventDefault();e.stopPropagation();picker.value='';picker.click();};
    picker.onchange=()=>{
      const file=picker.files&&picker.files[0];
      if(!file)return;
      if(file.type&&file.type.startsWith('image/')&&images){
        try{const dt=new DataTransfer();dt.items.add(file);images.files=dt.files;images.dispatchEvent(new Event('change',{bubbles:true}));}catch(_){images.click();}
      }else{
        let chip=document.getElementById('canvasflowMobileAttachment');
        if(!chip){chip=document.createElement('div');chip.id='canvasflowMobileAttachment';chip.className='cf-mobile-attachment';composer.parentElement.insertBefore(chip,composer);}
        chip.textContent='📎 '+file.name; chip.title=file.name;
        if(file.type==='text/plain'){const r=new FileReader();r.onload=()=>{input.value=String(r.result||'').slice(0,12000);};r.readAsText(file);}
      }
      bubble('📎 '+file.name,'user');
    };

    function bubble(text,type){
      text=String(text||'').trim(); if(!text)return;
      const b=document.createElement('div');b.className='cf-mobile-bubble '+type;b.textContent=text;messages.appendChild(b);messages.scrollTop=messages.scrollHeight;
    }
    const send=()=>{
      const value=input.value.trim();
      const hasImages=!!(window.lessonImageFiles&&window.lessonImageFiles.length);
      const attachment=document.getElementById('canvasflowMobileAttachment');
      if(!value&&!hasImages&&!attachment){bubble('اكتب سؤالك أو ارفع صورة/ملف الأول 📎','ai');return;}
      if(value)bubble(value,'user');
      const modeBtn=actions.querySelector('[data-ai="explain"]');
      if(modeBtn)modeBtn.click();
      input.value='';
    };
    composer.querySelector('.cf-mobile-send').onclick=e=>{e.preventDefault();e.stopPropagation();send();};
    input.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send();}});

    const originalRunAI=window.runAI;
    if(typeof originalRunAI==='function'&&!originalRunAI.__canvasflowMobileChatWrapped){
      const wrapped=async function(mode){
        await originalRunAI(mode);
        const text=(result.textContent||'').trim();
        if(text&&!/^جاري/.test(text)){bubble(text,'ai');result.textContent='';}
      };
      wrapped.__canvasflowMobileChatWrapped=true;
      window.runAI=wrapped;
    }

    body.innerHTML='';
    body.appendChild(chat);
    body.appendChild(actions);
    const previews=document.getElementById('lessonPreviews'); if(previews)body.appendChild(previews);
    const status=document.getElementById('aiStatus'); if(status)body.appendChild(status);
    const drop=document.getElementById('lessonDrop'); if(drop)drop.style.display='none';
    const settings=panel.querySelector('.ai-settings'); if(settings)settings.style.display='none';
    installed=true;
  }
  setup();
  [150,400,800,1500,3000].forEach(t=>setTimeout(setup,t));
  const observer=new MutationObserver(()=>{if(isMobile()&&!document.getElementById('canvasflowMobileChat'))setup();});
  observer.observe(document.documentElement,{childList:true,subtree:true});
  window.addEventListener('resize',()=>{installed=false;setTimeout(setup,100);},{passive:true});
  window.addEventListener('orientationchange',()=>{installed=false;setTimeout(setup,200);});
})();</script>`;

const marker='<script id="canvasflow-mobile-ai-chat-fix">';
const start=s.indexOf(marker);
if(start>=0){const end=s.indexOf('</script>',start);if(end>=0)s=s.slice(0,start)+js+s.slice(end+9);}
else s=s.replace('</body>',js+'\n</body>');

const css=`<style id="canvasflow-mobile-ai-chat-css">
@media screen and (max-width:760px), screen and (max-height:520px) and (max-width:900px){
  #aiPanel{width:min(94vw,520px)!important;height:min(76dvh,620px)!important;max-height:calc(100dvh - 70px)!important;min-height:280px!important;z-index:99999!important;overflow:hidden!important;}
  #aiPanel .ai-body{display:flex!important;flex-direction:column!important;gap:6px!important;min-height:0!important;overflow:hidden!important;padding:7px!important;}
  #aiPanel .ai-label,#aiPanel #lessonDrop,#aiPanel .ai-settings{display:none!important;}
  #canvasflowMobileChat{display:flex!important;flex-direction:column!important;flex:1 1 auto!important;min-height:0!important;overflow:hidden!important;gap:6px!important;}
  .cf-mobile-messages{flex:1 1 auto;min-height:90px;overflow:auto;background:#fafbfc;border:1px solid #e6e9ee;border-radius:13px;padding:9px;display:flex;flex-direction:column;gap:7px;}
  .cf-mobile-welcome,.cf-mobile-bubble{max-width:88%;padding:8px 10px;border-radius:12px;font-size:11px;line-height:1.65;white-space:pre-wrap;word-break:break-word;}
  .cf-mobile-welcome,.cf-mobile-bubble.ai{align-self:flex-start;background:#fff;color:#303844;border:1px solid #e1e5eb;border-radius:12px 12px 12px 4px;}
  .cf-mobile-bubble.user{align-self:flex-end;background:#18202a;color:#fff;border-radius:12px 12px 4px 12px;}
  .cf-mobile-composer{display:flex;align-items:center;gap:5px;flex:0 0 44px;border:1px solid #dfe4ea;border-radius:13px;background:#fff;padding:4px;}
  .cf-mobile-input{flex:1 1 auto;min-width:0;}
  #canvasflowMobileChat #lessonInput{display:block!important;width:100%!important;height:32px!important;min-height:32px!important;max-height:32px!important;resize:none!important;border:0!important;outline:none!important;background:transparent!important;box-shadow:none!important;padding:7px 6px!important;margin:0!important;font-size:12px!important;}
  .cf-mobile-composer button{width:32px;height:32px;flex:0 0 32px;border:0;border-radius:10px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:16px;padding:0;}
  .cf-mobile-attach{background:#eef1f5;color:#39424e;}.cf-mobile-send{background:#18202a;color:#fff;}
  .cf-mobile-attachment{flex:0 0 auto;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;border:1px solid #dfe4ea;border-radius:9px;background:#f7f8fa;padding:5px 8px;font-size:9px;color:#39424e;}
  #aiPanel .ai-actions{order:2!important;display:flex!important;flex:0 0 34px!important;flex-wrap:nowrap!important;gap:4px!important;overflow-x:auto!important;overflow-y:hidden!important;margin:0!important;padding:1px 0!important;scrollbar-width:none!important;}
  #aiPanel .ai-actions::-webkit-scrollbar{display:none!important;}
  #aiPanel .ai-action{flex:0 0 auto!important;width:auto!important;min-width:0!important;padding:7px 9px!important;border-radius:18px!important;font-size:8px!important;white-space:nowrap!important;}
  #aiPanel .ai-action b{display:inline!important;font-size:8px!important;margin:0!important;} #aiPanel .ai-action span{display:none!important;}
  #aiPanel #lessonPreviews{flex:0 0 auto!important;max-height:44px!important;margin:0!important;display:flex!important;gap:4px;overflow:auto;} #aiPanel #lessonPreviews:empty{display:none!important;}
  #aiPanel #aiResult{display:none!important;} #aiPanel #aiStatus{flex:0 0 auto!important;font-size:7px!important;margin:0!important;min-height:9px!important;}
  #aiPanel .ai-footer{display:none!important;}
  @media (orientation:landscape){
    #aiPanel{width:min(88vw,700px)!important;height:min(78dvh,430px)!important;max-height:calc(100dvh - 28px)!important;min-height:220px!important;}
    #aiPanel .ai-body{padding:6px!important;gap:5px!important;}
    #canvasflowMobileChat{gap:5px!important;}
    .cf-mobile-composer{flex-basis:38px!important;}
    #canvasflowMobileChat #lessonInput{height:28px!important;min-height:28px!important;max-height:28px!important;font-size:11px!important;}
    .cf-mobile-composer button{width:28px;height:28px;flex-basis:28px;}
    #aiPanel .ai-actions{flex-basis:30px!important;}
  }
}
</style>`;
const cssMarker='<style id="canvasflow-mobile-ai-chat-css">';
const cs=s.indexOf(cssMarker);
if(cs>=0){const ce=s.indexOf('</style>',cs);if(ce>=0)s=s.slice(0,cs)+css+s.slice(ce+8);}
else s=s.replace('</head>',css+'\n</head>');

fs.writeFileSync(file,s,'utf8');
console.log('CanvasFlow: mobile AI chat reliably installed.');
