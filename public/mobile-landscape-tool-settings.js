/* CanvasFlow — mobile landscape tool settings
   Scope: touch/coarse devices in landscape ONLY. */
(function(){
  'use strict';

  const isLandscapeTouch=()=>{
    return window.matchMedia(
      '(orientation: landscape) and (pointer: coarse) and (hover: none)'
    ).matches;
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

  // Use pointerdown because the existing Elements click handler changes tools
  // on the first tap. This listener runs in capture phase and only records
  // the tap; it never interferes with the normal tool action.
  let lastTool=null;
  let lastTime=0;

  bar.addEventListener('pointerdown',function(event){
    if(!isLandscapeTouch() || (event.pointerType && event.pointerType==='mouse'))return;
    const button=event.target.closest('button[data-v2-tool]');
    if(!button || !bar.contains(button))return;

    const tool=button.dataset.v2Tool;
    if(tool!=='pen' && tool!=='highlighter')return;

    const now=performance.now();
    const isDouble=(lastTool===tool && (now-lastTime)<=650);

    if(isDouble){
      lastTool=null;
      lastTime=0;
      window.setTimeout(function(){
        if(tool==='pen')openPenSettings();
        else openMarkerSettings();
      },0);
      return;
    }

    lastTool=tool;
    lastTime=now;
    window.setTimeout(function(){
      if(lastTool===tool && performance.now()-lastTime>650){
        lastTool=null;
        lastTime=0;
      }
    },700);
  },true);

  // Reset the detector when the user changes tools or orientation.
  window.addEventListener('orientationchange',function(){
    lastTool=null;
    lastTime=0;
  },{passive:true});

})();