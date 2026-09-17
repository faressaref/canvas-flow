import fs from 'node:fs';

const file = 'public/index.html';
if (!fs.existsSync(file)) throw new Error(`Missing ${file}`);

let html = fs.readFileSync(file, 'utf8');
const marker = '<style id="canvasflow-mobile-landscape-reference-final">';
const start = html.indexOf(marker);
if (start === -1) {
  console.log('mobile landscape reference block not found; nothing to reorder');
  process.exit(0);
}

// Move the reference block to the absolute end of the document so it wins over
// legacy styles accidentally appended after </html>.
let end = html.indexOf('</script>', start);
if (end === -1) throw new Error('Could not find end of mobile landscape reference block');
end += '</script>'.length;

const block = html.slice(start, end);
html = html.slice(0, start) + html.slice(end);
html = html.trimEnd() + '\n\n' + block + '\n';

// The existing desktop-isolation CSS uses min-width:901px, which incorrectly
// catches large phones in landscape (for example ~930px wide x ~430px tall).
// Add one final short-screen override that uses height only, preserving the
// uploaded mobile reference UI while leaving the AI implementation untouched.
const hardPhoneBlock = `
<style id="canvasflow-short-landscape-reference-hard-lock">
@media screen and (max-height:520px){
  html,body{width:100%;height:100%;min-width:0;max-width:100%;overflow:hidden;overscroll-behavior:none;}

  /* Large phones in landscape must use the mobile UI even when width > 900px. */
  #topbar,
  #hint,#zoom,#tabletControls,#tabletAccount,
  .device-switch,#pcMode,#tabletMode,
  #mobileDock,#mobileQuick,#mobilePages,#mobileAI,#mobileSaveState,
  #mobileV2More,#mobileV2Menu{
    pointer-events:none !important;
  }
  #topbar{display:none !important;visibility:hidden !important;}
  #hint,#zoom,#tabletControls,#tabletAccount{display:none !important;visibility:hidden !important;}
  .device-switch,#pcMode,#tabletMode{display:none !important;visibility:hidden !important;}
  #mobileDock,#mobileQuick,#mobilePages,#mobileAI,#mobileSaveState,#mobileV2More,#mobileV2Menu{display:none !important;visibility:hidden !important;}

  #mobilePhoneHeader{
    display:flex !important;
    position:fixed !important;
    top:0 !important;left:0 !important;right:0 !important;
    height:50px !important;
    z-index:2147483000 !important;
    align-items:center !important;
    justify-content:space-between !important;
    padding:6px 10px !important;
    box-sizing:border-box !important;
    background:rgba(255,255,255,.96) !important;
    border-bottom:1px solid #dfe4ea !important;
    backdrop-filter:blur(16px) !important;
    -webkit-backdrop-filter:blur(16px) !important;
    pointer-events:auto !important;
  }
  #mobilePhoneHeader .mbrand{display:block !important;font:900 16px/1 system-ui,sans-serif !important;color:#18202a !important;letter-spacing:-.6px !important;}
  #mobilePhoneHeader .mbrand span{color:#5b63ff !important;}
  #mobilePhoneHeader .mtools{display:flex !important;gap:6px !important;}
  #mobilePhoneHeader button{display:flex !important;align-items:center !important;justify-content:center !important;width:auto !important;min-width:38px !important;height:36px !important;padding:0 9px !important;border:1px solid #dfe4ea !important;border-radius:11px !important;background:#fff !important;color:#39424e !important;font:800 11px/1 system-ui,sans-serif !important;box-shadow:0 3px 12px rgba(0,0,0,.06) !important;gap:4px !important;pointer-events:auto !important;}

  #mobileV2Bar{
    display:flex !important;
    position:fixed !important;
    top:auto !important;
    bottom:max(6px,env(safe-area-inset-bottom)) !important;
    left:10px !important;right:10px !important;width:auto !important;
    height:54px !important;
    z-index:2147483001 !important;
    box-sizing:border-box !important;
    padding:4px !important;gap:4px !important;align-items:stretch !important;
    background:rgba(255,255,255,.97) !important;
    border:1px solid #dfe4ea !important;
    border-radius:18px !important;
    box-shadow:0 9px 30px rgba(0,0,0,.16) !important;
    overflow-x:auto !important;overflow-y:hidden !important;flex-wrap:nowrap !important;
    justify-content:flex-start !important;
    -webkit-overflow-scrolling:touch !important;scrollbar-width:none !important;
    white-space:nowrap !important;touch-action:pan-x !important;
    pointer-events:auto !important;
  }
  #mobileV2Bar::-webkit-scrollbar{display:none !important;}
  #mobileV2Bar>button,#mobileV2Bar>label{
    display:flex !important;flex:0 0 58px !important;min-width:58px !important;width:58px !important;max-width:58px !important;height:46px !important;margin:0 !important;padding:2px !important;border:0 !important;border-radius:13px !important;background:transparent !important;color:#4b5563 !important;flex-direction:column !important;align-items:center !important;justify-content:center !important;gap:1px !important;font:800 7px/1 system-ui,sans-serif !important;box-sizing:border-box !important;pointer-events:auto !important;touch-action:manipulation !important;
  }
  #mobileV2Bar>button .v2icon,#mobileV2Bar>label .v2icon{font-size:19px !important;line-height:19px !important;}
  #mobileV2Bar>button.active{background:#18202a !important;color:#fff !important;}
  #mobileV2Bar #mobileV2Scroll{display:flex !important;background:#fff !important;color:#39424e !important;border:1px solid #dfe4ea !important;}
  #mobileV2Bar #mobileV2Scroll.active{background:#18202a !important;color:#fff !important;border-color:#18202a !important;}
  #mobileV2Bar .mobile-v2-color{display:flex !important;flex:0 0 58px !important;min-width:58px !important;width:58px !important;height:46px !important;border:1px solid #dfe4ea !important;border-radius:13px !important;padding:5px !important;background:#fff !important;box-sizing:border-box !important;align-items:center !important;justify-content:center !important;pointer-events:auto !important;}
  #mobileV2Bar .mobile-v2-color input{width:100% !important;height:100% !important;border:0 !important;padding:0 !important;background:transparent !important;display:block !important;pointer-events:auto !important;}

  #canvasWrap{padding-top:50px !important;padding-bottom:66px !important;box-sizing:border-box !important;}

  #mobileQuickPenColors{display:flex !important;}
  #mobileLandscapeSideFullscreen{display:flex !important;}
}
</style>

<script id="canvasflow-short-landscape-reference-hard-lock-js">
(function(){
  'use strict';
  const isShortLandscape = () => window.matchMedia('(max-height:520px)').matches;
  const bar = document.getElementById('mobileV2Bar');
  if(!bar) return;

  const defs=[
    ['select','↖','Select'],['pen','✎','Pen'],['highlighter','▰','Highlight'],
    ['scroll','↕','Scroll'],['eraser','⌫','Eraser'],['rect','▱','Rectangle'],
    ['circle','○','Circle'],['line','╱','Line'],['arrow','➜','Arrow'],
    ['text','T','Text'],['node','◇','Node'],['image','▧','Image'],['ai','✦','AI']
  ];

  let built=false;
  function build(){
    if(built || !isShortLandscape()) return;
    built=true;
    bar.innerHTML='';
    defs.forEach(([name,icon,label])=>{
      const b=document.createElement('button');
      b.type='button'; b.dataset.v2Tool=name;
      b.innerHTML=`<span class="v2icon">${icon}</span><span>${label}</span>`;
      b.addEventListener('click',function(e){
        e.preventDefault(); e.stopPropagation();
        if(name==='ai'){
          const panel=document.getElementById('aiPanel');
          if(panel){
            const open=!panel.classList.contains('open');
            panel.classList.toggle('open',open);
            document.getElementById('aiToggle')?.classList.toggle('active',open);
          }
          return;
        }
        if(name==='scroll'){
          window.__mobileScrollOn=!window.__mobileScrollOn;
          if(typeof setTabletScrollMode==='function') setTabletScrollMode(window.__mobileScrollOn);
          sync();
          return;
        }
        if(name==='image'){
          const c=typeof canvas!=='undefined' && canvas.getCenter ? canvas.getCenter() : {left:0,top:0};
          window.pendingImagePoint={x:c.left,y:c.top};
          const input=document.getElementById('fileInput');
          if(input){input.value='';input.click();}
          if(typeof setTool==='function') setTool('select');
          return;
        }
        if(typeof setTabletScrollMode==='function') setTabletScrollMode(false);
        if(typeof setTool==='function') setTool(name);
        sync();
      });
      bar.appendChild(b);
    });

    const font=document.createElement('label');
    font.className='mobile-v2-font';
    font.setAttribute('aria-label','Font size');
    font.innerHTML='<span class="v2icon">A</span><input id="mobileV2FontLandscapeHard" type="range" min="10" max="72" value="22" aria-label="Font size"><span class="font-value">22</span>';
    const fi=font.querySelector('input');
    const mobileFont=document.getElementById('mobileFontSize');
    if(fi && mobileFont) fi.value=mobileFont.value;
    fi?.addEventListener('input',()=>{
      if(mobileFont){mobileFont.value=fi.value;mobileFont.dispatchEvent(new Event('input',{bubbles:true}));}
      const out=font.querySelector('.font-value'); if(out) out.textContent=fi.value;
    });
    bar.appendChild(font);

    const color=document.createElement('label');
    color.className='mobile-v2-color';
    color.setAttribute('aria-label','Color');
    color.innerHTML='<span class="v2icon">●</span><input id="mobileV2ColorLandscapeHard" type="color" aria-label="Color">';
    const ci=color.querySelector('input');
    const dc=document.getElementById('color');
    if(ci && dc) ci.value=dc.value;
    ci?.addEventListener('input',()=>{if(dc){dc.value=ci.value;dc.dispatchEvent(new Event('input',{bubbles:true}));dc.dispatchEvent(new Event('change',{bubbles:true}));}});
    bar.appendChild(color);
  }

  function sync(){
    if(!isShortLandscape()) return;
    build();
    bar.querySelectorAll('[data-v2-tool]').forEach(b=>{
      const active=(typeof tool==='string' && b.dataset.v2Tool===tool) || (b.dataset.v2Tool==='scroll' && !!window.__mobileScrollOn) || (b.dataset.v2Tool==='ai' && !!document.getElementById('aiPanel')?.classList.contains('open'));
      b.classList.toggle('active',active);
    });
    bar.style.display='flex';
  }

  sync();
  window.addEventListener('resize',()=>setTimeout(sync,40),{passive:true});
  window.addEventListener('orientationchange',()=>setTimeout(sync,80),{passive:true});
  new MutationObserver(sync).observe(bar,{childList:true,subtree:true});
})();
</script>
`;

html = html.trimEnd() + '\n\n' + hardPhoneBlock;
fs.writeFileSync(file, html, 'utf8');
console.log('mobile landscape reference hard-lock appended; AI untouched');
