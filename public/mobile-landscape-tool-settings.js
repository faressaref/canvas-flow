/* CanvasFlow — mobile landscape tool settings
   Scope: touch devices in landscape. Uses the app's landscape class as a
   fallback because iPadOS can report a non-coarse pointer. */
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

  let lastTool=null;
  let lastTime=0;

  function record(tool){
    if(!isLandscapeTouch())return;
    const now=performance.now();
    if(lastTool===tool && now-lastTime<=700){
      lastTool=null;
      lastTime=0;
      setTimeout(()=>{
        if(tool==='pen')openPenSettings();
        else openMarkerSettings();
      },30);
      return;
    }
    lastTool=tool;
    lastTime=now;
    setTimeout(()=>{
      if(lastTool===tool && performance.now()-lastTime>700){
        lastTool=null;
        lastTime=0;
      }
    },750);
  }

  // touchend catches iPad Safari reliably; pointerdown remains as a fallback
  // for browsers that expose pointer events normally.
  bar.addEventListener('touchend',function(e){
    if(!isLandscapeTouch())return;
    const button=e.target.closest('button[data-v2-tool]');
    if(!button || !bar.contains(button))return;
    const tool=button.dataset.v2Tool;
    if(tool==='pen'||tool==='highlighter')record(tool);
  },{capture:true,passive:true});

  bar.addEventListener('pointerdown',function(e){
    if(e.pointerType==='mouse' || !isLandscapeTouch())return;
    const button=e.target.closest('button[data-v2-tool]');
    if(!button || !bar.contains(button))return;
    const tool=button.dataset.v2Tool;
    if(tool==='pen'||tool==='highlighter')record(tool);
  },{capture:true,passive:true});

  window.addEventListener('orientationchange',()=>{
    lastTool=null;
    lastTime=0;
  },{passive:true});
})();
