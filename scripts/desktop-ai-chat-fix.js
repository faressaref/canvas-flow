import fs from "node:fs";

const file = "public/index.html";
let s = fs.readFileSync(file, "utf8");

const js = `<script id="canvasflow-desktop-ai-chat-fix">(function(){
  const isWide=()=>window.matchMedia('(min-width:761px)').matches;
  let installed=false;
  function setup(){
    if(!isWide()) return;
    const panel=document.getElementById('aiPanel');
    if(!panel) return;
    const body=panel.querySelector('.ai-body');
    const input=document.getElementById('lessonInput');
    const images=document.getElementById('lessonImages');
    const actions=panel.querySelector('.ai-actions');
    const result=document.getElementById('aiResult');
    if(!body||!input||!actions||!result) return;
    if(document.getElementById('canvasflowDesktopChat')) { installed=true; return; }

    const chat=document.createElement('div');
    chat.id='canvasflowDesktopChat';
    chat.innerHTML='<div class="cf-desktop-messages" aria-live="polite"><div class="cf-desktop-welcome">أهلاً 👋<br>أنا CanvasFlow AI Study Tutor.<br>اكتب سؤالك أو ارفع صورة/ملف من 📎.</div></div><div class="cf-desktop-composer"><button type="button" class="cf-desktop-attach" title="إرفاق صورة أو ملف">📎</button><div class="cf-desktop-input"></div><button type="button" class="cf-desktop-send" title="إرسال">➤</button></div>';
    const messages=chat.querySelector('.cf-desktop-messages');
    const composer=chat.querySelector('.cf-desktop-composer');
    composer.querySelector('.cf-desktop-input').appendChild(input);

    body.innerHTML='';
    body.appendChild(chat);
    body.appendChild(actions);
    const previews=document.getElementById('lessonPreviews'); if(previews)body.appendChild(previews);
    const status=document.getElementById('aiStatus'); if(status)body.appendChild(status);
    const drop=document.getElementById('lessonDrop'); if(drop)drop.style.display='none';
    const settings=panel.querySelector('.ai-settings'); if(settings)settings.style.display='none';

    function bubble(text,type){text=String(text||'').trim();if(!text)return;const b=document.createElement('div');b.className='cf-desktop-bubble '+type;b.textContent=text;messages.appendChild(b);messages.scrollTop=messages.scrollHeight;}

    let picker=document.getElementById('canvasflowDesktopFileInput');
    if(!picker){picker=document.createElement('input');picker.id='canvasflowDesktopFileInput';picker.type='file';picker.accept='image/*,.pdf,.txt,.doc,.docx,.ppt,.pptx';picker.style.display='none';document.body.appendChild(picker);}
    composer.querySelector('.cf-desktop-attach').onclick=e=>{e.preventDefault();e.stopPropagation();picker.value='';picker.click();};
    picker.onchange=()=>{const file=picker.files&&picker.files[0];if(!file)return;if(file.type&&file.type.startsWith('image/')&&images){try{const dt=new DataTransfer();dt.items.add(file);images.files=dt.files;images.dispatchEvent(new Event('change',{bubbles:true}));}catch(_){images.click();}bubble('📎 '+file.name,'user');}else{let chip=document.getElementById('canvasflowDesktopAttachment');if(!chip){chip=document.createElement('div');chip.id='canvasflowDesktopAttachment';chip.className='cf-desktop-attachment';composer.parentElement.insertBefore(chip,composer);}chip.textContent='📎 '+file.name;chip.title=file.name;if(file.type==='text/plain'){const reader=new FileReader();reader.onload=()=>{input.value=String(reader.result||'').slice(0,12000);};reader.readAsText(file);}bubble('📎 '+file.name,'user');}};

    const send=()=>{const value=input.value.trim();const hasImages=!!(window.lessonImageFiles&&window.lessonImageFiles.length);const attachment=document.getElementById('canvasflowDesktopAttachment');if(!value&&!hasImages&&!attachment){bubble('اكتب سؤالك أو ارفع صورة/ملف الأول 📎','ai');return;}if(value)bubble(value,'user');const modeBtn=actions.querySelector('[data-ai="explain"]');if(modeBtn)modeBtn.click();input.value='';};
    composer.querySelector('.cf-desktop-send').onclick=e=>{e.preventDefault();e.stopPropagation();send();};
    input.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send();}});

    const originalRunAI=window.runAI;
    if(typeof originalRunAI==='function'&&!originalRunAI.__canvasflowChatWrapped){const wrapped=async function(mode){await originalRunAI(mode);const text=(result.textContent||'').trim();if(text&&!/^جاري/.test(text)){bubble(text,'ai');result.textContent='';}};wrapped.__canvasflowChatWrapped=true;window.runAI=wrapped;}
    installed=true;
  }
  setup();[150,400,800,1500,3000].forEach(t=>setTimeout(setup,t));
  const observer=new MutationObserver(()=>{if(isWide()&&!document.getElementById('canvasflowDesktopChat'))setup();});observer.observe(document.documentElement,{childList:true,subtree:true});
  window.addEventListener('resize',()=>{installed=false;setTimeout(setup,100);},{passive:true});
})();</script>`;

