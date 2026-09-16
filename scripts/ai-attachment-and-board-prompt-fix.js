import fs from "node:fs";

const file = "public/index.html";
let s = fs.readFileSync(file, "utf8");

const js = `<script id="canvasflow-ai-attachment-and-board-prompt-fix">(function(){
  function boot(){
    const panel=document.getElementById('aiPanel');
    const chat=panel&&panel.querySelector('#canvasflowMobileChat,#canvasflowDesktopChat');
    if(!panel||!chat||chat.dataset.cfAttachmentListReady==='1')return;
    const composer=chat.querySelector('.cf-mobile-composer,.cf-desktop-composer');
    const attach=chat.querySelector('.cf-mobile-attach,.cf-desktop-attach');
    const send=chat.querySelector('.cf-mobile-send,.cf-desktop-send');
    const messages=chat.querySelector('.cf-mobile-messages,.cf-desktop-messages');
    const input=document.getElementById('lessonInput');
    const images=document.getElementById('lessonImages');
    if(!composer||!attach||!send||!messages||!input||!images)return;
    chat.dataset.cfAttachmentListReady='1';
    let picker=document.getElementById('cfVisibleAttachmentPicker');
    if(!picker){picker=document.createElement('input');picker.id='cfVisibleAttachmentPicker';picker.type='file';picker.multiple=true;picker.accept='image/*,.pdf,.txt,.doc,.docx,.ppt,.pptx';picker.style.display='none';document.body.appendChild(picker);}
    let pending=[];
    const bar=document.createElement('div');bar.id='cfVisibleAttachmentList';bar.dir='rtl';composer.parentElement.insertBefore(bar,composer);
    const style=document.createElement('style');style.textContent='#cfVisibleAttachmentList{display:none;flex-wrap:wrap;align-items:center;gap:5px;width:100%;max-height:76px;overflow:auto;margin:0 0 6px;padding:5px;border:1px solid #dfe4ea;border-radius:10px;background:rgba(247,248,250,.96);box-sizing:border-box;direction:rtl}#cfVisibleAttachmentList .cf-file{display:flex;align-items:center;gap:5px;max-width:100%;padding:5px 7px;border:1px solid #cfd6df;border-radius:8px;background:#fff;color:#303844;font-size:11px}#cfVisibleAttachmentList .cf-name{max-width:190px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}#cfVisibleAttachmentList .cf-remove{border:0;background:transparent;color:#c62828;font-size:18px;line-height:1;cursor:pointer;padding:0 3px}';document.head.appendChild(style);
    function render(){bar.innerHTML='';bar.style.display=pending.length?'flex':'none';pending.forEach(function(f,index){const item=document.createElement('div');item.className='cf-file';const name=document.createElement('span');name.className='cf-name';name.textContent='📎 '+f.name;const remove=document.createElement('button');remove.type='button';remove.className='cf-remove';remove.textContent='×';remove.title='حذف الملف';remove.onclick=function(e){e.preventDefault();e.stopPropagation();pending.splice(index,1);render();};item.append(name,remove);bar.appendChild(item);});}
    attach.addEventListener('click',function(e){e.preventDefault();e.stopImmediatePropagation();picker.value='';picker.click();},true);
    picker.addEventListener('change',function(){Array.from(picker.files||[]).forEach(function(f){if(!pending.some(function(p){return p.name===f.name&&p.size===f.size&&p.lastModified===f.lastModified;}))pending.push(f);});picker.value='';render();});
    send.addEventListener('click',function(e){e.preventDefault();e.stopImmediatePropagation();const text=input.value.trim();if(!pending.length&&!text)return;try{const dt=new DataTransfer();pending.forEach(function(f){dt.items.add(f);});images.files=dt.files;images.dispatchEvent(new Event('change',{bubbles:true}));}catch(_){}pending=[];render();const explain=panel.querySelector('[data-ai="explain"]');if(explain)explain.click();},true);
    let last='';const result=document.getElementById('aiResult');
    function addBoardPrompt(){const text=(result&&result.textContent||'').trim();if(!text||text===last||/^جاري/.test(text))return;last=text;const old=messages.querySelector('.cf-board-prompt');if(old)old.remove();const box=document.createElement('div');box.className='cf-board-prompt';box.dir='rtl';box.innerHTML='<div>تحب أحط الملخص أو الإجابة دي على البورد؟</div><div class="cf-board-prompt-actions"><button type="button" class="cf-board-yes">أيوه، ضيفه للبورد</button><button type="button" class="cf-board-no">لأ، شكرًا</button></div>';box.querySelector('.cf-board-no').onclick=function(){box.remove();};box.querySelector('.cf-board-yes').onclick=function(){let done=false;try{if(typeof window.canvasflowAddAIToBoard==='function'){window.canvasflowAddAIToBoard(text);done=true;}}catch(_){}this.textContent=done?'اتضاف للبورد ✓':'جهزت الإضافة';this.disabled=true;};messages.appendChild(box);messages.scrollTop=messages.scrollHeight;}
    if(result)new MutationObserver(function(){setTimeout(addBoardPrompt,100);}).observe(result,{childList:true,subtree:true,characterData:true});
    const style2=document.createElement('style');style2.textContent='.cf-board-prompt{margin-top:8px;padding:9px;border:1px solid #d97706;border-radius:11px;background:#fff7ed;color:#303844;font-size:11px}.cf-board-prompt-actions{display:flex;gap:6px;margin-top:7px;flex-wrap:wrap}.cf-board-prompt button{border:0;border-radius:9px;padding:6px 9px;font-size:10px;cursor:pointer}.cf-board-yes{background:#18202a;color:white}.cf-board-no{background:#e9edf2;color:#303844}';document.head.appendChild(style2);
  }
  [0,250,600,1200,2500,5000,9000].forEach(function(t){setTimeout(boot,t);});
  new MutationObserver(boot).observe(document.documentElement,{childList:true,subtree:true});
})();</script>`;

const marker='<script id="canvasflow-ai-attachment-and-board-prompt-fix">';
const start=s.indexOf(marker);
if(start>=0){const end=s.indexOf('</script>',start);if(end>=0)s=s.slice(0,start)+js+s.slice(end+9);}
else s=s.replace('</body>',js+'\n</body>');
fs.writeFileSync(file,s,'utf8');
console.log('CanvasFlow: robust visible attachment list and board prompt fixed.');
