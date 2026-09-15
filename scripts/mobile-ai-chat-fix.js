import fs from "node:fs";

const file = "public/index.html";
let s = fs.readFileSync(file, "utf8");

const cssMarker='<style id="canvasflow-mobile-ai-chat-css">';
const start=s.indexOf(cssMarker);
if(start>=0){
  const end=s.indexOf('</style>',start);
  if(end>=0){
    const old=s.slice(start,end+8);
    const next=old.replace(
      '#aiPanel{width:min(58vw,460px)!important;height:min(46dvh,250px)!important;max-width:calc(100vw - 12px)!important;max-height:calc(100dvh - 18px)!important;min-width:240px!important;min-height:170px!important;}',
      '#aiPanel{width:260px!important;height:150px!important;max-width:260px!important;max-height:150px!important;min-width:260px!important;min-height:150px!important;}'
    ).replace(
      '#aiPanel .ai-body{padding:5px!important;gap:4px!important;}',
      '#aiPanel .ai-body{padding:3px!important;gap:2px!important;}'
    ).replace(
      '.cf-mobile-messages{min-height:55px!important;padding:6px!important;gap:4px!important}',
      '.cf-mobile-messages{min-height:40px!important;padding:4px!important;gap:3px!important}'
    ).replace(
      '.cf-mobile-welcome,.cf-mobile-bubble{font-size:9px!important;line-height:1.4!important;padding:5px 7px!important}',
      '.cf-mobile-welcome,.cf-mobile-bubble{font-size:7px!important;line-height:1.25!important;padding:3px 5px!important}'
    ).replace(
      '.cf-mobile-composer{flex-basis:32px!important;padding:2px!important}',
      '.cf-mobile-composer{flex-basis:26px!important;padding:1px!important}'
    ).replace(
      '.cf-mobile-composer button{width:26px;height:26px;flex-basis:26px;font-size:13px}',
      '.cf-mobile-composer button{width:22px;height:22px;flex-basis:22px;font-size:11px}'
    ).replace(
      '#canvasflowMobileChat #lessonInput{height:25px!important;min-height:25px!important;max-height:25px!important;padding:5px!important;font-size:10px!important}',
      '#canvasflowMobileChat #lessonInput{height:20px!important;min-height:20px!important;max-height:20px!important;padding:3px!important;font-size:8px!important}'
    ).replace(
      '.cf-mobile-attachment{padding:3px 6px!important;font-size:8px!important}',
      '.cf-mobile-attachment{padding:2px 4px!important;font-size:7px!important}'
    ).replace(
      '#aiPanel .ai-actions{flex-basis:25px!important}',
      '#aiPanel .ai-actions{flex-basis:20px!important}'
    ).replace(
      '#aiPanel .ai-action{padding:4px 7px!important;font-size:7px!important}',
      '#aiPanel .ai-action{padding:2px 5px!important;font-size:6px!important}'
    );
    s=s.slice(0,start)+next+s.slice(end+8);
  }
}
fs.writeFileSync(file,s,'utf8');
console.log('CanvasFlow: mobile landscape AI chat reduced to compact size.');
