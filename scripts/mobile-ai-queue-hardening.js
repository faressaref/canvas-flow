import fs from 'node:fs';

const file = 'public/index.html';
let html = fs.readFileSync(file, 'utf8');

const js = `<script id="canvasflow-mobile-ai-queue-hardening">(function(){
'use strict';
const mobile=()=>window.matchMedia('(max-width:760px), (max-height:520px) and (max-width:900px)').matches;
function setup(){
  if(!mobile()) return;
  const chat=document.getElementById('canvasflowMobileChat');
  const input=document.getElementById('lessonInput');
  const send=chat?.querySelector('.cf-mobile-send');
  if(!chat||!input||!send||chat.dataset.queueHardened==='1') return;
  chat.dataset.queueHardened='1';
  const legacy=document.getElementById('canvasflowMobileFileInput');
  if(legacy) legacy.remove();
  input.addEventListener('keydown',function(e){
    if(e.key==='Enter'&&!e.shiftKey){
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      send.click();
    }
  },true);
}
[0,300,800,1500,3000,6000].forEach(t=>setTimeout(setup,t));
new MutationObserver(setup).observe(document.documentElement,{childList:true,subtree:true});
})();</script>`;
const marker='<script id="canvasflow-mobile-ai-queue-hardening">';
const start=html.indexOf(marker);
if(start>=0){const end=html.indexOf('</script>',start);if(end>=0)html=html.slice(0,start)+js+html.slice(end+9);}
else html=html.replace('</body>',js+'\\n</body>');
fs.writeFileSync(file,html,'utf8');
console.log('CanvasFlow: mobile AI queue hardened.');
