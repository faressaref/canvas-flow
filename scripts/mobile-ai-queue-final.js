import fs from 'node:fs';

const file = 'public/index.html';
let html = fs.readFileSync(file, 'utf8');

const js = `<script id="canvasflow-mobile-ai-queue-final">(function(){
'use strict';
const isMobile=()=>window.matchMedia('(max-width:760px), (max-height:520px) and (max-width:900px)').matches;
let queue=[];let picker;let list;let input;
function setup(){
 if(!isMobile())return;
 const chat=document.getElementById('canvasflowMobileChat');
 const composer=chat?.querySelector('.cf-mobile-composer');
 input=document.getElementById('lessonInput');
 if(!chat||!composer||!input||chat.dataset.queueFinal==='1')return;
 chat.dataset.queueFinal='1';
 list=document.createElement('div');list.id='cfFinalMobileQueue';
 list.style.cssText='display:none;align-items:center;flex-wrap:wrap;gap:6px;padding:7px;margin:0 0 6px;border:1px solid #dfe4ea;border-radius:11px;background:#f7f8fa;direction:rtl;max-height:85px;overflow:auto;';
 composer.parentNode.insertBefore(list,composer);
 picker=document.createElement('input');picker.type='file';picker.multiple=true;picker.accept='image/*,.pdf,.txt,.doc,.docx,.ppt,.pptx';picker.style.cssText='position:fixed;left:-10000px;top:0;width:1px;height:1px;opacity:0;';document.body.appendChild(picker);
 function render(){list.replaceChildren();list.style.setProperty('display',queue.length?'flex':'none','important');queue.forEach((f,i)=>{const chip=document.createElement('div');chip.style.cssText='display:flex;align-items:center;gap:6px;max-width:100%;padding:6px 8px;border:1px solid #d6dce4;border-radius:9px;background:#fff;color:#303844;font-size:11px;direction:ltr;';const name=document.createElement('span');name.textContent='📎 '+f.name;name.style.cssText='overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:calc(100vw - 150px);';const x=document.createElement('button');x.type='button';x.textContent='×';x.style.cssText='width:27px;height:27px;border:0;border-radius:8px;background:#18202a;color:#fff;font-size:19px;flex:0 0 27px;';x.onclick=e=>{e.preventDefault();e.stopPropagation();queue.splice(i,1);render();};chip.append(name,x);list.append(chip);});}
 function openPicker(e){if(!isMobile())return;const b=e.target.closest?.('.cf-mobile-attach');if(!b||!chat.contains(b))return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();picker.value='';picker.click();}
 document.addEventListener('pointerdown',openPicker,true);document.addEventListener('click',openPicker,true);
 picker.addEventListener('change',()=>{for(const f of Array.from(picker.files||[])){if(!queue.some(q=>q.name===f.name&&q.size===f.size&&q.lastModified===f.lastModified))queue.push(f);}picker.value='';render();});
 function send(e){const b=e.target.closest?.('.cf-mobile-send');if(!b||!chat.contains(b))return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();const command=input.value.trim();if(!queue.length){input.placeholder='ارفع الصورة أو الملف الأول 📎';return;}if(!command){input.placeholder='اكتب البرومبت ثم اضغط إرسال';input.focus();return;}const selected=queue.slice();try{const dt=new DataTransfer();selected.forEach(f=>dt.items.add(f));const images=document.getElementById('lessonImages');if(images)images.files=dt.files;window.lessonImageFiles=selected.filter(f=>f.type.startsWith('image/'));}catch(err){console.warn(err);}queue=[];render();input.value='';setTimeout(()=>{if(typeof window.runAI==='function')window.runAI('explain');},0);}
 document.addEventListener('pointerdown',send,true);document.addEventListener('click',send,true);
 render();
}
[0,300,800,1500,3000,6000].forEach(t=>setTimeout(setup,t));
new MutationObserver(setup).observe(document.documentElement,{childList:true,subtree:true});
})();</script>`;
const marker='<script id="canvasflow-mobile-ai-queue-final">';
const start=html.indexOf(marker);
if(start>=0){const end=html.indexOf('</script>',start);if(end>=0)html=html.slice(0,start)+js+html.slice(end+9);}
else html=html.replace('</body>',js+'\\n</body>');
fs.writeFileSync(file,html,'utf8');
console.log('CanvasFlow: final mobile queue installed.');
