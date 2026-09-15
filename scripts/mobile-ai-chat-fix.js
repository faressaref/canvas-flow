import fs from "node:fs";

const file = "public/index.html";
let s = fs.readFileSync(file, "utf8");

const js = `<script id="canvasflow-mobile-ai-chat-fix">(function(){
  const isMobile=()=>window.matchMedia('(max-width:760px), (max-height:520px) and (max-width:900px)').matches;
  function setup(){
    if(!isMobile() || document.getElementById('canvasflowMobileChatComposer')) return;
    const panel=document.getElementById('aiPanel');
    const body=panel?.querySelector('.ai-body');
    const input=document.getElementById('lessonInput');
    const images=document.getElementById('lessonImages');
    const drop=document.getElementById('lessonDrop');
    const actions=panel?.querySelector('.ai-actions');
    const result=document.getElementById('aiResult');
    if(!panel||!body||!input) return;

    const composer=document.createElement('div');
    composer.id='canvasflowMobileChatComposer';
    composer.innerHTML='<button type="button" class="cf-chat-image" title="إرفاق صورة أو ملف">📎</button><div class="cf-chat-input"></div><button type="button" class="cf-chat-send" title="إرسال">➤</button>';
    composer.querySelector('.cf-chat-input').appendChild(input);
    body.appendChild(composer);

    // Chat-style attachment button. Images continue through the existing
    // lessonImages pipeline; other files are shown as an attachment chip.
    const attach=composer.querySelector('.cf-chat-image');
    const fileInput=document.createElement('input');
    fileInput.type='file';
    fileInput.accept='image/*,.pdf,.txt,.doc,.docx,.ppt,.pptx';
    fileInput.style.display='none';
    fileInput.id='canvasflowChatFileInput';
    document.body.appendChild(fileInput);

    attach.onclick=e=>{
      e.preventDefault();e.stopPropagation();
      fileInput.value='';
      fileInput.click();
    };
    fileInput.onchange=()=>{
      const file=fileInput.files&&fileInput.files[0];
      if(!file) return;
      if(file.type.startsWith('image/')){
        // Use the original image input so the existing AI image processing is untouched.
        try{
          const dt=new DataTransfer();
          dt.items.add(file);
          images.files=dt.files;
          images.dispatchEvent(new Event('change',{bubbles:true}));
        }catch(_){ images?.click(); }
      }else{
        let chip=document.getElementById('canvasflowChatAttachment');
        if(!chip){
          chip=document.createElement('div');
          chip.id='canvasflowChatAttachment';
          chip.className='cf-chat-attachment';
          composer.parentElement.insertBefore(chip,composer);
        }
        chip.textContent='📎 '+file.name;
        chip.title=file.name;
        if(file.type==='text/plain'){
          const reader=new FileReader();
          reader.onload=()=>{input.value=String(reader.result||'').slice(0,12000);input.dispatchEvent(new Event('input',{bubbles:true}));};
          reader.readAsText(file);
        }
      }
    };

    composer.querySelector('.cf-chat-send').onclick=e=>{
      e.preventDefault();e.stopPropagation();
      const b=actions?.querySelector('[data-ai="explain"]');
      if(b) b.click();
    };

    if(drop) drop.style.display='none';
    if(result){
      result.classList.add('cf-chat-messages');
      if(result.classList.contains('empty')) result.textContent='ابدأ المحادثة 👋\nابعت سؤالك أو ارفع صورة/ملف من 📎.';
    }
    actions?.classList.add('cf-chat-actions');
  }
  setup();
  setTimeout(setup,300);setTimeout(setup,1000);
  window.addEventListener('orientationchange',()=>setTimeout(setup,150),{passive:true});
})();</script>`;

const marker='<script id="canvasflow-mobile-ai-chat-fix">';
const start=s.indexOf(marker);
if(start>=0){const end=s.indexOf('</script>',start);if(end>=0)s=s.slice(0,start)+js+s.slice(end+9);}
else s=s.replace('</body>',js+'\n</body>');

