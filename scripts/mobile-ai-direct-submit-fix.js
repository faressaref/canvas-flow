import fs from "node:fs";
const file = "public/index.html";
let s = fs.readFileSync(file, "utf8");
const js = `<script id="canvasflow-mobile-ai-direct-submit-fix">(function(){
  const isMobile=()=>matchMedia('(max-width:760px), (max-height:520px) and (max-width:900px)').matches;
  let pending=[];
  function boot(){
    if(!isMobile()) return;
    const chat=document.getElementById('canvasflowMobileChat');
    const input=document.getElementById('lessonInput');
    const images=document.getElementById('lessonImages');
    if(!chat||!input||!images||chat.dataset.directSubmitFix==='1') return;
    chat.dataset.directSubmitFix='1';
    const attach=chat.querySelector('.cf-mobile-attach');
    const send=chat.querySelector('.cf-mobile-send');
    if(!attach||!send) return;
    const picker=document.createElement('input');
    picker.type='file'; picker.multiple=true; picker.accept='image/*,.pdf,.txt,.doc,.docx,.ppt,.pptx'; picker.hidden=true;
    document.body.appendChild(picker);
    let bar=document.getElementById('cfDirectFiles');
    if(!bar){bar=document.createElement('div');bar.id='cfDirectFiles';chat.querySelector('.cf-mobile-composer').parentNode.insertBefore(bar,chat.querySelector('.cf-mobile-composer'));}
    const style=document.createElement('style');style.textContent='#cfDirectFiles{display:none!important;flex-wrap:wrap;gap:5px;padding:6px;margin:0 0 6px;border:1px solid #dfe4ea;border-radius:10px;background:#f7f8fa;direction:rtl;max-height:80px;overflow:auto}#cfDirectFiles.show{display:flex!important}#cfDirectFiles .df{display:flex;align-items:center;gap:5px;padding:5px 8px;background:#fff;border:1px solid #d6dce4;border-radius:8px;color:#303844;font-size:11px}#cfDirectFiles button{border:0;background:transparent;color:#c62828;font-size:18px}';document.head.appendChild(style);
    function render(){bar.innerHTML='';bar.classList.toggle('show',pending.length>0);pending.forEach((f,i)=>{const d=document.createElement('div');d.className='df';d.append(document.createTextNode('📎 '+f.name));const x=document.createElement('button');x.type='button';x.textContent='×';x.onclick=e=>{e.preventDefault();e.stopPropagation();pending.splice(i,1);render();};d.append(x);bar.append(d);});}
    attach.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();picker.value='';picker.click();},true);
    picker.addEventListener('change',()=>{for(const f of Array.from(picker.files||[])){if(!pending.some(p=>p.name===f.name&&p.size===f.size&&p.lastModified===f.lastModified))pending.push(f);}picker.value='';render();});
    function submit(e){
      e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
      const text=input.value.trim()||'لخص الدرس الموجود في الملف المرفق';
      if(!pending.length){if(!input.value.trim())return;}
      const selected=pending.slice();
      window.lessonImageFiles=selected.filter(f=>(f.type||'').startsWith('image/'));
      try{const dt=new DataTransfer();selected.forEach(f=>dt.items.add(f));images.files=dt.files;}catch(_){ }
      input.value=text;
      pending=[];render();
      setTimeout(()=>{if(typeof window.runAI==='function'){window.runAI('explain');}},50);
    }
    send.addEventListener('click',submit,true);
    send.addEventListener('pointerdown',e=>{e.stopImmediatePropagation();},true);
    render();
  }
  [0,300,800,1600,3000,6000].forEach(t=>setTimeout(boot,t));
  new MutationObserver(boot).observe(document.documentElement,{childList:true,subtree:true});
})();</script>`;
const marker='<script id="canvasflow-mobile-ai-direct-submit-fix">';
const start=s.indexOf(marker);
if(start>=0){const end=s.indexOf('</script>',start);if(end>=0)s=s.slice(0,start)+js+s.slice(end+9);}else{s=s.replace('</body>',js+'\n</body>');}
fs.writeFileSync(file,s,'utf8');
console.log('CanvasFlow: direct mobile AI submit installed.');
