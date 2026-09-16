import fs from "node:fs";

const file = "public/index.html";
let s = fs.readFileSync(file, "utf8");

const js = `<script id="canvasflow-mobile-ai-attachment-final-fix">(function(){
  const mobile=()=>window.matchMedia('(max-width:760px), (max-height:520px) and (max-width:900px)').matches;
  function boot(){
    if(!mobile())return;
    const chat=document.getElementById('canvasflowMobileChat');
    const composer=chat&&chat.querySelector('.cf-mobile-composer');
    const attach=chat&&chat.querySelector('.cf-mobile-attach');
    const send=chat&&chat.querySelector('.cf-mobile-send');
    const images=document.getElementById('lessonImages');
    const input=document.getElementById('lessonInput');
    if(!chat||!composer||!attach||!send||!images||!input||chat.dataset.cfFinalAttachment==='2')return;
    chat.dataset.cfFinalAttachment='2';
    let picker=document.getElementById('canvasflowMobileQueuedPicker');
    if(!picker){picker=document.createElement('input');picker.id='canvasflowMobileQueuedPicker';picker.type='file';picker.multiple=true;picker.accept='image/*,.pdf,.txt,.doc,.docx,.ppt,.pptx';picker.hidden=true;document.body.appendChild(picker);}
    let pending=[];
    let bar=document.getElementById('canvasflowMobileQueuedFiles');
    if(!bar){bar=document.createElement('div');bar.id='canvasflowMobileQueuedFiles';composer.parentElement.insertBefore(bar,composer);}
    function syncImages(){
      const imageFiles=pending.filter(f=>f.type&&f.type.startsWith('image/'));
      window.lessonImageFiles=imageFiles;
      try{const dt=new DataTransfer();imageFiles.forEach(f=>dt.items.add(f));images.files=dt.files;}catch(_){}
    }
    function render(){bar.replaceChildren();bar.style.display=pending.length?'flex':'none';bar.style.setProperty('display',pending.length?'flex':'none','important');pending.forEach((f,i)=>{const chip=document.createElement('div');chip.className='cf-mobile-queued-chip';const label=document.createElement('span');label.textContent='📎 '+f.name;const x=document.createElement('button');x.type='button';x.textContent='×';x.setAttribute('aria-label','حذف '+f.name);x.onclick=function(e){e.preventDefault();e.stopPropagation();pending.splice(i,1);syncImages();render();};chip.append(label,x);bar.append(chip);});}
    picker.onchange=function(){Array.from(picker.files||[]).forEach(f=>{if(!pending.some(p=>p.name===f.name&&p.size===f.size&&p.lastModified===f.lastModified))pending.push(f);});picker.value='';syncImages();render();};
    attach.onclick=function(e){e.preventDefault();e.stopPropagation();picker.value='';picker.click();};
    send.onclick=function(e){e.preventDefault();e.stopPropagation();if(!pending.length&&!input.value.trim())return;syncImages();if(!input.value.trim()&&pending.length)input.value='لخص الدرس الموجود في الملف المرفق';const explain=chat.parentElement.querySelector('[data-ai="explain"]');if(explain)explain.click();};
    const style=document.createElement('style');style.id='canvasflow-mobile-queued-files-css';style.textContent='#canvasflowMobileQueuedFiles{display:none!important;flex-wrap:wrap;align-items:center;gap:5px;max-height:58px;overflow-y:auto;overflow-x:hidden;margin:0 0 5px;padding:4px;direction:rtl;width:100%;box-sizing:border-box;position:relative;z-index:5;visibility:visible!important;opacity:1!important}.cf-mobile-queued-chip{display:flex;align-items:center;gap:5px;max-width:100%;box-sizing:border-box;padding:5px 7px;border:1px solid #dfe4ea;border-radius:9px;background:#f7f8fa;color:#39424e;font-size:10px;line-height:1.3}.cf-mobile-queued-chip span{display:block;max-width:calc(100% - 20px);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.cf-mobile-queued-chip button{border:0!important;background:transparent!important;color:#b3261e!important;font-size:17px!important;line-height:1!important;width:auto!important;height:auto!important;min-width:18px!important;padding:0 2px!important;flex:0 0 auto!important}';document.head.appendChild(style);render();
  }
  [0,150,400,800,1500,3000,5000,8000].forEach(t=>setTimeout(boot,t));
  new MutationObserver(boot).observe(document.documentElement,{childList:true,subtree:true});
})();</script>`;
const marker='<script id="canvasflow-mobile-ai-attachment-final-fix">';
const start=s.indexOf(marker);
if(start>=0){const end=s.indexOf('</script>',start);if(end>=0)s=s.slice(0,start)+js+s.slice(end+9);}else{s=s.replace('</body>',js+'\n</body>');}
fs.writeFileSync(file,s,'utf8');
console.log('CanvasFlow: fixed mobile AI queued image submission and summary fallback.');
