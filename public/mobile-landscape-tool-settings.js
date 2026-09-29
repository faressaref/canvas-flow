/* CanvasFlow — mobile landscape tool settings
   Scope: touch devices in landscape ONLY. */
(function(){
  'use strict';
  const isLandscapeTouch=()=>{
    const ua=navigator.userAgent||'';
    const touch=(navigator.maxTouchPoints||0)>0;
    const mobileUA=/Android|iPhone|iPad|iPod/i.test(ua);
    const appleTouch=touch && /Macintosh/i.test(ua);
    return touch && (mobileUA||appleTouch) &&
      window.matchMedia('(orientation: landscape)').matches;
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
    if(input&&sourceSize)input.value=sourceSize.value||'4';
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

  let lastTool=null,lastTime=0;
  bar.addEventListener('pointerup',function(event){
    if(!isLandscapeTouch()||event.pointerType==='mouse')return;
    const button=event.target.closest('button[data-v2-tool]');
    if(!button||!bar.contains(button))return;
    const tool=button.dataset.v2Tool;
    if(tool!=='pen'&&tool!=='highlighter')return;
    const now=performance.now();
    const isDouble=lastTool===tool&&(now-lastTime)<=700;
    if(isDouble){
      lastTool=null;lastTime=0;
      if(tool==='pen')openPenSettings();
      else openMarkerSettings();
      return;
    }
    lastTool=tool;lastTime=now;
    window.setTimeout(function(){
      if(lastTool===tool&&performance.now()-lastTime>700){
        lastTool=null;lastTime=0;
      }
    },720);
  },true);
})();
