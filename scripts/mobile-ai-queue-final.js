import fs from 'node:fs';

const file = 'public/index.html';
let html = fs.readFileSync(file, 'utf8');

const js = `<script id="canvasflow-mobile-ai-queue-final">(function(){
'use strict';
const isMobile=()=>window.matchMedia('(max-width:760px), (max-height:520px) and (max-width:900px)').matches;
let queue=[];let picker=null;let list=null;let input=null;let chat=null;let busy=false;
function setup(){
 if(!isMobile())return;
 chat=document.getElementById('canvasflowMobileChat');
 const composer=chat?.querySelector('.cf-mobile-composer');
 input=document.getElementById('lessonInput');
 if(!chat||!composer||!input||chat.dataset.normalChat==='1')return;
 chat.dataset.normalChat='1';
 list=document.createElement('div');list.id='cfFinalMobileQueue';
 list.style.cssText='display:none;align-items:center;flex-wrap:wrap;gap:6px;padding:7px;margin:0 0 6px;border:1px solid #dfe4ea;border-radius:11px;background:#f7f8fa;direction:rtl;max-height:85px;overflow:auto;';
 composer.parentNode.insertBefore(list,composer);
 picker=document.createElement('input');picker.type='file';picker.multiple=true;picker.accept='image/*,.pdf,.txt,.doc,.docx,.ppt,.pptx';picker.style.cssText='position:fixed;left:-10000px;top:0;width:1px;height:1px;opacity:0;';document.body.appendChild(picker);
 function render(){list.replaceChildren();list.style.setProperty('display',queue.length?'flex':'none','important');queue.forEach((f,i)=>{const chip=document.createElement('div');chip.style.cssText='display:flex;align-items:center;gap:6px;max-width:100%;padding:6px 8px;border:1px solid #d6dce4;border-radius:9px;background:#fff;color:#303844;font-size:11px;direction:ltr;';const name=document.createElement('span');name.textContent='📎 '+f.name;name.style.cssText='overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:calc(100vw - 150px);';const x=document.createElement('button');x.type='button';x.textContent='×';x.style.cssText='width:27px;height:27px;border:0;border-radius:8px;background:#18202a;color:#fff;font-size:19px;flex:0 0 27px;';x.onclick=e=>{e.preventDefault();e.stopPropagation();queue.splice(i,1);render();};chip.append(name,x);list.append(chip);});}
 function attach(e){const b=e.target.closest?.('.cf-mobile-attach');if(!b||!chat.contains(b))return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();picker.value='';picker.click();}
 picker.addEventListener('change',()=>{for(const f of Array.from(picker.files||[])){if(!queue.some(q=>q.name===f.name&&q.size===f.size&&q.lastModified===f.lastModified))queue.push(f);}render();});
 function syncFiles(){try{const dt=new DataTransfer();queue.forEach(f=>dt.items.add(f));const images=document.getElementById('lessonImages');if(images){images.files=dt.files;images.dispatchEvent(new Event('change',{bubbles:true}));}window.lessonImageFiles=queue.filter(f=>f.type&&f.type.startsWith('image/'));window.canvasflowMobileAttachments=queue.slice();}catch(err){console.warn('CanvasFlow attachments:',err);}}
 function run(mode='explain'){if(busy)return;busy=true;syncFiles();const text=input.value.trim();if(text){const messages=chat.querySelector('.cf-mobile-messages');if(messages){const b=document.createElement('div');b.className='cf-mobile-bubble user';b.textContent=text;messages.appendChild(b);messages.scrollTop=messages.scrollHeight;}}if(typeof window.runAI==='function'){Promise.resolve(window.runAI(mode)).finally(()=>{queue=[];render();input.value='';busy=false;});}else{queue=[];render();input.value='';busy=false;}}
 function send(e){const b=e.target.closest?.('.cf-mobile-send');if(!b||!chat.contains(b))return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();run('explain');}
 function shortcut(e){const b=e.target.closest?.('.ai-action');if(!b||!chat.contains(b))return;const mode=b.getAttribute('data-ai')||'explain';e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();run(mode);}
 document.addEventListener('pointerdown',attach,true);document.addEventListener('click',attach,true);
 document.addEventListener('pointerdown',send,true);document.addEventListener('click',send,true);
 document.addEventListener('pointerdown',shortcut,true);document.addEventListener('click',shortcut,true);
 input.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();run('explain');}},true);
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
console.log('CanvasFlow: mobile AI attachment handoff fixed.');
