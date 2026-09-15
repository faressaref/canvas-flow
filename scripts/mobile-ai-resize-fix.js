import fs from "node:fs";
const file="public/index.html";
let s=fs.readFileSync(file,"utf8");
const marker='<style id="canvasflow-mobile-ai-resize-css">';
const css=`<style id="canvasflow-mobile-ai-resize-css">
@media screen and (max-width:760px),screen and (max-height:520px) and (max-width:900px){
#aiPanel{position:fixed!important;z-index:99999!important;overflow:hidden!important}
@media (orientation:landscape){
#aiPanel{width:280px!important;height:175px!important;min-width:280px!important;min-height:175px!important;max-width:280px!important;max-height:175px!important}
#aiPanel .ai-body{padding:5px!important;gap:4px!important}
.cf-mobile-messages{min-height:48px!important;padding:6px!important;gap:4px!important}
.cf-mobile-welcome,.cf-mobile-bubble{font-size:10px!important;line-height:1.35!important;padding:5px 7px!important}
.cf-mobile-composer{flex-basis:36px!important;padding:2px!important}
.cf-mobile-composer button{width:30px!important;height:30px!important;flex-basis:30px!important;font-size:15px!important}
#canvasflowMobileChat #lessonInput{height:28px!important;min-height:28px!important;max-height:28px!important;padding:5px 6px!important;font-size:11px!important}
.cf-mobile-attachment{padding:3px 6px!important;font-size:9px!important}
#aiPanel .ai-actions{flex-basis:28px!important;gap:4px!important}
#aiPanel .ai-action{padding:5px 7px!important;font-size:8px!important;min-height:25px!important}
#aiPanel .ai-action b{font-size:8px!important}
#canvasflowAIResizeHandle{width:22px!important;height:22px!important;top:4px!important;left:4px!important;line-height:22px!important;font-size:12px!important;padding:0!important}
}
}
</style>`;
const start=s.indexOf(marker);
if(start>=0){const end=s.indexOf('</style>',start);if(end>=0)s=s.slice(0,start)+css+s.slice(end+8);}else{s=s.replace('</head>',css+'</head>');}
fs.writeFileSync(file,s,"utf8");
console.log('CanvasFlow: mobile AI compact sizing fixed.');
