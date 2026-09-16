import fs from "node:fs";

const file = "public/index.html";
let s = fs.readFileSync(file, "utf8");

const js = `<script id="canvasflow-ai-attachment-and-board-prompt-fix">(function(){
  function boot(){
    const panel=document.getElementById('aiPanel');
    const chat=panel&&panel.querySelector('#canvasflowMobileChat,#canvasflowDesktopChat');
    const input=document.getElementById('lessonInput');
    const images=document.getElementById('lessonImages');
    if(!panel||!chat||!input||!images||chat.dataset.cfUnified==='1')return;
    const composer=chat.querySelector('.cf-mobile-composer,.cf-desktop-composer');
    const attach=chat.querySelector('.cf-mobile-attach,.cf-desktop-attach');
    const send=chat.querySelector('.cf-mobile-send,.cf-desktop-send');
    const messages=chat.querySelector('.cf-mobile-messages,.cf-desktop-messages');
    if(!composer||!attach||!send||!messages)return;
    chat.dataset.cfUnified='1';
    let picker=document.getElementById('canvasflowUnifiedFileInput');
    if(!picker){picker=document.createElement('input');picker.id='canvasflowUnifiedFileInput';picker.type='file';picker.multiple=true;picker.accept='image/*,.pdf,.txt,.doc,.docx,.ppt,.pptx';picker.hidden=true;document.body.appendChild(picker);}
    let pending=[];
    const bar=document.createElement('div');bar.id='canvasflowPendingFilesBar';composer.parentElement.insertBefore(bar,composer);
    const css=document.createElement('style');css.textContent='#canvasflowPendingFilesBar{display:none;flex-wrap:wrap;gap:5px;max-height:65px;overflow:auto;margin:0 0 5px;padding:3px;direction:rtl}.cf-pending-chip{display:flex;align-items:center;gap:6px;padding:5px 8px;border:1px solid #dfe4ea;border-radius:9px;background:#f7f8fa;color:#39424e;font-size:10px}.cf-pending-chip span{max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.cf-pending-chip button{border:0;background:transparent;color:#b3261e;font-size:16px;cursor:pointer}';document.head.appendChild(css);
    function render(){bar.innerHTML='';bar.style.display=pending.length?'flex':'none';pending.forEach(function(f,i){const chip=document.createElement('div');chip.className='cf-pending-chip';const name=document.createElement('span');name.textContent='📎 '+f.name;const x=document.createElement('button');x.type='button';x.textContent='×';x.title='حذف الملف';x.onclick=function(){pending.splice(i,1);render();};chip.append(name,x);bar.appendChild(chip);});}
    picker.onchange=function(){Array.from(picker.files||[]).forEach(function(f){if(!pending.some(function(p){return p.name===f.name&&p.size===f.size&&p.lastModified===f.lastModified;}))pending.push(f);});picker.value='';render();};
    attach.onclick=function(e){e.preventDefault();e.stopPropagation();picker.value='';picker.click();};
    send.onclick=function(e){e.preventDefault();e.stopPropagation();if(!pending.length&&!input.value.trim()){return;}try{const dt=new DataTransfer();pending.forEach(function(f){dt.items.add(f);});images.files=dt.files;images.dispatchEvent(new Event('change',{bubbles:true}));}catch(_){}pending=[];render();const button=panel.querySelector('[data-ai="explain"]');if(button)button.click();};
    let last='';
    const result=document.getElementById('aiResult');
    function boardPrompt(){const text=(result&&result.textContent||'').trim();if(!text||text===last||/^جاري/.test(text))return;last=text;const old=messages.querySelector('.cf-board-prompt');if(old)old.remove();const box=document.createElement('div');box.className='cf-board-prompt';box.dir='rtl';box.innerHTML='<div>تحب أحط الملخص أو الإجابة دي على البورد؟</div><div class="cf-board-prompt-actions"><button type="button" class="cf-board-yes">أيوه، ضيفه للبورد</button><button type="button" class="cf-board-no">لأ، شكرًا</button></div>';box.querySelector('.cf-board-no').onclick=function(){box.remove();};box.querySelector('.cf-board-yes').onclick=function(){let done=false;try{if(typeof window.canvasflowAddAIToBoard==='function'){window.canvasflowAddAIToBoard(text);done=true;}}catch(_){}if(!done){const target=Array.from(panel.querySelectorAll('button')).find(function(b){return /بورد|board/i.test(b.textContent||'')&&b!==box.querySelector('.cf-board-yes');});if(target){target.click();done=true;}}this.textContent=done?'اتضاف للبورد ✓':'اتجهزت الإضافة';this.disabled=true;};messages.appendChild(box);messages.scrollTop=messages.scrollHeight;}
    if(result)new MutationObserver(function(){setTimeout(boardPrompt,100);}).observe(result,{childList:true,subtree:true,characterData:true});
    const style2=document.createElement('style');style2.textContent='.cf-board-prompt{margin-top:8px;padding:9px;border:1px solid #d97706;border-radius:11px;background:#fff7ed;color:#303844;font-size:11px}.cf-board-prompt-actions{display:flex;gap:6px;margin-top:7px;flex-wrap:wrap}.cf-board-prompt button{border:0;border-radius:9px;padding:6px 9px;font-size:10px;cursor:pointer}.cf-board-yes{background:#18202a;color:white}.cf-board-no{background:#e9edf2;color:#303844}';document.head.appendChild(style2);
  }
  [0,300,800,1500,3000,5000].forEach(function(t){setTimeout(boot,t);});
  new MutationObserver(boot).observe(document.documentElement,{childList:true,subtree:true});
})();</script>`;

const marker='<script id="canvasflow-ai-attachment-and-board-prompt-fix">';
const start=s.indexOf(marker);
if(start>=0){const end=s.indexOf('</script>',start);if(end>=0)s=s.slice(0,start)+js+s.slice(end+9);}
else s=s.replace('</body>',js+'\n</body>');
fs.writeFileSync(file,s,'utf8');
console.log('CanvasFlow: unified attachment queue and add-to-board prompt installed.');
