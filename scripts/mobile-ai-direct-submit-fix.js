import fs from 'node:fs';

const file = 'public/index.html';
let html = fs.readFileSync(file, 'utf8');

const script = `<script id="canvasflow-mobile-ai-direct-submit-fix">(function(){
'use strict';
const mobile=()=>window.matchMedia('(max-width:760px), (max-height:520px) and (max-width:900px)').matches;
let files=[];
let picker=null;
let bar=null;
function ui(){
 if(!mobile())return null;
 const chat=document.getElementById('canvasflowMobileChat');
 if(!chat)return null;
 const composer=chat.querySelector('.cf-mobile-composer');
 const attach=chat.querySelector('.cf-mobile-attach');
 const send=chat.querySelector('.cf-mobile-send');
 const input=document.getElementById('lessonInput');
 const images=document.getElementById('lessonImages');
 return composer&&attach&&send&&input&&images?{chat,composer,attach,send,input,images}:null;
}
function render(){
 if(!bar)return;
 bar.replaceChildren();
 bar.style.setProperty('display',files.length?'flex':'none','important');
 files.forEach((file,index)=>{
  const chip=document.createElement('div');
  chip.style.cssText='display:flex;align-items:center;gap:6px;max-width:100%;padding:6px 8px;border:1px solid #d6dce4;border-radius:9px;background:#fff;color:#303844;font-size:11px;direction:ltr;';
  const label=document.createElement('span');label.textContent='📎 '+file.name;label.style.cssText='overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:calc(100vw - 145px);';
  const remove=document.createElement('button');remove.type='button';remove.textContent='×';remove.setAttribute('aria-label','حذف الملف');remove.style.cssText='width:27px;height:27px;border:0;border-radius:8px;background:#18202a;color:#fff;font-size:19px;line-height:20px;flex:0 0 27px;';
  remove.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();files.splice(index,1);render();},true);
  chip.append(label,remove);bar.append(chip);
 });
}
function install(){
 const x=ui();
 if(!x||x.chat.dataset.realQueue==='1')return;
 x.chat.dataset.realQueue='1';
 bar=document.createElement('div');bar.id='canvasflowRealPendingFiles';bar.style.cssText='display:none;align-items:center;flex-wrap:wrap;gap:6px;padding:7px;margin:0 0 6px;border:1px solid #dfe4ea;border-radius:11px;background:#f7f8fa;direction:rtl;max-height:82px;overflow:auto;';x.composer.parentNode.insertBefore(bar,x.composer);
 picker=document.createElement('input');picker.type='file';picker.multiple=true;picker.accept='image/*,.pdf,.txt,.doc,.docx,.ppt,.pptx';picker.style.cssText='position:fixed;left:-9999px;width:1px;height:1px;opacity:0;';document.body.appendChild(picker);
 document.addEventListener('click',e=>{if(!mobile())return;const target=e.target.closest?.('.cf-mobile-attach');if(target!==x.attach)return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();picker.value='';picker.click();},true);
 picker.addEventListener('change',()=>{for(const f of Array.from(picker.files||[])){if(!files.some(v=>v.name===f.name&&v.size===f.size&&v.lastModified===f.lastModified))files.push(f);}picker.value='';render();});
 const clean=x.send.cloneNode(true);x.send.replaceWith(clean);
 const send=x.chat.querySelector('.cf-mobile-send');
 const submit=e=>{e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();const command=x.input.value.trim();if(!files.length){x.input.placeholder='ارفع الصورة أو الملف الأول 📎';return;}if(!command){x.input.placeholder='اكتب البرومبت ثم اضغط إرسال';x.input.focus();return;}const selected=files.slice();try{const dt=new DataTransfer();selected.forEach(f=>dt.items.add(f));x.images.files=dt.files;}catch(err){console.warn('CanvasFlow queue:',err);}window.lessonImageFiles=selected.filter(f=>f.type.startsWith('image/'));files=[];render();x.input.value='';setTimeout(()=>{if(typeof window.runAI==='function')window.runAI('explain');},30);};
 send.addEventListener('click',submit,true);
 x.input.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey)submit(e);},true);
 render();
}
[0,200,500,1000,2000,4000,7000].forEach(t=>setTimeout(install,t));
new MutationObserver(install).observe(document.documentElement,{subtree:true,childList:true});
})();</script>`;
const marker='<script id="canvasflow-mobile-ai-direct-submit-fix">';
const start=html.indexOf(marker);
if(start>=0){const end=html.indexOf('</script>',start);if(end>=0)html=html.slice(0,start)+script+html.slice(end+9);}else html=html.replace('</body>',script+'\\n</body>');
fs.writeFileSync(file,html,'utf8');
console.log('CanvasFlow: installed real visible mobile pending-file queue.');
