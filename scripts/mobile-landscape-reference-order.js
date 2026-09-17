import fs from 'node:fs';

const file = 'public/index.html';
if (!fs.existsSync(file)) throw new Error(`Missing ${file}`);

let html = fs.readFileSync(file, 'utf8');
const marker = '<style id="canvasflow-mobile-landscape-reference-final">';
if (html.includes(marker)) {
  let end = html.indexOf('</script>', html.indexOf(marker));
  if (end === -1) throw new Error('Could not find end of mobile landscape reference block');
  end += '</script>'.length;
  const block = html.slice(html.indexOf(marker), end);
  html = html.slice(0, html.indexOf(marker)) + html.slice(end);
  html = html.trimEnd() + '\n\n' + block + '\n';
}

const finalBlock = `
<style id="canvasflow-mobile-landscape-exact-final">
/* Uploaded mobile landscape reference — AI implementation is intentionally untouched. */
body.cf-phone-landscape #topbar,
body.cf-phone-landscape #hint,
body.cf-phone-landscape #zoom,
body.cf-phone-landscape #tabletControls,
body.cf-phone-landscape #tabletAccount,
body.cf-phone-landscape .device-switch,
body.cf-phone-landscape #mobileDock,
body.cf-phone-landscape #mobileQuick,
body.cf-phone-landscape #mobilePages,
body.cf-phone-landscape #mobileAI,
body.cf-phone-landscape #mobileV2More,
body.cf-phone-landscape #mobileV2Menu{
  display:none !important;visibility:hidden !important;pointer-events:none !important;
}
body.cf-phone-landscape{
  width:100% !important;height:100% !important;min-width:0 !important;max-width:100% !important;
  overflow:hidden !important;overscroll-behavior:none !important;
}
body.cf-phone-landscape #app.entered{
  display:flex !important;width:100% !important;height:100dvh !important;min-height:100dvh !important;overflow:hidden !important;
}
body.cf-phone-landscape #workspace{
  position:relative !important;flex:1 1 auto !important;width:100% !important;height:100% !important;
  min-width:0 !important;min-height:0 !important;overflow:hidden !important;padding:0 !important;
}

body.cf-phone-landscape #mobilePhoneHeader{
  display:flex !important;position:fixed !important;top:0 !important;left:0 !important;right:0 !important;height:50px !important;
  z-index:2147483000 !important;align-items:center !important;justify-content:space-between !important;padding:6px 10px !important;
  box-sizing:border-box !important;background:rgba(255,255,255,.96) !important;border-bottom:1px solid #dfe4ea !important;
  backdrop-filter:blur(16px) !important;-webkit-backdrop-filter:blur(16px) !important;pointer-events:auto !important;
}
body.cf-phone-landscape #mobilePhoneHeader .mbrand{display:block !important;font:900 16px/1 system-ui,sans-serif !important;color:#18202a !important;letter-spacing:-.6px !important;}
body.cf-phone-landscape #mobilePhoneHeader .mbrand span{color:#5b63ff !important;}
body.cf-phone-landscape #mobilePhoneHeader .mtools{display:flex !important;gap:6px !important;}
body.cf-phone-landscape #mobilePhoneHeader button{
  display:flex !important;align-items:center !important;justify-content:center !important;width:auto !important;min-width:38px !important;height:36px !important;
  padding:0 9px !important;border:1px solid #dfe4ea !important;border-radius:11px !important;background:#fff !important;color:#39424e !important;
  font:800 11px/1 system-ui,sans-serif !important;box-shadow:0 3px 12px rgba(0,0,0,.06) !important;gap:4px !important;pointer-events:auto !important;
}

body.cf-phone-landscape #mobileV2Bar{
  display:flex !important;position:fixed !important;top:auto !important;bottom:max(6px,env(safe-area-inset-bottom)) !important;
  left:10px !important;right:10px !important;width:auto !important;height:54px !important;z-index:2147483001 !important;
  box-sizing:border-box !important;padding:4px !important;gap:4px !important;align-items:stretch !important;
  background:rgba(255,255,255,.97) !important;border:1px solid #dfe4ea !important;border-radius:18px !important;
  box-shadow:0 9px 30px rgba(0,0,0,.16) !important;overflow-x:auto !important;overflow-y:hidden !important;flex-wrap:nowrap !important;
  justify-content:flex-start !important;-webkit-overflow-scrolling:touch !important;scrollbar-width:none !important;white-space:nowrap !important;
  touch-action:pan-x !important;pointer-events:auto !important;
}
body.cf-phone-landscape #mobileV2Bar::-webkit-scrollbar{display:none !important;}
body.cf-phone-landscape #mobileV2Bar>button,
body.cf-phone-landscape #mobileV2Bar>label{
  display:flex !important;flex:0 0 58px !important;min-width:58px !important;width:58px !important;max-width:58px !important;height:46px !important;
  margin:0 !important;padding:2px !important;border:0 !important;border-radius:13px !important;background:transparent !important;color:#4b5563 !important;
  flex-direction:column !important;align-items:center !important;justify-content:center !important;gap:1px !important;
  font:800 7px/1 system-ui,sans-serif !important;box-sizing:border-box !important;pointer-events:auto !important;touch-action:manipulation !important;
}
body.cf-phone-landscape #mobileV2Bar>button .v2icon,
body.cf-phone-landscape #mobileV2Bar>label .v2icon{font-size:19px !important;line-height:19px !important;}
body.cf-phone-landscape #mobileV2Bar>button.active{background:#18202a !important;color:#fff !important;}
body.cf-phone-landscape #mobileV2Bar #mobileV2Scroll{display:flex !important;background:#fff !important;color:#39424e !important;border:1px solid #dfe4ea !important;}
body.cf-phone-landscape #mobileV2Bar #mobileV2Scroll.active{background:#18202a !important;color:#fff !important;border-color:#18202a !important;}
body.cf-phone-landscape #mobileV2Bar .mobile-v2-color{
  display:flex !important;flex:0 0 58px !important;width:58px !important;min-width:58px !important;height:46px !important;
  border:1px solid #dfe4ea !important;border-radius:13px !important;padding:5px !important;background:#fff !important;box-sizing:border-box !important;
  align-items:center !important;justify-content:center !important;
}
body.cf-phone-landscape #mobileV2Bar .mobile-v2-color input{width:100% !important;height:100% !important;border:0 !important;padding:0 !important;background:transparent !important;display:block !important;}
body.cf-phone-landscape #canvasWrap{padding-top:50px !important;padding-bottom:66px !important;box-sizing:border-box !important;}

body.cf-phone-landscape #mobileSaveState{
  display:flex !important;visibility:visible !important;opacity:1 !important;position:fixed !important;left:8px !important;right:auto !important;
  top:auto !important;bottom:calc(69px + env(safe-area-inset-bottom)) !important;z-index:2147483647 !important;width:auto !important;min-width:0 !important;
  max-width:110px !important;height:18px !important;padding:2px 6px !important;margin:0 !important;box-sizing:border-box !important;
  align-items:center !important;border:1px solid #dfe4ea !important;border-radius:5px !important;background:rgba(255,255,255,.96) !important;
  box-shadow:0 2px 8px rgba(0,0,0,.10) !important;font-size:8px !important;line-height:12px !important;font-weight:800 !important;
  white-space:nowrap !important;pointer-events:none !important;
}
body.cf-phone-landscape #mobileSaveState.saving{color:#7c5cff !important;}
body.cf-phone-landscape #mobileSaveState.saved{color:#2d8a5b !important;}
body.cf-phone-landscape #mobileSaveState.error{color:#c33b3b !important;}

body.cf-phone-landscape #mobileQuickPenColors{
  display:flex !important;position:fixed !important;left:83px !important;top:auto !important;bottom:66px !important;transform:none !important;
  z-index:2147483640 !important;gap:5px !important;padding:5px !important;border-radius:14px !important;background:rgba(255,255,255,.98) !important;
  border:1px solid #dfe4ea !important;box-shadow:0 8px 24px rgba(0,0,0,.14) !important;pointer-events:auto !important;
}
body.cf-phone-landscape #mobileQuickPenColors button{width:24px !important;height:24px !important;min-width:24px !important;border-radius:50% !important;border:2px solid #fff !important;padding:0 !important;box-shadow:0 1px 5px rgba(0,0,0,.25) !important;}
body.cf-phone-landscape #mobileQuickPenColors button[data-quick-pen-color="#e53935"]{background:#e53935 !important;}
body.cf-phone-landscape #mobileQuickPenColors button[data-quick-pen-color="#111111"]{background:#111111 !important;}
body.cf-phone-landscape #mobileQuickPenColors button[data-quick-pen-color="#1976d2"]{background:#1976d2 !important;}

body.cf-phone-landscape #mobileLandscapeSideFullscreen{
  display:flex !important;position:fixed !important;left:8px !important;top:50% !important;transform:translateY(-50%) !important;z-index:2147483642 !important;
  width:48px !important;height:48px !important;border:1px solid #dfe4ea !important;border-radius:13px !important;background:rgba(255,255,255,.96) !important;
  color:#39424e !important;box-shadow:0 7px 22px rgba(0,0,0,.16) !important;align-items:center !important;justify-content:center !important;
  flex-direction:column !important;gap:1px !important;font:800 7px/1 system-ui,sans-serif !important;cursor:pointer !important;padding:3px !important;
  backdrop-filter:blur(10px) !important;-webkit-backdrop-filter:blur(10px) !important;
}
body.cf-phone-landscape #mobileLandscapeSideFullscreen .v2icon{font-size:20px !important;line-height:20px !important;}
body.cf-phone-landscape #mobileLandscapeSideFullscreen.active{background:#18202a !important;color:#fff !important;border-color:#18202a !important;}
body.landing-active.cf-phone-landscape #mobilePhoneHeader,
body.landing-active.cf-phone-landscape #mobileV2Bar,
body.landing-active.cf-phone-landscape #mobileLandscapeSideFullscreen,
body.landing-active.cf-phone-landscape #mobileSaveState,
body.landing-active.cf-phone-landscape #mobileQuickPenColors{display:none !important;}
body.cf-phone-landscape.mobile-css-fullscreen #mobilePhoneHeader,
body.cf-phone-landscape.mobile-css-fullscreen #mobileV2Bar,
body.cf-phone-landscape.mobile-css-fullscreen #mobileSaveState{display:none !important;}
</style>

<script id="canvasflow-mobile-landscape-exact-final-js">
(function(){
  'use strict';
  const bar=document.getElementById('mobileV2Bar');
  if(!bar) return;
  const defs=[['select','↖','Select'],['pen','✎','Pen'],['highlighter','▰','Highlight'],['scroll','↕','Scroll'],['eraser','⌫','Eraser'],['rect','▱','Rectangle'],['circle','○','Circle'],['line','╱','Line'],['arrow','➜','Arrow'],['text','T','Text'],['node','◇','Node'],['image','▧','Image'],['ai','✦','AI']];
  const isPhoneLandscape=()=>window.matchMedia('(orientation: landscape)').matches && (window.matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints>0) && window.matchMedia('(hover: none)').matches && Math.max(innerWidth,innerHeight)<=1100 && Math.min(innerWidth,innerHeight)<=700;
  let original='';
  let on=false;

  function setActive(name){
    bar.querySelectorAll('[data-v2-tool]').forEach(b=>b.classList.toggle('active',b.dataset.v2Tool===name));
    bar.querySelector('[data-v2-tool="scroll"]')?.classList.toggle('active',!!window.__mobileScrollOn);
    bar.querySelector('[data-v2-tool="ai"]')?.classList.toggle('active',!!document.getElementById('aiPanel')?.classList.contains('open'));
  }

  function run(name){
    if(name==='ai'){
      const p=document.getElementById('aiPanel');
      if(p){const open=!p.classList.contains('open');p.classList.toggle('open',open);document.getElementById('aiToggle')?.classList.toggle('active',open);}
      setActive('ai');return;
    }
    if(name==='scroll'){
      window.__mobileScrollOn=!window.__mobileScrollOn;
      if(typeof window.setTabletScrollMode==='function') window.setTabletScrollMode(window.__mobileScrollOn);
      setActive('scroll');return;
    }
    if(name==='image'){
      document.getElementById('fileInput')?.click();
      if(typeof window.setTool==='function') window.setTool('select');
      setActive('select');return;
    }
    if(typeof window.setTabletScrollMode==='function') window.setTabletScrollMode(false);
    if(typeof window.setTool==='function') window.setTool(name);
    setActive(name);
  }

  function build(){
    if(!original) original=bar.innerHTML;
    bar.innerHTML='';
    defs.forEach(([name,icon,label])=>{
      const b=document.createElement('button');b.type='button';b.dataset.v2Tool=name;b.innerHTML='<span class="v2icon">'+icon+'</span><span>'+label+'</span>';
      b.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();run(name);},true);bar.appendChild(b);
    });
    const f=document.createElement('label');f.className='mobile-v2-font';f.innerHTML='<span class="v2icon">A</span><input type="range" min="10" max="72" value="22"><span class="font-value">22</span>';
    const fi=f.querySelector('input'), mf=document.getElementById('mobileFontSize');if(fi&&mf)fi.value=mf.value;
    fi?.addEventListener('input',()=>{if(mf){mf.value=fi.value;mf.dispatchEvent(new Event('input',{bubbles:true}));}f.querySelector('.font-value').textContent=fi.value;});bar.appendChild(f);
    const c=document.createElement('label');c.className='mobile-v2-color';c.innerHTML='<span class="v2icon">●</span><input type="color">';
    const ci=c.querySelector('input'),dc=document.getElementById('color');if(ci&&dc)ci.value=dc.value;
    ci?.addEventListener('input',()=>{if(dc){dc.value=ci.value;dc.dispatchEvent(new Event('input',{bubbles:true}));dc.dispatchEvent(new Event('change',{bubbles:true}));}});bar.appendChild(c);
  }

  function sync(){
    const should=isPhoneLandscape();
    if(should&&!on){on=true;document.body.classList.add('cf-phone-landscape');build();}
    if(!should&&on){on=false;document.body.classList.remove('cf-phone-landscape');document.body.classList.remove('mobile-css-fullscreen');if(original)bar.innerHTML=original;}
    if(on){setActive('select');}
  }

  const fs=document.getElementById('mobileLandscapeSideFullscreen');
  fs?.addEventListener('click',async e=>{
    if(!on)return;e.preventDefault();e.stopImmediatePropagation();
    const native=!!(document.fullscreenElement||document.webkitFullscreenElement);const css=document.body.classList.contains('mobile-css-fullscreen');
    if(native||css){document.body.classList.remove('mobile-css-fullscreen');document.getElementById('app')?.classList.remove('mobile-css-fullscreen');try{const f=document.exitFullscreen||document.webkitExitFullscreen;if(f)await f.call(document);}catch(_){}}
    else{try{const f=document.documentElement.requestFullscreen||document.documentElement.webkitRequestFullscreen;if(f)await f.call(document.documentElement);else throw 0;}catch(_){document.body.classList.add('mobile-css-fullscreen');document.getElementById('app')?.classList.add('mobile-css-fullscreen');}}
    fs.classList.toggle('active',!!document.fullscreenElement||document.body.classList.contains('mobile-css-fullscreen'));
  },true);

  sync();window.addEventListener('resize',()=>setTimeout(sync,30),{passive:true});window.addEventListener('orientationchange',()=>setTimeout(sync,80),{passive:true});
})();
</script>
`;

html = html.trimEnd() + '\n\n' + finalBlock;
fs.writeFileSync(file, html, 'utf8');
console.log('uploaded mobile landscape reference applied as final UI; AI untouched');