const css=`<style id="canvasflow-mobile-ai-chat-css">
@media screen and (max-width:760px), screen and (max-height:520px) and (max-width:900px){
  #aiPanel{height:42dvh!important;max-height:42dvh!important;min-height:190px!important;z-index:99999!important;overflow:hidden!important;}
  #aiPanel .ai-head{padding:7px 9px!important;}
  #aiPanel .ai-body{display:flex!important;flex-direction:column!important;gap:5px!important;min-height:0!important;overflow:hidden!important;padding:7px!important;}
  #aiPanel .ai-body>.ai-label,#aiPanel #lessonDrop,#aiPanel .ai-settings{display:none!important;}
  #aiPanel #lessonPreviews{display:flex!important;flex:0 0 auto!important;max-height:44px!important;margin:0!important;}
  #aiPanel #lessonPreviews:empty{display:none!important;}
  #aiPanel .ai-actions{order:2!important;display:flex!important;flex:0 0 34px!important;flex-wrap:nowrap!important;gap:4px!important;overflow-x:auto!important;overflow-y:hidden!important;margin:0!important;padding:1px 0!important;scrollbar-width:none!important;}
  #aiPanel .ai-actions::-webkit-scrollbar{display:none!important;}
  #aiPanel .ai-action{flex:0 0 auto!important;width:auto!important;min-width:0!important;padding:7px 9px!important;border-radius:18px!important;font-size:8px!important;white-space:nowrap!important;background:#fff!important;}
  #aiPanel .ai-action b{display:inline!important;font-size:8px!important;margin:0!important;}
  #aiPanel .ai-action span{display:none!important;}
  #aiPanel #aiResult{order:1!important;flex:1 1 auto!important;min-height:55px!important;max-height:none!important;margin:0!important;padding:9px 10px!important;border-radius:13px!important;font-size:10px!important;line-height:1.6!important;overflow:auto!important;background:#fafbfc!important;}
  #aiPanel #aiStatus{order:3!important;flex:0 0 auto!important;font-size:7px!important;margin:0!important;min-height:9px!important;}
  #canvasflowMobileChatComposer{order:4!important;display:flex!important;align-items:center!important;gap:5px!important;flex:0 0 42px!important;border:1px solid #dfe4ea!important;border-radius:13px!important;background:#fff!important;padding:4px!important;}
  #canvasflowMobileChatComposer .cf-chat-input{flex:1 1 auto!important;min-width:0!important;}
  #canvasflowMobileChatComposer #lessonInput{display:block!important;width:100%!important;height:32px!important;min-height:32px!important;max-height:32px!important;resize:none!important;border:0!important;background:transparent!important;box-shadow:none!important;padding:7px 6px!important;margin:0!important;font-size:12px!important;outline:none!important;}
  #canvasflowMobileChatComposer button{flex:0 0 32px!important;width:32px!important;height:32px!important;border:0!important;border-radius:10px!important;display:flex!important;align-items:center!important;justify-content:center!important;padding:0!important;font-size:16px!important;cursor:pointer!important;}
  #canvasflowMobileChatComposer .cf-chat-image{background:#eef1f5!important;color:#39424e!important;}
  #canvasflowMobileChatComposer .cf-chat-send{background:#18202a!important;color:#fff!important;}
  #canvasflowChatAttachment{flex:0 0 auto!important;max-width:100%!important;overflow:hidden!important;text-overflow:ellipsis!important;white-space:nowrap!important;border:1px solid #dfe4ea!important;border-radius:9px!important;background:#f7f8fa!important;padding:5px 8px!important;font-size:9px!important;color:#39424e!important;}
  #aiPanel .ai-footer{padding:5px 7px!important;flex:0 0 auto!important;}
  #aiPanel .ai-footer button{font-size:7px!important;padding:5px!important;}
  @media (orientation:landscape){
    #aiPanel{height:34dvh!important;max-height:34dvh!important;min-height:175px!important;}
    #aiPanel .ai-head{padding:5px 8px!important;}
    #aiPanel .ai-body{padding:5px!important;gap:4px!important;}
    #aiPanel .ai-actions{flex-basis:30px!important;}
    #aiPanel .ai-footer{display:none!important;}
    #canvasflowMobileChatComposer{flex-basis:38px!important;}
    #canvasflowMobileChatComposer #lessonInput{height:29px!important;min-height:29px!important;max-height:29px!important;font-size:11px!important;}
    #canvasflowMobileChatComposer button{width:29px!important;height:29px!important;flex-basis:29px!important;}
  }
}
</style>`;
const cssMarker='<style id="canvasflow-mobile-ai-chat-css">';
const cs=s.indexOf(cssMarker);
if(cs>=0){const ce=s.indexOf('</style>',cs);if(ce>=0)s=s.slice(0,cs)+css+s.slice(ce+8);}
else s=s.replace('</head>',css+'\n</head>');

fs.writeFileSync(file,s);
console.log('CanvasFlow: restored mobile AI chat composer with paperclip attachments.');