const marker='<script id="canvasflow-desktop-ai-chat-fix">';
const start=s.indexOf(marker);
if(start>=0){const end=s.indexOf('</script>',start);if(end>=0)s=s.slice(0,start)+js+s.slice(end+9);}
else s=s.replace('</body>',js+'\n</body>');

const css=`<style id="canvasflow-desktop-ai-chat-css">
/* Tablet / smaller landscape */
@media screen and (min-width:761px) and (max-width:1099px){
  #aiPanel{width:min(92vw,560px)!important;height:min(76dvh,560px)!important;max-height:calc(100dvh - 32px)!important;min-height:300px!important;}
}
/* Desktop / PC */
@media screen and (min-width:1100px){
  #aiPanel{width:400px!important;height:min(620px,calc(100dvh - 96px))!important;min-height:500px!important;max-height:calc(100dvh - 64px)!important;}
}
@media screen and (min-width:761px){
  #aiPanel .ai-body{display:flex!important;flex-direction:column!important;min-height:0!important;gap:8px!important;padding:9px!important;overflow:hidden!important;}
  #aiPanel .ai-label,#aiPanel #lessonDrop,#aiPanel .ai-settings{display:none!important;}
  #aiPanel #canvasflowDesktopChat{display:flex!important;flex-direction:column!important;flex:1 1 auto!important;min-height:0!important;overflow:hidden!important;gap:8px!important;}
  .cf-desktop-messages{flex:1 1 auto;min-height:120px;overflow:auto;background:#fafbfc;border:1px solid #e6e9ee;border-radius:13px;padding:10px;display:flex;flex-direction:column;gap:8px;}
  .cf-desktop-welcome,.cf-desktop-bubble{max-width:88%;padding:10px 12px;border-radius:13px;font-size:11px;line-height:1.65;white-space:pre-wrap;word-break:break-word;}
  .cf-desktop-welcome,.cf-desktop-bubble.ai{align-self:flex-start;background:#fff;color:#303844;border:1px solid #e1e5eb;border-radius:13px 13px 13px 5px;}
  .cf-desktop-bubble.user{align-self:flex-end;background:#18202a;color:#fff;border-radius:13px 13px 5px 13px;}
  .cf-desktop-composer{display:flex;align-items:center;gap:6px;flex:0 0 46px;border:1px solid #dfe4ea;border-radius:13px;background:#fff;padding:5px;}
  .cf-desktop-input{flex:1 1 auto;min-width:0;}
  #canvasflowDesktopChat #lessonInput{display:block!important;width:100%!important;height:34px!important;min-height:34px!important;max-height:34px!important;resize:none!important;border:0!important;outline:none!important;background:transparent!important;box-shadow:none!important;padding:8px 7px!important;margin:0!important;font-size:12px!important;}
  .cf-desktop-composer button{width:34px;height:34px;flex:0 0 34px;border:0;border-radius:10px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:17px;padding:0;}
  .cf-desktop-attach{background:#eef1f5;color:#39424e;}.cf-desktop-send{background:#18202a;color:#fff;}
  #aiPanel .ai-actions{display:flex!important;flex:0 0 38px;flex-wrap:nowrap;gap:5px;overflow-x:auto;overflow-y:hidden;margin:0;padding:1px 0;}
  #aiPanel .ai-action{flex:0 0 auto;width:auto;min-width:0;padding:7px 10px;border-radius:18px;font-size:9px;white-space:nowrap;}
  #aiPanel .ai-action b{display:inline;font-size:9px;margin:0;} #aiPanel .ai-action span{display:none;}
  #aiPanel #lessonPreviews{flex:0 0 auto;max-height:54px;overflow:auto;margin:0;display:flex;gap:5px;} #aiPanel #lessonPreviews:empty{display:none;}
  #aiPanel #aiResult{display:none!important;} #aiPanel #aiStatus{flex:0 0 auto;font-size:8px;margin:0;min-height:10px;}
  .cf-desktop-attachment{flex:0 0 auto;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;border:1px solid #dfe4ea;border-radius:9px;background:#f7f8fa;padding:5px 8px;font-size:9px;color:#39424e;}
}
</style>`;
const cssMarker='<style id="canvasflow-desktop-ai-chat-css">';
const cs=s.indexOf(cssMarker);
if(cs>=0){const ce=s.indexOf('</style>',cs);if(ce>=0)s=s.slice(0,cs)+css+s.slice(ce+8);}
else s=s.replace('</head>',css+'\n</head>');

fs.writeFileSync(file,s,'utf8');
console.log('CanvasFlow: fixed desktop AI chat sizing and preserved tablet responsiveness.');
