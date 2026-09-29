/* CanvasFlow — mobile landscape tool settings
   Single tap selects Pen/Marker. Two physical taps open settings. */
(function(){
  'use strict';

  const isLandscapeTouch=()=>{
    return document.body.classList.contains('cf-touch-landscape') ||
      window.matchMedia('(orientation: landscape) and (pointer: coarse) and (hover: none)').matches;
  };

  const bar=document.getElementById('mobileV2Bar');
  if(!bar)return;

  let lastTapTime=0;
  let lastTapTool='';
  let lastTapButton=null;

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

  // Touch only: a first tap selects the tool; a second physical tap within
  // 420ms on the same tool opens its settings. No pointerdown/click timing.
  bar.addEventListener('touchend',function(e){
    if(!isLandscapeTouch())return;

    const button=e.target.closest('button[data-v2-tool]');
    if(!button || !bar.contains(button))return;

    const tool=button.dataset.v2Tool;
    if(tool!=='pen' && tool!=='highlighter')return;

    const now=Date.now();
    const sameTool=lastTapButton===button && lastTapTool===tool;
    const isDouble=sameTool && (now-lastTapTime)<=420;

    if(isDouble){
      e.preventDefault();
      e.stopPropagation();
      lastTapTime=0;
      lastTapTool='';
      lastTapButton=null;

      if(tool==='pen')openPenSettings();
      else openMarkerSettings();
      return;
    }

    lastTapTime=now;
    lastTapTool=tool;
    lastTapButton=button;
  },true);

  window.addEventListener('orientationchange',()=>{
    lastTapTime=0;
    lastTapTool='';
    lastTapButton=null;
  },{passive:true});
})();