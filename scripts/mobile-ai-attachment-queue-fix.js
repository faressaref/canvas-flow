import fs from "node:fs";

const file = "public/index.html";
let s = fs.readFileSync(file, "utf8");

const js = `<script id="canvasflow-mobile-ai-attachment-queue-fix">(function(){
  let installed=false;
  function setup(){
    const picker=document.getElementById('canvasflowMobileFileInput');
    const input=document.getElementById('lessonInput');
    const images=document.getElementById('lessonImages');
    const chat=document.getElementById('canvasflowMobileChat');
    if(!picker||!input||!images||!chat||installed)return;
    const composer=chat.querySelector('.cf-mobile-composer');
    const attach=chat.querySelector('.cf-mobile-attach');
    const send=chat.querySelector('.cf-mobile-send');
    const messages=chat.querySelector('.cf-mobile-messages');
    if(!composer||!attach||!send||!messages)return;
    let pending=[];
    let bar=document.getElementById('canvasflowMobilePendingFiles');
    if(!bar){
      bar=document.createElement('div');bar.id='canvasflowMobilePendingFiles';
      bar.setAttribute('aria-live','polite');
      composer.parentElement.insertBefore(bar,composer);
    }
    function render(){
      bar.innerHTML='';
      pending.forEach((f,i)=>{
        const chip=document.createElement('div');chip.className='cf-pending-file';
        const name=document.createElement('span');name.textContent='📎 '+f.name;
        const remove=document.createElement('button');remove.type='button';remove.textContent='×';remove.title='إزالة الملف';
        remove.onclick=()=>{pending.splice(i,1);render();};
        chip.append(name,remove);bar.appendChild(chip);
      });
      bar.style.display=pending.length?'flex':'none';
    }
    picker.onchange=()=>{
      const files=Array.from(picker.files||[]);
      if(!files.length)return;
      files.forEach(f=>{if(!pending.some(x=>x.name===f.name&&x.size===f.size&&x.lastModified===f.lastModified))pending.push(f);});
      render();
      picker.value='';
    };
    attach.onclick=e=>{e.preventDefault();e.stopPropagation();picker.value='';picker.click();};
    const oldSend=send.onclick;
    send.onclick=e=>{
      e.preventDefault();e.stopPropagation();
      if(!pending.length){if(typeof oldSend==='function')oldSend.call(send,e);return;}
      try{
        const dt=new DataTransfer();pending.forEach(f=>dt.items.add(f));images.files=dt.files;
        images.dispatchEvent(new Event('change',{bubbles:true}));
      }catch(_){return;}
      const text=input.value.trim();
      const button=chat.parentElement.querySelector('.ai-actions [data-ai="explain"]');
      if(text&&messages){const b=document.createElement('div');b.className='cf-mobile-bubble user';b.textContent=text;messages.appendChild(b);messages.scrollTop=messages.scrollHeight;}
      pending=[];render();input.value='';
      if(button)button.click();
    };
    const style=document.createElement('style');style.textContent=`#canvasflowMobilePendingFiles{display:none;flex-wrap:wrap;gap:4px;max-height:42px;overflow:auto;margin:0 0 4px;padding:2px 0}.cf-pending-file{display:flex;align-items:center;gap:5px;max-width:100%;padding:4px 7px;border:1px solid #dfe4ea;border-radius:9px;background:#f7f8fa;color:#39424e;font-size:10px;direction:rtl}.cf-pending-file span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.cf-pending-file button{border:0;background:transparent;color:#a33;font-size:15px;cursor:pointer;padding:0 2px}`;
    document.head.appendChild(style);
    installed=true;
  }
  setup();[150,400,800,1500,3000,5000].forEach(t=>setTimeout(setup,t));
  new MutationObserver(setup).observe(document.documentElement,{childList:true,subtree:true});
})();</script>`;

const marker='<script id="canvasflow-mobile-ai-attachment-queue-fix">';
const start=s.indexOf(marker);
if(start>=0){const end=s.indexOf('</script>',start);if(end>=0)s=s.slice(0,start)+js+s.slice(end+9);}
else s=s.replace('</body>',js+'\n</body>');
fs.writeFileSync(file,s,'utf8');
console.log('CanvasFlow: AI attachments now wait above chat until prompt send.');
