import fs from 'node:fs';

const file = 'public/index.html';
if (!fs.existsSync(file)) throw new Error(`Missing ${file}`);

let html = fs.readFileSync(file, 'utf8');

const oldDetector = "const landscape=()=>window.matchMedia('(max-height:520px) and (max-width:900px)').matches;";
const newDetector = `const landscape=()=>{
      const landscape=window.matchMedia('(orientation: landscape)').matches;
      const coarse=window.matchMedia('(pointer: coarse)').matches || (navigator.maxTouchPoints || 0) > 0;
      const noHover=window.matchMedia('(hover: none)').matches;
      const maxSide=Math.max(window.innerWidth,window.innerHeight);
      const minSide=Math.min(window.innerWidth,window.innerHeight);
      return landscape && coarse && noHover && maxSide<=1100 && minSide<=700;
    };`;
if (html.includes(oldDetector)) html = html.replace(oldDetector, newDetector);

const marker = '<style id="canvasflow-mobile-landscape-reference-final">';
const start = html.indexOf(marker);
if (start !== -1) {
  let end = html.indexOf('</script>', start);
  if (end === -1) throw new Error('Could not find end of mobile landscape reference block');
  end += '</script>'.length;
  const block = html.slice(start, end);
  html = html.slice(0, start) + html.slice(end);
  html = html.trimEnd() + '\n\n' + block + '\n';
}

const styleMarker = '<style id="canvasflow-mobile-landscape-toolbar-final">';
if (!html.includes(styleMarker)) {
  const finalStyle = `<style id="canvasflow-mobile-landscape-toolbar-final">
/* FINAL MOBILE LANDSCAPE TOP HEADER — phone landscape only. */
body.cf-phone-landscape{
  #topbar,
  #hint,
  #zoom,
  #tabletControls,
  #tabletAccount,
  .device-switch,
  #mobileDock,
  #mobileQuick,
  #mobilePages,
  #mobileAI,
  #mobileV2More,
  #mobileV2Menu{
    display:none!important;visibility:hidden!important;pointer-events:none!important;
  }
  #mobilePhoneHeader{
    display:flex!important;position:fixed!important;top:0!important;left:0!important;right:0!important;
    height:50px!important;z-index:2147483000!important;align-items:center!important;justify-content:space-between!important;
    padding:4px 8px!important;box-sizing:border-box!important;background:rgba(255,255,255,.97)!important;
    border-bottom:1px solid #dfe4ea!important;box-shadow:0 1px 8px rgba(0,0,0,.06)!important;
    backdrop-filter:blur(14px)!important;
  }
  #mobilePhoneHeader .mbrand{
    display:flex!important;align-items:center!important;flex:0 0 105px!important;min-width:105px!important;
    margin:0!important;font:900 16px/1 system-ui,sans-serif!important;color:#18202a!important;
    letter-spacing:-.6px!important;cursor:pointer!important;white-space:nowrap!important;
  }
  #mobilePhoneHeader .mbrand span{color:#5b63ff!important;}
  #mobilePhoneHeader .mtools{
    display:flex!important;align-items:center!important;justify-content:flex-end!important;gap:5px!important;
    flex:0 0 auto!important;order:3!important;
  }
  #mobilePhoneHeader button{
    display:flex!important;align-items:center!important;justify-content:center!important;width:auto!important;
    min-width:58px!important;height:36px!important;padding:0 8px!important;border:1px solid #dfe4ea!important;
    border-radius:10px!important;background:#fff!important;color:#39424e!important;font:800 10px/1 system-ui,sans-serif!important;
    box-shadow:0 2px 9px rgba(0,0,0,.05)!important;gap:4px!important;
  }
  #mobileV2Bar{
    display:flex!important;position:fixed!important;top:0!important;bottom:auto!important;
    left:105px!important;right:125px!important;width:auto!important;height:50px!important;
    z-index:2147483001!important;box-sizing:border-box!important;padding:3px 4px!important;gap:2px!important;
    align-items:center!important;justify-content:flex-start!important;background:transparent!important;border:0!important;
    border-radius:0!important;box-shadow:none!important;overflow-x:auto!important;overflow-y:hidden!important;
    flex-wrap:nowrap!important;scrollbar-width:none!important;-webkit-overflow-scrolling:touch!important;
    touch-action:pan-x!important;white-space:nowrap!important;
  }
  #mobileV2Bar::-webkit-scrollbar{display:none!important;}
  #mobileV2Bar>button,
  #mobileV2Bar>label{
    display:flex!important;flex:0 0 46px!important;min-width:46px!important;width:46px!important;max-width:46px!important;
    height:42px!important;margin:0!important;padding:2px!important;flex-direction:column!important;
    align-items:center!important;justify-content:center!important;border-radius:9px!important;background:transparent!important;
    color:#4b5563!important;font:800 7px/1 system-ui,sans-serif!important;cursor:pointer!important;
  }
  #mobileV2Bar>button:hover,
  #mobileV2Bar>label:hover{background:#f1f3f6!important;}
  #mobileV2Bar>button.active{background:#18202a!important;color:#fff!important;}
  #mobileV2Bar button .v2icon,
  #mobileV2Bar label .v2icon{font-size:18px!important;line-height:18px!important;}
  #mobileV2Bar .mobile-v2-color{
    flex:0 0 42px!important;min-width:42px!important;width:42px!important;height:42px!important;display:flex!important;
    align-items:center!important;justify-content:center!important;border:1px solid #dfe4ea!important;
    border-radius:9px!important;padding:4px!important;background:#fff!important;
  }
  #mobileV2Bar .mobile-v2-color input{
    width:100%!important;height:100%!important;border:0!important;padding:0!important;background:transparent!important;display:block!important;
  }
  #canvasWrap{padding-top:50px!important;padding-bottom:0!important;box-sizing:border-box!important;}
  /* Keep the existing AI implementation; only move its viewport below the top header. */
  #aiPanel{
    top:58px!important;bottom:0!important;height:calc(100dvh - 58px)!important;max-height:none!important;
  }
}
</style>
`;
  html = html.trimEnd() + '\n\n' + finalStyle;
}

const detectorMarker = '<script id="canvasflow-mobile-landscape-class-detector">';
if (!html.includes(detectorMarker)) {
  const detector = `
<script id="canvasflow-mobile-landscape-class-detector">
(function(){
  function sync(){
    const ua=navigator.userAgent||'';
    const appleTouchDevice=(navigator.maxTouchPoints||0)>1 && /Macintosh/i.test(ua);
    const mobileUA=/Android|iPhone|iPad|iPod/i.test(ua);
    const phoneLandscape=window.matchMedia('(orientation: landscape)').matches
      && (mobileUA || appleTouchDevice)
      && (window.matchMedia('(pointer: coarse)').matches || (navigator.maxTouchPoints||0)>0)
      && window.matchMedia('(hover: none)').matches;
    document.body.classList.toggle('cf-phone-landscape',phoneLandscape);
  }
  sync();
  window.addEventListener('resize',sync,{passive:true});
  window.addEventListener('orientationchange',()=>setTimeout(sync,80),{passive:true});
})();
</script>
`;
  html = html.trimEnd() + '\n\n' + detector;
}

fs.writeFileSync(file, html, 'utf8');
console.log('mobile landscape fixed: full Elements toolbar restored; AI untouched');
