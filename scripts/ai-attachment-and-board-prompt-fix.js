import fs from "node:fs";

const file = "public/index.html";
let s = fs.readFileSync(file, "utf8");

const js = `<script id="canvasflow-ai-attachment-and-board-prompt-fix">(function(){
  function getUI(){
    const panel=document.getElementById('aiPanel');
    if(!panel)return null;
    const body=panel.querySelector('.ai-body');
    const chat=panel.querySelector('#canvasflowMobileChat, #canvasflowDesktopChat');
    const input=document.getElementById('lessonInput');
    const images=document.getElementById('lessonImages');
    if(!body||!chat||!input||!images)return null;
    const composer=chat.querySelector('.cf-mobile-composer, .cf-desktop-composer');
    const attach=chat.querySelector('.cf-mobile-attach, .cf-desktop-attach');
    const send=chat.querySelector('.cf-mobile-send, .cf-desktop-send');
    const messages=chat.querySelector('.cf-mobile-messages, .cf-desktop-messages');
    if(!composer||!attach||!send||!messages)return null;
    return {panel,body,chat,input,images,composer,attach,send,messages};
  }

  function setupAttachments(ui){
    if(ui.chat.dataset.cfAttachmentQueue==='1')return;
    ui.chat.dataset.cfAttachmentQueue='1';
    let picker=document.getElementById('canvasflowUnifiedFileInput');
    if(!picker){picker=document.createElement('input');picker.id='canvasflowUnifiedFileInput';picker.type='file';picker.multiple=true;picker.accept='image/*,.pdf,.txt,.doc,.docx,.ppt,.pptx';picker.hidden=true;document.body.appendChild(picker);}
    let pending=[];
    let bar=document.createElement('div');bar.id='canvasflowPendingFilesBar';
    ui.composer.parentElement.insertBefore(bar,ui.composer);
    const style=document.createElement('style');style.textContent=`#canvasflowPendingFilesBar{display:none;flex-wrap:wrap;align-items:center;gap:5px;max-height:64px;overflow:auto;margin:0 0 5px;padding:3px 0;direction:rtl}.cf-pending-chip{display:flex;align-items:center;gap:6px;max-width:100%;padding:5px 8px;border:1px solid #dfe4ea;border-radius:9px;background:#f7f8fa;color:#39424e;font-size:10px}.cf-pending-chip .cf-file-name{max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.cf-pending-chip .cf-file-remove{border:0;background:transparent;color:#b3261e;font-size:16px;line-height:1;cursor:pointer;padding:0 2px}`;document.head.appendChild(style);
    function render(){bar.innerHTML='';bar.style.display=pending.length?'flex':'none';pending.forEach((f,i)=>{const chip=document.createElement('div');chip.className='cf-pending-chip';const name=document.createElement('span');name.className='cf-file-name';name.textContent='📎 '+f.name;const remove=document.createElement('button');remove.type='button';remove.className='cf-file-remove';remove.textContent='×';remove.title='حذف الملف';remove.onclick=()=>{pending.splice(i,1);render();};chip.append(name,remove);bar.appendChild(chip);});}
    picker.onchange=()=>{Array.from(picker.files||[]).forEach(f=>{if(!pending.some(x=>x.name===f.name&&x.size===f.size&&x.lastModified===f.lastModified))pending.push(f);});picker.value='';render();};
    ui.attach.onclick=e=>{e.preventDefault();e.stopPropagation();picker.value='';picker.click();};
    ui.send.onclick=e=>{e.preventDefault();e.stopPropagation();const text=ui.input.value.trim();if(!pending.length){if(text){const b=document.createElement('div');b.className=ui.messages.classList.contains('cf-mobile-messages')?'cf-mobile-bubble user':'cf-desktop-bubble user';b.textContent=text;ui.messages.appendChild(b);}const explain=ui.panel.querySelector('[data-ai="explain"]');if(explain)explain.click();return;}try{const dt=new DataTransfer();pending.forEach(f=>dt.items.add(f));ui.images.files=dt.files;ui.images.dispatchEvent(new Event('change',{bubbles:true}));}catch(_){return;}if(text){const b=document.createElement('div');b.className=ui.messages.classList.contains('cf-mobile-messages')?'cf-mobile-bubble user':'cf-desktop-bubble user';b.textContent=text;ui.messages.appendChild(b);ui.messages.scrollTop=ui.messages.scrollHeight;}pending=[];render();ui.input.value='';const explain=ui.panel.querySelector('[data-ai="explain"]');if(explain)explain.click();};
  }

  function setupBoardPrompt(ui){
    if(ui.chat.dataset.cfBoardPrompt==='1')return;
    ui.chat.dataset.cfBoardPrompt='1';
    let last='';
    const addPrompt=()=>{
      const result=document.getElementById('aiResult');
      const text=(result&&result.textContent||'').trim();
      if(!text||text===last||/^جاري/.test(text))return;
      last=text;
      const old=ui.messages.querySelector('.cf-board-prompt');if(old)old.remove();
      const box=document.createElement('div');box.className='cf-board-prompt';box.dir='rtl';box.innerHTML='<div class="cf-board-prompt-text">تحب أحط الملخص أو الإجابة دي على البورد؟</div><div class="cf-board-prompt-actions"><button type="button" class="cf-board-yes">أيوه، ضيفه للبورد</button><button type="button" class="cf-board-no">لأ، شكرًا</button></div>';
      const yes=box.querySelector('.cf-board-yes');yes.onclick=()=>{let done=false;try{if(typeof window.canvasflowAddAIToBoard==='function'){window.canvasflowAddAIToBoard(text);done=true;}}catch(_){}if(!done){const candidates=Array.from(ui.panel.querySelectorAll('button,[role="button"]'));const target=candidates.find(b=>/board|بورد|البورد|إضافة للبورد|اضف للبورد/i.test((b.textContent||'').trim())&&b!==yes);if(target){target.click();done=true;}}yes.textContent=done?'اتضاف للبورد ✓':'جهزت الإضافة';yes.disabled=true;};
      box.querySelector('.cf-board-no').onclick=()=>{box.remove();};
      const st=document.createElement('style');st.textContent=`.cf-board-prompt{margin-top:8px;padding:9px;border:1px solid #d97706;border-radius:11px;background:rgba(255,247,237,.96);color:#303844;direction:rtl}.cf-board-prompt-text{font-size:11px;margin-bottom:7px}.cf-board-prompt-actions{display:flex;gap:6px;flex-wrap:wrap}.cf-board-prompt button{border:0;border-radius:9px;padding:6px 9px;font-size:10px;cursor:pointer}.cf-board-yes{background:#18202a;color:#fff}.cf-board-no{background:#e9edf2;color:#303844}`;if(!document.getElementById('cf-board-prompt-style')){st.id='cf-board-prompt-style';document.head.appendChild(st);}ui.messages.appendChild(box);ui.messages.scrollTop=ui.messages.scrollHeight;};
    const result=document.getElementById('aiResult');
    if(result)new MutationObserver(()=>setTimeout(addPrompt,80)).observe(result,{childList:true,subtree:true,characterData:true});
  }

  function boot(){const ui=getUI();if(!ui)return;setupAttachments(ui);setupBoardPrompt(ui);}
  [0,200,600,1200,2500,5000].forEach(t=>setTimeout(boot,t));
  new MutationObserver(boot).observe(document.documentElement,{childList:true,subtree:true});
})();</script>`;

const marker='<script id="canvasflow-ai-attachment-and-board-prompt-fix">';
const start=s.indexOf(marker);
if(start>=0){const end=s.indexOf('</script>',start);if(end>=0)s=s.slice(0,start)+js+s.slice(end+9);}
else s=s.replace('</body>',js+'\n</body>');

fs.writeFileSync(file,s,'utf8');
console.log('CanvasFlow: queued attachments with remove buttons and board prompt installed.');
