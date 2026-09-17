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
  const finalStyle = `
<style id="canvasflow-mobile-landscape-toolbar-final">
@media screen and (orientation:landscape) and (max-width:1100px) and (max-height:700px) and (pointer:coarse){
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
    display:none!important;visibility:hidden!important;pointer-events:none!important;
  }
  body.cf-phone-landscape #mobilePhoneHeader{
    display:flex!important;position:fixed!important;top:0!important;left:0!important;right:0!important;
    height:50px!important;z-index:2147483000!important;
  }
  body.cf-phone-landscape #mobileV2Bar{
    display:flex!important;position:fixed!important;top:auto!important;
    bottom:max(6px,env(safe-area-inset-bottom))!important;
    left:10px!important;right:10px!important;width:auto!important;height:54px!important;
    z-index:2147483001!important;box-sizing:border-box!important;padding:4px!important;gap:4px!important;
    align-items:stretch!important;background:rgba(255,255,255,.97)!important;
    border:1px solid #dfe4ea!important;border-radius:18px!important;
    box-shadow:0 9px 30px rgba(0,0,0,.16)!important;
    overflow-x:auto!important;overflow-y:hidden!important;flex-wrap:nowrap!important;
    justify-content:flex-start!important;scrollbar-width:none!important;
    -webkit-overflow-scrolling:touch!important;touch-action:pan-x!important;white-space:nowrap!important;
  }
  body.cf-phone-landscape #mobileV2Bar::-webkit-scrollbar{display:none!important;}
  body.cf-phone-landscape #mobileV2Bar>button,
  body.cf-phone-landscape #mobileV2Bar>label{
    display:flex!important;flex:0 0 58px!important;min-width:58px!important;width:58px!important;
    max-width:58px!important;height:46px!important;margin:0!important;padding:2px!important;
    flex-direction:column!important;align-items:center!important;justify-content:center!important;
  }
  body.cf-phone-landscape #mobileV2Bar .mobile-v2-color{
    flex:0 0 58px!important;min-width:58px!important;width:58px!important;height:46px!important;display:flex!important;
  }
  body.cf-phone-landscape #canvasWrap{padding-top:50px!important;padding-bottom:66px!important;box-sizing:border-box!important;}
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
    const phoneLandscape=window.matchMedia('(orientation: landscape)').matches
      && (window.matchMedia('(pointer: coarse)').matches || (navigator.maxTouchPoints||0)>0)
      && window.matchMedia('(hover: none)').matches
      && Math.max(window.innerWidth,window.innerHeight)<=1100
      && Math.min(window.innerWidth,window.innerHeight)<=700;
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
