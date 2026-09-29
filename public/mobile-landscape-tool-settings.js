/* CanvasFlow — mobile landscape tool settings
   Single tap selects Pen/Marker. Double tap opens settings. */
(function(){
  'use strict';

  const isLandscapeTouch=()=>{
    return document.body.classList.contains('cf-touch-landscape') ||
      window.matchMedia('(orientation: landscape) and (max-height: 600px)').matches;
  };

  const bar=document.getElementById('mobileV2Bar');
  if(!bar)return;

  function openPenSettings(){
    const panel=document.getElementById('mobilePenSettings');
    if(!panel)return;
    if(typeof setTool==='function')setTool('pen');
    const sourceSize=document.getElementById('size');
    const input=document.getElementById('mobilePenSize');
    const output=document.getElementById('mobilePenSizeValue');
    if(input&&sourceSize)input.value=Math.max(1,Math.min(40,Number(sourceSize.value)||4));
    if(output)output.textContent=input?input.value:'4';
    panel.classList.add('open');
    panel.setAttribute('aria-hidden','false');
  }

  function openMarkerSettings(){
    const panel=document.getElementById('mobileMarkerSettings');
    if(!panel)return;
    if(typeof setTool==='function')setTool('highlighter');
    const color=document.getElementById('mobileMarkerColor');
    const colorOutput=document.getElementById('mobileMarkerColorValue');
    const size=document.getElementById('mobileMarkerSize');
    const sizeOutput=document.getElementById('mobileMarkerSizeValue');
    const opacity=document.getElementById('mobileMarkerOpacity');
    const opacityOutput=document.getElementById('mobileMarkerOpacityValue');
    if(colorOutput)colorOutput.textContent=(color?.value||'#FFD54A').toUpperCase();
    if(sizeOutput)sizeOutput.textContent=size?.value||'10';
    if(opacityOutput)opacityOutput.textContent=(opacity?.value||'30')+'%';
    panel.classList.add('open');
    panel.setAttribute('aria-hidden','false');
  }

  // Use the browser's actual dblclick gesture. This is intentionally NOT
  // implemented on pointerdown/touchend, because iPadOS can synthesize both
  // event types and make one physical tap look like two taps.
  bar.addEventListener('dblclick',function(e){
    if(!isLandscapeTouch())return;
    const button=e.target.closest('button[data-v2-tool]');
    if(!button || !bar.contains(button))return;
    const tool=button.dataset.v2Tool;
    if(tool!=='pen' && tool!=='highlighter')return;

    e.preventDefault();
    e.stopPropagation();

    if(tool==='pen')openPenSettings();
    else openMarkerSettings();
  },true);

  window.addEventListener('orientationchange',()=>{}, {passive:true});
})();
