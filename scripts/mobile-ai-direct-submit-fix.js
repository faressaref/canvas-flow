import fs from "node:fs";

const file = "public/index.html";
let s = fs.readFileSync(file, "utf8");

const js = `<script id="canvasflow-mobile-ai-direct-submit-fix">(function(){
  'use strict';
  const isMobile=()=>window.matchMedia('(max-width:760px), (max-height:520px) and (max-width:900px)').matches;
  let pending=[];
  let selectedMode='summary';
  const modeLabels={summary:'ملخص كامل',explain:'اشرحلي',important:'المهم',quiz:'امتحان',flashcards:'Flashcards',recall:'Active Recall',mindmap:'Mind Map',studyplan:'Study Plan'};

  function boot(){
    if(!isMobile()) return;
    const chat=document.getElementById('canvasflowMobileChat');
    const composer=chat?.querySelector('.cf-mobile-composer');
    const input=document.getElementById('lessonInput');
    const images=document.getElementById('lessonImages');
    if(!chat||!composer||!input||!images||chat.dataset.cleanAiFlow==='1') return;
    chat.dataset.cleanAiFlow='1';

    const oldAttach=chat.querySelector('.cf-mobile-attach');
    const oldSend=chat.querySelector('.cf-mobile-send');
    if(!oldAttach||!oldSend) return;

    const attach=oldAttach.cloneNode(true);
    const send=oldSend.cloneNode(true);
    oldAttach.replaceWith(attach);
    oldSend.replaceWith(send);

    let bar=document.getElementById('cfCleanQueuedFiles');
    if(!bar){
      bar=document.createElement('div');
      bar.id='cfCleanQueuedFiles';
      composer.parentNode.insertBefore(bar,composer);
    }

    const style=document.createElement('style');
    style.textContent='#cfCleanQueuedFiles{display:none;align-items:center;flex-wrap:wrap;gap:5px;padding:6px;margin:0 0 6px;border:1px solid #dfe4ea;border-radius:10px;background:#f7f8fa;direction:rtl;max-height:78px;overflow:auto}#cfCleanQueuedFiles.show{display:flex!important}#cfCleanQueuedFiles .cf-file-chip{display:flex;align-items:center;gap:5px;max-width:100%;padding:5px 8px;border:1px solid #d6dce4;border-radius:8px;background:#fff;color:#303844;font-size:11px;direction:ltr}#cfCleanQueuedFiles .cf-file-chip span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:210px}#cfCleanQueuedFiles .cf-file-chip button{border:0;background:#18202a;color:#fff;border-radius:6px;width:24px;height:24px;cursor:pointer;font-size:16px;line-height:20px}';
    document.head.appendChild(style);

    const picker=document.createElement('input');
    picker.type='file'; picker.multiple=true; picker.accept='image/*'; picker.hidden=true;
    document.body.appendChild(picker);

    function render(){
      bar.innerHTML='';
      bar.classList.toggle('show',pending.length>0);
      pending.forEach((f,i)=>{
        const chip=document.createElement('div'); chip.className='cf-file-chip';
        const name=document.createElement('span'); name.textContent='📎 '+f.name;
        const remove=document.createElement('button'); remove.type='button'; remove.textContent='×'; remove.setAttribute('aria-label','Remove file');
        remove.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();pending.splice(i,1);render();},true);
        chip.append(name,remove); bar.appendChild(chip);
      });
    }

    attach.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();picker.value='';picker.click();},true);
    picker.addEventListener('change',()=>{
      for(const f of Array.from(picker.files||[])){
        if(!f.type.startsWith('image/')) continue;
        if(!pending.some(p=>p.name===f.name&&p.size===f.size&&p.lastModified===f.lastModified)) pending.push(f);
      }
      picker.value=''; render();
      if(pending.length) chat.querySelector('.cf-mobile-messages')?.scrollTo?.({top:999999,behavior:'smooth'});
    });

    // Quick actions only fill the command. They never call the AI by themselves.
    chat.parentElement?.querySelectorAll('.ai-action').forEach(button=>{
      const clean=button.cloneNode(true);
      button.replaceWith(clean);
      clean.addEventListener('click',e=>{
        e.preventDefault(); e.stopImmediatePropagation();
        selectedMode=clean.dataset.ai||'summary';
        input.value=modeLabels[selectedMode]||selectedMode;
        input.focus();
        chat.querySelectorAll('.ai-action').forEach(b=>b.classList.toggle('selected',b===clean));
      },true);
    });

    function send(e){
      e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
      const command=input.value.trim();
      if(!pending.length){
        input.placeholder='ارفع ملف الدرس الأول من 📎';
        return;
      }
      if(!command){
        input.placeholder='اكتب الأمر الأول ثم اضغط إرسال';
        input.focus();
        return;
      }

      const selected=pending.slice();
      // The native change handler updates the real lexical lessonImageFiles array.
      try{
        const dt=new DataTransfer();
        selected.forEach(f=>dt.items.add(f));
        images.files=dt.files;
      }catch(err){ console.warn('CanvasFlow: could not assign queued files',err); }
      images.dispatchEvent(new Event('change',{bubbles:true}));

      const mode=selectedMode;
      const message=command;
      pending=[]; render();
      const messages=chat.querySelector('.cf-mobile-messages');
      if(messages){
        const bubble=document.createElement('div'); bubble.className='cf-mobile-bubble user'; bubble.textContent=message; messages.appendChild(bubble); messages.scrollTop=messages.scrollHeight;
      }
      input.value='';
      setTimeout(()=>{
        if(typeof window.runAI==='function') window.runAI(mode);
        else console.error('CanvasFlow: runAI is unavailable');
      },0);
    }

    send.addEventListener('click',send,true);
    input.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){send(e);}});
    render();
  }

  [0,250,700,1400,3000,6000].forEach(t=>setTimeout(boot,t));
  new MutationObserver(boot).observe(document.documentElement,{childList:true,subtree:true});
})();</script>`;

const marker='<script id="canvasflow-mobile-ai-direct-submit-fix">';
const start=s.indexOf(marker);
if(start>=0){const end=s.indexOf('</script>',start);if(end>=0)s=s.slice(0,start)+js+s.slice(end+9);}
else s=s.replace('</body>',js+'\\n</body>');

fs.writeFileSync(file,'utf8'=== 'utf8' ? s : s,'utf8');
console.log('CanvasFlow: clean mobile AI queue and explicit submit flow installed.');
